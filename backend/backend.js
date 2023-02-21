const PORT = 8000;
const DOMAIN = `http://localhost:${PORT}`;


import express from 'express';
import cors from 'cors';
import userRouter from './routes/users.js';
import positionRouter from './routes/positions.js';
import workspacesRouter from './routes/workspaces.js';
import alertsRouter from './routes/alerts.js';

const log = console.log;

import REGULAR_SCHEDULED_JOBS from './scheduled_jobs/regular_internal_jobs.js';



const APP = express(); //creating and starting the server
APP.use(cors());
APP.use(express.json()); 

APP.listen(PORT, '127.0.0.1', () => log(`Server Running on PORT ${PORT}`));

APP.use('/users', userRouter);
APP.use('/positions', positionRouter);
APP.use('/workspaces', workspacesRouter);

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


APP.get('/', (req, res) => {
    res.json('Hello World!');
});