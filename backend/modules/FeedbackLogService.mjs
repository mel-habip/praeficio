import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class FeedbackLogService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'FeedbackLog';
    }
};