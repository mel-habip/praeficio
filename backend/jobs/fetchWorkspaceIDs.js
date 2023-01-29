import query from '../utils/db_connection.js';

/**
 * @async_function fetchWorkspaces - checks DB for Workspaces to which this user is related
 * @param {String|Number} id - ID of the user to check
 * @param {Array<String|Number>} only_display - filters the result down to exclude IDs not in this array, if provided
 * @returns {Promise<Array<Number>>} array of WorkspaceIDs
 */
export default async function fetchWorkspaces(id, only_display = null) {
    let sql = `SELECT WorkspaceID FROM WorkspaceAssociations WHERE UserID = ?`;

    let result = await query(sql, id);

    if (only_display && Array.isArray(only_display) && only_display.length) {
        result?.map(res => res.WorkspaceID)?.filter(w_id => only_display.includes(w_id)) || [];
    }

    return result?.map(res => res.WorkspaceID) || [];
};