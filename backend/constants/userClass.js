export default class User {
    /**
     * @param {{id: number, first_name: string, last_name: string, workspaces: Array<{ role: string, workspace_id: number }> feedback_logs: Array<number> to_do_categories: Array<string>, use_beta_features: boolean, permissions: string}} data
     */
    constructor (data) {
        this.id = data.id;
        this.first_name = data.first_name;
        ['last_name', 'workspaces', 'feedback_logs', 'to_do_categories', 'use_beta_features', 'permissions'].forEach(prop => this[prop] = data[prop]);
    }
}