"use strict"
import express from 'express';
const alertsRouter = express.Router();
import emailService from '../jobs/emailService.js'; //won't need here
import authenticateToken from '../jobs/authenticateToken.js';
import defaultPermissions from '../constants/defaultPermissions.js';
import query from '../utils/db_connection.js';

const log = console.log;

alertsRouter.use(authenticateToken);

//test api
alertsRouter.get('/', async (req, res) => {
    res.status(200).send('Hello World from the Alerts section!');
});

//Create a new Alert
alertsRouter.post('/', async (req, res) => {
    let {UserID, Type, Frequency, Active, Notes} = req.body;

    if (!UserID || !Type || !Frequency) {
        return res.status(400).send(`Params UserID, Type, Frequency are required`);
    }
    UserID = parseInt(UserID);

    if (parseInt(UserID) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.Permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let SQL = `INSERT INTO Alerts (UserID, Type, Frequency, Active, Notes) VALUES ?, ?, ?, ?, ?;`;

    let result = await query(SQL, UserID, Type, Frequency, Active, Notes);

    if (!result) return res.status(422).send(`Something went wrong while creating Alert.`);

    SQL = `SELECT * FROM Alerts WHERE AlertID = LAST_INSERT_ID();`;

    [result] = await query(SQL);

    if (!result) return res.status(422).send(`Something went wrong while creating Alert.`);

    return res.status(200).json(result);

});

//See alerts of a single user
alertsRouter.get('/:user_id', async (req, res) => {

    if (parseInt(req.params.user_id) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.Permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let matches = await query(`SELECT * FROM Alerts WHERE UserID = ?`, req.params.user_id);

});

//See details of a single user
alertsRouter.get('/:alert_id', async (req, res) => {
    let [match] = await query(`SELECT * FROM Alerts WHERE AlertID = ?`, req.params.alert_id);
    

    if (match.UserID !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.Permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    

});

//Update a single Alert
alertsRouter.put('/:alert_id', async (req, res) => {
    let [match] = await query(`SELECT * FROM Alerts WHERE AlertID = ?`, req.params.alert_id);

    if (!match) return res.status(404).send('Requested resource not found.');

    if (parseInt(match.UserID) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.Permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let result = await query(`UPDATE Alerts WHERE AlertID = ? SET Frequency = ? , Notes = ?, Active = ?, Type = ?;`, [req.params.alert_id, req.body.frequency ?? match.Frequency, req.body.notes ?? match.Notes, req.body.active, req.body.type ?? match.Type]);

    if (!result) return res.status(422).send(`Something went wrong while updating Alert.`);
});

//turn off a single Alert (just a quicker way)
alertsRouter.put('/:alert_id/turn_off', async (req, res) => {});

//delete a single Alert
alertsRouter.delete('/:alert_id', async (req, res) => {

    if (parseInt(req.params.user_id) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.Permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let result = await query(`DELETE FROM Alerts WHERE AlertID = ?;`, req.params.alert_id);

    if (!result.status) return res.status(422).send('Something went wrong.');

    return res.status(204).json(result);

});

export default alertsRouter;