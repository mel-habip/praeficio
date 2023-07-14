"use strict"
import {
    Router
} from 'express';
const userRouter = Router();
import NodeCache from "node-cache";
const userRouterCache = new NodeCache();

const log = console.log;
const list = (arr) => new Intl.ListFormat().format(arr.map(x => JSON.stringify(x)));

import authenticateToken from '../jobs/authenticateToken.js';
import defaultPermissions from '../constants/defaultPermissions.js';
import isAvailableUsername from '../jobs/isAvailableUsername.js';
import db_keys from '../constants/db_keys.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import query from '../utils/db_connection.js';
import sql_wrap from '../utils/sql_wrap.js';
import is_valid_email from '../utils/is_valid_email.js';
import emailService from '../jobs/emailService.js';
import validatePassword from '../../frontend/src/utils/validatePassword.mjs';
import UserService from '../modules/UserService.mjs';
import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';
import generateTemporaryPassword from '../utils/generateTemporaryPassword.js';
import fetchUserFriendships from '../jobs/fetchUserFriendships.js';

import usersCache from '../stores/usersCache.js';

const helper = new UserService();

userRouter.get('/', authenticateToken, async (req, res) => {

    const include_deactivated = Boolean(req.query.include_deactivated);

    let sql = `SELECT user_id, username, last_name, first_name, email, permissions, active, deleted, use_beta_features, created_on, updated_on, to_do_categories, discovery_token FROM users`;

    if (!include_deactivated) sql += ` WHERE active = 1;`;

    await query(sql).then(async response => {
        if (!response) {
            log('User Details Fetch Error');
            return res.status(422).send('User Details Fetch Error');
        };
        if (defaultPermissions.access.view_all_user_profiles.includes(req.user.permissions)) {
            return res.json(response);
        } else if (defaultPermissions.access.view_other_users_bulk.includes(req.user.permissions)) {
            //this side is kinda messy and should be done via the helper instead
            return res.json(response.filter(user => user.id === req.user.id));
        } else {
            return res.json(response.filter(user => user.user_id === req.user.id));
        }
    });
});

userRouter.post('/search', authenticateToken, validateAndSanitizeBodyParts({
    user_id: 'number',
    username: 'string',
    discovery_token: 'string'
}), async (req, res) => {
    if (!req.body.user_id && !req.body.username && !req.body.discovery_token) return res.status(401).json({
        message: 'At least one parameter should be provided'
    });

    let result;

    if (req.body.user_id) {
        const cacheCheck = usersCache.get(`user-${req.body.user_id}`);
        result = cacheCheck ? {
            details: [cacheCheck],
            success: true,
        } : await helper.fetch_by_criteria({
            user_id: req.body.user_id,
            deleted: false,
            active: true,
        });
        if (!cacheCheck && !!result?.details?. [0]) usersCache.set(`user-${req.body.user_id}`, result.details[0]);
    } else if (req.body.username) {
        result = await helper.fetch_by_criteria({
            username: req.body.username,
            deleted: false,
            active: true,
        });
        if (!result.details?.length) {
            //no exact match found, do similarity based check
            const sql = `SELECT username, user_id, discovery_token, created_on FROM users WHERE deleted = FALSE AND active = TRUE AND username LIKE ?`;
            const substring = `%${req.body.username}%`;
            result = {
                details: await query(sql, substring),
            };
            result.success = !!result.details;
        }
    } else if (req.body.discovery_token) {
        result = await helper.fetch_by_criteria({
            discovery_token: req.body.discovery_token,
            deleted: false,
            active: true,
        });
    }


    if (!result?.success) return res.status(422).json({
        message: result?.message || `Something went wrong`,
    });


    return res.status(200).json({
        message: `Found ${result.details.length} results`,
        data: result.details.map(user => ({
            username: user.username,
            user_id: user.user_id,
            discovery_token: (user.discovery_token === req.body.discovery_token || req.user.is_dev || !!req.user.friendships.find(frnd => [frnd.user_1_id, frnd.user_2_id].includes(user.id))) ? user.discovery_token : undefined,
            created_on: user.created_on,
        }))
    });
});

userRouter.get('/session', authenticateToken, (req, res) => {
    return res.status(200).json({
        ...req.user
    });
});


userRouter.post('/create_new_user', async (req, res) => {
    log('received: ', req.body || {});

    if (!req.body.username) {
        return res.status(401).json({
            message: `Username required.`,
            error_part: 'username'
        });
    }

    if (!req.body.password) {
        return res.status(401).json({
            message: `Password required.`,
            error_part: 'password'
        });
    }

    if (!validatePassword(req.body.password)) {
        return res.status(401).json({
            message: `Password not strong enough.`,
            error_part: 'password'
        });
    }

    if (!await isAvailableUsername(req.body.username)) {
        return res.status(401).json({
            message: `Username ${req.body.username} already in use`,
            error_part: 'username'
        });
    }

    let is_secured = !!req.body.email; //if email is provided, we will set the account as inactive and await activation

    if (is_secured && !is_valid_email(req.body.email)) {
        return res.status(401).json({
            message: `Invalid email address.`,
            error_part: 'email'
        });
    }

    //hashed = encrypted
    //encryption uses a "Salt" that is generated uniquely for each password. The salt is prepended to the hashed password and functions as the key to decrypt it later on.

    const hashedPassword = await bcrypt.hash(req.body.password, 10); //default strength for salt creation is 10

    const creation_result = await helper.create_single({
        username: req.body.username,
        password: hashedPassword,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        permissions: 'basic_client',
        email: req.body.email,
        active: !is_secured,
        discovery_token: generateTemporaryPassword(16, true),
    });

    if (!creation_result?.success) {
        return res.status(422).json({
            message: 'New User Creation Error',
            error_part: 'other'
        });
    };

    if (is_secured) {
        const user = {
            id: creation_result.details.user_id
        };
        const ActivationToken = jwt.sign(user, process.env.ACTIVATION_TOKEN_SECRET_KEY); //any reason to use this over bcrypt? 

        await emailService({
            to: req.body.email,
            message: `Welcome on board! \n\t Your activation token: ${ActivationToken}`
        });
    }

    usersCache.set(`user-${creation_result.details.user_id}`, creation_result.details);

    return res.status(201).json({
        ...creation_result.details,
        message: 'Successfully created',
        is_secured
    });
});

userRouter.post('/pre_signed_create_new_user', authenticateToken, async (req, res) => {

    if (!defaultPermissions.can_create_new_user.includes(req.user.permissions)) {
        return res.status(403).send('Forbidden:You do not have access to this.');
    }

    if (!defaultPermissions.permission_access_framework.includes(req.body.permissions)) {
        return res.status(403).send(`Forbidden: As a ${req.user.permissions} you do not have access creating ${req.body.permissions}.'`);
    }

    const required_but_missing = ['username', 'email', 'permissions'].filter(prop => !req.body[prop]);

    if (required_but_missing.length) {
        return res.status(401).json(`Required params missing: ${required_but_missing.join(', ')}`);
    }

    if (!await isAvailableUsername(req.body.username)) {
        return res.status(401).json(`Username ${req.body.username} already in use`);
    }

    if (!is_valid_email(req.body.email)) {
        return res.status(401).send(`Invalid email address.`);
    }

    const temp_password = generateTemporaryPassword(); //send an email now with this to the provided email
    const hashedPassword = await bcyprt.hash(temp_password, 10); //default strength for salt creation is 10

    let sql = `INSERT INTO users (username, password, first_name, last_name, permissions, email) VALUES ('${req.body.username}', '${hashedPassword}', ${sql_wrap(req.body.first_name)}, ${sql_wrap(req.body.last_name)}, '${req.body.permissions}', ${sql_wrap(req.body.email)});`;

    const user_creation = await query(sql);

    if (!user_creation) {
        log('New User Creation Error');
        return res.status(422).send('New User Creation Error');
    };

    sql = `SELECT ${db_keys.all_except_pass.join(', ')} FROM users WHERE user_id = LAST_INSERT_ID();`;

    const [created_user_details] = await query(sql);

    log("1 record inserted", created_user_details);

    const user = {
        id: created_user_details.user_id
    };

    const ActivationToken = jwt.sign(user, process.env.ACTIVATION_TOKEN_SECRET_KEY);

    await emailService({
        to: req.body.email,
        message: `Welcome onboard! \n\n\tYour temp password: ${temp_password}\n\n\t Your activation token: ${ActivationToken}`, //TODO: embed this into a button in HTML or at least a hyperlink
    });

    usersCache.set(`user-${created_user_details.user_id}`, created_user_details);

    return res.status(201).json({
        ...created_user_details,
        message: `Successfully created, User will receive email to activate account`,
    });
});

userRouter.post('/login', validateAndSanitizeBodyParts({
    username: 'string',
    password: 'string'
}, ['username', 'password']), async (req, res) => {
    let sql = `SELECT * FROM users WHERE upper(username) = ?`;

    const [relevantUser] = await query(sql, req.body.username.trim().toUpperCase());

    if (!relevantUser || relevantUser?.deleted) {
        return res.status(401).json({
            message: `Username not recognized`,
            error_part: 'username'
        });
    };
    if (!relevantUser.active) {
        return res.status(401).json({
            message: `Cannot Login to Inactive Account. Must Activate first.`,
            error_part: 'inactive'
        });
    };

    const globalCacheCheck = usersCache.get(`user-${relevantUser.user_id}`);

    const isLockedOut = userRouterCache.get(`${relevantUser.user_id}-lock`);

    if (isLockedOut) {
        return res.status(419).json({
            message: 'You have been locked out. Please try again in 1 hour.'
        });
    }

    const MAX_ATTEMPTS = 5;
    const cacheKeys = Array.from({
        length: MAX_ATTEMPTS
    }, (_, i) => `${relevantUser.user_id}-attempt-${i+1}`);

    const userLoginAttempts = userRouterCache.mget(cacheKeys);
    console.log('cacheTest', userLoginAttempts);

    if (await bcrypt.compare(req.body.password, relevantUser.password)) {
        const user = {
            id: relevantUser.user_id,
        };
        const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY);
        usersCache.set(`user-${relevantUser.user_id}`, {
            ...(globalCacheCheck || {}),
            ...relevantUser
        });
        return res.status(200).json({
            user_id: relevantUser.user_id,
            username: relevantUser.username,
            first_name: relevantUser.first_name,
            last_name: relevantUser.last_name,
            created_on: relevantUser.created_on,
            active: relevantUser.active,
            message: `Successful`,
            access_token,
            to_do_categories: relevantUser?.to_do_categories,
            use_beta_features: relevantUser?.use_beta_features,
            permissions: relevantUser.permissions,
        });
    } else {
        //check how many attempts took place already
        let next_attempt_number;

        for (let i = 1; i <= MAX_ATTEMPTS; i++) {
            if (!userLoginAttempts[`${relevantUser.user_id}-attempt-${i}`]) {
                next_attempt_number = i;
                break;
            }
        };

        if (!next_attempt_number) { //means they are all used
            userRouterCache.set(`${relevantUser.user_id}-lock`, true, 60 * 60) // 1 hour lock
            return res.status(401).json({
                message: `Too many attempts. Your account has been locked.`,
                error_part: 'too_many_attempts'
            });
        }

        userRouterCache.set(`${relevantUser.user_id}-attempt-${next_attempt_number}`, true, 60 * 10) // retain fails for 10 mins

        return res.status(401).json({
            message: `Incorrect Password`,
            error_part: 'password'
        });
    }
});

userRouter.post('/login_with_recovery_code', validateAndSanitizeBodyParts({
    username: 'string',
    recovery_code: 'string'
}, ['username', 'recovery_code']), async (req, res) => {

    let sql = `SELECT * FROM users WHERE username = ?`;

    const [user_details] = await query(sql, req.body.username);

    if (!user_details || result?.deleted) {
        return res.status(401).json({
            message: `Username not recognized`,
            error_part: 'username'
        });
    };

    if (!result.active) {
        return res.status(401).json({
            message: `Cannot Login to Inactive Account. Must Activate first.`,
            error_part: 'inactive'
        });
    };

    const recovery_codes = {};

    const allowed_number_of_recovery_codes = 10;

    let user_remaining_codes = 0;

    for (let i = 1; i <= allowed_number_of_recovery_codes; i++) {
        if (user_details[`recovery_code_${i}`]) {
            user_remaining_codes++;
            recovery_codes[i] = user_details[`recovery_code_${i}`];
        }
    }

    if (!user_remaining_codes) { //means user used up all 10 already
        return res.status(401).json({
            message: `You do not have any remaining recovery codes.`,
            error_part: 'all_recovery_codes_used'
        });
    }

    for await (const [pos, code] of Object.entries(recovery_codes)) {
        if (await bcrypt.compare(req.body.recovery_code, code)) {
            await helper.update_single({ //invalidate the code
                [`recovery_code_${pos}`]: null
            }, [user_details.user_id]);
            const user = {
                id: user_details.user_id,
            };
            const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY);
            return res.status(200).json({
                user_id: user_details.user_id,
                first_name: user_details.first_name,
                last_name: user_details.last_name,
                created_on: user_details.created_on,
                message: `Recovery Code #${pos} consumed. Successfully logged in.`,
                access_token,
                to_do_categories: user_details.to_do_categories,
                use_beta_features: user_details.use_beta_features,
                permissions: user_details.permissions,
            });
        }
    };

    return res.status(401).json({
        message: `Invalid recovery code.`,
        error_part: 'recovery_code'
    });
});

userRouter.put('/activate/:user_id', async (req, res) => {

    if (!req?.query?.activation_token) {
        return res.status(401).json({
            message: `Activation Token not received`
        });
    }
    let decoded = jwt.decode(req.query.activation_token);

    if (decoded.id !== req.params.user_id) {
        return res.status(422).json({
            message: `Invalid Activation Token.`
        });
    }

    let current_status = await query(`SELECT active FROM users WHERE user_id = ? LIMIT 1;`, req.params.user_id);

    if (!current_status) {
        return res.status(422).json({
            message: `Something went wrong`
        });
    };
    if (!current_status.length) {
        return res.status(404).json({
            message: `Resource Does Not Exist`
        });
    };

    if (current_status[0]?.active) {
        return res.status(401).json({
            message: `User already active`
        });
    };



    let updated = await query(`UPDATE users SET active = TRUE WHERE user_id = ?;`, req.params.user_id);

    return res.status(200).json(updated);
});

userRouter.delete('/:user_id', authenticateToken, async (req, res) => {

    if (!defaultPermissions.actions.delete_other_user.includes(req.user.permissions) && req.user.id !== parseInt(req.params.user_id)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }

    if (!defaultPermissions.actions.delete_self_user.includes(req.user.permissions) && req.user.id === parseInt(req.params.user_id)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }

    const deletion_result = await helper.soft_delete(req.params.user_id);

    if (!deletion_result?.success) {
        return res.status(422).json({
            message: 'User Deletion Error',
            error_part: 'other'
        });
    };

    return res.status(200).json(deletion_result.details);
});

userRouter.get('/:user_id', authenticateToken, async (req, res) => {

    const cacheCheck = usersCache.get(`user-${req.params.user_id}`);

    const user_details = cacheCheck || await helper.fetch_by_id(req.params.user_id);

    if (!user_details) return res.status(404).json({
        message: `User #${req.params.user_id} not found.`
    });

    if (!cacheCheck) {
        usersCache.set(`user-${req.params.user_id}`, user_details);
    }

    if (req.user.is_dev || req.user.id === parseInt(req.params.user_id) || req.query.discovery_token === user_details.discovery_token) {
        //we're good
    } else {
        //check if friends already
        if (!req.user.friendships) {
            req.user.friendships = await fetchUserFriendships(req.user.id);
            usersCache.set(`user-${req.user.id}`, req.user);
        }

        const friendship = req.user.friendships.find(frnd => [frnd.user_1_id, frnd.user_2_id].includes(parseInt(req.params.user_id)));

        if (!friendship) return res.status(403).json({
            message: `A Discovery Token is required to connect with #${req.params.user_id}`
        });
    }

    return res.status(200).json(user_details);
});

userRouter.put('/:user_id', authenticateToken, async (req, res) => {

    const cacheCheck = usersCache.get(`user-${req.params.user_id}`);

    const selected_user_details = cacheCheck || await helper.fetch_by_id(req.params.user_id);

    if (!selected_user_details) {
        return res.status(404).json({
            message: `User ${req.params.user_id} not found`
        });
    };

    const changes = {};

    Object.entries(selected_user_details).forEach(([key, og_value]) => {
        let changed_value = req.body[key];

        if (changed_value != null && Array.isArray(changed_value)) {
            changes[key] = JSON.stringify(changed_value);
        } else if (changed_value != null && changed_value !== og_value) {
            changes[key] = changed_value;
        }
    });

    if (changes.username) {
        if (!await isAvailableUsername(req.body.username)) {
            return res.status(401).send(`Username ${req.body.username} already in use`);
        }
    }

    if (changes.email && !is_valid_email(changes.email)) {
        return res.status(401).send(`Invalid email address.`);
    }

    if (changes.permissions) {
        if (!defaultPermissions.permission_access_framework[req.user.permissions].includes(changes.permissions)) {
            return res.status(403).send(`Forbidden: ${req.user.permissions} cannot change permission level to ${changes.permissions}.`);
        }
    }

    if (!Object.values(changes).length) { //this is concerning as it might be giving away the current status
        return res.status(422).json({
            message: `No Changes Detected`
        });
    }

    if (req.user.id === parseInt(req.params.user_id)) { //self-edit pathway, anyone can do it

        let props_allowed_to_be_changed = defaultPermissions.actions.edit_user_details_framework[req.user.permissions];

        for (const key of Object.keys(changes)) {
            if (!props_allowed_to_be_changed.includes(key)) {
                return res.status(403).send(`Forbidden: ${req.user.permissions} cannot edit ${key}.`);
            }
        };
    } else {
        if (!defaultPermissions.actions.edit_others_details.includes(req.user.permissions)) {
            return res.status(403).send('Forbidden: You do not have access to this.');
        };
    }

    let sql = `UPDATE users SET ${Object.keys(changes).map(key => `${key} = ?`).join(', ')} WHERE user_id = ?;`;

    await query(sql, [...Object.values(changes), req.params.user_id]).then(response => {
        if (response.affectedRows) {

            usersCache.del(`user-${req.params.user_id}`);

            return res.status(200).json({
                message: `${list(Object.keys(changes))} updated.`,
                response,
            });
        }
        return res.status(422).json({
            message: `Something went wrong`,
            response,
        });
    }).catch(error => {
        return res.status(422).send({
            message: `Something went wrong`,
            error
        });
    });
});

userRouter.post('/:user_id/renew_discovery_token', authenticateToken, async (req, res) => {
    const cacheCheck = usersCache.get(`user-${req.params.user_id}`);

    const selected_user_details = cacheCheck || await helper.fetch_by_id(req.params.user_id);

    if (!selected_user_details) {
        return res.status(404).json({
            message: `User ${req.params.user_id} not found`
        });
    };

    if (req.user.id !== parseInt(req.params.user_id) && !req.user.is_dev) return res.status(403).json({
        message: `You do not have access to this.`
    });

    const newDiscoveryToken = generateTemporaryPassword(8, true);

    const update_results = await helper.update_single({
        discovery_token: newDiscoveryToken
    }, req.params.user_id);

    if (!update_results || !update_results?.success) return res.status(422).json({
        message: update_results?.message || 'Something went wrong',
        success: false,
        details: update_results?.details,
    });

    usersCache.set(`user-${req.params.user_id}`, {
        ...selected_user_details,
        discovery_token: newDiscoveryToken
    });

    return res.status(200).json({
        message: `Updated`,
        discovery_token: newDiscoveryToken
    });
});

userRouter.get('/:user_id/positions', authenticateToken, async (req, res) => {
    let sql = `SELECT * FROM positions WHERE user_id = ? OR secondary_user_id = ? OR tertiary_user_id = ?`; //TODO: handle joint_confirmed prop
    //GET positions belonging to said user, based on perms

    if (req.params.user_id === req.user.id) {} //everyone can see their own positions
    else if (!defaultPermissions.access.view_other_users_positions.includes(req.user.permissions)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }


    let results = await query(sql, Array(3).fill(req.params.user_id));

    if (!results) {
        return res.status(422).json({
            message: `Something went wrong`
        });
    }

    return res.status(422).json(results);
});

userRouter.post('/:user_id/regenerate_recovery_codes', authenticateToken, async (req, res) => {
    return res.status(418).json({
        message: 'this endpoint is not ready yet.'
    });
});

userRouter.post('/:user_id/regenerate_last_resort_passcode', authenticateToken, async (req, res) => {
    return res.status(418).json({
        message: 'this endpoint is not ready yet.'
    });
});

export default userRouter;