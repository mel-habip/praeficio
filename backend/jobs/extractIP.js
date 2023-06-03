/**
 * @middleware that adds the requester's IP address to the req object
 * @adds `req.custom_ip` 
 */
export default function extractIP(req, res, next) {
    const ipAddresses = req.header('x-forwarded-for') || req.header('x-forwarded') || req.header('forwarded-for') || req.header('forwarded') || req.socket.remoteAddress;

    req.custom_ip = ipAddresses;

    console.log(`custom_ip: ${req.custom_ip}`);
    console.log(`regular ip: ${req.ip}`);

    next();
}