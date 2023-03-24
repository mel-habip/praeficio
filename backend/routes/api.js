"use strict"
import express from 'express';
const apiRouter = express.Router();
import emailService from '../jobs/emailService.js';
import authenticateToken from '../jobs/authenticateToken.js';
import * as random from '../utils/random_value_generators.js';

const log = console.log;

apiRouter.use(authenticateToken);


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

export default apiRouter;