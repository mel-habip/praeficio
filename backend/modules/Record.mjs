import query from '../utils/db_connection.js';

/**
 * @module Record polymorphic archetype for different records in the DB
 * @method fetch_by_id provides the record
 * @method update_by_id functions as a PATCH 
 */
export default class Record {
    constructor(data) {};

    data = {};

    async fetch_by_id(record_id, constraints = {}, detailed = false) {
        if (!this.record_type) {
            console.error(`No Record Type specified`);
            return null;
        }

        switch (this.record_type) {
            case 'Position': {
                const sql = `SELECT positions.*, workspace_position_associations.workspace_id  FROM positions LEFT JOIN workspace_position_associations ON positions.position_id = workspace_position_associations.position_id WHERE positions.position_id = ? ${constraint_obj_to_string(constraints)} LIMIT 1;`;
                const [position] = await query(sql, record_id);
                return position;
            }
            case 'Alert': {
                const sql = `SELECT * FROM alerts WHERE alert_id = ? ${constraint_obj_to_string(constraints)}`;
                const [alert] = await query(sql, record_id);
                return alert;
            }
            case 'User': {
                const sql_1 = `SELECT user_id, username, last_name, first_name, email, permissions, active, created_on, updated_on FROM users WHERE user_id = ? ${constraint_obj_to_string(constraints)} LIMIT 1;`;

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

    async update_by_id(id, data) {
        let [record_to_be_updated] = await this.fetch_by_id(id);
        if (!record_to_be_updated) return null;

    }
};

function constraint_obj_to_string(constraints) {
    let t = '';
    if (constraints.deleted === true) {
        t = 'AND deleted = TRUE';
    } else if (constraints.deleted === false) {
        t = 'AND deleted = FALSE';
    }

    if (constraints.active === true) {
        t += ' AND active = TRUE';
    } else if (constraints.active === false) {
        t = 'AND active = FALSE';
    }
    return t;
}