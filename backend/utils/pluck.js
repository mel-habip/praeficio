/**
 * @name pluck - returns new hash with selected keys
 * @param {Object} object - source hash
 * @param {String} keys - parts to extract
 * @return {Object} new hash with selected keys
 */
export default function pluck(object={}, ...keys) {
    return keys.reduce((obj, key) => {
        obj[key] = object[key];
        return obj;
    }, {});
}