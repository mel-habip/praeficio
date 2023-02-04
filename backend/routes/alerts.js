"use strict"
import express from 'express';
const alertsRouter = express.Router();
import emailService from '../jobs/emailService.js';
import authenticateToken from '../jobs/authenticateToken.js';
import query from '../utils/db_connection.js';

const log = console.log;

alertsRouter.use(authenticateToken);

//test api
alertsRouter.get('/', async (req, res) => {
    res.status(200).send('Hello World from the Alerts section!');
});

//Create a new Alert
alertsRouter.post('/', async (req, res) => {});

//See alerts of a single user
alertsRouter.get('/:user_id', async (req, res) => {});

//See details of a single user
alertsRouter.get('/:alert_id', async (req, res) => {});

//Update a single Alert
alertsRouter.put('/:alert_id', async (req, res) => {});

//turn off a single Alert (just a quicker way)
alertsRouter.put('/:alert_id/turn_off', async (req, res) => {});

//delete a single Alert
alertsRouter.delete('/:alert_id', async (req, res) => {});

export default alertsRouter;