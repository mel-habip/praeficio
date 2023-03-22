import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class PositionService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Position';
    }

    async un_soft_delete(position_id) {
        const sql = `UPDATE positions SET deleted = FALSE, active = TRUE WHERE position_id = ?`;
        
        let result = await query(sql, position_id);
        
        if (result?.affectedRows) {
            let data = await this.fetch_by_id(position_id);
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

    async soft_delete(position_id) {

        const sql = `UPDATE positions SET deleted = TRUE, active = FALSE WHERE position_id = ?`;

        let result = await query(sql, position_id);

        if (result?.affectedRows) {

            let data = await this.fetch_by_id(position_id);

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