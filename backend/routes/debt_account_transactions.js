"use strict"
import express from 'express';
const debtAccountTransactionRouter = express.Router();
import authenticateToken from '../jobs/authenticateToken.js';
import DebtAccountService from '../modules/DebtAccountService.mjs';
import DebtAccountTransactionService from '../modules/DebtAccountTransactionService.mjs';
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
    header: 'string',
    amount: 'number',
    details: 'string',
    entered_by: 'number',
    posted_on: 'date',
    debt_account_id: 'number'
}), async (req, res) => {
    const CheckCacheForTransactionID /**for account */ = ''; //check the cache

    const transaction = CheckCacheForTransactionID || await transactionHelper.fetch_by_id(req.params.debt_account_transaction_id);

    if (!transaction) return res.status(404).json({
        message: `Transaction #${req.params.debt_account_transaction_id} is not found.`
    });

    const CheckCacheForDebtAccount = '';

    const debtAccount /**that contains this transaction */ = CheckCacheForDebtAccount || await accountHelper.fetch_by_id(transaction.debt_account_id);

    if (debtAccount.archived && !req.user.is_dev) return res.status(403).json({
        message: `Debt Account #${debtAccount.debt_account_id} is archived. The transactions cannot be modified.`
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

    const update_results = await transactionHelper.update_single(req.body, req.params.debt_account_transaction_id);

    if (!update_results?.success) return res.status(422).json({
        message: 'Failed to update.'
    });

    return res.status(200).json({
        ...update_results.details
    });
});

//delete a debt account transaction
debtAccountTransactionRouter.delete('/:debt_account_transaction_id', async (req, res) => {
    const CheckCacheForTransactionID /**for account */ = ''; //check the cache

    const transaction = CheckCacheForTransactionID || await transactionHelper.fetch_by_id(req.params.debt_account_transaction_id);

    if (!transaction) return res.status(404).json({
        message: `Transaction #${req.params.debt_account_transaction_id} is not found.`
    });

    const CheckCacheForDebtAccount = '';

    const debtAccount /**that contains this transaction */ = CheckCacheForDebtAccount || await accountHelper.fetch_by_id(transaction.debt_account_id);

    if (debtAccount.archived && !req.user.is_dev) return res.status(403).json({
        message: `Debt Account #${debtAccount.debt_account_id} is archived. The transactions cannot be modified.`
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

    const deletion_result = await transactionHelper.hard_delete({
        debt_account_transaction_id: req.params.debt_account_transaction_id
    });

    if (!deletion_result?.success) return res.status(422).json({
        message: 'Failed to delete.'
    });

    return res.status(200).json(deletion_result);
});

export default debtAccountTransactionRouter;