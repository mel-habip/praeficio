import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';


export default class WorkspaceMessageLikeService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'WorkspaceMessageLike';
        this.table_name = 'workspace_message_likes';
        this.primary_key = ['workspace_message_id', 'user_id'];
    }

    async dislike (workspace_message_id, user_id) {
        return await this.hard_delete({workspace_message_id, user_id});
    }

    async like (workspace_message_id, user_id) {
        return await this.create_single({workspace_message_id, user_id});
    }
}