
import query from '../utils/db_connection.js';

export default async function fetchUserFeedbackLogs(req, res, next) {
    if (!req.user) return res.status(401).send('Unauthenticated: No user details received.');

    await query(`SELECT feedback_log_id FROM feedback_log_user_associations WHERE user_id = ?;`, req.user.id).then(response => req.user.feedback_logs = response.map(a=>a.feedback_log_id));

    next();
}