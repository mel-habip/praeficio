import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class AlertService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Alert';
        this.table_name = 'alerts';
        this.primary_key = 'alert_id';
    }

    async fetch_by_user_id(user_id, constraints = {}) {
        const sql = `SELECT * FROM alerts WHERE user_id = ? ${constraint_stringifier(constraints)}`;
        const alerts = await query(sql, user_id);
        return alerts;
    }
}