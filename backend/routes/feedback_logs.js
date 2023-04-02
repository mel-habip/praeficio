"use strict"
import express from 'express';
const feedbackLogRouter = express.Router();
import authenticateToken from '../jobs/authenticateToken.js';
import FeedbackLogService from '../modules/FeedbackLogService.mjs';
import query from '../utils/db_connection.js';
import fetchUserFeedbackLogs from '../jobs/fetchUserFeedbackLogs.js';

const helper = new FeedbackLogService();

feedbackLogRouter.use(authenticateToken);

feedbackLogRouter.get('/test', async (_, res) => {
    res.status(200).send('Hello World from the Feedback Logs!');
});

//fetch the names of the feedback logs that user has access to
feedbackLogRouter.get('/', async (req, res) => {

    const show_archived = req.query.archived === 'true';

    if (req.user.is_total) {
        const sql = 'SELECT * FROM feedback_logs WHERE archived = ?';
        let feedback_logs = await query(sql, show_archived);
        return res.status(!!feedback_logs ? 200 : 422).json({
            success: !!feedback_logs,
            message: 'Special - you are total',
            data: feedback_logs
        });
    }


    let feedback_logs = await helper.fetch_by_user_id(req.user.id, {
        archived: show_archived
    });

    return res.status(!!feedback_logs ? 200 : 422).json({
        success: !!feedback_logs,
        data: feedback_logs
    });
});

//create new feedback log
feedbackLogRouter.post('/', async (req, res) => {

    if (req.user.permissions.endsWith('client')) {
        return res.status(403).send('You do not have permission to create Feedback Logs');
    }

    if (!req.body.name) {
        return res.status(400).send('Name is required');
    }

    let creation_result = await query(`INSERT INTO feedback_logs (name) VALUES ( ? );`, req.body.name);

    if (!creation_result || !creation_result?.affectedRows) return res.status(422).json({
        message: `Something went wrong while creating a new Feedback Log`,
        details: creation_result,
    });


    let sql = `SELECT * FROM feedback_logs WHERE feedback_log_id = LAST_INSERT_ID();`;

    let [new_feedback_log_details] = await query(sql);

    //we should add the creator to the Feedback Log now

    let association_result = await query(`INSERT into feedback_log_user_associations (feedback_log_id, user_id) VALUES ( ?, ? )`, new_feedback_log_details.feedback_log_id, req.user.id);

    if (!association_result || !association_result?.affectedRows) return res.status(422).json({
        message: `Something went wrong while creating associating creator to Feedback Log`,
        creation_result,
        new_feedback_log_details,
        association_result,
    });

    return res.status(201).json(new_feedback_log_details);
});


//fetches details of a feedback log, including the items therein
feedbackLogRouter.get('/:feedback_log_id', async (req, res) => {

    if (!req.user.feedback_logs.includes(parseInt(req.params.feedback_log_id))) {
        return res.status(403).send(`Forbidden: You do not have access to this Feedback Log.`);
    }

    let {
        feedback_log_items,
        ...feedback_log_details
    } = await helper.fetch_by_id([req.params.feedback_log_id], {}, {
        users: true,
        items: true,
    }) || {};

    if (!Object.keys(feedback_log_details || {}).length || !feedback_log_items) {
        return res.status(404).json({message: `Feedback Log ${req.params.feedback_log_id} Not Found.`, not_found: true});
    }

    return res.status(200).json({
        success: true,
        ...feedback_log_details,
        data: feedback_log_items
    });
});

//create an item in a log 
feedbackLogRouter.post('/:feedback_log_id/new_item', async (req, res) => {

    let feedback_log_exists = await helper.fetch_by_id([req.params.feedback_log_id]);

    if (!feedback_log_exists) {
        return res.status(404).send(`Feedback Log ${req.params.feedback_log_id} Not Found.`);
    }

    if (!req.user.is_total && !req.user.feedback_logs.includes(parseInt(req.params.feedback_log_id))) {
        return res.status(403).send(`Forbidden: You do not have access to this Feedback Log.`);
    }

    if (feedback_log_exists.archived) {
        return res.status(403).send(`Forbidden: Feedback Log ${req.params.feedback_log_id} has been archived.`);
    }

    if (!req.body.content || !req.body.header) {
        return res.status(400).send(`content and header are required.`);
    }

    const sql_1 = 'INSERT INTO feedback_log_items (content, header, status, feedback_log_id, created_by) VALUES (?, ?, ?, ?, ?);';

    let feedback_log_item_creation = await query(sql_1, req.body.content, req.body.header, req.body.status || 'submitted', req.params.feedback_log_id, req.user.id);

    if (!feedback_log_item_creation || !feedback_log_item_creation?.affectedRows) {
        return res.status(422).json({
            message: `Something went wrong`,
            details: feedback_log_item_creation
        });
    }

    let [new_feedback_log_item_details] = await query(`SELECT * FROM feedback_log_items WHERE feedback_log_item_id = LAST_INSERT_ID();`);

    return res.status(201).json(new_feedback_log_item_details);
});

//edit a feedback log (change notes or name)
feedbackLogRouter.put('/:feedback_log_id', async (req, res) => {


    if (!req.user.is_total && (['basic_client', 'pro_client'].includes(req.user.permissions) || !req.user.feedback_logs.includes(parseInt(req.params.feedback_log_id)))) {
        return res.status(403).send(`Forbidden: You do not have access to editing this Feedback Log.`);
    }

    const {
        name,
        notes,
        archived
    } = req.body;

    if (!name && !notes && archived == null) {
        return res.status(400).send(`Either name, archived or notes must be provided.`);
    }

    let feedback_log_details = await helper.fetch_by_id([req.params.feedback_log_id]);

    if (!feedback_log_details) {
        return res.status(404).send(`Feedback Log ${req.params.feedback_log_id} Not Found.`);
    }


    if (!req.user.is_total && feedback_log_details.archived) {
        return res.status(403).send(`Forbidden: This Feedback Log has been archived and cannot be edited.`);
    }


    const update_sql = `UPDATE feedback_logs SET name = ?, notes = ?, archived = ? WHERE feedback_log_id = ?;`;

    let feedback_log_update = await helper.update_single({
        name: name || feedback_log_details.name,
        notes: JSON.stringify(notes || feedback_log_details.notes),
        archived: archived ?? feedback_log_details.archived,
    }, req.params.feedback_log_id);

    if (!feedback_log_update?.success) {
        return res.status(422).json({
            success: false,
            message: `Something went wrong`,
            details: feedback_log_update
        });
    }

    feedback_log_details = await helper.fetch_by_id([req.params.feedback_log_id]);

    return res.status(200).json({
        success: true,
        data: feedback_log_details
    });
});

//give user access to feedback log
feedbackLogRouter.post('/:feedback_log_id/add_user', async (req, res) => {

    if (!req.body.user_id) {
        return res.status(400).send('user_id is required');
    }

    if (!req.user.is_total && (['basic_client', 'pro_client'].includes(req.user.permissions) || !req.user.feedback_logs.includes(parseInt(req.params.feedback_log_id)))) {
        return res.status(403).send(`Forbidden: You do not have access to adding users to this Feedback Log.`);
    }

    let feedback_log_details = await helper.fetch_by_id([req.params.feedback_log_id]);

    if (!feedback_log_details) {
        return res.status(404).send(`Feedback Log ${req.params.feedback_log_id} Not Found.`);
    }

    let association_result = await query(`INSERT into feedback_log_user_associations (feedback_log_id, user_id) VALUES ( ?, ? )`, feedback_log_details.feedback_log_id, req.body.user_id);

    if (!association_result || !association_result?.affectedRows) return res.status(422).json({
        message: `Something went wrong while creating associating user to Feedback Log`,
        details: association_result,
    });

    return res.status(201).json(association_result);
});


export default feedbackLogRouter;