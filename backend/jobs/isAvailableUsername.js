import connection from '../utils/db_connection.js';

const log = console.log;

/**
 * @function isAvailableUsername - checks in DB if the username is taken already
 * @returns {Promise<Boolean>} - return true if the username is available
 */
export default async function isAvailableUsername(username) {
    let sql = `SELECT * FROM Users WHERE Username = '${username}'`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        log('result', result);
        return !!result?.[0];
    });
}