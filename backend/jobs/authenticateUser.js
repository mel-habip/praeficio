import connection from '../utils/db_connection.js';

/**
 * @middleware authenticateUser - fetches logged-in user's data
 * @note dependant on `authenticateToken` middleware
 * @returns {null} adds details to `req.user`
 */
export default function authenticateUser(req, res, next) { //this is middleware
    let sql = `SELECT ${req.user.id} FROM Users`;
    connection.query(sql, (err, result) => {
        if (err) throw err;
        if (!result || !result?.[0]) {
            res.status(403).send('Unauthenticated: No such user found');
        };
        let resClone = {...result[0]};

        delete resClone.UserID;

        req.user = {...req.user, ...resClone};
        next();
    });
}