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

});

//update a debt account transaction
debtAccountTransactionRouter.put('/:debt_account_transaction_id', validateAndSanitizeBodyParts({

}), async (req, res) => {

});

//delete a debt account transaction
debtAccountTransactionRouter.delete('/:debt_account_transaction_id', async (req, res) => {

});

export default debtAccountTransactionRouter;