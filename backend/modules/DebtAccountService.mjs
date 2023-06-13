import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';
import fetchUserDebtAccounts from '../jobs/fetchUserDebtAccounts.js';

export default class DebtAccountService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'DebtAccount';
        this.table_name = 'debt_accounts';
        this.primary_key = 'debt_account_id';
    }

    /**
     * If two parties have 2 accounts where they owe each other money
     * @param {String|Number} debt_account_id_1
     * @param {String|Number} debt_account_id_2
     */
    consolidateBetweenAccounts = async (debt_account_id_1, debt_account_id_2) => {
        const AccountOne = await this.fetch_by_id(debt_account_id_1, {}, {
            balance: true
        });
        const AccountTwo = await this.fetch_by_id(debt_account_id_2, {}, {
            balance: true
        });

        {
            //check borrower-lender relationship
            const checkOne = AccountOne.borrower_id === AccountTwo.lender_id;
            const checkTwo = AccountOne.lender_id === AccountTwo.borrower_id;

            if (!checkOne || !checkTwo) {
                return {
                    success: false,
                    message: `Accounts' borrowers and lenders do not overlap.`
                }
            }
        }

        {
            //check that both accounts have a positive balance
            const checkOne = AccountOne.balance > 0;
            const checkTwo = AccountTwo.balance > 0;

            if (!checkOne || !checkTwo) {
                return {
                    success: false,
                    message: `Account balances aren't both positive.`
                }
            }
        }

        const lesserAccountId = AccountOne.balance > AccountTwo.balance ? AccountTwo.debt_account_id : AccountOne.debt_account_id;
        const greaterAccountId = lesserAccountId === AccountOne.debt_account_id ? AccountTwo.debt_account_id : AccountOne.debt_account_id;

        const sql = `INSERT INTO debt_account_transactions (debt_account_id, header, details , amount ) VALUES (?, ?, ?, ?);`

        const header = 'CONSOLIDATION';
        const details = `Consolidating cross-balances from account #${lesserAccountId} to #${greaterAccountId}`;
        const amount = (lesserAccountId === AccountOne.debt_account_id ? AccountOne.balance : AccountTwo.balance) * -1;

        await query(sql, [lesserAccountId, header, details, amount]);
        await query(sql, [greaterAccountId, header, details, amount]);


        return {
            success: true, //not actually checking if it was successful or not, we should do that too
            message: `Consolidated a balance of ${amount*-1} from account #${lesserAccountId} to #${greaterAccountId}`
        };
    }


    fetch_by_user_id = async (user_id, archived = false) => {
        return await fetchUserDebtAccounts(user_id, archived);
    }

    /**
     * @method statistics provides some simple statistics about the transactions array provided
     * @param {Array<{posted_on: date, amount: number, header: string, details: string}>} transactions
     * @return {{most_popular_header: string, least_popular_header: string, headers_breakdown: {[name:string]:number}, number_of_transactions: number, number_of_unique_headers: number, average_positive_amount: number, average_negative_amount: number}
     */
    statistics = (transactions = []) => {

        const transactionsHeadersMap = {};
        let positive_amounts = {
            total: 0,
            count: 0
        };
        let negative_amounts = {
            total: 0,
            count: 0
        };

        transactions.forEach(trans => {
            if (trans.amount > 0) {
                positive_amounts.total += trans.amount;
                positive_amounts.count++;
            } else if (trans.amount < 0) {
                negative_amounts.total += (trans.amount * -1);
                negative_amounts.count++;
            }

            const header_name_cleaned = cleaner(trans.header);
            if (transactionsHeadersMap.hasOwnProperty(header_name_cleaned)) {
                transactionsHeadersMap[header_name_cleaned]++;
            } else {
                transactionsHeadersMap[header_name_cleaned] = 1;
            }
        });

        return {
            number_of_transactions: transactions.length,
            number_of_unique_headers: Object.keys(transactionsHeadersMap).length
        };
    }
}



function cleaner(str) {
    str = str.trim().toLowerCase();
    while (str.includes('  ')) {
        str = str.replace('  ', ' ');
    }
    str = str.replaceAll(' ', '_');

    return str;
}