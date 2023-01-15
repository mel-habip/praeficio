import connection from '../utils/db_connection.js';

export default async function fetchPermission(id) {
    let sql = `SELECT * FROM Users WHERE ${(isNaN(id)) ? 'Username': 'UserID'} = '${id}'`;
    return connection.query(sql, (err, result) => {
        if (err) throw err;
        if (!result) {
            throw Error(`User ${id} not found.`);
        };
        if (!result.workspace_ids) {
            return [];
        }
        let res = JSON.parse(result.workspace_ids);
        
    });
};