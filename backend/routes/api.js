"use strict"
import express from 'express';
const apiRouter = express.Router();
import emailService from '../jobs/emailService.js';
import authenticateToken from '../jobs/authenticateToken.js';
import * as random from '../utils/random_value_generators.js';
import query from '../utils/db_connection.js';

import fuzzySearch from '../utils/fuzzy_search.js';

import {
    recordTypeMap
} from '../modules/RecordService.mjs';

const log = console.log;

apiRouter.get('/test', async (_, res) => {
    res.status(200).send('<h1>Hello World from the API! (with HTML) <h1/>');
});


apiRouter.get('/', async (_, res) => {
    res.status(200).send('Hello World from the API!');
});


apiRouter.post('/test_email_service', async (req, res) => {
    let result = await emailService(req.data);

    if (result.success) {
        return res.status(200).json(result);
    }

    return res.status(400).json(result);
});

apiRouter.get('/random_result', (_, res) => {

    const ranVal = random.ranNumber(200);
    const message = 'This endpoint is for testing purposes with no foreseeable real application';

    if (ranVal < 100) {
        return res.status(200).json({
            message,
            value: ranVal,
            success: true
        });
    }

    if (ranVal > 175) {
        return res.status(418).json({
            message: 'You found me!',
            value: ranVal,
            success: true
        });
    }

    return res.status(422).json({
        message,
        value: ranVal,
        success: false
    });
});

apiRouter.post('/search', authenticateToken, async (req, res) => { //TODO: Consider some caching here
    const {
        type,
        keyword,
        columns
    } = req.body;


    if (!type || !keyword || !columns || !columns.length) {
        return res.status(400).send(`type, columns and keyword are required.`);
    }

    if (columns.includes('password')) return res.status(400).send(`you may not search passwords`);

    const tableName = recordTypeMap.table_names[type];

    if (!tableName) {
        return res.status(400).send(`type ${type} not recognized.`);
    }

    const sql = `SELECT ${columns.join(', ')} FROM ${tableName};`

    let data = await query(sql, keyword);

    if (!data) return res.status(400).send(`Bad Request`);

    if (!data.length) return res.status(200).json({
        data
    });

    let filtered_data = fuzzySearch(data, columns, keyword);

    return res.status(200).json({
        data: filtered_data.slice(0, 10)
    });

});

apiRouter.get('/my_ip', async (req, res) => {
    return res.status(200).send(`<h1>Your IP address --> ${JSON.stringify(req.custom_ip)} <h1/>`);
});

export default apiRouter;