import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class FeedbackLogService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'FeedbackLog';
        this.table_name = 'feedback_logs';
        this.primary_key = 'feedback_log_id';
    }
};