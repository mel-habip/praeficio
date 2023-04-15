/**
 * @middleware 
 * @param {{[prop]: 'string'|'number'|'boolean'|'hash'|'array'|'date'|'enum(word_1, word_2, word_3)'}} all_props
 * @param {Array<string> | {[prop]: true}} required
 */
export default function validateAndSanitizeBodyParts(all_props = {}, required = []) {

    if (Array.isArray(required)) {
        required = required.reduce((acc, cur) => ({
            ...acc,
            [cur]: true
        }), {});
    }

    Object.keys(required).forEach(prop => { //internal validation to make sure the tool is used correctly
        if (!all_props.hasOwnProperty(prop)) throw Error(`prop "${prop}" is not specified in the 'all_props' object in this middleware`);
    });

    const reqMessage = [Object.keys(required).slice(0, -1).join(', '), Object.keys(required).pop()].join(' and ') + Object.keys(required).length > 1 ? ' are ' : ' is ' + 'required.';

    return function (req, res, next) {
        const cleanedBody = {};

        for (const [prop, expectedType] of Object.entries(all_props)) {

            if (!req.body.hasOwnProperty(prop) && required[prop]) { //not included in the body at all
                return res.status(400).json({
                    message: reqMessage
                });
            } else if (req.body.hasOwnProperty(prop)) {
                if (expectedType.startsWith('enum(')) {
                    const allowedOptions = expectedType.slice(5, -1).split(',').map(a => a.trim());
                    if (!allowedOptions.includes(req.body[prop])) {
                        return res.status(400).json({
                            message: `Expected one of "${allowedOptions.join(', ')}" but got "${req.body[prop]}" for prop "${prop}"`
                        });
                    }
                } else {
                    const trueType = typeFind(req.body[prop]); //the type provided in the request
                    if (expectedType !== trueType) { //wrong type
                        return res.status(400).json({
                            message: `Expected "${expectedType}" but got "${trueType}" for prop "${prop}"`
                        });
                    }
                    if (expectedType !== 'boolean' && required[prop] && !req.body[prop]) { //falsy value, for all except booleans
                        return res.status(400).json({
                            message: reqMessage
                        });
                    }
                }
            }
            cleanedBody[prop] = req.body[prop];
        }

        req.body = {...cleanedBody};

        next();
    }
}


function typeFind(val) {
    if (Array.isArray(val)) return 'array';

    if ([null, undefined].includes(val)) return 'null';

    const dateObject = new Date(val);
    if (dateObject.toString() !== 'Invalid Date') return 'date';

    const primType = typeof val;

    if (primType === 'object') return 'hash';

    return primType; //covers boolean, string, number
}