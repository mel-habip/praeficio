import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class PositionService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Position';
        this.table_name = 'positions';
        this.primary_key = 'position_id';
    }

    async un_soft_delete(position_id) {
        const sql = `UPDATE positions SET deleted = FALSE, active = TRUE WHERE position_id = ?`;

        let result = await query(sql, position_id);

        if (result?.affectedRows) {
            let data = await this.fetch_by_id([position_id]);
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

            let data = await this.fetch_by_id([position_id]);

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

    async fetch_by_user_id(user_id, constraints = {}) {
        const sql = `SELECT positions.*, workspace_position_associations.workspace_id  FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.user_id = ? ${constraint_stringifier(constraints)} ;`;
        const positions = await query(sql, user_id);
        return positions;
    }
}