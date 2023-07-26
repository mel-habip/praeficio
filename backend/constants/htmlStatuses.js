//reference --> https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const htmlStatuses = {
    OK: 200,
    Created: 201,
    Accepted: 202, //when a request is taken in but not enacted upon, very rare use
    Moved: 301,
    'Moved Permanently': 301, //use to deprecate old endpoints?
    'No Content': 204,
    bad_request: 400,
    'Bad Request': 400,
    'Bad request': 400,
    Unauthenticated: 401,
    unauthenticated: 401,
    Unauthorized: 401,
    unauthorized: 401,
    'Payment Required': 402,
    forbidden: 403,
    Forbidden: 403,
    'Not found': 404,
    'Not Found': 404,
    not_found: 404,
    Conflict: 409,
    Gone: 410, //use to deprecate old endpoints?
    'Payload Too Large': 413,
    "I'm a teapot": 418, //use as an Easter Egg? 
    'Too Many Requests': 429, //use for global rate-limiter,
    'Unavailable For Legal Reasons': 451
};

export default htmlStatuses;