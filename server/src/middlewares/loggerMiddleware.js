import logger from "../utils/logger.js";

export function loggerMiddleware(req, res, next) {
    logger.notice(`${req.method} ${req.originalUrl}`);

    next();
}
