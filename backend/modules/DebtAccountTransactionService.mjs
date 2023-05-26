import RecordService from './RecordService.mjs';

export default class DebtAccountTransactionService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'DebtAccountTransactions';
        this.table_name = 'debt_account_transactions';
        this.primary_key = 'debt_account_transaction_id';
    }
}