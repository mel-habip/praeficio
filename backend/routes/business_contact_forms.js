"use strict"
import express from 'express';
const businessContactFormsRouter = express.Router();
import authenticateToken from '../jobs/authenticateToken.js';
import BusinessContactFormService from '../modules/BusinessContactFormService.mjs';

const helper = new BusinessContactFormService();

businessContactFormsRouter.post('/', async (req, res) => {
    const creation_details = await helper.create_single({
        sender_ip_address: req.ip,
        details: JSON.stringify(req.body || {}),
    });

    if (!creation_details?.success) return res.status(422).json({
        message: `Something went wrong`
    });

    return res.status(201).json(creation_details.details);
});

businessContactFormsRouter.get('/', authenticateToken, async (req, res) => {
    if (!['total', 'head_of_sales'].includes(req.user.permissions)) return res.status(403).json({
        message: 'Forbidden: You do not have access to this.'
    });

    const results = await helper.fetch_all();

    return res.status(!!results ? 200 : 422).json({
        data: results,
        message: `Fetched ${results?.length} results`
    });
});

businessContactFormsRouter.put('/:form_id', authenticateToken, async (req, res) => {
    if (!['total', 'head_of_sales'].includes(req.user.permissions)) return res.status(403).json({
        message: 'Forbidden: You do not have access to this.'
    });

    const form_to_update = await helper.fetch_by_id(req.params.form_id);

    if (!form_to_update || form_to_update?.deleted) return res.status(404).json({message: `Business Contact Form #${req.params.form_id} is not found`});

    const update_details = await helper.update_single({...req.body});

    if (!update_details?.success) return res.status(422).json({
        message: `Something went wrong`
    });

    return res.status(200).json({
        ...update_details.details
    });
});

businessContactFormsRouter.delete('/:form_id', authenticateToken, async (req, res) => {
    if (!['total', 'head_of_sales'].includes(req.user.permissions)) return res.status(403).json({
        message: 'Forbidden: You do not have access to this.'
    });

    const form_to_delete = await helper.fetch_by_id(req.params.form_id);

    if (!form_to_delete || form_to_delete?.deleted) return res.status(404).json({
        message: `Business Contact Form #${req.params.form_id} is not found`
    });

    const deletion_details = await helper.soft_delete(req.params.form_id);

    if (!deletion_details?.success) return res.status(422).json({
        message: `Something went wrong`
    });

    return res.status(200).json({
        message: `Successfully soft-deleted #${req.params.form_id}`
    });
});

export default businessContactFormsRouter;