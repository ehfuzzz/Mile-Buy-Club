/**
 * Winston Logger Wrapper
 * Provides structured logging with different transports
 */
import winston from 'winston';
declare const logger: winston.Logger;
export declare function createLogger(context: string): {
    error: (message: string, meta?: any) => winston.Logger;
    warn: (message: string, meta?: any) => winston.Logger;
    info: (message: string, meta?: any) => winston.Logger;
    debug: (message: string, meta?: any) => winston.Logger;
    verbose: (message: string, meta?: any) => winston.Logger;
};
export declare function maskSensitiveData(data: any): any;
export default logger;
//# sourceMappingURL=logger.d.ts.map