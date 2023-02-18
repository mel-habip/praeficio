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
        if (err) return res.status(403).send('Unauthenticated: Invalid Token');
        req.user = user;

        let [active_status] = await query(`SELECT active, permissions FROM users WHERE user_id = ? LIMIT 1;`, user.id);

        if (!active_status) {
            return res.status(403).send(`Unauthenticated: User ${user.id} not found.`);
        } 
        
        if (!active_status.active) {
            return res.status(403).send(`Unauthenticated: Inactive User ${user.id} cannot make requests.`);
        };

        req.user.permissions = !active_status.permissions;

        req.user.workspaces = await query(`SELECT workspace_id FROM workspace_user_associations WHERE user_id = ?;`, user.id);

        next();
    }));
}