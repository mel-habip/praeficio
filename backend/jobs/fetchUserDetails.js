import query from '../utils/db_connection.js';

export default async function fetchUserDetails(id) {
    let sql = `SELECT UserID, Username, LastName, FirstName, Email, Permissions, Active, CreatedOn, UpdatedOn FROM Users WHERE UserID = ${id}`;

    let res = await query(sql);
    return res?. [0];
};