const PORT = process.env.PORT || 8000;

import express from 'express';
import cors from 'cors';

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

import REGULAR_SCHEDULED_JOBS from './scheduled_jobs/regular_internal_jobs.js';

const log = console.log;

const APP = express(); //creating and starting the server
APP.use(cors());
APP.use(express.json());

const mainRouter = express.Router();

APP.use(function errorHandler(err, req, res, next) {
    if (!err) return next();
    console.error(err.stack);
    return res.status(500).render('500', {
        error: err.stack
    });
    // res.status(422).send(`Unprocessable Entity`); //what was there before
});

mainRouter.use('/users', userRouter);
mainRouter.use('/positions', positionRouter);
mainRouter.use('/workspaces', workspacesRouter);
mainRouter.use('/workspace_messages', workspaceMessagesRouter);
mainRouter.use('/alerts', alertsRouter);
mainRouter.use('/todos', todosRouter);
mainRouter.use('/api', apiRouter);
mainRouter.use('/feedback_logs', feedbackLogRouter);
mainRouter.use('/feedback_log_filters', feedbackLogFilterRouter);
mainRouter.use('/feedback_log_items', feedbackLogItemsRouter);
mainRouter.use('/feedback_log_item_messages', feedbackLogItemMessagesRouter);
mainRouter.use('/subscribers', subscriberRouter);
mainRouter.use('/newsletters', newsletterRouter);

Object.values(REGULAR_SCHEDULED_JOBS).forEach(job => job.start());

/**
 * TODO LIST:
 * 1) Add email sending integration
 *   1.1) Optionally, add SMS sending functionality
 * 2) SQL injection protection
 * 3) Rate-Limiting protection
 * 4) Add scheduled jobs
 *   4.1) Dividend Tracker
 *   4.2) Performance Tracker
 * 5) Add Yahoo Finance or another financial data API here
 * 6) Add Load Balancer and define job priorities
 * 7) Spread DB and Server across 2 machines
 * 8) Host on a domain
 * 9) Create a Sandbox/Staging environment that is ideally not local
 * 10) Create custom permissionning model
 * 11) Create Joint Position Handling where it accumulates a set of positions and sends an email to that user
 */

mainRouter.get('/', (req, res) => {
    return res.status(200).json('Hello World!');
});

APP.use('/be', mainRouter); 

APP.listen(PORT);

log(`Server Running on PORT ${PORT}`);