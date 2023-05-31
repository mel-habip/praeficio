const PORT = process.env.PORT || 8000;

import express from 'express';
import cors from 'cors';

//global middlewares
import rateLimit from 'express-rate-limit'
import extractIP from './jobs/extractIP.js';
import {
    checkDatabaseConnection
} from './utils/db_connection.js';

//all routers
import userRouter from './routes/users.js';
import positionRouter from './routes/positions.js';
import workspacesRouter from './routes/workspaces.js';
import workspaceMessagesRouter from './routes/workspace_messages.js'
import alertsRouter from './routes/alerts.js';
import todosRouter from './routes/todos.js';
import newsletterRouter from './routes/newsletters.js'
import apiRouter from './routes/api.js';
import subscriberRouter from './routes/subscribers.js'
import feedbackLogRouter from './routes/feedback_logs.js';
import feedbackLogFilterRouter from './routes/feedback_log_filters.js';
import feedbackLogItemsRouter from './routes/feedback_log_items.js';
import feedbackLogItemMessagesRouter from './routes/feedback_log_item_messages.js';
import debtAccountRouter from './routes/debt_accounts.js'
import debtAccountTransactionRouter from './routes/debt_account_transactions.js'


import REGULAR_SCHEDULED_JOBS from './scheduled_jobs/regular_internal_jobs.js';


const log = console.log;
const rateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 150, // Limit each IP to 150 requests per `window` (here, per 10 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next) => res.status(429).json({
        message: 'Too many requests, please try again later.'
    })
});

const APP = express(); //creating and starting the server
APP.set('trust proxy', 1);
APP.get('/ip', (request, response) => response.send(request.ip)); //for testing purposes
APP.use(cors());
APP.use(express.json());
APP.use(extractIP);
APP.use(rateLimiter);
APP.use(checkDatabaseConnection);

APP.use(function errorHandler(err, req, res, next) {
    if (!err) return next();
    console.error(err.stack);
    return res.status(500).render('500', {
        error: err.stack
    });
});

APP.use('/users', userRouter);
APP.use('/positions', positionRouter);
APP.use('/workspaces', workspacesRouter);
APP.use('/workspace_messages', workspaceMessagesRouter);
APP.use('/alerts', alertsRouter);
APP.use('/todos', todosRouter);
APP.use('/api', apiRouter);
APP.use('/feedback_logs', feedbackLogRouter);
APP.use('/feedback_log_filters', feedbackLogFilterRouter);
APP.use('/feedback_log_items', feedbackLogItemsRouter);
APP.use('/feedback_log_item_messages', feedbackLogItemMessagesRouter);
APP.use('/subscribers', subscriberRouter);
APP.use('/newsletters', newsletterRouter);
APP.use('/debt_accounts', debtAccountRouter);
APP.use('/debt_account_transactions', debtAccountTransactionRouter);

//starts the cron jobs
Object.values(REGULAR_SCHEDULED_JOBS).forEach(job => job.start());

/**
 * TODO LIST:
 * 1) Add email sending integration
 *   1.1) Optionally, add SMS sending functionality
 * 2) SQL injection protection
 * 3) Add scheduled jobs
 *   3.1) Dividend Tracker
 *   3.2) Performance Tracker
 * 4) Add Yahoo Finance or another financial data API here
 * 5) Add Load Balancer and define job priorities
 * 6) Create a Sandbox/Staging environment that is ideally not local
 * 7) Create custom permissionning model
 * 8) Create Joint Position Handling where it accumulates a set of positions and sends an email to that user
 */

APP.get('/', (req, res) => {
    return res.status(200).json('Hello World!');
});

APP.listen(PORT);

log(`Server Running on PORT ${PORT}`);