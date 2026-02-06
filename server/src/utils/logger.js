import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  notice: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

const logger = winston.createLogger({
    levels,
    level: 'notice',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        // You can add file transports or other transports here
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

export default logger;

// export function error(message) {
//     console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
// }

// export function warn(message) {
//     console.warn(`[${new Date().toISOString()}] WARNING: ${message}`);
// }

// export function info(message) {
//     console.info(`[${new Date().toISOString()}] INFO: ${message}`);
// }

// export function notice(message) {
//     if (process.env.NODE_ENV === 'production') {
//         // In production, you might want to send this to a logging service
//         // For example: sendToLoggingService('notice', message);
//         console.log(`[${new Date().toISOString()}] NOTICE: ${message}`);
//     }
// }

// export function log(message) {
//     if (process.env.NODE_ENV === 'development') {
//         // In production, you might want to send this to a logging service
//         // For example: sendToLoggingService('log', message);
//         console.log(`[${new Date().toISOString()}] ${message}`);
//     }
// }

// export function debug(message) {
//     console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`);
// }

// export default {
//     error,
//     warn,
//     info,
//     notice,
//     log,
//     debug
// }
