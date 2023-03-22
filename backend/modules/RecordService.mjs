import query from '../utils/db_connection.js';


const recordTypeMap = {
    table_names: {
        Position: 'positions',
        Alert: 'alerts',
        ToDo: 'to_do_s',
        Workspace: 'workspaces',
        WorkspaceUserAssociation: 'workspace_user_associations',
        WorkspacePositionAssociation: 'workspace_position_associations',
        User: 'users',
    },
    simple_primary_key: {
        Position: 'position_id',
        Alert: 'alert_id',
        ToDo: 'to_do_id',
        Workspace: 'workspace_id',
        User: 'user_id',
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
        console.log(`You shouldn't initialize this Class directly.`);
    };

    data = {};
    record_type;

    async fetch_by_id(record_id, constraints = {}, detailed = false) {
        if (!this.record_type) {
            console.error(`No Record Type specified`);
            return null;
        }

        switch (this.record_type) {
            case 'Position': {
                const sql = `SELECT positions.*, workspace_position_associations.workspace_id  FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.position_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [position] = await query(sql, record_id);
                return position;
            }
            case 'Alert': {
                const sql = `SELECT * FROM alerts WHERE alert_id = ? ${constraint_stringifier(constraints)}`;
                const [alert] = await query(sql, record_id);
                return alert;
            }
            case 'ToDo': {
                const sql = `SELECT * FROM to_do_s WHERE to_do_id = ? ${constraint_stringifier(constraints)}`;
                const [to_do] = await query(sql, record_id);
                return to_do;
            }
            case 'User': {
                const sql_1 = `SELECT user_id, username, last_name, first_name, email, permissions, active, created_on, updated_on FROM users WHERE user_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;

                const [user] = await query(sql_1, record_id);

                if (!user) return null;

                if (detailed) {
                    const sql_2 = `SELECT workspace_id, role FROM workspace_user_associations WHERE user_id = ?;`;
                    await query(sql_2, record_id).then(response => user.workspaces = response);
                }

                return user;
            }
            case 'Workspace': {
                const sql = `SELECT * FROM workspaces WHERE workspace_id = ?`;
                const [workspace] = await query(sql, record_id);
                if (!workspace) return null;
                if (detailed) {
                    await query(`SELECT * FROM workspace_user_associations WHERE workspace_id = ?`, workspace.workspace_id).then(response => {
                        workspace.users = response.map(x => x.user_id);
                    });
                    await query(`SELECT * FROM workspace_position_associations WHERE workspace_id = ?`, workspace.workspace_id).then(response => {
                        workspace.positions = response.map(x => x.position_id);
                    });
                }
                return workspace;
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
                const sql = `SELECT positions.*, workspace_position_associations.workspace_id  FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.user_id = ? ${constraint_stringifier(constraints)} LIMIT 1;`;
                const [position] = await query(sql, user_id);
                return position;
            }
            case 'Alert': {
                const sql = `SELECT * FROM alerts WHERE user_id = ? ${constraint_stringifier(constraints)}`;
                const [alert] = await query(sql, user_id);
                return alert;
            }
        }
    }


    /**
     * @param {Number} primary_record_id sole identifier for primitive records
     * @param {Number?} secondary_record_id - secondary identifier for complex records
     * @param {Number?} tertiary_record_id - tertiary identifier for complex records
     */
    async hard_delete(primary_record_id, secondary_record_id, tertiary_record_id) {
        const table_name = recordTypeMap.table_names[this.record_type];

        if (!table_name) throw Error(`${this.record_type} not recognized`);

        const primary_key = recordTypeMap.simple_primary_key[this.record_type];

        let result;

        if (primary_key) {
            const sql = `DELETE FROM ${table_name} WHERE ${primary_key} = ?;`;
            result = await query(sql, primary_record_id);
        } else {
            let sql = `DELETE FROM ${table_name} WHERE`;

            switch (this.record_type) {
                case 'WorkspaceUserAssociation': {
                    sql += `workspace_id = ? AND user_id = ?;`;
                    break;
                }
                case 'WorkspacePositionAssociation': {
                    sql += `workspace_id = ? AND position_id = ?;`;
                    break;
                }
                default: {
                    throw Error(`${this.record_type} not recognized`);
                }
            }
            result = await query(sql, primary_record_id, secondary_record_id, tertiary_record_id);
        }

        return {
            success: !!result?.affectedRows,
            message: result?.affectedRows ? 'deleted' : 'failed',
            details: result
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
            t.push(`AND ${key} = NULL`);
        } else if (typeof value === 'number') {
            t.push(`AND ${key} = ${value}`);
        } else {
            console.log(`Unrecognized case in constraint_stringifier at key "${key}"`, constraints);
        }
    });

    t.length && t.unshift(' ');

    return t.join(' ');
}