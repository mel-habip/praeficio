import query from '../utils/db_connection.js';

export default async function fetchUserDetails(id) {
    let sql = `SELECT user_id, username, last_name, first_name, email, permissions, active, created_on, updated_on, to_do_categories FROM users WHERE user_id = ${id};`;
    let [res] = await query(sql);
    return res;
};