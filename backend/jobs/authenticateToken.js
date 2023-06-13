import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import query from '../utils/db_connection.js';
import env_dir from '../utils/env_dir.js';

import usersCache from '../stores/usersCache.js';

import fetchUserFriendships from './fetchUserFriendships.js';
import fetchUserDebtAccounts from './fetchUserDebtAccounts.js';

if (env_dir) {
    dotenv.config({
        path: env_dir
    });
}

/**
 * @function authenticateToken - middleware that converts JWT to user and adds it to request data
 * @returns {null} - adds `user` to request data
 * @middleware
 */
export default async function authenticateToken(req, res, next) { //this is middleware in /login
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Unauthenticated: No session token received.');
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (async (err, user) => {
        if (err) return res.status(401).send('Unauthenticated: Invalid Token');

        const checkCache = usersCache.get(`user-${user.id}`);

        if (checkCache?.to_do_categories && checkCache?.workspaces && checkCache?.feedback_logs && checkCache?.friendships && checkCache?.debt_accounts) {
            req.user = checkCache;
            next();
            return;
        }

        let [current_details] = await query(`SELECT deleted, active, discovery_token, permissions, first_name, last_name, email, created_on, updated_on, to_do_categories, use_beta_features, username FROM users WHERE user_id = ? LIMIT 1;`, user.id);

        if (!current_details || current_details?.deleted) {
            return res.status(401).send(`Unauthenticated: User ${user.id} not found.`);
        }

        if (!current_details.active) {
            return res.status(401).send(`Unauthenticated: Inactive User ${user.id} cannot make requests.`);
        };

        user.permissions = current_details.permissions;

        if (current_details.permissions === 'total') user.is_total = true;
        if (current_details.permissions.startsWith('dev_') || user.is_total) user.is_dev = true;

        user.first_name = current_details.first_name;
        user.last_name = current_details.last_name;
        user.email = current_details.email;
        user.created_on = current_details.created_on;
        user.updated_on = current_details.updated_on;
        user.use_beta_features = current_details.use_beta_features;
        user.username = current_details.username;
        user.to_do_categories = current_details.to_do_categories;
        user.discovery_token = current_details.discovery_token;

        if (!user.to_do_categories?.length) {
            user.to_do_categories = ['General', 'Personal', 'Financial', 'School', 'Professional', 'Legal', 'Immigration'];
        }

        await query(`SELECT workspace_id, role FROM workspace_user_associations WHERE user_id = ?;`, user.id).then(response => user.workspaces = response);

        await query(`SELECT feedback_log_id FROM feedback_log_user_associations WHERE user_id = ?;`, user.id).then(response => user.feedback_logs = response.map(a => a.feedback_log_id));

        await fetchUserFriendships(user.id).then(response => user.friendships = response);

        await fetchUserDebtAccounts(user.id).then(response => user.debt_accounts = response);

        req.user = user;

        usersCache.set(`user-${req.user.id}`, req.user);

        next();
    }));
}