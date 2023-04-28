import RecordService from './RecordService.mjs';
import query from '../utils/db_connection.js';


export default class FeedbackLogFilterService extends RecordService {
    constructor() {
        super();
        this.record_type = 'FeedbackLogFilter';
        this.table_name = 'feedback_log_filters';
        this.primary_key = 'feedback_log_filter_id';
    }

    async apply_condition(log_id_to_query, condition) {
        const {
            success,
            result : sqlFilter
        } = this.validate_condition(condition);

        const query_sql = sqlFilter ? `WHERE feedback_log_id = ? AND ( ${sqlFilter} );` : `WHERE feedback_log_id = ?`;

        const query_results = await query(query_sql, log_id_to_query);
    };

    stringify_condition_v1(condition = {}) { //good so far!!!
        let sql = '';
        for (let key in condition) {
            if (key === 'OR') {
                let orConditions = [];
                for (let i = 0; i < condition[key].length; i++) {
                    orConditions.push(stringify_condition(condition[key][i]));
                }
                sql += '(' + orConditions.join(' OR ') + ')';
            } else {
                let value = condition[key];
                if (Array.isArray(value)) {
                    value = value.map((v) => typeof v === 'string' ? `'${v}'` : v).join(', ');
                    sql += `${key} IN (${value})`;
                } else if (typeof value === 'object') {
                    for (let op in value) {
                        let val = value[op];
                        if (op === 'before') {
                            sql += `${key} <= "${val}"`;
                        } else if (op === 'after') {
                            sql += `${key} >= "${val}"`;
                        }
                    }
                } else {
                    sql += `${key} = ${typeof value === 'string' ? `'${value}'` : value}`;
                }
            }
            sql += ' AND ';
        }
        sql = sql.substring(0, sql.length - 5);
        return sql;
    };

    //with infinite gratitude to ChatGPT for this function :)
    stringify_condition_v2(condition = {}) {
        if (!condition) return "";

        if (condition.OR) {
            const or = condition.OR.map(stringify_condition_v2).filter(Boolean).join(" OR ");
            return or ? `(${or})` : "";
        }

        if (condition.AND) {
            const and = condition.AND.map(stringify_condition_v2).filter(Boolean).join(" AND ");
            return and ? `(${and})` : "";
        }

        const conditions = [];

        for (const [key, value] of Object.entries(condition)) {
            if (key === "OR" || key === "AND") continue;

            let operator = "=";
            let fieldValue = value;

            if (Array.isArray(value)) {
                if (value.length === 0) continue;
                operator = "IN";
                fieldValue = `(${value.map((v) => `'${v}'`).join(", ")})`;
            } else if (typeof value === "object") {
                const entries = Object.entries(value);

                if (entries.length !== 1) continue;

                const [op, opValue] = entries[0];

                if (['after', 'lte'].includes(op)) {
                    operator = "<=";
                    fieldValue = `"${opValue}"`;
                } else if (['after', 'gte'].includes(op)) {
                    operator = ">=";
                    fieldValue = `"${opValue}"`;
                } else if (op === "not") {
                    operator = "!=";
                    fieldValue = `"${opValue}"`;
                } else if (op === "is") {
                    operator = "=";
                    fieldValue = `"${opValue}"`;
                }
            } else {
                fieldValue = `'${value}'`;
            }

            conditions.push(`${key} ${operator} ${fieldValue}`);
        }

        return conditions.length ? conditions.join(" AND ") : "";
    };

    validate_condition(condition) {
        try {
            let result = this.stringify_condition_v2(condition);
            return {
                success: true,
                result,
            }
        } catch (primary_error) {
            try {
                let result = this.stringify_condition_v1(condition);
                return {
                    success: true,
                    primary_error,
                    result,
                }
            } catch (secondary_error) {
                return {
                    success: false,
                    primary_error,
                    secondary_error,
                }

            }
        }
    };
};