import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';



export default class FeedbackLogItemService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'FeedbackLogItemMessage';
    }
};