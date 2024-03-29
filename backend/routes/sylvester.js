"use strict"
import express from 'express';
const sylvesterRouter = express.Router();

import NodeCache from "node-cache";
const sylvesterRouterCache = new NodeCache();

import multer from 'multer';

import {
    uploadToS3,
    fetchFromS3,
} from '../utils/s3_connection.js';

import GalleryService from '../modules/GalleryService.mjs';
import authenticateToken from '../jobs/authenticateToken.js';
import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';
import {
    ranNumber
} from '../utils/random_value_generators.js';

const helper = new GalleryService('sylvester');

const storage = multer.memoryStorage()
const upload = multer({
    storage
})

sylvesterRouter.post('/', authenticateToken, upload.single('image'), async (req, res) => {

    //Mel & Molly's user's IDs
    if (![1, 16].includes(req.user.id)) return res.status(403).json({
        message: "Forbidden: You do not have access to this."
    });

    const file = req.file;
    const {
        description,
        tags,
        file_name
    } = req.body;

    if (!description) return res.status(400).json({
        message: `Description is required.`
    });

    if (!file_name || !file) return res.status(400).json({
        message: `File (image) is required.`
    });

    if (tags && Array.isArray(tags)) {
        try {
            tags = JSON.stringify(tags, null, 0);
        } catch {
            return res.status(400).json({
                message: `Invalid Tags`
            });
        }
    } else if (tags && typeof tags !== 'string') {
        return res.status(400).json({
            message: `Invalid Tags`
        });
    }

    console.log('file_name', file_name);

    if (!['jpeg', 'jpg', 'png', 'gif', 'mp4', 'mov', 'mpeg4'].some(file_type => file_name.toLowerCase().trim().endsWith('.' + file_type))) return res.status(400).json({
        message: `File type not supported.`
    });

    const upload_result = await uploadToS3(file.buffer, file.mimetype);

    if (!upload_result || !upload_result?.result) return res.status(422).json({
        message: 'Upload failed'
    });

    const creation = await helper.create_single({
        file_name: upload_result.name_used,
        tags,
        description,
        mime_type: file.mimetype,
    });

    if (!creation?.success) return res.status(422).json({
        message: `Post Creation failed.`
    });

    return res.status(201).json({
        ...creation.details
    });
});

sylvesterRouter.post('/search', validateAndSanitizeBodyParts({
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

sylvesterRouter.get('/', async (req, res) => {
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
sylvesterRouter.get('/random', async (req, res) => {
    const sql = `SELECT COUNT(${helper.primary_key}) FROM ${helper.table_name}`;


    const [{
        "COUNT(photo_id)": count
    }] = await helper.query(sql);

    if (!count) return res.status(401).json({
        message: `No items in gallery to showcase`
    });

    let random, fetch_counter = 0;

    if (count === 1) {
        random = await helper.query(`SELECT * FROM ${helper.table_name}`);
        random = random?. [0];
    } else {
        const last_id_served_to_this_requester = sylvesterRouterCache.get(req.ip);

        while (!random && fetch_counter < 10) {
            fetch_counter++;
            let random_id = ranNumber(count + 1);
            if (last_id_served_to_this_requester === random_id) continue;
            if (!random_id) random_id = 1;
            random = await helper.query(`SELECT * FROM ${helper.table_name} WHERE ${helper.primary_key} = ?`, random_id);
            random = random?. [0];
            console.log(`Fetching ${random_id}`, random);
        }
    }

    if (!random) return res.status(422).json({
        message: `Something went wrong`
    });

    //save the last served to that IP in cache to not serve the same one again
    sylvesterRouterCache.set(req.ip, random[helper.primary_key]);

    random.url = await fetchFromS3(random.file_name);

    return res.status(200).json(random);
});


export default sylvesterRouter;