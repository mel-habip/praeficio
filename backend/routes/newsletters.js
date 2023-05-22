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

//fetch a single newsletter
newsletterRouter.get('/:newsletter_id', async (req, res) => {
    const fetch_job = await helper.fetch_by_id(req.params.newsletter_id, {
        'newsletters.deleted': false
    });

    if (!fetch_job) {
        return res.status(404).json({
            message: 'Not found'
        })
    }

    return res.status(200).json({
        ...fetch_job
    });
});

//create a new Newsletter
newsletterRouter.post('/', validateAndSanitizeBodyParts({
    title: 'string',
    description: 'string',
    content: 'string',
    read_length: 'number',
    send_email: 'boolean',
    pinned: 'boolean',
    handled_externally: 'boolean'
}, ['title', 'description', 'content']), authenticateToken, async (req, res) => {

    if (!req.user.permissions.startsWith('dev') && !req.user.is_total) {
        return res.status(403).json({
            message: `Forbidden: You do not have access to this.`
        });
    }

    const created = await helper.create_single({
        title: req.body.title,
        description: req.body.description,
        content: removeExtraSpaces(req.body.content),
        written_by: req.user.id,
        read_length: req.body.read_length || 0,
        pinned: req.body.pinned,
        handled_externally: req.body.handled_externally,
    });

    if (created?.success) {
        return res.status(201).json({
            ...created?.details
        });
    }

    return res.status(422).json({
        message: `Something went wrong`,
        details: created
    });
});

//delete a newsletter
newsletterRouter.delete('/:newsletter_id', authenticateToken, async (req, res) => {

    if (!['total', 'dev_lead'].includes(req.user.permissions)) {
        return res.status(403).json({
            message: `Forbidden: You do not have access to this.`
        });
    }

    const confirm_exists = await helper.confirm_exists_by_id(req.params.newsletter_id);

    if (!confirm_exists) {
        return res.status(404).json({
            message: `Not Found: newsletter ${req.params.newsletter_id} does not exist.`
        });
    }

    const deletion = await helper.soft_delete(req.params.newsletter_id)

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


newsletterRouter.put('/:newsletter_id', validateAndSanitizeBodyParts({
    title: 'string',
    description: 'string',
    content: 'string',
    read_length: 'number',
    send_email: 'boolean',
    pinned: 'boolean',
    handled_externally: 'boolean',
}), authenticateToken, async (req, res) => {

    if (!req.user.permissions.startsWith('dev') && !req.user.is_total) {
        return res.status(403).json({
            message: `Forbidden: You do not have access to this.`
        });
    }

    const fetch_job = await helper.fetch_by_id(req.params.newsletter_id);

    if (!fetch_job) {
        return res.status(404).json({
            message: 'Not found'
        })
    }

    if (fetch_job.deleted) {
        return res.status(401).json({
            message: 'Resource is deleted and cannot be edited.'
        })
    }

    const update_job = await helper.update_single(req.body, req.params.newsletter_id);

    if (update_job?.success) {
        return res.status(200).json(update_job);
    }

    return res.status(422).json({
        message: `Something went wrong`
    });
});


export default newsletterRouter;


function removeExtraSpaces(str = '') {
    str = str.replace(/[\r\n\f\b]/gi, ''); //get ride of line breaks

    while (str.includes('  ')) { //convert all double spaces into single. Not the most efficient way to do it but it's fine
        str = str.replaceAll('  ', ' ');
    }

    return str;
}