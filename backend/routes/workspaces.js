import express from 'express';
import jwt from 'jsonwebtoken';
const workspacesRouter = express.Router();
const log = console.log;
import authenticateToken from '../jobs/authenticateToken.js';
import {
    positions
} from '../constants/defaultPermissions.js';
import query from '../utils/db_connection.js';
import emailService from '../jobs/emailService.js';

import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';

import WorkspaceService from '../modules/WorkspaceService.mjs';
import WorkspaceUserAssociationService from '../modules/WorkspaceUserAssociationService.mjs';

const workspaceHelper = new WorkspaceService();
const workspaceUserHelper = new WorkspaceUserAssociationService();

workspacesRouter.use(authenticateToken);

//fetch all WSs that user has access to
workspacesRouter.get('/', async (req, res) => {
    if (positions.devs.includes(req.user.permissions)) {

        let sql_1 = `SELECT workspaces.*, 
                        wua.role, 
                        wua.joined_on as member_since, 
                        u1.username AS invitation_sent_by_username, 
                        u2.username AS application_accepted_by_username,
                        wua.joined, 
                        wua.method, 
                        wua.starred,
                        (SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'created_on', created_on,
                                'name', workspace_topic_name
                            )
                        ) FROM workspace_topics WHERE workspace_id = workspaces.workspace_id) AS topics
                        FROM workspaces 
                        LEFT JOIN workspace_user_associations AS wua
                        	ON (wua.workspace_id = workspaces.workspace_id AND wua.user_id = ?)
                        LEFT JOIN users AS u1 ON wua.invitation_sent_by = u1.user_id
                        LEFT JOIN users AS u2 ON wua.application_accepted_by = u2.user_id;`;

        let workspaces = await query(sql_1, req.user.id);

        return res.status(200).json({
            data: workspaces
        });

    } else {

        let sql_3 = `SELECT workspaces.*, 
                        wua.role, 
                        wua.joined_on as member_since, 
                        u1.username AS invitation_sent_by_username, 
                        u2.username AS application_accepted_by_username,
                        wua.joined, 
                        wua.method, 
                        wua.starred,
                        (SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'created_on', created_on,
                                'name', workspace_topic_name
                            )
                        ) FROM workspace_topics WHERE workspace_id = workspaces.workspace_id) AS topics
                        FROM workspaces 
                        LEFT JOIN workspace_user_associations AS wua
                        	ON (wua.workspace_id = workspaces.workspace_id)
                        LEFT JOIN users AS u1 ON wua.invitation_sent_by = u1.user_id
                        LEFT JOIN users AS u2 ON wua.application_accepted_by = u2.user_id WHERE wua.user_id = ?;`

        let workspaces = await query(sql_3, req.user.id);

        return res.status(200).json({
            data: workspaces
        });
    }
});

//create new Workspace
workspacesRouter.post('/', validateAndSanitizeBodyParts({
    name: 'string',
    publicity: "enum(public, private)"
}, ['name', 'publicity']), async (req, res) => {

    if (req.user.permissions === 'basic_client') {
        return res.status(403).send('Forbidden: You do not have access to this');
    }

    const creation_result = await workspaceHelper.create_single({
        name: req.body.name,
        publicity: req.body.publicity
    });

    if (!creation_result?.success) {
        return res.status(422).json({
            message: `Failed to create Workspace`,
            data: creation_result
        });
    }

    const association_result = await workspaceUserHelper.create_single({
        user_id: req.user.id,
        workspace_id: creation_result.details.workspace_id,
        role: 'workspace_admin',
        joined: true,
        joined_on: new Date(),
        method: 'invitation',
        invitation_sent_by: req.user.id,
        application_accepted_by: req.user.id,
    });

    if (!association_result?.success) {
        return res.status(422).json({
            message: association_result?.message || `Failed to associate user to Workspace`,
            data: association_result?.details
        });
    }

    return res.status(201).json({
        ...creation_result.details,
        ...association_result.details,
    });
});

//fetch details of a single workspace, including messages, users and positions
workspacesRouter.get('/:workspace_id', async (req, res) => {

    let detailed;

    if (positions.devs.includes(req.user.permissions)) {
        detailed = true;
    } else if (req.query.token) {



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
    }

    let workspace = await workspaceHelper.fetch_by_id(req.params.workspace_id, {}, {
        users: detailed,
        messages: true
    });

    if (!workspace) {
        return res.status(404).send("Resource not found.");
    };

    return res.status(200).json(workspace);
});

workspacesRouter.put('/:workspace_id', authenticateRole(true), async (req, res) => {

    let update = await workspaceHelper.update_single({
        ...req.body
    }, req.params.workspace_id);

    return res.status(200).json(update);
});


//add user to WS
workspacesRouter.post('/:workspace_id/user/:user_id', validateAndSanitizeBodyParts({role: 'string'}), authenticateRole(), async (req, res) => {

    //check if user exists
    const sql_1 = `SELECT deleted, email FROM users WHERE user_id = ?;`;

    let [target_user] = await query(sql_1, req.params.user_id);

    if (!target_user || target_user?.deleted) {
        return res.status(404).send('Resource (user) not found');
    }

    const sql_2 = `SELECT * FROM workspace_user_associations WHERE user_id = ? AND workspace_id = ?;`;

    let [association_check] = await query(sql_2, req.params.user_id, req.params.workspace_id);

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
                message: `Target user ${req.params.user_id} is missing an email address and cannot receive the invitation`
            });
        }
    }

    const sql_3 = 'INSERT INTO workspace_user_associations (workspace_id, user_id, role) VALUES (?, ?, ?);';

    await query(sql_3, req.params.workspace_id, req.params.user_id, req.body.role || 'workspace_member').then(result => {
        if (result) {
            return res.status(200).json({
                success: true,
                data: result
            });
        }
        return res.status(422).send({
            message: `Could not insert ${req.params.user_id} into ${req.params.workspace_id}`,
            error
        });
    });
});

//remove user from WS
workspacesRouter.delete('/:workspace_id/user/:user_id', authenticateRole(true), async (req, res) => {

});

//change association or accept invitation
workspacesRouter.put('/:workspace_id/user/:user_id', authenticateRole(), async (req, res) => {

    if (!req.body.joined && !req.body.role) {
        return res.status(400).json({
            message: `invitation_accepted or role must be provided`
        });
    }

    let update_details = await workspaceUserHelper.update_single(req.body, req.params.workspace_id, req.params.user_id);

    return res.status(update_details?.success ? 200 : 422).json({
        message: update_details?.message,
        details: update_details?.details,
    });
});

//delete WS
workspacesRouter.delete('/:workspace_id', authenticateRole(true), async (req, res) => {

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

function authenticateRole(require_admin = false) {

    return (req, res, next) => {
        if (positions.devs.includes(req.user.permissions)) next();


        const role = req.user.workspaces.find(workspace => workspace.workspace_id === req.params.workspace_id)?.role;
        if (!role) return res.status(403).send('Forbidden: You do not have access to this.');


        if (require_admin && positions.workspace_admins.includes(role)) next();

        if (positions.workspace_users.includes(role)) next();

        return res.status(403).send('Forbidden: You do not have access to this.');
    }
}