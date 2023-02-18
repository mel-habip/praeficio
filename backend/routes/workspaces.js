import express from 'express';
const workspacesRouter = express.Router();
const log = console.log;
import authenticateToken from '../jobs/authenticateToken.js';
import defaultPermissions from '../constants/defaultPermissions.js';
import query from '../utils/db_connection.js';

workspacesRouter.use(authenticateToken);

workspacesRouter.get('/', async (req, res) => {
    if (true) { //TODO: add permissions
        let sql = 'SELECT workspaces.workspace_id FROM workspace_user_associations INNER JOIN users ON workspace_user_associations.workspace_id = users.user_id'; //to be tested
        let result = query(sql);

        // if (defaultPermissions.actions)
        return res.status(200).json(result);

    } else {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }
});

workspacesRouter.get('/:workspace_id', async (req, res) => {

    if (req.user.workspaces.includes(req.params.workspace_id) || req.user.permissions === 'total') {
        let sql = `SELECT ${req.params.workspace_id} FROM workspaces`;

        let [result] = query(sql);

        return res.json(result);

    } else {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }
});


export default workspacesRouter;