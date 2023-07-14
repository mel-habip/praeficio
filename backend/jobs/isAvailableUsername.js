import query from '../utils/db_connection.js';

const log = console.log;

/**
 * @function isAvailableUsername - checks in DB if the username is taken already
 * @returns {Promise<Boolean>} - return true if the username is available
 */
export default async function isAvailableUsername(username) {
    let sql = `SELECT username FROM users WHERE upper(username) = ?`;
    let [temp_result] = await query(sql, username.trim().toUpperCase());

    log(`${username} ${temp_result ? 'is not' : 'is'} available`);
    return !temp_result;
}