import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class PlantService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Plant';
        this.table_name = 'plants';
        this.primary_key = 'plant_id';
    }

    fetch_by_user_id = async (user_id, active = null) => {
        return await this.fetch_by_criteria({
            user_id,
            ...(typeof active === 'boolean' ? {
                active
            } : {})
        });
    }
};