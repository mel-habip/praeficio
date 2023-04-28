"use strict"
import express from 'express';
const subscriberRouter = express.Router();
const log = console.log;
import authenticateToken from '../jobs/authenticateToken.js';
import query from '../utils/db_connection.js';
import is_valid_email from '../utils/is_valid_email.js';
import jwt from 'jsonwebtoken'; //for unsubscription token

import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';

import SubscriberService from "../modules/SubscriberService.mjs";

const helper = new SubscriberService();

/**
 * GET '/',
 * fetches all subscribers
 * meant for internal use
 */
subscriberRouter.get('/', authenticateToken, async (req, res) => {

    if (!req.user.permissions.startsWith('dev') && !req.user.is_total) {
        return res.status(403).json({message: `Forbidden: You do not have access to this.`});
    }

    const fetch_job = await helper.fetch_by_criteria({});

    if (fetch_job?.success) {
        return res.status(200).json({
            data: fetch_job.details
        });
    }

    return res.status(422).json({message: `Something went wrong`});
});

//add a new subscriber to the list
subscriberRouter.post('/', validateAndSanitizeBodyParts({
    email: 'email',
    name: 'string'
}, ['email']), async (req, res) => {

    { //check if already subscribed
        const SQL = `SELECT created_on FROM subscribers WHERE email = ?`;
        const [existing] = await query(SQL, req.body.email);
        if (existing) return res.status(400).json({message: `Already subscribed as of ${existing.created_on}`});
    }

    let related_user_id; { //check if user with that email exists
        const SQL = `SELECT user_id FROM users WHERE email = ?`;
        const [existing] = await query(SQL, req.body.email);
        if (existing) related_user_id = existing.user_id;
    }

    const created = await helper.create_single({
        email: req.body.email,
        name: req.body.name || null,
        related_user_id,
        updates_to_receive: 'all', //in the future we can offer detailed controlled on subscriptions
    });

    if (created) {
        return res.status(201).json({
            ...created
        });
    }

    return res.status(422).json({message: `Something went wrong`});
});

//remove a subscription
subscriberRouter.delete('/', validateAndSanitizeBodyParts({
    email: 'email',
    unsubscription_token: 'string'
}, ['email', 'unsubscription_token']), async (req, res) => {

    { //check if provided token matches 
        const unsubscription_token = jwt.sign(req.body.email, process.env.UNSUBSCRIPTION_TOKEN_SECRET_KEY);
        if (unsubscription_token !== req.body.unsubscription_token) return res.status(400).json({
            message: `Invalid token`
        });
    }

    { //check if subscription exists
        const SQL = `SELECT created_on FROM subscribers WHERE email = ?`;
        const [existing] = await query(SQL, req.body.email);
        if (!existing) return res.status(400).json({
            message: 'Subscription not found'
        });
    }

    const deletion = await helper.hard_delete({
        email: req.body.email
    });

    if (deletion?.success) {
        return res.status(200).json({
            message: deletion.message || 'Deleted',
            details: deletion.details,
        });
    }

    return res.status(422).json({message:`Something went wrong`});
});


export default subscriberRouter;