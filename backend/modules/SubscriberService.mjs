import RecordService from './RecordService.mjs';

export default class SubscriberService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'Subscriber';
        this.table_name = 'subscribers';
        this.primary_key = 'email';
    }
};