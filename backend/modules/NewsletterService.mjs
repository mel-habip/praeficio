import RecordService from './RecordService.mjs';

export default class NewsletterService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Newsletter';
        this.table_name = 'newsletters';
        this.primary_key = 'newsletter_id';
    }
};