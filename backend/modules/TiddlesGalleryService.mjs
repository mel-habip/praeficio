import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class TiddlesGalleryService extends RecordService {
    constructor() {
        super();
        this.record_type = 'TiddlesPhoto';
        this.table_name = 'tiddles_photos';
        this.primary_key = 'photo_id';
    }

    search_by_keyword = async keyword => {
        const sql = `SELECT * FROM ${this.table_name} WHERE tags LIKE ? or description LIKE ? LIMIT 25;`;
        const param = `%${keyword}%`;

        const result = await query(sql, param, param);

        return result;
    }

    fetch_all = async (limit = 50) => {
        const sql = `SELECT * FROM ${this.table_name} LIMIT ${limit}`;

        const results = await query(sql);

        return results;
    }
}