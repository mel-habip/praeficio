"use strict"
import express from 'express';
const newsletterRouter = express.Router();
const log = console.log;
import authenticateToken from '../jobs/authenticateToken.js'; //for posting or editing newsletters
import query from '../utils/db_connection.js';

import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';

import NewsletterService from "../modules/NewsletterService.mjs";

const helper = new NewsletterService();

/**
 * GET '/',
 * fetches newsletters based on query params
 */
newsletterRouter.get('/', async (req, res) => {

    const how_many_to_load = (!req.query.size || isNaN(req.query.size)) ? 25 : req.query.size;

    const page_to_load = (!req.query.page || isNaN(req.query.page)) ? 1 : req.query.page;

    const fetch_job = await helper.fetch_by_criteria({
        'newsletters.deleted': false,
        limit: (how_many_to_load * page_to_load) + 1,
        offset: how_many_to_load * (page_to_load - 1),
    });

    if (fetch_job?.success) {
        const has_more = fetch_job.details.length === ((how_many_to_load * page_to_load) + 1);
        if (has_more) fetch_job.details.pop();

        //sorting based on pinned posts
        const pinned = [];
        const unpinned = fetch_job.details.filter(post => {
            if (post.pinned) return !pinned.push(post); //push returns true if pushed
            return true;
        });


        return res.status(200).json({
            data: [...pinned, ...unpinned],
            has_more,
            page: page_to_load,
            size: how_many_to_load,
            message: fetch_job.message || `Success`,
        });
    }

    return res.status(422).json({
        message: `Something went wrong`
    });
});

//create a new Newsletter
newsletterRouter.post('/', validateAndSanitizeBodyParts({
    title: 'string',
    description: 'string',
    content: 'string',
    read_length: 'number',
    send_newsletter_email_out: 'boolean'
}, ['title', 'description', 'content', 'read_length']), authenticateToken, async (req, res) => {

    const created = await helper.create_single({
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        written_by: req.user.id
    });

    if (created) {
        return res.status(201).json({
            ...created
        });
    }

    return res.status(422).json({
        message: `Something went wrong`
    });
});

//remove a subscription
newsletterRouter.delete('/', validateAndSanitizeBodyParts({
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

    return res.status(422).json({
        message: `Something went wrong`
    });
});


export default newsletterRouter;