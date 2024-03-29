"use strict"
import {
    Router
} from 'express';
const todosRouter = Router();
import emailService from '../jobs/emailService.js';
import authenticateToken from '../jobs/authenticateToken.js';

import ToDoService from '../modules/ToDoService.mjs';

const helper = new ToDoService();

import query from '../utils/db_connection.js';

import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';

const log = console.log;

todosRouter.use(authenticateToken);

todosRouter.get('/', async (req, res) => {
    res.status(200).send(`Hello World from ToDo's!`);
});

//fetch user's own todos
todosRouter.get(`/my_todos`, async (req, res) => {

    let results = await query(`SELECT * FROM todos WHERE user_id = ? AND archived = ${req.query.archived==='true' ? 'TRUE': 'FALSE'};`, req.user.id);

    return res.status(!!results ? 200 : 422).json({
        success: !!results ? true : false,
        data: results
    });
});

//create a ToDo
todosRouter.post(`/`, validateAndSanitizeBodyParts({
    content: 'string',
    category: 'string',
    due_on: 'date'
}, ['content', 'category']), async (req, res) => {

    let creation = await helper.create_single({
        user_id: req.user.id,
        content: req.body.content,
        category: req.body.category,
        due_on: req.body.due_on,
    });

    if (creation?.success) {
        return res.status(201).json(creation.details);
    }

    return res.status(422).json({
        success: false,
        details: creation?.details,
        message: creation?.message
    });
});

//edit a ToDo
todosRouter.put('/:to_do_id/', validateAndSanitizeBodyParts({
    content: 'string',
    category: 'string',
    due_on: 'date',
    archived: 'boolean',
    completed: 'boolean'
}, []), async (req, res) => {
    let match = await helper.fetch_by_id([req.params.to_do_id]);

    if (!match) return res.status(404).send(`ToDo not found.`);

    if (match.user_id !== req.user.id) {
        return res.status(403).send(`Forbidden: ${req.user.permissions} cannot view this ToDo.`);
    }

    if (match.archived) return res.status(400).send(`ToDo is archived and is uneditable`);

    if (req.body.completed && !match.completed) { //means this is the request that completes it
        req.body.completed_on = new Date();
    } else if (req.body.completed === false && match.completed) { //we are undoing the completion
        req.body.completed_on = null;
    }

    let update_details = await helper.update_single(req.body, req.params.to_do_id);

    if (!update_details?.success) {
        return res.status(422).json({
            success: false,
            message: update_details?.message || 'failed',
            details: update_details?.details
        });
    }

    return res.status(200).json({
        success: true,
        message: update_details?.message || 'updated',
        data: update_details?.details
    });

    // let update_sql = `UPDATE todos SET content = ?, category = ?, completed = ?, archived = ? WHERE to_do_id = ?`;

    // let props = ['content', 'category', 'completed', 'archived'];

    // let propDefaults = {
    //     content: "",
    //     category: "General",
    //     completed: false,
    //     archived: false,
    // };



    // //if value coming is is not null, it is intentional, so if blank, set to null to clear value
    // //if value coming is nullish, its not intentional, so try to keep as is by referencing the match
    // let result = await query(update_sql, props.map(prop => (req.body[prop] == null) ? match[prop] : req.body[prop] || propDefaults[prop]).concat(req.params.to_do_id));

    // if (result?.affectedRows) {
    //     let data = await helper.fetch_by_id([req.params.to_do_id]);

    //     return res.status(200).json({
    //         success: true,
    //         message: 'updated',
    //         data: data
    //     });
    // } else {
    //     return res.status(422).json({
    //         success: false,
    //         message: 'failed',
    //         details: result
    //     });
    // }
});

//delete a ToDo
todosRouter.delete('/:to_do_id/', async (req, res) => {
    let match = await helper.fetch_by_id([req.params.to_do_id], {
        archived: false
    });

    if (!match) return res.status(404).send(`ToDo not found.`);

    if (match.user_id !== req.user.id) {
        return res.status(403).send(`Forbidden: ${req.user.permissions} cannot view this ToDo.`);
    }

    if (match.archived) return res.status(400).send(`ToDo is archived and is uneditable`);

    let result = await helper.hard_delete(req.params.position_id);

    return res.status(result.success ? 200 : 422).json(details);
});

//move all to archive
todosRouter.post(`/archive_all_completed`, async (req, res) => {
    let results = await query(`UPDATE todos SET archived = TRUE WHERE user_id = ? AND archived = FALSE and completed = TRUE;`, req.user.id);

    return res.status(!!results ? 201 : 422).json({
        success: !!results ? true : false,
        data: results,
        updated: results.affectedRows
    });
});

export default todosRouter;