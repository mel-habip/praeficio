import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class VoteService extends RecordService {
    constructor() {
        super();
        this.record_type = 'Vote';
        this.table_name = 'votes';
        this.primary_key = 'vote_id';
    }

    fetch_by_voting_session_id = async (voting_session_id) => {
        const sql = `SELECT details FROM votes WHERE voting_session_id = ? AND deleted = FALSE`;
        const votes = await query(sql, voting_session_id);
        return votes;
    }
}