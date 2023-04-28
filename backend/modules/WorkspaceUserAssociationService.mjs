import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';


export default class WorkspaceUserAssociationService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'WorkspaceUserAssociation';
        this.table_name = 'workspace_user_associations';
        this.primary_key = ['workspace_id', 'user_id'];
    }

    async invitation_accept(workspace_id, user_id) {

        const update_result = await this.update_single({
            joined: true,
            joined_on: new Date(),
        }, workspace_id, user_id);

        return update_result;
    }
}