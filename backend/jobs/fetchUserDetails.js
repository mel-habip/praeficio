import connection from '../utils/db_connection.js';

export default async function fetchUserDetails(id) {
    let sql = `SELECT ${id} FROM Users`;
    return connection.query(sql, (err, result) => {
        if (err) throw err;
        if (!result) {
            throw Error(`User ${id} not found.`);
        };
        return result;
    });
};