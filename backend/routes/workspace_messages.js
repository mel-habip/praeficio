import express from 'express';

const workspaceMessagesRouter = express.Router();
const log = console.log;
import authenticateToken from '../jobs/authenticateToken.js';
import {
    positions
} from '../constants/defaultPermissions.js';

import query from '../utils/db_connection.js';

import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';

import WorkspaceMessageService from '../modules/WorkspaceMessageService.mjs';
import WorkspaceMessageLikeService from '../modules/WorkspaceMessageLikeService.mjs';

const workspaceMessageHelper = new WorkspaceMessageService();
const workspaceMessageLikeHelper = new WorkspaceMessageLikeService();

workspaceMessagesRouter.use(authenticateToken);

//post a new message
workspaceMessagesRouter.post('/:workspace_id', validateAndSanitizeBodyParts({
    content: 'string',
    parent_workspace_message_id: 'number',
}, ['content']), authenticateRole(), async (req, res) => {

    const creation_result = await workspaceMessageHelper.create_single({
        workspace_id: req.params.workspace_id,
        content: req.body.content,
        sent_by: req.user.id,
        deleted: false,
        starred: false,
        parent_workspace_message_id: req.body.parent_workspace_message_id || null,
    });

    console.log('CREATION: ', creation_result)

    if (!creation_result?.success) {
        return res.status(422).json({
            message: creation_result?.message || `Failed to create Workspace Message`,
            data: creation_result?.details
        });
    }

    return res.status(201).json({
        ...creation_result.details
    });
});

//like a message
workspaceMessagesRouter.post('/like/:workspace_message_id', async (req, res) => {
    let message_details = await workspaceMessageHelper.fetch_by_id(req.params.workspace_message_id);

    if (!message_details) return res.status(404).send(`Message not found.`);

    if (!req.user.workspaces.find(ws => ws.workspace_id === message_details.workspace_id)) return res.status(403).send(`Forbidden: You do not belong to this workspace.`);

    let create_like = await workspaceMessageLikeHelper.like(req.params.workspace_message_id, req.user.id);

    if (!create_like?.success) {
        return res.status(422).json({
            message: create_like?.message || `Failed to like message`,
            details: create_like?.details
        });
    }

    return res.status(201).json({
        ...create_like?.details
    });
});

//dislike a message
workspaceMessagesRouter.delete('/like/:workspace_message_id', async (req, res) => {
    let message_details = await workspaceMessageHelper.fetch_by_id(req.params.workspace_message_id);

    if (!message_details) return res.status(404).send(`Message not found.`);

    if (!req.user.workspaces.find(ws => ws.workspace_id === message_details.workspace_id)) return res.status(403).send(`Forbidden: You do not belong to this workspace.`);

    let remove_like = await workspaceMessageLikeHelper.dislike(req.params.workspace_message_id, req.user.id);

    if (!remove_like?.success) {
        return res.status(422).json({
            message: remove_like?.message || `Failed to dislike message`,
            details: remove_like?.details
        });
    }

    return res.status(201).json({
        ...remove_like?.details
    });
});

export default workspaceMessagesRouter;

function authenticateRole(require_admin = false) {

    return (req, res, next) => {
        if (positions.devs.includes(req.user.permissions)) return next();


        const role = req.user.workspaces.find(workspace => workspace.workspace_id === req.params.workspace_id)?.role;
        if (!role) return res.status(403).send('Forbidden: You do not have access to this.');


        if (require_admin && positions.workspace_admins.includes(role)) return next();

        if (positions.workspace_users.includes(role)) return next();

        return res.status(403).send('Forbidden: You do not have access to this.');
    }
}