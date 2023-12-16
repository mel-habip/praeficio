"use strict"
import express from 'express';
import authenticateToken from '../jobs/authenticateToken.js';
import FileStorageService from '../modules/FileStorageService.mjs';
import multer from 'multer';
import generateTemporaryPassword from '../utils/generateTemporaryPassword.js';

import {
    uploadToS3,
    fetchFromS3,
} from '../utils/s3_connection.js';

const fileStorageRouter = express.Router();

const storage = multer.memoryStorage()
const upload = multer({
    storage
});

const helper = new FileStorageService();

// upload a file as a logged in user
fileStorageRouter.post('/logged', authenticateToken, upload.single('file'), async (req, res) => {

    const file = req.file;

    if (!file) return res.status(401).json({
        message: 'No file prodived.'
    });

    const keyLength = req.body.keyLength || 8;

    if (keyLength < 6 || keyLength > 32) return res.status(401).json({
        message: 'Invalid Key Length prodived.'
    });

    const upload = await uploadToS3(file.buffer, file.mimetype);

    const retrieval_key = generateTemporaryPassword(keyLength, true);

    const recordCreation = await helper.create_single({
        user_id: req.user.id,
        file_name: upload.name_used,
        retrieval_key,
        useCount: 1,
    });

    if (recordCreation) return res.status(200).json(recordCreation.details);

    return res.status(422).json({
        message: `Failed to create.`
    });
});

// upload a file as a guest
fileStorageRouter.post('/anon', upload.single('file'), async (req, res) => {

    const file = req.file;
    const keyLength = req.body.keyLength || 8;

    if (keyLength < 6 || keyLength > 32) return res.status(401).json({
        message: 'Invalid Key Length prodived.'
    });

    if (!file) return res.status(401).json({
        message: 'No file prodived.'
    });

    const upload = await uploadToS3(file.buffer, file.mimetype);

    const retrieval_key = generateTemporaryPassword(keyLength, true);

    const recordCreation = await helper.create_single({
        user_id: null,
        file_name: upload.name_used,
        retrieval_key,
        useCount: 1,
    });

    if (recordCreation) return res.status(200).json(recordCreation.details);

    return res.status(422).json({
        message: `Failed to create.`
    });
});


fileStorageRouter.get('/:retrieval_key', async (req, res) => {

    const {
        retrieval_key
    } = req.params;

    if (retrieval_key.length < 8 || retrieval_key.length > 32) return res.status(400).json({
        message: `Bad Request: Invalid format for Retrieval Key.`
    });

    console.log('got here1');
    const findInDb = await helper.fetch_by_criteria({
        retrieval_key,
    });
    console.log('got here1.5');

    const fileURL = findInDb.details?. [0]?.file_name;

    if (!findInDb?.success || !fileURL) return res.status(404).json({
        message: `Resource not found. The key may have been expired.`
    });

    console.log('got here1.7', fileURL);

    const fileFetch = await fetchFromS3(fileURL);
    console.log('got here2');

    if (!fileFetch) {
        return res.status(500).json({
            message: 'Not good esti.'
        });
    }

    const recordDeletion = await helper.hard_delete({
        stored_file_id: findInDb.details?. [0]?.stored_file_id,
    });

    console.log('got here3');

    return res.status(200).json({
        message: `Failed to create.`,
        url: fileFetch,
    });
});

export default fileStorageRouter;