import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

import fetchUserFriends from '../jobs/fetchUserFriendships.js';

export default class FriendshipService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Friendship';
        this.table_name = 'friendships';
        this.primary_key = ['user_1_id', 'user_2_id'];
    }

    async fetch_by_user_id(user_id) {
        return await fetchUserFriends(user_id);
    }

    delete_both_ways = async (user_1_id, user_2_id) => {
        const sql = `DELETE FROM ${this.table_name} WHERE (user_1_id = ? AND user_2_id = ?) OR (user_1_id = ? AND user_2_id = ?);`;
        const result = await query(sql, user_1_id, user_2_id, user_2_id, user_1_id);

        return {
            success: !!result?.affectedRows,
            message: result?.affectedRows ? `deleted ${result?.affectedRows}` : 'failed',
            details: result
        };
    } 
}