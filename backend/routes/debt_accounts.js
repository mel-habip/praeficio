"use strict"
import express from 'express';
const debtAccountRouter = express.Router();
import authenticateToken from '../jobs/authenticateToken.js';
import DebtAccountService from '../modules/DebtAccountService.mjs';
import query from '../utils/db_connection.js';
import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';

const helper = new DebtAccountService();

debtAccountRouter.use(authenticateToken);

debtAccountRouter.get('/test', async (_, res) => res.status(200).send('Hello World from the Debt Account Router!'));

//get all accounts of the user
debtAccountRouter.get('/', async (req, res) => {
    const show_archived = req.query.archived === 'true';

    let debt_accounts = await helper.fetch_by_user_id(req.user.id, show_archived);

    return res.status(!!debt_accounts ? 200 : 422).json({
        success: !!debt_accounts,
        data: debt_accounts
    });
});

//all details of one account
debtAccountRouter.get('/:debt_account_id', async (req, res) => {
    const details = await helper.fetch_by_id(req.params.debt_account_id, {}, {
        balance: true,
        transactions: true
    });

    if (!details) return res.status(404).json({
        message: `Debt Account not found.`
    });
    
    if ([details.borrower_id, details.lender_id].includes(req.user.id) || req.user.is_total || req.user.permissions.startsWith('dev_')) {
        const statistics = helper.statistics(details.transactions);
        return res.status(200).json({
            ...details,
            statistics
        });
    }

    return res.status(404).json({
        message: `Debt Account not found.`
    });
});

//create a new debt account
debtAccountRouter.post('/', validateAndSanitizeBodyParts({
    name: 'string',
    borrower_id: 'number',
    lender_id: 'number',
    who_can_add_transactions: 'enum(both,borrower,lender)',
}, ['name', 'borrower_id', 'lender_id', 'who_can_add_transactions']), async (req, res) => {

    //somehow validate that the borrower and lender are connected --> TODO: "Friendship" records

    {
        const checkOne = req.user.id === req.body.borrower_id;
        const checkTwo = req.user.id === req.body.lender_id;

        if (!checkOne && !checkTwo && !req.user.is_total && !req.user.permissions.startsWith('dev_')) {
            return res.status(401).json({
                message: `User should be either Borrower or Lender`,
            });
        }
    }

    const creation_details = await helper.create_single(req.body);

    return res.status(!!creation_details?.success ? 201 : 422).json(!!creation_details?.success ? {
        ...creation_details.details
    } : {
        success: !!creation_details?.success,
        message: !!creation_details?.message || 'Something went wrong',
        data: creation_details?.details
    });
});

//update account details
debtAccountRouter.put('/:debt_account_id', validateAndSanitizeBodyParts({
    name: 'string',
    who_can_add_transactions: 'enum(both,borrower,lender)',
    archived: 'boolean',
}), async (req, res) => {

    let match = await helper.fetch_by_id(req.params.debt_account_id);

    if (!match) return res.status(404).json({
        message: `Debt Account not found.`
    });

    if (match.archived) return res.status(400).send(`Debt Account is archived and is uneditable`);

    let update_details = await helper.update_single(req.body, req.params.debt_account_id);

    if (!update_details?.success) {
        return res.status(422).json({
            success: false,
            message: update_details?.message || 'failed',
            details: update_details?.details
        });
    }

    return res.status(200).json({
        success: true,
        message: update_details?.message || 'updated',
        data: update_details?.details
    });
});

//create a new transaction under the account
debtAccountRouter.post('/:debt_account_id/new_transaction', async (req, res) => {

});

export default debtAccountRouter;