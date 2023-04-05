import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class ToDoService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'ToDo';
        this.table_name = 'to_do_s';
        this.primary_key = 'to_do_id';
    }
};