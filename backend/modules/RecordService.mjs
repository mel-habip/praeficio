import query from '../utils/db_connection.js';

import WorkspaceMessagesRelationshipOrganizer from '../jobs/WorkspaceMessagesRelationshipOrganizer.js';

export const recordTypeMap = {
    table_names: { //phase these out once ready.
        Position: 'positions',
        User: 'users',
        Workspace: 'workspaces',
        FeedbackLog: 'feedback_logs',
        WorkspaceUserAssociation: 'workspace_user_associations',
        WorkspacePositionAssociation: 'workspace_position_associations',
    },
    simple_primary_key: {
        Users: 'user_id',
        Position: 'position_id',
        Workspace: 'workspace_id',
        FeedbackLog: 'feedback_log_id',
        FeedbackLogItem: 'feedback_log_item',
    },
    complex_primary_key: {
        WorkspaceUserAssociation: ['workspace_id', 'user_id'],
        WorkspacePositionAssociation: ['workspace_id', 'position_id'],
        FeedbackLogUserAssociation: ['feedback_log_id', 'user_id'],
    }
};

/**
 * @module Record polymorphic archetype for different records in the DB
 * @method fetch_by_id provides the record
 * @method fetch_by_user_id functions as a PATCH
 * @const {Hash} data
 * @const {String} record_type - inherit from child
 * @const {String} table_name - inherit from child
 * @const {String|Array<String>} primary_key - inherit from child
 */
export default class RecordService {
    constructor(data) {
        if (data) console.log(`You shouldn't initialize this Class directly.`);
    };

    data = {};
    record_type;
    primary_key;
    table_name;

    /**
     * @param {Array|String} record_ids - the records to be fetched
     * @param {{any?:any}} constraints - will return empty array if doesn't meet constraints
     * @param {{users?: boolean, feedback_log_items?:boolean, messages?:boolean, items?:boolean, workspaces?:boolean, positions?:boolean }} inclusions to include data otherwise not provided
     * @returns {Promise<{to_do_id?: number, 
     *  workspace_id?:number, 
     *  feedback_log_id?: number,
     *  feedback_log_message_id?: number, 
     *  user_id?: number, position_id?:number, 
     *  content?:string, 
     *  notes?:string[], 
     *  completed?:boolean, 
     *  archived?:boolean, 
     *  deleted?:boolean, 
     *  active?:boolean}>}
     */
    fetch_by_id = async (record_ids, constraints = {}, inclusions = {}) => {

        if (typeof record_ids === 'string' || typeof record_ids === 'number') record_ids = [record_ids]; //so that you can pass an array or others

        const [record_id_1, record_id_2] = record_ids;

        if (!this.record_type) {
            console.error(`No Record Type specified`);
            return null;
        }

        switch (this.record_type) {
            case 'Position': {
                const sql = `${this.fetch_sql} WHERE positions.position_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [position] = await query(sql, record_id_1);

                if (inclusions.workspaces) {
                    const sql_2 = `SELECT workspace_id FROM workspace_position_associations WHERE position_id = ?;`;
                    await query(sql_2, record_id_1).then(response => position.workspaces = response?. [0]?.workspace_id ?? null);
                }
                return position;
            }
            case 'Alert': {
                const sql = `SELECT * FROM alerts WHERE alert_id = ? ${constraint_stringifier(constraints)}`;
                const [alert] = await query(sql, record_id_1);
                return alert;
            }
            case 'ToDo': {
                const sql = `SELECT * FROM todos WHERE to_do_id = ? ${constraint_stringifier(constraints)}`;
                const [to_do] = await query(sql, record_id_1);
                return to_do;
            }
            case 'User': {
                const sql_1 = `SELECT user_id, username, last_name, first_name, email, permissions, active, created_on, updated_on, use_beta_features, to_do_categories FROM users WHERE user_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;

                const [user] = await query(sql_1, record_id_1);

                if (!user) return null;

                if (inclusions.workspaces) {
                    const sql_2 = `SELECT workspace_id, role FROM workspace_user_associations WHERE user_id = ?;`;
                    await query(sql_2, record_id_1).then(response => user.workspaces = response);
                }

                return user;
            }
            case 'Workspace': {
                const sql = `SELECT * FROM workspaces WHERE workspace_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [workspace] = await query(sql, record_id_1);
                if (!workspace) return null;
                if (inclusions.users) {
                    await query(`SELECT * FROM workspace_user_associations WHERE workspace_id = ?`, record_id_1).then(response => {
                        workspace.users = response;
                    });
                }
                if (inclusions.positions) {
                    await query(`SELECT * FROM workspace_position_associations WHERE workspace_id = ?`, record_id_1).then(response => {
                        workspace.positions = response;
                    });
                }
                if (inclusions.messages) {
                    await query(`SELECT workspace_messages.*, users.username as sent_by_username,
                                (SELECT COUNT(*) FROM workspace_message_likes WHERE workspace_message_id = workspace_messages.workspace_message_id) as likes_count
                                FROM workspace_messages LEFT JOIN users ON users.user_id = workspace_messages.sent_by WHERE workspace_id = ? ;
                                `, record_id_1)
                        .then(response => {
                            workspace.messages = WorkspaceMessagesRelationshipOrganizer(response);
                        });
                }
                return workspace;
            }
            case 'WorkspaceMessage': {
                const sql = `SELECT workspace_messages.*, users.username as sent_by_username FROM workspace_messages LEFT JOIN users ON users.user_id = workspace_messages.sent_by WHERE workspace_message_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [workspace_message] = await query(sql, record_id_1);
                if (!workspace_message) return null;
                return workspace_message;
            }
            case 'WorkspaceUserAssociation': {
                const sql = `SELECT * FROM workspace_user_associations WHERE workspace_id = ? AND user_id = ?`;
                const [assoc] = await query(sql, record_id_1, record_id_2);
                if (!assoc) return null;
                return assoc;
            }
            //FeedbackLogs handled specially in their own Service
            case 'FeedbackLogFilter': {
                const sql = `SELECT * FROM feedback_log_filters WHERE feedback_log_filter_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [FeedbackLogFilter] = await query(sql, record_id_1);
                if (!FeedbackLogFilter) return null;
            }
            case 'FeedbackLogItem': {
                const sql = `SELECT feedback_log_items.*, users.username AS created_by_username, archived FROM feedback_log_items LEFT JOIN feedback_logs ON feedback_logs.feedback_log_id = feedback_log_items.feedback_log_item_id LEFT JOIN users ON created_by = users.user_id WHERE feedback_log_item_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [feedbackLogItem] = await query(sql, record_id_1);
                return feedbackLogItem;
            }
            case 'FeedbackLogItemMessage': {
                const sql = `SELECT feedback_log_item_messages.*, users.username AS sent_by_username FROM feedback_log_item_messages LEFT JOIN users ON sent_by = users.user_id WHERE feedback_log_item_message_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [feedbackLogItemMessage] = await query(sql, record_id_1);
                return feedbackLogItemMessage;
            }
            case 'Newsletter': {
                const sql = `${this.fetch_sql} WHERE newsletter_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [newsletter] = await query(sql, record_id_1);
                return newsletter;
            }
            case 'DebtAccount': {
                const sql = `SELECT A.*, Bor.username AS borrower_username, Len.username AS lender_username, SUM(T.amount) AS balance FROM debt_accounts A LEFT JOIN debt_account_transactions T ON A.debt_account_id = T.debt_account_id LEFT JOIN users Bor ON Bor.user_id = A.borrower_id LEFT JOIN users Len ON Len.user_id = A.lender_id WHERE A.debt_account_id = ?;`;
                const [debtAccount] = await query(sql, record_id_1);
                return debtAccount;
            }
            case 'DebtAccount': {
                let sql;

                if (inclusions.balance) {
                    sql = `SELECT A.*, Bor.username AS borrower_username, Len.username AS lender_username, SUM(T.amount) AS balance FROM debt_accounts A LEFT JOIN debt_account_transactions T ON A.debt_account_id = T.debt_account_id LEFT JOIN users Bor ON Bor.user_id = A.borrower_id LEFT JOIN users Len ON Len.user_id = A.lender_id WHERE A.debt_account_id = ?;`;
                } else {
                    sql = `SELECT A.*, Bor.username AS borrower_username, Len.username AS lender_username FROM debt_accounts A LEFT JOIN users Bor ON Bor.user_id = A.borrower_id LEFT JOIN users Len ON Len.user_id = A.lender_id WHERE A.debt_account_id = ?;`;
                }
                
                const [debtAccount] = await query(sql, record_id_1);

                if (inclusions.transactions) {
                    await query(`SELECT debt_account_transactions.*, users.username AS entered_by_username FROM debt_account_transactions LEFT JOIN users ON entered_by = users.user_id WHERE debt_account_id = ?;`, record_id_1)
                        .then(response => {
                            debtAccount.transactions = response;
                        });
                }

                return debtAccount;
            }
            case 'VotingSession': {
                const sql = `SELECT * FROM voting_sessions WHERE voting_session_id = ? ${constraint_stringifier(constraints)}`;

                const [votingSession] = await query(sql, record_id_1);

                if (inclusions.votes) {
                    await query(`SELECT * FROM votes WHERE voting_session_id = ? AND deleted = FALSE;`, record_id_1)
                        .then(response => {
                            votingSession.votes = response;
                        });
                }

                return votingSession;
            }
            default: {
                const table_name = this.table_name || recordTypeMap.table_names[this.record_type];

                const primary_key = this.primary_key || recordTypeMap.simple_primary_key[this.record_type];

                if (!table_name || !primary_key || !this.record_type) {
                    console.log(`${this.record_type} not recognized`);
                    return null;
                }

                const sql = `SELECT * FROM ${table_name}  WHERE ( ${(typeof primary_key === 'string' ? [primary_key] : primary_key).map(a => a + ' = ?').join(' AND ')});`;

                console.log('SQL', sql);
                const [record] = await query(sql, record_ids);
                return record;
            }
        }
    }

    /**
     * @method fetch_by_criteria
     * @param {Object} criteria
     */
    fetch_by_criteria = async (criteria = {}) => {

        const {
            limit,
            offset
        } = criteria;
        delete criteria.limit;
        delete criteria.offset;

        const table_name = this.table_name || recordTypeMap.table_names[this.record_type];
        const keys = Object.keys(criteria);
        const vals = Object.values(criteria);

        //these allow you to specify rules like -->  "SELECT * FROM workspace_messages ORDER BY workspace_message_id LIMIT 60 OFFSET 30;"
        //what this does is returns records all the way to record 60 starting at 30, or in other words, records 30 to 60.
        const limitText = limit ? ` LIMIT ${limit}` : '';
        const offsetText = offset ? ` OFFSET ${offset}` : '';

        let sql_2;

        if (this.fetch_sql) {
            sql_2 = `${this.fetch_sql} ${keys.length ? 'WHERE ': ''}` + keys.map(a => a + ' = ?').join(',') + limitText + offsetText
        }

        const sql = sql_2 || (keys.length ? `SELECT * FROM ${table_name} WHERE ` + keys.map(a => a + ' = ?').join(',') + limitText + offsetText : `SELECT * FROM ${table_name} ` + limitText + offsetText);
        const result = await query(sql, vals);

        return {
            success: !!result,
            message: `Fetched ${result.length} rows`,
            details: result
        };
    }

    /**
     * @method hard_delete
     * @param {Object} criteria
     */
    hard_delete = async criteria => {
        const table_name = this.table_name || recordTypeMap.table_names[this.record_type];

        const keys = Object.keys(criteria);
        const vals = Object.values(criteria);

        const sql = `DELETE FROM ${table_name} WHERE ` + keys.map(a => a + ' = ?').join(',');
        const result = await query(sql, vals);

        return {
            success: !!result?.affectedRows,
            message: result?.affectedRows ? `deleted ${result?.affectedRows}` : 'failed',
            details: result
        };
    }

    un_soft_delete = async (...record_ids) => {
        return await this.update_single({
            deleted: false
        }, ...record_ids);
    }

    soft_delete = async (...record_ids) => {
        return await this.update_single({
            deleted: true
        }, ...record_ids);
    }

    /**
     * @method update_single
     * @param {Number} record_ids one or more of the primary keys for the record
     */
    update_single = async (data, ...record_ids) => {
        const table_name = this.table_name || recordTypeMap.table_names[this.record_type];

        const primary_key = this.primary_key || recordTypeMap.simple_primary_key[this.record_type];

        if (!table_name || !primary_key) throw Error(`${this.record_type} not recognized`);

        let keys = Object.keys(data);

        const sql = `UPDATE ${table_name} SET  ${keys.map(a=> a+ ' = ?').join(', ')}  WHERE ( ${(typeof primary_key === 'string' ? [primary_key] : primary_key).map(a=>a+' = ?').join(' AND ')});`;

        console.log('SQL', sql);
        console.log('data', ...keys.map(key => data[key]).concat(record_ids));

        const update = await query(sql, ...keys.map(key => data[key]).concat(record_ids));

        if (!update || !update?.affectedRows) {
            return {
                success: false,
                message: 'failed',
                details: update
            };
        }

        let new_record_details = await this.fetch_by_id([...record_ids]);

        return {
            success: !!new_record_details,
            message: 'updated',
            details: new_record_details
        };
    }

    /**
     * @method create_single Inserts 1 record with the provided data into the DB
     * @param {{any:string|number|boolean}} data details of the new record
     */
    create_single = async data => {
        const table_name = this.table_name || recordTypeMap.table_names[this.record_type];

        if (!table_name) throw Error(`${this.record_type} not recognized`);

        let keys = Object.keys(data);


        const sql = `INSERT INTO ${table_name} ( ${keys.join(', ')} ) VALUES ( ${keys.map(a => ' ? ').join(', ')} )`;
        const creation_details = await query(sql, ...keys.map(key => data[key]));

        if (!creation_details || !creation_details?.affectedRows) {
            return {
                success: false,
                message: creation_details?.affectedRows ? 'deleted' : 'failed',
                details: creation_details
            };
        }

        console.log(data, this.primary_key, creation_details);

        if (typeof this.primary_key === 'string') { //simple
            console.log('simple primary key');
            let new_record_details = await this.fetch_by_id(creation_details.insertId);
            console.log(new_record_details);
            return {
                success: !!new_record_details,
                message: new_record_details ? 'created' : 'failed',
                details: new_record_details
            };
        } else { //complex
            let new_record_details = await this.fetch_by_id([data[this.primary_key[0]], data[this.primary_key[1]]], {}, {});

            console.log(new_record_details);

            return {
                success: !!new_record_details,
                message: new_record_details ? 'created' : 'failed',
                details: new_record_details
            };
        }
    }

    /**
     * @returns {Promise<{primary_key: number} | undefined>}
     */
    confirm_exists_by_id = async (...record_ids) => {
        const table_name = this.table_name || recordTypeMap.table_names[this.record_type];

        const primary_keys = this.primary_key || recordTypeMap.simple_primary_key[this.record_type] || recordTypeMap.complex_primary_key[this.record_type];

        if (!primary_keys || !table_name) throw Error(`${this.record_type} not recognized`);

        let result;
        let [primary_record_id] = record_ids;

        if (typeof primary_keys === 'string') { //simple
            const sql = `SELECT ${primary_keys} FROM ${table_name} WHERE ${primary_keys} = ?;`;
            result = await query(sql, primary_record_id);
        } else { //complex
            let sql = `SELECT ${primary_keys[0]} FROM ${table_name} WHERE`;
            sql += primary_keys.map(a => a + ' = ?').join(',');
            result = await query(sql, record_ids);
        }

        return !!result?. [0];
    }
};

/**
 * @function constraint_stringifier
 * @return {string} SQL statement for the filters
 */
export function constraint_stringifier(constraints = {}) {
    let t = [];

    Object.entries(constraints).forEach(([key, value]) => {

        if (typeof value === 'boolean') {
            t.push(`AND ${key} = ${value?'TRUE': 'FALSE'}`);
        } else if (typeof value === 'string') {
            t.push(`AND ${key} = '${value}'`);
        } else if (value === null) {
            t.push(`AND ${key} IS NULL`);
        } else if (typeof value === 'number') {
            t.push(`AND ${key} = ${value}`);
        } else if (Array.isArray(value)) {
            t.push(`AND ${key} IN ( ${value.join(', ')} ) `);
        } else {
            console.log(`Unrecognized case in constraint_stringifier at key "${key}"`, constraints);
        }
    });

    t.length && t.unshift(' ');

    return t.join(' ');
}