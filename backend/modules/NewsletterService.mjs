import RecordService from './RecordService.mjs';

export default class NewsletterService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Newsletter';
        this.table_name = 'newsletters';
        this.primary_key = 'newsletter_id';
        this.fetch_sql = `SELECT newsletters.*, users.username AS written_by_username FROM newsletters LEFT JOIN users ON written_by = users.user_id`;
    }
};