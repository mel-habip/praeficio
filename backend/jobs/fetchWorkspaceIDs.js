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
/**
 * @async_function fetchWorkspaces - checks DB for Workspaces to which this user is related
 * @param {String|Number} id - ID of the user to check
 * @param {Array<String|Number>} only_display - filters the result down to exclude IDs not in this array, if provided
 * @returns {Promise<Array<Number>>} array of WorkspaceIDs
 */
};