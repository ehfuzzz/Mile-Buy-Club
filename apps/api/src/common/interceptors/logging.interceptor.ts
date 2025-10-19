import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { createLogger } from '@mile/shared/src/logger';
import { RequestWithId } from '../types/request-with-id';

const logger = createLogger('API');

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const { method, url, body, user } = request;
    const requestId = request.requestId;
    const timestamp = new Date().toISOString();

    logger.debug('API call', {
      requestId,
      timestamp,
      method,
      url,
      userId: user?.id,
      payloadSize: body ? JSON.stringify(body).length : 0,
    });
    
    return next.handle().pipe(
      tap((data) => {
        logger.info('API response', {
          requestId,
          method,
          url,
          userId: user?.id,
          dataLength: JSON.stringify(data).length,
        });
      }),
      catchError((error) => {
        logger.error('API error', {
          requestId,
          method,
          url,
          userId: user?.id,
          error: error.message,
          stack: error.stack,
          statusCode: error instanceof HttpException ? error.getStatus() : 500,
        });
        
        return throwError(() => error);
      })
    );
  }
}
