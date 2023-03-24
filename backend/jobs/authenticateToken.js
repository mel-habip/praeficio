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

        let [current_details] = await query(`SELECT deleted, active, permissions, first_name, last_name, email, created_on, updated_on, to_do_categories, use_beta_features FROM users WHERE user_id = ? LIMIT 1;`, user.id);

        if (!current_details || current_details?.deleted) {
            return res.status(401).send(`Unauthenticated: User ${user.id} not found.`);
        }

        if (!current_details.active) {
            return res.status(401).send(`Unauthenticated: Inactive User ${user.id} cannot make requests.`);
        };

        req.user.permissions = current_details.permissions;

        if (current_details.permissions === 'total') req.user.is_total = true;

        req.user.first_name = current_details.first_name;
        req.user.last_name = current_details.last_name;
        req.user.email = current_details.email;
        req.user.created_on = current_details.created_on;
        req.user.updated_on = current_details.updated_on;


        req.user.to_do_categories = current_details.to_do_categories;

        if (!req.user.to_do_categories?.length) {
            req.user.to_do_categories = ['General', 'Personal', 'Financial', 'School', 'Professional', 'Legal', 'Immigration'];
        }

        await query(`SELECT workspace_id, role FROM workspace_user_associations WHERE user_id = ?;`, user.id).then(response => req.user.workspaces = response);

        next();
    }));
}