"use strict"
import express from 'express';
const tiddlesRouter = express.Router();

import multer from 'multer';

import {
    uploadToS3
} from '../utils/s3_connection.js';
import TiddlesGalleryService from '../modules/TiddlesGalleryService.mjs';
import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';

const helper = new TiddlesGalleryService();

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage
})

tiddlesRouter.post('/', upload.single('image'), async (req, res) => {
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
        url: upload_result.name_used,
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

});

tiddlesRouter.get('/random', async (req, res) => {
    const sql = `SELECT COUNT(${helper.primary_key}) FROM ${helper.table_name}`;

    const [{"COUNT(photo_id)" : count}] = await helper.query(sql);

    console.log(count);

    return res.status(200).json(count);
});


export default tiddlesRouter;