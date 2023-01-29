const SAVE_LOCAL = true;
// import query from '../utils/db_connection.js'; //do we save locally or DB?

import fs from 'fs';

const notes_prep = (nt) => {
    if (!nt) return '';
    if (Array.isArray(nt)) return nt.filter(Boolean).map((content, index) => `Note #${index+1}: "${content}"`).join('\n');
    if (typeof nt === 'string') {
        try {
            nt = notes_prep(JSON.parse(nt))
        } catch {}
    };
    return nt;
}

/**
 * @function error_handler - creates record for errors to be investigated later
 * @event
 * @prop {String} error_type
 * @prop {String} related_to
 * @prop {String} severity - default `Low`
 * @prop {String|Number} parent_id
 * @prop {String} parent_type
 * @prop {String} details
 * @prop {String|Array} notes
 * @return {undefined} nothing
 */
export default function error_handler({
    error_type,
    related_to,
    severity = 'Low',
    parent_id,
    parent_type,
    details,
    notes,
}) {
    if (SAVE_LOCAL) {
        let now = new Date();
        let txt = `Severity: ${severity}
        Error Type: ${error_type||'unspecified'}
        Related to: ${related_to||'unspecified'}
        Parent ID: ${parent_id||'unspecified'}
        Parent Type: ${parent_type||'unspecified'}
        Details: ${details||''}
        Notes: ${notes_prep(notes)}
        Reported: ${String(now)}`;

        fs.writeFileSync(`../errors/${severity} - ${JSON.stringify(now)} - ${related_to||'unspecified'}`, txt, {
            encoding: 'utf8'
        });
    }
}