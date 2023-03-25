"use strict"
import express from 'express';
const feedbackLogItemRouter = express.Router();
import authenticateToken from '../jobs/authenticateToken.js';
import FeedbackLogItemService from '../modules/FeedbackLogItemService.mjs';
import FeedbackLogService from '../modules/FeedbackLogService.mjs';
import query from '../utils/db_connection.js';
import fetchUserFeedbackLogs from '../jobs/fetchUserFeedbackLogs.js';

const itemsHelper = new FeedbackLogItemService();
const logsHelper = new FeedbackLogService();

feedbackLogItemRouter.use(authenticateToken);
feedbackLogItemRouter.use(fetchUserFeedbackLogs);

feedbackLogItemRouter.get('/test', async (req, res) => {
    res.status(200).send('Hello World from the Feedback Log Items!');
});

//fetch a feedback log item
feedbackLogItemRouter.get('/:feedback_log_item_id', async (req, res) => {

    let [feedback_log_item] = await itemsHelper.fetch_by_id(req.params.feedback_log_item_id);

    if (!feedback_log_item) {
        return res.status(404).send(`Feedback Log Item ${req.params.feedback_log_item_id} Not Found.`);
    }

    if (!req.user.is_total && !req.user.feedback_logs.includes(feedback_log_item.feedback_log_id)) {
        return res.status(403).send(`Forbidden: You do not have access to this Feedback Log Item.`);
    }

    return res.status(200).json(feedback_log_item);
});

//edit a feedback log item INCOMPLETE
feedbackLogItemRouter.put('/:feedback_log_item_id', async (req, res) => {

    let feedback_log_item = await itemsHelper.fetch_by_id(req.params.feedback_log_item_id);

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

    if (! req.body.content && ! req.body.header && ! req.body.status || ! req.body.notes || ! req.body.internal_notes) {
        return res.status(400).send(`Content, Header or Status must be provided`);
    }

    const update_sql = `UPDATE feedback_log_items SET content = ?, status = ?, header = ?, notes = ?, internal_notes = ? WHERE feedback_log_item_id = ?`;

    let update_results = await query(update_sql, req.body.content || feedback_log_item.content, req.body.status || feedback_log_item.status, req.body.header || feedback_log_item.header, JSON.stringify(req.body.notes || feedback_log_item.notes), JSON.stringify(req.body.internal_notes || feedback_log_item.internal_notes), req.params.feedback_log_item_id);

    if (!update_results || !update_results.affectedRows) {
        return res.status(422).json({
            details: update_results,
            message: 'Something went wrong'
        });
    }

    feedback_log_item = await itemsHelper.fetch_by_id(req.params.feedback_log_item_id);

    return res.status(200).json(feedback_log_item);
});

export default feedbackLogItemRouter;