import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';



export default class FeedbackLogItemService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'FeedbackLogItemMessage';
        this.table_name = 'feedback_log_item_messages';
        this.primary_key = 'feedback_log_item_message_id';
    }
};