import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class MovieService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Movie';
        this.table_name = 'movies';
        this.primary_key = 'movie_id';
    }
}