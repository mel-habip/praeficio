import query from '../utils/db_connection.js';

export default async function fetchUserFriendships(user_id) {
    const sql = `SELECT F.*, U1.username AS user_1_username, U2.username AS user_2_username FROM friendships F LEFT JOIN users U1 ON (F.user_1_id = U1.user_id) LEFT JOIN users U2 ON (U2.user_id = F.user_2_id) WHERE (F.user_1_id = ? OR F.user_2_id = ?);`;
    const friendships = await query(sql, user_id, user_id);

    // cross-filter as we don't need to show 2 entries for friendships that are reversed but same
    const userIdSeenMap = {};

    const filtered = friendships.filter(frndshp => {

        const otherParty = frndshp.user_1_id === parseInt(user_id) ? frndshp.user_2_id : frndshp.user_1_id;

        if (!userIdSeenMap[otherParty]) {
            userIdSeenMap[otherParty] = true;
            return true;
        }
    });

    return filtered;
}