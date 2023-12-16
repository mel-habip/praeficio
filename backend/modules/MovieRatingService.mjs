import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class MovieRatingService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'MovieRating';
        this.table_name = 'movie_ratings';
        this.primary_key = ['movie_id', 'user_id'];
    }
}