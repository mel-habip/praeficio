"use strict"
import express from 'express';
const feedbackLogItemMessageRouter = express.Router();
import authenticateToken from '../jobs/authenticateToken.js';
import FeedbackLogItemService from '../modules/FeedbackLogItemService.mjs';
import FeedbackLogItemMessageService from '../modules/FeedbackLogItemMessageService.mjs';
import query from '../utils/db_connection.js';
import fetchUserFeedbackLogs from '../jobs/fetchUserFeedbackLogs.js';

const itemsHelper = new FeedbackLogItemService();
const messagesHelper = new FeedbackLogItemMessageService();

feedbackLogItemMessageRouter.use(authenticateToken);

feedbackLogItemMessageRouter.get('/test', async (req, res) => {
    res.status(200).send('Hello World from the Feedback Log Items!');
});

//fetch messages of a feedback log item
feedbackLogItemMessageRouter.get('/:feedback_log_item_id', async (req, res) => {

    let feedback_log_item = await itemsHelper.fetch_by_id([req.params.feedback_log_item_id]);

    if (!feedback_log_item) {
        return res.status(404).send(`Feedback Log Item ${req.params.feedback_log_item_id} Not Found.`);
    }

    if (!req.user.is_total && !req.user.feedback_logs.includes(feedback_log_item.feedback_log_id)) {
        return res.status(403).send(`Forbidden: You do not have access to this Feedback Log Item.`);
    }

    const sql = `SELECT * FROM feedback_log_item_messages WHERE feedback_log_item_id = ?;`;

    const messages_in_item = await query(sql, req.params.feedback_log_item_id);

    if (!messages_in_item) return res.status(422).send(`Something went wrong`);

    return res.status(200).json({
        data: messages_in_item
    });
});

//add new message to a feedback log item
feedbackLogItemMessageRouter.post('/:feedback_log_item_id', async (req, res) => {

    if (!req.body.content) {
        return res.status(400).send(`Content must be provided`);
    }
    let feedback_log_item = await itemsHelper.fetch_by_id([req.params.feedback_log_item_id]);

    if (!feedback_log_item) {
        return res.status(404).send(`Feedback Log Item ${req.params.feedback_log_item_id} Not Found.`);
    }

    if (!req.user.is_total && !req.user.feedback_logs.includes(feedback_log_item.feedback_log_id)) {
        return res.status(403).send(`Forbidden: You do not have access to this Feedback Log Item.`);
    }

    if (!req.user.is_total && feedback_log_item.archived) {
        return res.status(403).send(`Forbidden: Feedback Log Item ${req.params.feedback_log_item_id} has been archived.`);
    }

    if (!req.user.is_total && feedback_log_item.completed) {
        return res.status(403).send(`Forbidden: Feedback Log Item ${req.params.feedback_log_item_id} has been completed.`);
    }


    let creation = await messagesHelper.create_single({
        content: req.body.content,
        sent_by: req.user.id,
        feedback_log_item_id: req.params.feedback_log_item_id,
    });

    let success = !!creation && creation.success;

    return res.status(success ? 201 : 422).json(creation);
});

export default feedbackLogItemMessageRouter;