import query from '../utils/db_connection.js';
const log = console.log;

export default async function fetchPermission(id) {
    let sql = `SELECT Permissions FROM Users WHERE UserID = ${id}`;
    let res;
    await query(sql).then(([response]) => {
        if (!response || !response?.Permissions) {
            log(`User ${id} not found.`, response);
            return;
        };
        res = response.Permissions;
    });
    return res;
};