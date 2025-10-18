import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, maskSensitiveData } from '@mile/shared/src/logger';

const logger = createLogger('HTTP');

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    const startTime = Date.now();
    
    // Attach request ID to request
    req['requestId'] = requestId;
    
    // Log request
    logger.info('Incoming request', {
      requestId,
      method: req.method,
      path: req.path,
      query: maskSensitiveData(req.query),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'error' : 'info';
      
      logger[logLevel]('Request completed', {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });
    
    next();
  }
}
