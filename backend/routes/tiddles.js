"use strict"
import express from 'express';
const tiddlesRouter = express.Router();

import multer from 'multer';

import {
    uploadToS3,
    fetchFromS3,
} from '../utils/s3_connection.js';

import TiddlesGalleryService from '../modules/TiddlesGalleryService.mjs';
import authenticateToken from '../jobs/authenticateToken.js';
import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';
import {
    ranNumber
} from '../utils/random_value_generators.js';

const helper = new TiddlesGalleryService();

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage
})

tiddlesRouter.post('/', authenticateToken, upload.single('image'), async (req, res) => {

    //Mel & Alek's user's IDs
    if (![1, 13].includes(req.user.id)) return res.status(403).json({
        message: "Forbidden: You do not have access to this."
    });

    const file = req.file;
    const {
        description,
        tags
    } = req.body;

    if (!description) return res.status(400).json({
        message: `Description is required.`
    });
    if (!file) return res.status(400).json({
        message: `File (image) is required.`
    });

    const upload_result = await uploadToS3(file.buffer, file.mimetype);

    if (!upload_result || !upload_result?.result) return res.status(422).json({
        message: 'Upload failed'
    });

    const creation = await helper.create_single({
        file_name: upload_result.name_used,
        tags,
        description,
    });

    if (!creation?.success) return res.status(422).json({
        message: `Post Creation failed.`
    });

    return res.status(201).json({
        ...creation.details
    });
});

tiddlesRouter.post('/search', validateAndSanitizeBodyParts({
    keyword: 'string'
}, ['keyword']), async (req, res) => {
    const search_results = await helper.search_by_keyword(req.body.keyword);

    if (!search_results) return res.status(422).json({
        message: `Search failed.`
    });

    return res.status(200).json({
        data: search_results,
        message: `Retrieved ${search_results.length} results`
    });
});

tiddlesRouter.get('/', async (req, res) => {
    const results = await helper.fetch_all();

    if (!results) return res.status(422).json({
        message: `Something went wrong`
    });

    for await (const result of results) {
        result.url = await fetchFromS3(result.file_name);
    }

    return res.status(200).json(results);
});

//fetches a random entry from the DB
tiddlesRouter.get('/random', async (req, res) => {
    const sql = `SELECT COUNT(${helper.primary_key}) FROM ${helper.table_name}`;

    const [{
        "COUNT(photo_id)": count
    }] = await helper.query(sql);

    if (!count) return res.status(401).json({
        message: `No items in gallery to showcase`
    });

    let random, fetch_counter = 0;

    while (!random && fetch_counter < 10) {
        fetch_counter++;
        let random_id = ranNumber(count + 1);
        if (!random_id) random_id = 1;
        random = await helper.query(`SELECT * FROM ${helper.table_name} WHERE ${helper.primary_key} = ?`, random_id);
        random = random?. [0];
        console.log(`Fetching ${random_id}`, random);
    }

    if (!random) return res.status(422).json({
        message: `Something went wrong`
    });

    random.url = await fetchFromS3(random.file_name);

    return res.status(200).json(random);
});


export default tiddlesRouter;