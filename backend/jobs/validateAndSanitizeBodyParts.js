/**
 * @middleware 
 * @param {{[prop]: 'string'|'number'|'boolean'|'hash'|'array'|'date'}} all_props
 * @param {Array<string> | {[prop]: true}} required
 */
export default function validateAndSanitizeBodyParts(all_props = {}, required = []) {

    required.forEach(prop => { //internal validation to make sure the tool is used correctly
        if (!all_props.hasOwnProperty(prop)) throw Error(`prop "${prop}" is not specific in the 'all_props' object in this middleware`);
    });

    required = required.reduce((acc, cur) => ({
        ...acc,
        [cur]: true
    }), {});

    const reqMessage = [Object.keys(required).slice(0, -1).join(', '), Object.keys(required).pop()].join(' and ');

    return (req, res, next) => {
        const cleanedBody = {};

        for (const [prop, expectedType] of Object.entries(all_props)) {

            if (!req.body.hasOwnProperty(prop) && required[prop]) { //not included in the body at all
                return res.status(400).json({
                    message: reqMessage
                });
            } else if (req.body.hasOwnProperty(prop)) {
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

            cleanedBody[prop] = req.body[prop];
        }
        req.body = cleanedBody;

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