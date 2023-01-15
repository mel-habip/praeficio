import express from 'express';
const positionRouter = express.Router();
const log = console.log;

import authenticateToken from '../jobs/authenticateToken.js';
import authenticateUser from '../jobs/authenticateUser.js';
import {
    defaultPermissions
} from '../constants/defaultPermissions.js';

positionRouter.use(authenticateToken);
positionRouter.use(authenticateUser);



positionRouter.get('/:position_id', (req, res) => {
    let sql = `SELECT ` //TODO: finish this, check a couple things:

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
    let sql = ` ` //TODO: create new position for user prescribed in the data. 
    //TODO: check user permissions to see if they are allowed to create positions for folk other than themselves
});

positionRouter.post('/import', (req, res) => {
    let sql = `SELECT ` //TODO: finish this, provide import modes as CSV, XML or JSON in prescribed formats
});

positionRouter.post('/export', (req, res) => {
    let sql = `SELECT ` //TODO: finish this, provide as a CSV... I know how to prepare but not sure about making the FE download
});


export default positionRouter;