import find_local_file from '../jobs/find_local_file.js';

import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url)); //this is merely a workaround for the __dirname which is not available inside of an ES module


/**
 * @constant {String} - path to the `.env` file
 * @access private
 */
const env_dir = find_local_file(__dirname, '.env', ['Desktop', 'Documents', 'Users']);

export default env_dir;