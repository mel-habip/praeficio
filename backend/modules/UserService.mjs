import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class UserService extends RecordService {
    constructor() {
        super();
        this.record_type = 'User';
    }

    async un_soft_delete(user_id) {
        const sql = `UPDATE users SET deleted = FALSE WHERE user_id = ?`;
        
        let result = await query(sql, user_id);
        
        if (result?.affectedRows) {
            let data = await this.fetch_by_id(user_id);
            return {
                success: true,
                message: 'recovered',
                data
            };
        } else {
            return {
                success: false,
                message: 'failed',
                details: result
            };
        }
    }

    async soft_delete(user_id) {

        const sql = `UPDATE users SET deleted = TRUE WHERE user_id = ?`;

        let result = await query(sql, user_id);

        if (result?.affectedRows) {

            let data = await this.fetch_by_id(user_id);

            return {
                success: true,
                message: 'recovered',
                data
            };
        } else {
            return {
                success: false,
                message: 'failed',
                details: result
            };
        }
    }
}