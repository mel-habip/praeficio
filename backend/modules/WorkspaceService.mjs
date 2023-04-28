import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';


export default class WorkspaceService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Workspace';
        this.table_name = 'workspaces';
        this.primary_key = 'workspace_id';
    }

    async fetch_by_user_id(user_id, constraints = {}) {
        let sql_3 = `SELECT workspaces.*, workspace_user_associations.role, workspace_user_associations.created_on AS member_since, workspace_user_associations.invitation_accepted, workspace_user_associations.starred  FROM workspaces LEFT JOIN workspace_user_associations ON workspace_user_associations.workspace_id = workspaces.workspace_id WHERE user_id = ? ${constraint_stringifier(constraints)};`

        let workspaces = await query(sql_3, user_id);

        return {
            success: !!workspaces,
            data: workspaces
        };
    }
}