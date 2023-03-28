"use strict"

import express from 'express';
const feedbackLogFilterRouter = express.Router();
import authenticateToken from '../jobs/authenticateToken.js';
import query from '../utils/db_connection.js';
import FeedbackLogFilterService from '../modules/FeedbackLogFilterService.mjs';
import UserService from '../modules/UserService.mjs';
import FeedbackLogService from '../modules/FeedbackLogService.mjs';

const filterHelper = new FeedbackLogFilterService();
const userHelper = new UserService();
const feedbackLogHelper = new FeedbackLogService();

feedbackLogFilterRouter.use(authenticateToken);

feedbackLogFilterRouter.get('/test', async (req, res) => {
    res.status(200).send('Hello World from the Feedback Log Filters!');
});

//create a new filter 
feedbackLogFilterRouter.post('/', async (req, res) => {

    const {
        publicity,
        parent_log_id,
        name,
        description = '', //optional
        method,
    } = req.body;

    if ([publicity, parent_log_id, name, method].filter(Boolean).length !== 4) {
        return res.status(400).send(`publicity, parent_log_id, name, description are required.`);
    }

    if (!req.user.feedback_logs.includes(parent_log_id)) {
        return res.status(403).send(`Forbidden: You do not have access to this log.`);
    }

    if (!['global', 'user_all_logs', 'all_users_one_log', 'user_one_log'].includes(publicity)) {
        return res.status(403).send(`Forbidden: You do not have access to this log.`);
    }

    let creation = await filterHelper.create_single({
        publicity,
        parent_log_id,
        name,
        description,
        created_by: req.user.id,
        method: JSON.stringify(method),
    });

    return res.status(creation?.success ? 201 : 422).json(creation?.details || "Something went wrong")
});

//fetch filters that user has
feedbackLogFilterRouter.get('/:feedback_log_id', async (req, res) => {

    const sql = `SELECT * FROM feedback_log_filters WHERE (publicity = 'global' OR (publicity = 'user_all_logs' AND created_by = ?) OR (publicity = 'user_one_log' AND parent_log_id = ? AND created_by = ?) OR (publicity = 'all_users_one_log' AND parent_log_id = ?))`;

    // let condition_in_JSON = {
    //     OR: [{
    //             publicity: 'global'
    //         },
    //         {
    //             AND: [
    //                 {
    //                     publicity: 'user_all_logs'
    //                 },
    //                 {
    //                     created_by: req.user.id
    //                 }
    //             ]
    //         },
    //         {
    //             AND: [
    //                 {
    //                     publicity: 'user_one_log'
    //                 },
    //                 {
    //                     parent_log_id: req.params.feedback_log_id
    //                 },
    //                 {
    //                     created_by: req.user.id
    //                 }
    //             ]
    //         },
    //         {
    //             AND: [
    //                 {
    //                     publicity: 'all_users_one_log'
    //                 },
    //                 {
    //                     parent_log_id: req.params.feedback_log_id
    //                 }
    //             ]
    //         }
    //     ]
    // };

    let results = await query(sql, req.user.id, req.params.feedback_log_id, req.user.id, req.params.feedback_log_id);

    return res.status(!!results ? 200 : 422).json({
        data: results
    });
});

export default feedbackLogFilterRouter;