import query from '../utils/db_connection.js';

export default async function fetchUserDebtAccounts(user_id, show_archived=false) {
    const sql = `SELECT A.*, Bor.username AS borrower_username, Len.username AS lender_username, SUM(T.amount) AS balance FROM debt_accounts A LEFT JOIN debt_account_transactions T ON A.debt_account_id = T.debt_account_id LEFT JOIN users Bor ON Bor.user_id = A.borrower_id LEFT JOIN users Len ON Len.user_id = A.lender_id WHERE ((Len.user_id = ? OR Bor.user_id = ?) ${show_archived ? '': 'AND A.archived = FALSE'}) GROUP BY A.debt_account_id;`;
    const debtAccounts = await query(sql, user_id, user_id);

    return debtAccounts;
}