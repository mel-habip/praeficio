import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class VotingSessionService extends RecordService {
    constructor() {
        super();
        this.record_type = 'VotingSession';
        this.table_name = 'voting_sessions';
        this.primary_key = 'voting_session_id';
    }

    async fetch_by_user_id(user_id, constraints = {}) {
        const sql = `SELECT * FROM voting_sessions WHERE created_by = ? ${constraint_stringifier(constraints)}`;
        const voting_sessions = await query(sql, user_id);
        return voting_sessions;
    }
}