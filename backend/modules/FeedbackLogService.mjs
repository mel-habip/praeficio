import RecordService, {
    constraint_stringifier,
} from './RecordService.mjs';
import query from '../utils/db_connection.js';

import FeedbackLogFilterService from './FeedbackLogFilterService.mjs';

const filterHelper = new FeedbackLogFilterService();

export default class FeedbackLogService extends RecordService {
    constructor(data) {
        super();
        this.record_type = 'FeedbackLog';
        this.table_name = 'feedback_logs';
        this.primary_key = 'feedback_log_id';
    }

    async fetch_by_user_id(user_id, constraints = {}) {
        const sql = `SELECT feedback_logs.*, feedback_log_user_associations.user_id  FROM feedback_logs LEFT JOIN feedback_log_user_associations ON feedback_logs.feedback_log_id = feedback_log_user_associations.feedback_log_id WHERE feedback_log_user_associations.user_id = ? ${constraint_stringifier(constraints)}`;
        const feedbackLogs = await query(sql, user_id);
        return feedbackLogs;
    }

    async fetch_by_id(record_id, constraints = {}, inclusions = {}) {
        const sql = `SELECT * FROM feedback_logs WHERE feedback_log_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
        const [feedbackLog] = await query(sql, record_id);
        if (!feedbackLog) return null;
        if (inclusions.users) {
            await query(`SELECT * FROM feedback_log_user_associations WHERE feedback_log_id = ?`, record_id).then(response => {
                feedbackLog.users = response.map(x => x.user_id);
            });
        }
        if (inclusions.feedback_log_items || inclusions.items) {

            let additional_filter='';

            if (feedbackLog.default_filter_id && !inclusions.all && inclusions.all_items) {
                const filter_details = await filterHelper.fetch_by_id(feedbackLog.default_filter_id);
                if (!filter_details) return null;
                let sqlCond = filterHelper.stringify_condition_v2(filter_details.method ?? {});

                if (sqlCond) {
                    additional_filter = ` AND ( ${sqlCond} );`
                }

            }

            /**
             * source-- > https: //stackoverflow.com/questions/1313120/retrieving-the-last-record-in-each-group-mysql
             * returns all items in log and adds `created_by_username` through a LEFT JOIN
             * the complex part is that it partitions the `feedback_log_item_messages` table by their parent's id's and finds the `sent_by` value of the last item in that partition
             */
            const new_sql = ` 
                    WITH ranked_messages AS(
                        SELECT m.*, ROW_NUMBER() OVER(PARTITION BY feedback_log_item_id ORDER BY feedback_log_item_message_id DESC) AS rn FROM feedback_log_item_messages AS m
                    ) SELECT feedback_log_items.*, sent_by AS last_message_sent_by, users.username AS created_by_username
                        FROM feedback_log_items 
                        LEFT JOIN users 
                            ON created_by = users.user_id
                        LEFT JOIN ranked_messages
                            ON ranked_messages.feedback_log_item_id = feedback_log_items.feedback_log_item_id
                        WHERE (rn = 1 OR rn IS NULL) AND feedback_log_id = ? ${additional_filter};
                    `;
            await query(new_sql, record_id).then(response => {
                feedbackLog.feedback_log_items = response;
            });
        }
        return feedbackLog;
    }
};