import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';



export default class FeedbackLogItemService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'FeedbackLogItem';
        this.table_name = 'feedback_log_items';
        this.primary_key = 'feedback_log_item_id';
    }
};