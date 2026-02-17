import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

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
        new LoggingWinston(),
    ],
});

export default logger;
