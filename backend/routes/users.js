import express from 'express';
const userRouter = express.Router();
const log = console.log;

import authenticateToken from '../jobs/authenticateToken.js';
import fetchPermission from '../jobs/fetchPermission.js';
import fetchWorkspaceIDs from '../jobs/fetchWorkspaceID.js';
import {defaultPermissions} from '../constants/defaultPermissions.js';
import isAvailableUsername from '../jobs/isAvailableUsername.js'
import connection from '../utils/db_connection.js';

userRouter.get('/', authenticateToken, (req, res) => {

    const include_deactivated = Boolean(req.query.include_deactivated)

    let sql = `SELECT * FROM Users`;
    let results = connection.query(sql, function (err, result) {
        if (err) throw err;
        let permission = fetchPermission(req.user.id);
        if (defaultPermissions.access.view_all_user_profiles.includes[permission]) {
            return res.json(results);
        } else if (defaultPermissions.access.view_other_users_bulk.includes[permission]) {
            let logged_in_user_workspace_ids = fetchWorkspaceIDs(req.user.id);
            return res.json(results.filter(user => user.id === req.user.id || logged_in_user_workspace_ids.some(id=> user.workspace_ids.includes(id))));
        } else {
            return res.json(results.filter(user => user.id === req.user.id));
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
    try {
        //hashed = encrypted
        //encryption uses a "Salt" that is generated uniquely for each password. The salt is prepended to the hashed password and functions as the key to decrypt it later on.
        const hashedPassword = await bcyprt.hash(req.body.password, 10); //default strength for salt creation is 10

        let sql = `INSERT INTO Users (Username, Password, FirstName, LastName, Permissions) VALUES ('${req.body.username}', '${hashedPassword}','${req.body.FirstName}','${req.body.LastName}', 'basic_client')`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
            log("1 record inserted", result);
            //Do we want to then create a table specifically for that user and their data?
            return res.status(201).send({
                id: result.UserID,
                message: 'Successfully created'
            });
        });
    } catch (err) {
        res.status(422).send(err)
    }
});

userRouter.post('/pre_signed_create_new_user', authenticateToken, async (req, res) => {
    let permission = fetchPermission(req.user.id);

    if (!defaultPermissions.can_create_new_user.includes(permission)) {
        return res.status(403).send('Forbidden:You do not have access to this.');
    }

    if (!defaultPermissions.permission_access_framework.includes(req.body.permission)) {
        return res.status(403).send(`Forbidden: As a ${permission} you do not have access creating ${req.body.permission}.'`);
    }


    log('received: ', req.body || {});

    if (!req.body.username) {
        return res.status(401).json(`Username required.`);
    }

    if (!await isAvailableUsername(req.body.username)) {
        return res.status(401).json(`Username ${req.body.username} already in use`);
    }
    try {
        //if you are creating a user for someone else, you can't set their password, system should email them with temp_password;

        let temp_password = generateTemporaryPassword(); //send an email now with this to the provided email... there is no email 😳😳😳
        const hashedPassword = await bcyprt.hash(temp_password, 10);

        let sql = `INSERT INTO Users (Username, Password, FirstName, LastName, Permissions) VALUES ('${req.body.username}', '${hashedPassword}','${req.body.FirstName}','${req.body.LastName}', '${req.body.permission}')`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
            log("1 record inserted", result);
            //Do we want to then create a table specifically for that user and their data?
            return res.status(201).send({
                id: result.UserID,
                message: 'Successfully created'
            });
        });
    } catch (err) {
        res.status(422).send(err)
    }
});

userRouter.post('/login', (req, res) => {
    let sql = `SELECT * FROM Users WHERE Username = '${req.body.username}'`;
    return connection.query(sql, async (err, result) => {
        if (err) throw err;
        if (result?.Username) {
            return res.status(401).json({
                message: `Username not recognized`
            });
        };
        try {
            if (await bcrypt.compare(req.body.password, result.Password)) {
                const user = {
                    id: result[0].id
                };
                const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY);
                return res.status(200).json({
                    id: user.id,
                    first_name: result[0].FirstName,
                    last_name: result[0].LastName,
                    created_on: result[0].CreatedOn,
                    message: ``,
                    access_token,
                });
            } else {
                return res.status(401).json({
                    message: `Incorrect Password`
                });
            }
        } catch {
            return res.status(422).json({
                message: `Something went wrong`
            });
        }
    });
});

userRouter.delete('/:user_id', authenticateToken, (req, res) => {
    let permission = fetchPermission(req.user.id);

    if (!defaultPermissions.actions.delete_other_user.includes[permission] && req.user.id !== parseInt(req.params.user_id)) {
        // action;
        return;
    }
    
    if (!defaultPermissions.actions.delete_self_user.includes[permission] && req.user.id === parseInt(req.params.user_id)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }

    //TODO: soft-delete the user
});

userRouter.get('/:user_id', authenticateToken, async (req, res) => {
    if (req.user.id === req.params.user_id || await fetchPermission(req.user.id) === 'total') {
        let sql = `SELECT * FROM Users WHERE UserID = '${req.params.user_id}'`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
            delete result.password;
            res.json(result);
        });
    } else {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }
});

userRouter.put('/:user_id', authenticateToken, async (req, res) => {

    let permission = fetchPermission(req.user.id);

    let current_user_details = await fetchUserDetails(req.params.user_id);

    let changes = {};

    Object.entries(current_user_details).forEach(([key, og_value]) => {
        let changed_value = req.body.changes[key]
        if (changed_value && changed_value !== og_value) {
            changes[key] = changed_value;
        }
    })

    if (req.user.id === parseInt(req.params.user_id)) { //self-edit pathway, anyone can do it

        let props_allowed_to_be_changed = defaultPermissions.actions.edit_user_details_framework[permission];

        for (const key of Object.keys(changes)) {
            if (!props_allowed_to_be_changed.includes(key)) {
                return res.status(403).send(`Forbidden: ${permission} cannot edit ${key}.`);
            }
        };

        if (changes.username) {
            //check if available
        }

        if (changes.permission) {
            if (!defaultPermissions.permission_access_framework[permission].includes(changes.permission)) {
                return res.status(403).send(`Forbidden: ${permission} cannot change permission level to ${changes.permission}.`);
            }
        }

        //continue with operation
    } else {
       if (!defaultPermissions.actions.edit_others_details.includes[permission]) {
           return res.status(403).send('Forbidden: You do not have access to this.');
       };


    }

    const allowed_changes =['first_name', 'last_name', 'username', 'updated_on', 'permissions'];
    delete res.body.created_at; //uneditable
    //TODO: update user details except CreatedOn, 
});


userRouter.get('/:user_id/positions', authenticateToken, async (req, res) => {
    let sql = `SELECT * FROM Position WHERE UserID = '${req.params.user_id}' OR SecondaryUserID = '' OR TertiaryUserID = ''`; //TODO: handle joint_confirmed prop
    //GET positions belonging to said user, based on perms
});

export default userRouter;