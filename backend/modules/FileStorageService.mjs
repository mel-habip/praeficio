import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class FileStorageService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'StoredFile';
        this.table_name = 'stored_files';
        this.primary_key = 'stored_file_id';
    }

    async fetch_by_user_id(user_id, constraints = {}) {
        const sql = `SELECT * FROM ${this.table_name} WHERE user_id = ? ${constraint_stringifier(constraints)}`;
        const alerts = await query(sql, user_id);
        return alerts;
    }
}