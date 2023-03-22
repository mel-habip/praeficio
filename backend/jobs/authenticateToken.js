import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import query from '../utils/db_connection.js';
import env_dir from '../utils/env_dir.js';
dotenv.config({
    path: env_dir
});

/**
 * @function authenticateToken - middleware that converts JWT to user and adds it to request data
 * @returns {null} - adds `user` to request data
 */
export default async function authenticateToken(req, res, next) { //this is middleware in /login
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Unauthenticated: No session token received.');
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (async (err, user) => {
        if (err) return res.status(401).send('Unauthenticated: Invalid Token');
        req.user = user;

        let [active_status] = await query(`SELECT deleted, active, permissions, first_name, last_name, email, created_on, updated_on, to_do_categories FROM users WHERE user_id = ? LIMIT 1;`, user.id);

        if (!active_status || active_status?.deleted) {
            return res.status(401).send(`Unauthenticated: User ${user.id} not found.`);
        }

        if (!active_status.active) {
            return res.status(401).send(`Unauthenticated: Inactive User ${user.id} cannot make requests.`);
        };

        req.user.permissions = active_status.permissions;

        if (active_status.permissions === 'total') req.user.is_total = true;

        req.user.first_name = active_status.first_name;
        req.user.last_name = active_status.last_name;
        req.user.email = active_status.email;
        req.user.created_on = active_status.created_on;
        req.user.updated_on = active_status.updated_on;

        try {
            req.user.to_do_categories = JSON.parse(active_status.to_do_categories);
        } catch {}
        if (!req.user.to_do_categories?.length) {
            req.user.to_do_categories = ['General', 'Personal', 'Financial', 'School', 'Professional', 'Legal', 'Immigration'];
        }

        await query(`SELECT workspace_id, role FROM workspace_user_associations WHERE user_id = ?;`, user.id).then(response => req.user.workspaces = response);

        next();
    }));
}