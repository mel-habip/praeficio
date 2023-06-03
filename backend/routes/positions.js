import Papa from 'papaparse';
import fs from 'fs';
import formidable from 'formidable';
import path from 'path';
import {Router} from 'express';
const positionRouter = Router();
const log = console.log;
var counter = 0; //used for additional randomization on temp files

import {
    fileURLToPath
} from 'url';

const __dirname = path.dirname(fileURLToPath(
    import.meta.url));

import authenticateToken from '../jobs/authenticateToken.js';
import defaultPermissions, {
    positions
} from '../constants/defaultPermissions.js';
import query from '../utils/db_connection.js';
import emailService from '../jobs/emailService.js';
import PositionService from '../modules/PositionService.mjs';

const helper = new PositionService();

positionRouter.use(authenticateToken);



//all positions of a user, including the workspaces to which they might be associated
positionRouter.get('/user/:user_id', async (req, res) => {

    console.log('query', req.query)

    let query_to_text = 'AND deleted = FALSE AND active = TRUE';

    if (req.query.include_deleted?.toLowerCase() === 'true') {
        query_to_text = '';
    } else if (req.query.include_inactive?.toLowerCase() === 'true') {
        query_to_text = 'AND deleted = FALSE';
    }

    let sql = `Select positions.*, workspace_id FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.user_id = ? ${query_to_text};`;

    let matches = await query(sql, req.params.user_id);

    if (!matches) return res.status(404).send(`Not found.`);

    if (parseInt(req.params.user_id) === req.user.id) return res.status(200).json(matches);

    if (defaultPermissions.access.extract_position_data.includes(req.user.permissions)) return res.status(200).json(matches);

    if (req.user.workspaces.includes(match.workspace_id)) return res.status(200).json(matches.filter(pos => req.user.workspaces.includes(pos.workspace_id)));
});

//details of a single position
positionRouter.get('/:position_id', async (req, res) => {

    let match = await helper.fetch_by_id([req.params.position_id]);

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

//create new position
positionRouter.post('/', async (req, res) => {

    let {
        user_id,
        ticker,
        acquired_on,
        sold_on,
        notes = [],
        size,
    } = req.body;

    if (!user_id || !ticker) return res.status(400).send(`Params user_id and ticker are required.`);

    try {
        notes = JSON.stringify(notes);
    } catch {
        return res.status(400).send(`Param notes is invalid JSON.`);
    }

    if (req.user.id !== user_id) { //TODO: permissions
        return res.status(403).send(`Forbidden: ${req.user.permissions} cannot create Position for non-self.`);
    }

    let sql = `INSERT INTO positions (user_id, ticker, size, acquired_on, sold_on, notes) VALUES (?, ?, ?, ?, ?, ?)`;

    let result = await query(sql, user_id, ticker, size, acquired_on || null, sold_on || null, notes);

    if (!result || !result?.affectedRows) return res.status(422).send(`Something went wrong while creating a new Position`);

    sql = `SELECT * FROM positions WHERE position_id = LAST_INSERT_ID();`;

    [result] = await query(sql);

    return res.status(201).json(result);
});

//import positions in bulk TODO:
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

//export positions in bulk
positionRouter.post('/export', async (req, res) => {

    let sql = `SELECT * FROM positions` //TODO: finish filtering this

    const result = await query(sql);

    //implement Json logic from --> https://jsonlogic.com/ ? Or build your own? I don't like this one too much and can build a simplified version of it myself
    //consider a mechanism whereby we do the filter at the SQL level instead of JS. In theory this should reduce Server Memory usage? 

    // let filtered_result = result.filter(position => condition_evaluator(req.body.filter_rule, position));
    counter++;

    let temp_name = `${Date.now()}-${counter}`;
    let filePath = path.join(__dirname + '/temp_files', temp_name);

    if (req.query?.format === 'json') {
        temp_name += `.json`;
        filePath += `.json`;

        fs.writeFileSync(filePath, JSON.stringify(result, null, 2), (err) => {
            if (err) throw err;
        });
    } else if (req.query?.format === 'xml') {
        //handle xml
    } else {
        const csv = Papa.unparse(result);
        temp_name += `.csv`;
        filePath += `.csv`;

        fs.writeFileSync(filePath, csv, (err) => {
            if (err) throw err;
        });
    }

    return res.status(200).download(filePath, async (err) => {
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

//soft-delete position
positionRouter.delete('/:position_id', async (req, res) => {

    let match = await helper.fetch_by_id([req.params.position_id], {
        deleted: false
    });

    if (!match) return res.status(404).send(`Position not found.`);

    if (match.user_id === req.user.id) {
        //good
    } else if (defaultPermissions.access.extract_position_data.includes(req.user.permissions)) {
        //good
    } else if (req.user.workspaces.includes(match.workspace_id)) {
        //good
    } else {
        return res.status(403).send(`Forbidden: ${req.user.permissions} (Workspaces ${req.user.workspaces}) cannot view this Position.`);
    }

    let result = await helper.soft_delete(req.params.position_id);

    return res.status(result.success ? 200 : 422).json(result);
});

//un-soft-delete position
positionRouter.put('/:position_id/recover', async (req, res) => {



    let match = await helper.fetch_by_id([req.params.position_id]);

    if (!match) return res.status(404).send(`Position not found.`);

    if (match.user_id === req.user.id) {
        //good
    } else if (defaultPermissions.access.extract_position_data.includes(req.user.permissions)) {
        //good
    } else if (req.user.workspaces.includes(match.workspace_id)) {
        //good
    } else {
        return res.status(403).send(`Forbidden: ${req.user.permissions} (Workspaces ${req.user.workspaces}) cannot view this Position.`);
    }

    let result = await helper.un_soft_delete(req.params.position_id);

    return res.status(result.success ? 200 : 422).json(result);

});

//reactivate inactive position
positionRouter.put('/:position_id/reactivate', async (req, res) => {
    let sql = `Select positions.*, workspace_position_associations.workspace_id  FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.position_id = ? AND DELETED = FALSE LIMIT 1;`;

    let [match] = await query(sql, req.params.position_id);

    if (!match) return res.status(404).send(`Position not found.`);

    if (match.user_id === req.user.id) {
        //good
    } else if (defaultPermissions.access.extract_position_data.includes(req.user.permissions)) {
        //good
    } else if (req.user.workspaces.includes(match.workspace_id)) {
        //good
    } else {
        return res.status(403).send(`Forbidden: ${req.user.permissions} (Workspaces ${req.user.workspaces}) cannot view this Position.`);
    }

    sql = `UPDATE positions SET active = TRUE WHERE position_id = ?`;

    let result = await query(sql, req.params.position_id);

    if (result?.affectedRows) {
        return res.status(200).json({
            success: true,
            message: 'reactivated',
            data: match
        });
    } else {
        return res.status(422).json({
            success: false,
            message: 'failed',
            details: result
        });
    }

});

//deactivate position
positionRouter.put('/:position_id/deactivate', async (req, res) => {
    let sql = `Select positions.*, workspace_position_associations.workspace_id  FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.position_id = ? AND DELETED = FALSE LIMIT 1;`;

    let [match] = await query(sql, req.params.position_id);

    if (!match) return res.status(404).send(`Position not found.`);

    if (match.user_id === req.user.id) {
        //good
    } else if (defaultPermissions.access.extract_position_data.includes(req.user.permissions)) {
        //good
    } else if (req.user.workspaces.includes(match.workspace_id)) {
        //good
    } else {
        return res.status(403).send(`Forbidden: ${req.user.permissions} (Workspaces ${req.user.workspaces}) cannot view this Position.`);
    }

    sql = `UPDATE positions SET active = FALSE WHERE position_id = ?`;

    let result = await query(sql, req.params.position_id);

    if (result?.affectedRows) {
        return res.status(200).json({
            success: true,
            message: 'deactivated',
            data: match
        });
    } else {
        return res.status(422).json({
            success: false,
            message: 'failed',
            details: result
        });
    }

});

//edit a position
positionRouter.put('/:position_id/', async (req, res) => {

    let match = await helper.fetch_by_id([req.params.position_id], {
        deleted: false
    });

    if (!match) return res.status(404).send(`Position not found.`);

    if (match.user_id === req.user.id) {
        //good
    } else if (defaultPermissions.access.extract_position_data.includes(req.user.permissions)) {
        //good
    } else if (req.user.workspaces.includes(match.workspace_id)) {
        //good
    } else {
        return res.status(403).send(`Forbidden: ${req.user.permissions} (Workspaces ${req.user.workspaces}) cannot view this Position.`);
    }

    let update_sql = `UPDATE positions SET ticker = ?, size = ?, acquired_on = ?, sold_on = ?, active = ?, notes = ? WHERE position_id = ?`;

    let props = ['ticker', 'size', 'acquired_on', 'sold_on', 'active', 'notes'];

    //if value coming is is not null, it is intentional, so if blank, set to null to clear value
    //if value coming is nullish, its not intentional, so try to keep as is by referencing the match
    let result = await query(update_sql, props.map(prop => {
        if (prop === 'notes') {
            return (req.body[prop] == null) ? JSON.stringify(match[prop]) : JSON.stringify(req.body[prop]) || "[]"
        }
        return (req.body[prop] == null) ? match[prop] : req.body[prop] || null

    }).concat(req.params.position_id));

    if (result?.affectedRows) {
        let data = await helper.fetch_by_id([req.params.position_id]);
        return res.status(200).json({
            success: true,
            message: 'updated',
            data
        });
    } else {
        return res.status(422).json({
            success: false,
            message: 'failed',
            details: result
        });
    }

});



export default positionRouter;