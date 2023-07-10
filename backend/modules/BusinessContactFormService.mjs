import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';

export default class BusinessContactFormService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'BusinessContactForm';
        this.table_name = 'business_contact_forms';
        this.primary_key = 'business_contact_form_id';
    }

    fetch_all = async () => {
        const sql = `SELECT * FROM ${this.table_name} WHERE deleted = FALSE`;
        return await query(sql);
    }

    PROJECT_STATES = [
        'SUBMITTED', //start
        'REVIEWING FORM',
        'AWAITING CONTACT',
        'MEETING SCHEDULED',
        'AWAITING TECHNICAL REVIEW',
        'AWAITING PROPOSAL PRESENTATION',
        'DISCUSSIONS & NEGOTIATIONS',
        'AWAITING PROJECT LAUNCH',
        'PROJECT STARTED',
        'PROJECT BETA DEMO',
        'PROJECT CONTINUES',
        'COMPLETED', //final
        'REJECTED, SCOPE TOO LARGE', //negatives
        'REJECTED, PRICE NOT ACCEPTABLE',
        'REJECTED, TIMELINE NOT ACCEPTABLE',
        'REJECTED, CONTACT LOST',
        'REJECTED, OTHER',
    ];
};