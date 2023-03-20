"use strict"
import express from 'express';
const todosRouter = express.Router();
import emailService from '../jobs/emailService.js';
import authenticateToken from '../jobs/authenticateToken.js';

import query from '../utils/db_connection.js';

const log = console.log;

todosRouter.use(authenticateToken);

todosRouter.get('/', async (req, res) => {
    res.status(200).send(`Hello World from To-Do's!`);
});

todosRouter.get(`/my_todos`, async (req, res) => {
    let results = await query(`SELECT * FROM todos WHERE user_id = ?;`, req.user.id);

    return res.status(200).json({
        success: true,
        data: results
    });
});

todosRouter.post(`/`, async (req, res) => {
    let result = await query(`INSERT INTO todos (user_id, content, category) VALUES ( ?,  ?,  ?);`, [req.user.id, req.body.content, req.body.category]);

    if (result.affectedRows) {
        let [newly_created] = await query(`SELECT * FROM todos WHERE to_do_id = LAST_INSERT_ID();`);
        return res.status(201).json({
            success: true,
            details: newly_created
        });
    } else {
        return res.status(422).json({
            success: false,
            details: result
        });
    }
});

export default todosRouter;