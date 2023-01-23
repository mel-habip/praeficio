"use strict"
import express from 'express';
const userRouter = express.Router();
const log = console.log;

import authenticateToken from '../jobs/authenticateToken.js';
import fetchPermission from '../jobs/fetchPermission.js';
import fetchUserDetails from '../jobs/fetchUserDetails.js';
import fetchWorkspaceIDs from '../jobs/fetchWorkspaceIDs.js';
import defaultPermissions from '../constants/defaultPermissions.js';
import isAvailableUsername from '../jobs/isAvailableUsername.js';
import db_keys from '../constants/db_keys.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import query from '../utils/db_connection.js';
import sql_wrap from '../utils/sql_wrap.js';

userRouter.get('/', authenticateToken, async (req, res) => {

    const include_deactivated = Boolean(req.query.include_deactivated);

    let sql = `SELECT UserID, Username, LastName, FirstName, Email, Permissions, Active, CreatedOn, UpdatedOn FROM Users`;

    if (!include_deactivated) sql += ` WHERE Active = 1;`;

    await query(sql).then(async response => {
        if (!response) {
            log('User Details Fetch Error');
            res.status(422).send('User Details Fetch Error');
            return;
        };
        let permission = await fetchPermission(req.user.id);
        if (defaultPermissions.access.view_all_user_profiles.includes(permission)) {
            return res.json(response);
        } else if (defaultPermissions.access.view_other_users_bulk.includes(permission)) {
            let logged_in_user_workspace_ids = await fetchWorkspaceIDs(req.user.id);
            return res.json(response.filter(user => user.id === req.user.id || logged_in_user_workspace_ids.some(id => user.workspace_ids.includes(id))));
        } else {
            return res.json(response.filter(user => user.UserID === req.user.id));
        }
    });
});

userRouter.post('/create_new_user', async (req, res) => {
    log('received: ', req.body || {});

    if (!req.body.username) {
        return res.status(401).json(`Username required.`);
    }
    if (!req.body.password) {
        return res.status(401).json(`Password required.`);
    }

    if (!await isAvailableUsername(req.body.username)) {
        return res.status(401).json(`Username ${req.body.username} already in use`);
    }

    //hashed = encrypted
    //encryption uses a "Salt" that is generated uniquely for each password. The salt is prepended to the hashed password and functions as the key to decrypt it later on.

    const hashedPassword = await bcrypt.hash(req.body.password, 10); //default strength for salt creation is 10

    let sql = `INSERT INTO Users (Username, Password, FirstName, LastName, Permissions, Email) VALUES ('${req.body.username}', '${hashedPassword}', ${sql_wrap(req.body.FirstName)}, ${sql_wrap(req.body.LastName)}, 'basic_client', ${sql_wrap(req.body.Email)});`;

    await query(sql).then(async result => {
        if (!result) {
            log('New User Creation Error');
            res.status(422).send('New User Creation Error');
            return;
        };
        sql = `SELECT ${db_keys.all_except_pass.join(', ')} FROM Users WHERE UserID = LAST_INSERT_ID();`
        await query(sql).then(result_2 => {
            log("1 record inserted", result_2);
            //Do we want to then create a table specifically for that user and their data?

            res.status(201).send({
                ...result_2[0],
                message: 'Successfully created'
            });
        });
    });
});

userRouter.post('/pre_signed_create_new_user', authenticateToken, async (req, res) => {
    let permission = await fetchPermission(req.user.id);

    if (!defaultPermissions.can_create_new_user.includes(permission)) {
        return res.status(403).send('Forbidden:You do not have access to this.');
    }

    if (!defaultPermissions.permission_access_framework.includes(req.body.Permissions)) {
        return res.status(403).send(`Forbidden: As a ${permission} you do not have access creating ${req.body.Permissions}.'`);
    }

    const required_but_missing = ['Username', 'Email', 'Permissions'].filter(prop => !req.body[prop]);

    if (required_but_missing.length) {
        return res.status(401).json(`Required params missing: ${required_but_missing.join(', ')}`);
    }

    if (!await isAvailableUsername(req.body.Username)) {
        return res.status(401).json(`Username ${req.body.Username} already in use`);
    }

    let temp_password = generateTemporaryPassword(); //send an email now with this to the provided email... there is no email 😳😳😳
    const hashedPassword = await bcyprt.hash(temp_password, 10); //default strength for salt creation is 10

    let sql = `INSERT INTO Users (Username, Password, FirstName, LastName, Permissions, Email) VALUES ('${req.body.Username}', '${hashedPassword}', ${sql_wrap(req.body.FirstName)}, ${sql_wrap(req.body.LastName)}, '${req.body.Permissions}', ${sql_wrap(req.body.Email)});`;

    await query(sql).then(async result => {
        if (!result) {
            log('New User Creation Error');
            res.status(422).send('New User Creation Error');
            return;
        };
        sql = `SELECT ${db_keys.all_except_pass.join(', ')} FROM Users where UserID = LAST_INSERT_ID();`;
        await query(sql).then(result_2 => {
            log("1 record inserted", result_2[0]);
            //Do we want to then create a table specifically for that user and their data?

            res.status(201).send({
                ...result_2[0], 
                message: `Successfully created, User will receive email to activate account`
            });
        });
    });
});

userRouter.post('/login', async (req, res) => {
    let sql = `SELECT * FROM Users WHERE Username = '${req.body.username}'`;

    await query(sql).then(async result => {
        if (!result || !result?. [0]) {
            return res.status(401).json({
                message: `Username not recognized`
            });
        };
        if (!result[0].Active) {
            return res.status(401).json({
                message: `Cannot Login to Inactive Account. Must Activate first.`
            });
        }
        if (await bcrypt.compare(req.body.password, result[0].Password)) {
            const user = {
                id: result[0].UserID
            };
            const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY);
            return res.status(200).send({
                UserID: user.id,
                FirstName: result[0].FirstName,
                LastName: result[0].LastName,
                CreatedOn: result[0].CreatedOn,
                message: `Successful`,
                access_token,
            });
        } else {
            return res.status(401).json({
                message: `Incorrect Password`
            });
        }





        // try {
        // } catch {
        //     return res.status(422).json({
        //         message: `Something went wrong`
        //     });
        // }

    });
});

userRouter.delete('/:user_id', authenticateToken, async (req, res) => {
    let permission = await fetchPermission(req.user.id);

    if (!defaultPermissions.actions.delete_other_user.includes(permission) && req.user.id !== parseInt(req.params.user_id)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }

    if (!defaultPermissions.actions.delete_self_user.includes(permission) && req.user.id === parseInt(req.params.user_id)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }

    let sql = `SELECT Active FROM Users WHERE UserID = ${req.params.user_id};`;



    //TODO: soft-delete the user
});

userRouter.get('/:user_id', authenticateToken, async (req, res) => {
    if (req.user.id === Number(req.params.user_id) || await fetchPermission(req.user.id) === 'total') {
        let sql = `SELECT UserID, Username, LastName, FirstName, Email, Permissions, Active, CreatedOn, UpdatedOn FROM Users WHERE UserID = '${req.params.user_id}'`;
        await query(sql).then(response => {
            if (!response) {
                return res.status(422).json({
                    message: `Something went wrong`
                });
            };
            if (!response.length) {
                return res.status(422).json({
                    message: `Resource Does Not Exist`
                });
            };
            return res.status(422).send(response);
        });
    } else {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }
});

userRouter.put('/:user_id', authenticateToken, async (req, res) => {

    let permission = await fetchPermission(req.user.id);

    let selected_user_details = await fetchUserDetails(req.params.user_id);

    if (!selected_user_details) {
        return res.status(422).json({
            message: `Something went wrong`
        });
    };

    const changes = {};

    Object.entries(selected_user_details).forEach(([key, og_value]) => {
        let changed_value = req.body[key];
        if (changed_value != null && changed_value !== og_value) {
            changes[key] = changed_value;
        }
    });

    if (changes.Username) {
        if (!await isAvailableUsername(req.body.username)) {
            return res.status(401).json(`Username ${req.body.username} already in use`);
        }
    }

    if (changes.Permissions) {
        if (!defaultPermissions.permission_access_framework[permission].includes(changes.Permissions)) {
            return res.status(403).send(`Forbidden: ${permission} cannot change permission level to ${changes.Permissions}.`);
        }
    }

    if (!Object.values(changes).length) { //this is concerning as it might be giving away the current status
        return res.status(422).json({
            message: `No Changes Detected`
        });
    }

    if (req.user.id === parseInt(req.params.user_id)) { //self-edit pathway, anyone can do it

        let props_allowed_to_be_changed = defaultPermissions.actions.edit_user_details_framework[permission];

        for (const key of Object.keys(changes)) {
            if (!props_allowed_to_be_changed.includes(key)) {
                return res.status(403).send(`Forbidden: ${permission} cannot edit ${key}.`);
            }
        };


    } else {
        if (!defaultPermissions.actions.edit_others_details.includes(permission)) {
            return res.status(403).send('Forbidden: You do not have access to this.');
        };
    }

    let sql = `UPDATE Users SET `;

    let sql_changes_parts = [];

    Object.entries(changes).forEach(([key, value]) => {
        sql_changes_parts.push(`${key} = ${sql_wrap(value)}`);
    });

    sql += sql_changes_parts.join(', ');

    sql += `WHERE UserID = ${req.params.user_id};`;

    await query(sql).then(response => {
        if (!response) {
            return res.status(422).json({
                message: `Something went wrong`
            });
        };
        res.status(200).json({
            message: `${Object.keys(changes).join(', ')} updated`
        });
    });
});


userRouter.get('/:user_id/positions', authenticateToken, async (req, res) => {
    let sql = `SELECT * FROM Position WHERE UserID = '${req.params.user_id}' OR SecondaryUserID = '' OR TertiaryUserID = ''`; //TODO: handle joint_confirmed prop
    //GET positions belonging to said user, based on perms
});

export default userRouter;