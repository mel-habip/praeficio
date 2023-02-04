"use strict"
import express from 'express';
const apiRouter = express.Router();
import emailService from '../jobs/emailService.js';
import authenticateToken from '../jobs/authenticateToken.js';

const log = console.log;

apiRouter.use(authenticateToken);


userRouter.get('/', async (req, res) => {
    res.status(200).send('Hello World from the API!');
});

userRouter.post('/test_email_service', async (req, res) => {
    let result = await emailService(req.data);

    if (result.success) {
        return res.status(200).json(result);
    }

    return res.status(400).json(result);
});