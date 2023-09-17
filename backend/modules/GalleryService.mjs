import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class GalleryService extends RecordService {
    constructor(gallery_name) {
        super();
        this.primary_key = 'photo_id';
        if (gallery_name === 'tiddles') {
            this.record_type = 'TiddlesPhoto';
            this.table_name = 'tiddles_photos';
        } else if (gallery_name === 'sylvester') {
            this.record_type = 'SylvesterPhoto';
            this.table_name = 'sylvester_photos';
        } else {
            console.error(`Wrong configuration in Gallery Service Module.`);
            process.exit(1);
        }
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