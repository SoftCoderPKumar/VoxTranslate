const winston = require('winston');
const path = require('path')

const { combine, timestamp, errors, colorize, printf, json } = winston.format;

const logDir = path.join(process.cwd(), 'logs');
const devFormat = printf(({
    level, message, timestamp, stack
}) => {
    return `${timestamp} [${level}]:${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true })
    ),
    defaultMeta: { service: 'audio-translator' },
    transports: [
        //Console transport
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({
                    format: "HH:mm:ss"
                }),
                devFormat
            ),
        }),
    ],
});


//In Production, also log to files
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: combine(timestamp(), json())
    }))
    logger.add(new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        format: combine(timestamp(), json())
    }))
}

// const levels = {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6
// };

module.exports = logger
