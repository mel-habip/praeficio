import Papa from 'papaparse';
import fs from 'fs';
import formidable from 'formidable';
import path from 'path';
import express from 'express';
const positionRouter = express.Router();
const log = console.log;
var counter = 0; //used for additional randomization on temp files

import {
    fileURLToPath
} from 'url';

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));

import authenticateToken from '../jobs/authenticateToken.js';
import defaultPermissions from '../constants/defaultPermissions.js';
import query from '../utils/db_connection.js';
import emailService from '../jobs/emailService.js';

positionRouter.use(authenticateToken);

positionRouter.get('/user/:user_id', async (req, res) => {
    let sql = `Select * FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.user_id = ?;`;

    let matches = await query(sql, req.params.user_id);

    if (!matches) return res.status(404).send(`Not found.`);

    if (parseInt(req.params.user_id) === req.user.id) return res.status(200).json(matches);

    if (defaultPermissions.access.extract_position_data.includes(req.user.permissions)) return res.status(200).json(matches);

    if (req.user.workspaces.includes(match.workspace_id))

        return res.status(200).json(matches.filter(pos => req.user.workspaces.includes(pos.workspace_id)));
});

positionRouter.get('/:position_id', async (req, res) => {
    let sql = `Select * FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.position_id = ? LIMIT 1;`;

    let [match] = await query(sql, req.params.position_id);

    if (!match) return res.status(404).send(`Position not found.`);

    if (match.user_id === req.user.id) return res.status(200).json(match);

    if (defaultPermissions.access.extract_position_data.includes(req.user.permissions)) return res.status(200).json(match);

    if (req.user.workspaces.includes(match.workspace_id)) return res.status(200).json(match);

    return res.status(403).send(`Forbidden: ${req.user.permissions} (Workspaces ${req.user.workspaces}) cannot view this Position.`);

    /**
     * 1) who does the position belong to?
     * 2) if self, provide & return
     * 3) if other, does the user have permission to see others' positions?
     * 4) if yes, are do they have access to this specific user via the workspace?
     * 5) if yes, provide & return
     */
});

positionRouter.post('/', async (req, res) => {

    if (req.user.id !== req.body.user_id && !defaultPermissions.actions.create_positions_for_others.includes(req.user.permissions)) {
        return res.status(403).send(`Forbidden: ${req.user.permissions} cannot create Position for non-self.`);
    }

    let sql = `INSERT INTO positions (user_id, ticker, acquired_on, sold_on) VALUES (?, ?, ?, ?)`;

    let result = await query(sql, req.body.user_id, req.body.ticker, req.body.acquired_on, req.body.sold_on);

    if (!result) return res.status(422).send(`Something went wrong while creating a new Position`);

    sql = `SELECT * FROM positions WHERE position_id = LAST_INSERT_ID();`;

    result = await query(sql);

    return res.status(200).json(result);
});

positionRouter.post('/import', (req, res) => {

    const provided_data = []; //TODO: provide import modes as CSV, XML or JSON in prescribed formats

    let form = new formidable.IncomingForm(); //TODO: test test test!

    //Process the file upload in Node
    form.parse(req, function (error, fields, file) {

        if (error) return res.status(422).send(`Something went wrong while importing`);

        let filepath = file.fileupload.filepath;
        let newpath = '../temp_files/';
        newpath += file.fileupload.originalFilename;

        //Copy the uploaded file to a custom folder
        fs.rename(filepath, newpath, function (err) {
            if (err) return res.status(422).send(`Something went wrong while importing`);
        });
        //then, process the file

        const csv = Papa.parse(newpath);
        csv.forEach(e => provided_data.push(e));
    });



    let sql = `INSERT INTO positions (user_id, ticker, acquired_on, sold_on) ` + provided_data.map(row => `('${row.user_id}', '${row.ticker}', '${row.acquired_on}', '${row.sold_on}')`).join(', ') + ';';

});

positionRouter.post('/export', async (req, res) => {

    let sql = `SELECT * FROM positions` //TODO: finish this, provide as a CSV... I know how to prepare but not sure about making the FE download;

    let result = await query(sql);

    //implement Json logic from --> https://jsonlogic.com/ ? Or build your own? I don't like this one too much and can build a simplified version of it myself
    //consider a mechanism whereby we do the filter at the SQL level instead of JS. In theory this should reduce Server Memory usage? 

    // let filtered_result = result.filter(position => condition_evaluator(req.body.filter_rule, position));

    const csv = Papa.unparse(result);
    counter++;
    const temp_name = `${Date.now()}-${counter}.csv`;
    const filePath = path.join(__dirname + '/temp_files', temp_name);

    fs.writeFileSync(filePath, csv, (err) => {
        if (err) throw err;
    });

    res.status(200).download(filePath, async (err) => {
        let att = [{
            filename: temp_name,
            content: fs.createReadStream(filePath)
        }];

        let email = await emailService({
            to: 'mel.habip@gmail.com',
            subject: 'Export Demo',
            text: 'export demo',
            attachments: att
        });

        if (err) res.status(422).json(err);

        if (req.query?.keep !== 'true') fs.unlinkSync(filePath);
    });

});


export default positionRouter;