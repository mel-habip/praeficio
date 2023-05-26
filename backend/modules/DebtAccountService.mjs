import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';

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
        const AccountOne = await this.fetch_by_id(debt_account_id_1);
        const AccountTwo = await this.fetch_by_id(debt_account_id_2);

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
        const sql = `SELECT A.*, Bor.username AS borrower_username, Len.username AS lender_username, SUM(T.amount) AS balance FROM debt_accounts A LEFT JOIN debt_account_transactions T ON A.debt_account_id = T.debt_account_id LEFT JOIN users Bor ON Bor.user_id = A.borrower_id LEFT JOIN users Len ON Len.user_id = A.lender_id WHERE (Len.user_id = ? OR Bor.user_id = ?) AND A.archived = ?;`;
        const debtAccounts = await query(sql, user_id, user_id, archived);

        return debtAccounts;
    }
}