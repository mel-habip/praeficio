import express from 'express';
const workspacesRouter = express.Router();
const log = console.log;
import authenticateToken from '../jobs/authenticateToken.js';
import {
    positions
} from '../constants/defaultPermissions.js';
import query from '../utils/db_connection.js';
import emailService from '../jobs/emailService.js';

workspacesRouter.use(authenticateToken);

workspacesRouter.get('/', async (req, res) => {
    if (positions.devs.includes(req.user.permissions)) {
        let sql_1 = `SELECT * FROM workspaces`;

        let workspaces = await query(sql_1);


        for await (const workspace of workspaces) {
            await query(`SELECT * FROM workspace_user_associations WHERE workspace_id = ?`, workspace.workspace_id).then(response => {
                workspace.users = response.map(x => x.user_id);
            });
            await query(`SELECT * FROM workspace_position_associations WHERE workspace_id = ?`, workspace.workspace_id).then(response => {
                workspace.positions = response.map(x => x.position_id);
            });
        };

        return res.status(200).json(workspaces);

    } else {

        const user_workspace_map = req.user.workspaces.reduce((map, {
            workspace_id,
            role
        }) => (map[workspace_id] = role) && map, {});

        let sql = `SELECT * FROM workspaces WHERE workspace_id IN (?)`;

        let workspaces = await query(sql, req.user.workspaces.map(x => x.workspace_id).join(', '));

        for await (const workspace of workspaces) {
            if (positions.workspace_users.includes(user_workspace_map[workspace.workspace_id])) {
                await query(`SELECT * FROM workspace_user_associations WHERE workspace_id = ?`, workspace.workspace_id).then(response => {
                    workspace.users = response.map(x => x.user_id);
                });
                await query(`SELECT * FROM workspace_position_associations WHERE workspace_id = ?`, workspace.workspace_id).then(response => {
                    workspace.positions = response.map(x => x.position_id);
                });
            }
        };

        return res.status(201).json(workspaces);
    }

    // if (true) { //TODO: add permissions
    //     let result = query(sql);

    //     // if (defaultPermissions.actions)
    //     return res.status(200).json(result);

    // } else {
    //     return res.status(403).send('Forbidden: You do not have access to this.');
    // }
});

workspacesRouter.post('/', async (req, res) => {

    if (req.user.permissions === 'basic_client') {
        return res.status(403).send('Forbidden: You do not have access to this');
    }

    if (!req.body?.name) {
        return res.status(400).send(`Param name is required.`);
    }

    let sql = `INSERT INTO workspaces (name) VALUES (?);`;

    let creation_result = await query(sql, req.body.name ?? '');

    if (!creation_result || !creation_result?.insertId) {
        res.status(422).json({
            message: `Failed to create Workspace`,
            data: creation_result
        });
    }

    const sql_2 = `INSERT INTO workspace_user_associations (user_id, workspace_id, role) VALUES (?, ?, ?);`;

    let association_result = await query(sql_2, [req.user.id, creation_result.insertId, 'workspace_admin']);

    return res.status(201).json({
        creation_result,
        association_result
    });
});

workspacesRouter.get('/:workspace_id', async (req, res) => {
    let detailed;

    if (positions.devs.includes(req.user.permissions)) {
        detailed = true;
    } else {
        const role = req.user.workspaces.find(({
            workspace_id
        }) => workspace_id === req.params.workspace_id)?.role;
        if (!role) {
            return res.status(403).send('Forbidden: You do not have access to this.');
        }
        if (positions.workspace_users.includes(role)) {
            detailed = true;
        } else {
            detailed = false;
        }
    };

    let workspace = await fetch_one_workspace(detailed, req.params.workspace_id);

    if (!workspace) {
        return res.status(404).send("Resource not found.");
    };

    return res.status(200).json(workspace);

    async function fetch_one_workspace(detailed = false, workspace_id) {
        const sql = `SELECT * FROM workspaces WHERE workspace_id = ?`;
        const [workspace] = await query(sql, workspace_id);
        if (!workspace) return;
        if (detailed) {
            await query(`SELECT * FROM workspace_user_associations WHERE workspace_id = ?`, workspace.workspace_id).then(response => {
                workspace.users = response.map(x => x.user_id);
            });
            await query(`SELECT * FROM workspace_position_associations WHERE workspace_id = ?`, workspace.workspace_id).then(response => {
                workspace.positions = response.map(x => x.position_id);
            });
        }
        return workspace;
    }
});

workspacesRouter.post('/add_user', async (req, res) => {

    if (!req.body.user_id || !req.body.workspace_id) {
        return res.status(400).json('Params user_id and workspace_id are required.');
    }

    if (!authenticateRole(req.user, req.body.workspace_id)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }

    //check if user exists
    const sql_1 = `SELECT deleted, email FROM users WHERE user_id = ?;`;

    let [target_user] = await query(sql_1, req.body.user_id);

    if (!target_user || target_user?.deleted) {
        return res.status(404).send('Resource (user) not found');
    }

    const sql_2 = `SELECT * FROM workspace_user_associations WHERE user_id = ? AND workspace_id = ?;`;

    let [association_check] = await query(sql_2, req.body.user_id, req.body.workspace_id);

    if (association_check && !association_check.invitation_accepted) {
        if (target_user.email) {
            await emailService({
                to: target_user.email,
                text: `This is a reminder to join Workspace #${association_check.workspace_id} on Mel's Portfolio Tracker. Please enter your portal to accept the invite.`
            });
            return res.status(205).json({
                message: `Invitation reminder has been sent to the user's email address`
            });
        } else {
            return res.status(400).json({
                message: `Target user ${req.body.user_id} is missing an email address and cannot receive the invitation`
            });
        }
    }

    const sql_3 = 'INSERT INTO workspace_user_associations (workspace_id, user_id, role) VALUES (?, ?, ?);';

    await query(sql_3, req.body.workspace_id, req.body.user_id, req.body.role || 'workspace_member').then(result => {
        if (result) {
            return res.status(200).json({
                success: true,
                data: result
            });
        }
        return res.status(422).send({
            message: `Could not insert ${req.body.user_id} into ${req.body.workspace_id}`,
            error
        });
    });
});

workspacesRouter.put('/edit_user', async (req, res) => {
    if (!authenticateRole(req.user, req.body.workspace_id)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }
})

workspacesRouter.delete('/:workspace_id', async (req, res) => {
    if (!authenticateRole(req.user, req.params.workspace_id, true)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }

    let sql_1 = `SELECT * FROM workspaces WHERE workspace_id = ?;`;

    let [workspace_id_check] = await query(sql_1, req.params.workspace_id);

    if (!workspace_id_check) {
        return res.status(404).send('Resource (workspace) not found');
    };

    let sql_2 = `DELETE FROM workspaces WHERE workspace_id = ?`;

    await query(sql_2, req.params.workspace_id).then(result => {
        if (result) return res.status(200).json({
            success: true,
            data: result
        });
        return res.status(422).send({
            message: `Could not delete ${req.params.workspace_id}`,
            error
        });
    });
});


export default workspacesRouter;

function authenticateRole(user, workspace_id, require_admin = false) {
    if (positions.devs.includes(user.permissions)) return true;

    const role = user.workspaces.find(workspace => workspace.workspace_id === workspace_id)?.role;

    if (!role) return false;
    if (require_admin && positions.workspace_admins.includes(role)) return true;
    return positions.workspace_users.includes(role);
}