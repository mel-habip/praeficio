/**
 * @type {Boolean}
 * @note When set to `true`, server will start to reject all requests.
 * @important
 */
var GRACEFUL_SHUTDOWN_FLAG = false;

import usersCache from './usersCache.js';

export default GRACEFUL_SHUTDOWN_FLAG;

export function gracefulShutdownProcedule(saveCache = true) {
    GRACEFUL_SHUTDOWN_FLAG = true;

    if (saveCache) {
        console.log(usersCache.keys());
    }


    process.exit(1);
}