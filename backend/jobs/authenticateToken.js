import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import env_dir from '../utils/env_dir.js';
dotenv.config({
    path: env_dir
});

/**
 * @function authenticateToken - middleware that converts JWT to user and adds it to request data
 * @returns {null} - adds `user` to request data
 */
export default function authenticateToken(req, res, next) { //this is middleware in /login
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Unauthenticated: No session token received.');
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, ((err, user) => {
        if (err) res.status(403).send('Unauthenticated: Invalid Token');;
        req.user = user;
        next();
    }));
}