import express from 'express';
const positionRouter = express.Router();
const log = console.log;

import authenticateToken from '../jobs/authenticateToken.js';
import authenticateUser from '../jobs/authenticateUser.js';
import defaultPermissions from '../constants/defaultPermissions.js';
import connection from '../utils/db_connection.js';

positionRouter.use(authenticateToken);
positionRouter.use(authenticateUser);



positionRouter.get('/:position_id', (req, res) => {
    let sql = `SELECT ${req.params.position_id} FROM Positions` //TODO: finish this, check a couple things:

    //check if query includes 'include-deactivated:true', else filter them out

    /**
     * 1) who does the position belong to?
     * 2) if self, provide & return
     * 3) if other, does the user have permission to see others' positions?
     * 4) if yes, are do they have access to this specific user via the workspace?
     * 5) if yes, provide & return
     */
});

positionRouter.post('/', (req, res) => {

    if (req.user.id !== req.body.user_id && !defaultPermissions.actions.create_positions_for_others.includes(req.user.Permissions)) {
        res.status(403).send(`Forbidden: ${req.user.Permissions} cannot create Position for non-self.`)
    }

    let sql = `INSERT INTO Positions (UserID, Ticker, AcquiredOn, SoldOn) VALUES '${req.body.user_id}', '${req.body.ticker}', '${req.body.acquired_on}', '${req.body.sold_on}'`;



    //TODO: check user permissions to see if they are allowed to create positions for folk other than themselves
});

positionRouter.post('/import', (req, res) => {

    //work the file provided some how
    const provided_data = []; //TODO: provide import modes as CSV, XML or JSON in prescribed formats

    let sql = `INSERT INTO Positions (UserID, Ticker, AcquiredOn, SoldOn) ` + provided_data.map(row => `('${row.user_id}', '${row.ticker}', '${row.acquired_on}', '${row.sold_on}')`).join(', ') + ';';


});

positionRouter.post('/export', (req, res) => {

    let sql = `SELECT * FROM Positions` //TODO: finish this, provide as a CSV... I know how to prepare but not sure about making the FE download;

    let result = [];

    //implement Json logic from --> https://jsonlogic.com/ ? Or build your own? I don't like this one too much and can build a simplified version of it myself
    //consider a mechanism whereby we do the filter at the SQL level instead of JS. In theory this should reduce Server Memory usage? 

    let filtered_result = result.filter(position => condition_evaluator(req.body.filter_rule, position));

    res.status(200).json(filtered_result);

});


export default positionRouter;