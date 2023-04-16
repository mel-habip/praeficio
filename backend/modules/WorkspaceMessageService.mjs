import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';


export default class WorkspaceMessageService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'WorkspaceMessage';
        this.table_name = 'workspace_messages';
        this.primary_key = 'workspace_message_id';
    }
}