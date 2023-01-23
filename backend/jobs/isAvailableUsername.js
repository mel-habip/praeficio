import query from '../utils/db_connection.js';

const log = console.log;

/**
 * @function isAvailableUsername - checks in DB if the username is taken already
 * @returns {Promise<Boolean>} - return true if the username is available
 */
export default async function isAvailableUsername(username) {
    let sql = `SELECT Username FROM Users WHERE Username = '${username}'`;
    let temp_result = await query(sql);

    log(`${username} ${temp_result[0] ? 'is not' : 'is'} available`);
    return !temp_result?.[0];
}