import query from '../utils/db_connection.js';

import WorkspaceMessagesRelationshipOrganizer from '../jobs/WorkspaceMessagesRelationshipOrganizer.js';

export const recordTypeMap = {
    table_names: { //phase these out once ready.
        Alert: 'alerts',
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
        Alert: 'alert_id',
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
     * @param {Number} record_id_1 - the record to be fetched
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
    async fetch_by_id(record_ids, constraints = {}, inclusions = {}) {

        if (typeof record_ids === 'string' || typeof record_ids === 'number') record_ids = [record_ids]; //so that you can pass an array or others

        const [record_id_1, record_id_2] = record_ids;

        if (!this.record_type) {
            console.error(`No Record Type specified`);
            return null;
        }

        switch (this.record_type) {
            case 'Position': {
                const sql = `SELECT positions.*, workspace_position_associations.workspace_id  FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.position_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
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
                const sql_1 = `SELECT user_id, username, last_name, first_name, email, permissions, active, created_on, updated_on, use_beta_features FROM users WHERE user_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;

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
                const sql = `SELECT feedback_log_items.*, users.username AS created_by_username, archived FROM feedback_log_items LEFT JOIN feedback_logs ON feedback_logs.feedback_log_id = feedback_log_items.feedback_log_item_id LEFT JOIN users ON created_by = users.user_id WHERE feedback_log_item_id = ?`;
                const [feedbackLogItem] = await query(sql, record_id_1);
                return feedbackLogItem;
            }
            case 'FeedbackLogItemMessage': {
                const sql = `SELECT feedback_log_item_messages.*, users.username AS sent_by_username FROM feedback_log_item_messages LEFT JOIN users ON sent_by = users.user_id WHERE feedback_log_item_message_id = ?`;
                const [feedbackLogItemMessage] = await query(sql, record_id_1);
                return feedbackLogItemMessage;
            }
            default: {
                if (!this.record_type) {
                    console.error(`No Record Type specified`);
                } else {
                    console.error(`${this.record_type} is not a recognized Record Type`);
                }
                return null;
            }
        }
    }

    /**
     * @method hard_delete
     * @param {Object} criteria
     */
    async hard_delete(criteria) {
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

    /**
     * @method update_single
     * @param {Number} record_ids one or more of the primary keys for the record
     */
    async update_single(data, ...record_ids) {
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
    async create_single(data) {
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

    async confirm_exists_by_id(...record_ids) {
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