import Record from './Record.mjs';
import query from '../utils/db_connection.js';

export default class Position extends Record {
    constructor (data) {
        super();
        this.record_type = 'Position';
    }

    async un_soft_delete(position_id) {

        let match = await this.fetch_by_id(position_id);

        const sql = `UPDATE positions SET deleted = FALSE, active = TRUE WHERE position_id = ?`;

        let result = await query(sql, position_id);

        if (result?.affectedRows) {
            return {
                success: true,
                message: 'recovered',
                data: {...match, deleted: false, active: true}
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

        let match = await this.fetch_by_id(position_id);

        const sql = `UPDATE positions SET deleted = TRUE, active = FALSE WHERE position_id = ?`;

        let result = await query(sql, position_id);

        if (result?.affectedRows) {
            return {
                success: true,
                message: 'recovered',
                data: {
                    ...match,
                    deleted: false,
                    active: true
                }
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