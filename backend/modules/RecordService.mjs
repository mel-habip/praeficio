import query from '../utils/db_connection.js';


export const recordTypeMap = {
    table_names: { //phase these out once ready.
        Alert: 'alerts',
        Workspace: 'workspaces',
        WorkspaceUserAssociation: 'workspace_user_associations',
        WorkspacePositionAssociation: 'workspace_position_associations',
    },
    simple_primary_key: {
        Alert: 'alert_id',
        Workspace: 'workspace_id',
    },
    complex_primary_key: {
        WorkspaceUserAssociation: ['workspace_id', 'user_id'],
        WorkspacePositionAssociation: ['workspace_id', 'position_id'],
        FeedbackLogUserAssociation: ['feedback_log_id', 'user_id'],
    }
}

/**
 * @module Record polymorphic archetype for different records in the DB
 * @method fetch_by_id provides the record
 * @method fetch_by_user_id functions as a PATCH
 * @const {Hash} data
 * @const {String} record_type - inherit from child
 */
export default class RecordService {
    constructor(data) {
        if (data) console.log(`You shouldn't initialize this Class directly.`);
    };

    data = {};
    record_type;

    /**
     * @param {Number} record_id - the record to be fetched
     * @returns {Promise<{to_do_id?: number, user_id?: number, position_id?:number, content?:string, notes?:string[], completed?:boolean, archived?:boolean, deleted?:boolean, active?:boolean}>}
     */
    async fetch_by_id(record_id, constraints = {}, inclusions = {}) {
        if (!this.record_type) {
            console.error(`No Record Type specified`);
            return null;
        }

        switch (this.record_type) {
            case 'Position': {
                const sql = `SELECT positions.*, workspace_position_associations.workspace_id  FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.position_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [position] = await query(sql, record_id);

                if (inclusions.workspaces) {
                    const sql_2 = `SELECT workspace_id FROM workspace_position_associations WHERE position_id = ?;`;
                    await query(sql_2, record_id).then(response => position.workspaces = response?. [0]?.workspace_id ?? null);
                }
                return position;
            }
            case 'Alert': {
                const sql = `SELECT * FROM alerts WHERE alert_id = ? ${constraint_stringifier(constraints)}`;
                const [alert] = await query(sql, record_id);
                return alert;
            }
            case 'ToDo': {
                const sql = `SELECT * FROM todos WHERE to_do_id = ? ${constraint_stringifier(constraints)}`;
                const [to_do] = await query(sql, record_id);
                return to_do;
            }
            case 'User': {
                const sql_1 = `SELECT user_id, username, last_name, first_name, email, permissions, active, created_on, updated_on, use_beta_features FROM users WHERE user_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;

                const [user] = await query(sql_1, record_id);

                if (!user) return null;

                if (inclusions.workspaces) {
                    const sql_2 = `SELECT workspace_id, role FROM workspace_user_associations WHERE user_id = ?;`;
                    await query(sql_2, record_id).then(response => user.workspaces = response);
                }

                return user;
            }
            case 'Workspace': {
                const sql = `SELECT * FROM workspaces WHERE workspace_id = ?`;
                const [workspace] = await query(sql, record_id);
                if (!workspace) return null;
                if (inclusions.users) {
                    await query(`SELECT * FROM workspace_user_associations WHERE workspace_id = ?`, record_id).then(response => {
                        workspace.users = response.map(x => x.user_id);
                    });
                }
                if (inclusions.positions) {
                    await query(`SELECT * FROM workspace_position_associations WHERE workspace_id = ?`, record_id).then(response => {
                        workspace.positions = response.map(x => x.position_id);
                    });
                }
                return workspace;
            }
            case 'FeedbackLog': {
                const sql = `SELECT * FROM feedback_logs WHERE feedback_log_id = ?`;
                const [feedbackLog] = await query(sql, record_id);
                if (!feedbackLog) return null;
                if (inclusions.users) {
                    await query(`SELECT * FROM feedback_log_user_associations WHERE feedback_log_id = ?`, record_id).then(response => {
                        feedbackLog.users = response.map(x => x.user_id);
                    });
                }
                if (inclusions.feedback_log_items || inclusions.items) {
                    await query(`SELECT * FROM feedback_log_items WHERE feedback_log_id = ?`, record_id).then(response => {
                        feedbackLog.feedback_log_items = response.map(x => x.feedback_log_item_id);
                    });
                }
                return feedbackLog;
            }
            case 'FeedbackLogItem': {
                const sql = `SELECT feedback_log_items.*, users.username AS created_by_username, archived FROM feedback_log_items LEFT JOIN feedback_logs ON feedback_logs.feedback_log_id = feedback_log_items.feedback_log_item_id LEFT JOIN users ON created_by = users.user_id WHERE feedback_log_item_id = ?`;
                const [feedbackLogItem] = await query(sql, record_id);
                return feedbackLogItem;
            }
            case 'FeedbackLogItemMessage': {
                const sql = `SELECT feedback_log_item_messages.*, users.username AS sent_by_username FROM feedback_log_item_messages LEFT JOIN users ON sent_by = users.user_id WHERE feedback_log_item_message_id = ?`;
                const [feedbackLogItemMessage] = await query(sql, record_id);
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

    async fetch_by_user_id(user_id, constraints = {}) {
        switch (this.record_type) {
            case 'Position': {
                const sql = `SELECT positions.*, workspace_position_associations.workspace_id  FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.user_id = ? ${constraint_stringifier(constraints)} ;`;
                const positions = await query(sql, user_id);
                return positions;
            }
            case 'Alert': {
                const sql = `SELECT * FROM alerts WHERE user_id = ? ${constraint_stringifier(constraints)}`;
                const alerts = await query(sql, user_id);
                return alerts;
            }
            case 'FeedbackLog': {
                const sql = `SELECT feedback_logs.*, feedback_log_user_associations.user_id  FROM feedback_logs LEFT JOIN feedback_log_user_associations ON feedback_logs.feedback_log_id = feedback_log_user_associations.feedback_log_id WHERE feedback_log_user_associations.user_id = ? ${constraint_stringifier(constraints)}`;
                const feedbackLogs = await query(sql, user_id);
                return feedbackLogs;
            }
        }
    }


    /**
     * @param {Number} record_ids one or more of the primary keys for the record
     */
    async hard_delete(...record_ids) {
        const table_name = recordTypeMap.table_names[this.record_type];

        if (!table_name) throw Error(`${this.record_type} not recognized`);

        const primary_keys = recordTypeMap.simple_primary_key[this.record_type] || recordTypeMap.complex_primary_key[this.record_type];

        if (!primary_keys) throw Error(`${this.record_type} not recognized`);

        let result;

        if (typeof primary_keys === 'string') { //simple
            const sql = `DELETE FROM ${table_name} WHERE ${primary_keys} = ?;`;
            result = await query(sql, primary_record_id);
        } else { //complex
            let sql = `DELETE FROM ${table_name} WHERE`;
            sql += primary_keys.map(a => a + ' = ?').join(',');
            result = await query(sql, record_ids);
        }

        return {
            success: !!result?.affectedRows,
            message: result?.affectedRows ? 'deleted' : 'failed',
            details: result
        };
    }

    /**
     * @param {Number} record_ids one or more of the primary keys for the record
     */
    async update(data, ...record_ids) {

    }

    /**
     * @param {{any:string|number|boolean}} data details of the new record
     */
    async create_single(data) {
        const table_name = recordTypeMap.table_names[this.record_type];

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

        let new_record_details = await this.fetch_by_id([creation_details.insertId]);

        return {
            success: !!new_record_details,
            message: new_record_details ? 'created' : 'failed',
            details: new_record_details
        };
    }
};

/**
 * @function constraint_stringifier
 * @return {string} SQL statement for the filters
 */
function constraint_stringifier(constraints = {}) {
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
        } else {
            console.log(`Unrecognized case in constraint_stringifier at key "${key}"`, constraints);
        }
    });

    t.length && t.unshift(' ');

    return t.join(' ');
}