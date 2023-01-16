import express from 'express';
const workspacesRouter = express.Router();
const log = console.log;
import authenticateToken from '../jobs/authenticateToken.js';
import authenticateUser from '../jobs/authenticateUser.js';
import defaultPermissions from '../constants/defaultPermissions.js';
import connection from '../utils/db_connection.js';

workspacesRouter.use(authenticateToken);
workspacesRouter.use(authenticateUser);

workspacesRouter.get('/', async (req, res) => {
    if (true) { //TODO: add permissions
        let sql = 'SELECT Workspaces.WorkspaceID FROM Workspace_User_Associations INNER JOIN Users ON Workspace_User_Associations.WorkspaceID = Users.UserID'; //to be tested
        connection.query(sql, function (err, result) {
            if (err) throw err;
            // if (defaultPermissions.actions)
            res.status(200).json(result);
        });
    } else {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }
});

workspacesRouter.get('/:workspace_id', async (req, res) => {

    if (req.user.id === req.params.workspace_id || await fetchPermission(req.user.id) === 'total') {
        let sql = `SELECT ${req.params.workspace_id} FROM Workspaces`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
            delete result.password;
            res.json(result);
        });
    } else {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }
});


export default workspacesRouter;