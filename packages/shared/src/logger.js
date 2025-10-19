"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
exports.maskSensitiveData = maskSensitiveData;
/**
 * Winston Logger Wrapper
 * Provides structured logging with different transports
 */
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, json, printf, colorize, errors } = winston_1.default.format;
// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, context, ...metadata }) => {
    let msg = `${timestamp} [${level}] ${context ? `[${context}]` : ''} ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
// Create logger instance
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
    defaultMeta: { service: 'mile-buy-club' },
    transports: [
        // Console transport
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
        }),
        // File transport for errors
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // File transport for all logs
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});
// Contextual logger factory
function createLogger(context) {
    return {
        error: (message, meta) => logger.error(message, { context, ...meta }),
        warn: (message, meta) => logger.warn(message, { context, ...meta }),
        info: (message, meta) => logger.info(message, { context, ...meta }),
        debug: (message, meta) => logger.debug(message, { context, ...meta }),
        verbose: (message, meta) => logger.verbose(message, { context, ...meta }),
    };
}
// Mask sensitive data
function maskSensitiveData(data) {
    if (!data || typeof data !== 'object')
        return data;
    const masked = { ...data };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization', 'ssn', 'creditCard'];
    for (const key in masked) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            masked[key] = '***REDACTED***';
        }
        else if (typeof masked[key] === 'object') {
            masked[key] = maskSensitiveData(masked[key]);
        }
    }
    return masked;
}
exports.default = logger;
//# sourceMappingURL=logger.js.map