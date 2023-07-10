"use strict"
import express from 'express';
const debtAccountTransactionRouter = express.Router();
import authenticateToken from '../jobs/authenticateToken.js';
import DebtAccountService from '../modules/DebtAccountService.mjs';
import DebtAccountTransactionService from '../modules/DebtAccountTransactionService.mjs';
import query from '../utils/db_connection.js';
import validateAndSanitizeBodyParts from '../jobs/validateAndSanitizeBodyParts.js';

const transactionHelper = new DebtAccountTransactionService();
const accountHelper = new DebtAccountService();

debtAccountTransactionRouter.use(authenticateToken);

//get details of one transaction
debtAccountTransactionRouter.get('/:debt_account_transaction_id', async (req, res) => {

});

//create a new debt account transaction
debtAccountTransactionRouter.post('/', validateAndSanitizeBodyParts({
    debt_account_id: 'number',
    header: 'string',
    details: 'string',
    amount: 'number',
    posted_on: 'date'
}, ['debt_account_id', 'header', 'amount']), async (req, res) => {

    const CheckCache /**for account */ = ''; //check the cache

    const debtAccount = CheckCache || await accountHelper.fetch_by_id(req.body.debt_account_id);

    if (!debtAccount) return res.status(404).json({
        message: `Debt Account #${req.body.debt_account_id} is not found.`
    });

    if (req.user.is_dev) {
        //we good
    } else if (['both', 'lender'].includes(debtAccount.who_can_add_transactions) && debtAccount.lender_id === req.user.id) {
        //we good
    } else if (['both', 'borrower'].includes(debtAccount.who_can_add_transactions) && debtAccount.borrower_id === req.user.id) {
        //we good
    } else return res.status(403).json({
        message: `Forbidden: You do not have access to this.`
    });

    if (debtAccount.archived) return res.status(403).json({
        message: `Debt Account #${req.body.debt_account_id} is archived and further additions aren't allowed.`
    });

    const creation = await transactionHelper.create_single({
        ...req.body,
        entered_by: req.user.id,
    });

    if (!creation?.success) return res.status(422).json({
        message: creation?.message || `Something went wrong during creating the transaction.`,
        details: creation?.details
    });

    return res.status(201).json(creation.details);
});

//update a debt account transaction
debtAccountTransactionRouter.put('/:debt_account_transaction_id', validateAndSanitizeBodyParts({

}), async (req, res) => {

});

//delete a debt account transaction
debtAccountTransactionRouter.delete('/:debt_account_transaction_id', async (req, res) => {
    
});

export default debtAccountTransactionRouter;