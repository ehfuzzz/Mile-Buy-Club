import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly cookieName = 'csrf-token';
  private readonly headerName = 'x-csrf-token';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      // Generate and set CSRF token for future requests
      this.generateAndSetToken(request, response);
      return true;
    }

    // Validate CSRF token for state-changing operations
    const tokenFromHeader = request.headers[this.headerName] as string;
    const tokenFromCookie = request.cookies[this.cookieName];

    if (!tokenFromHeader || !tokenFromCookie) {
      throw new ForbiddenException('CSRF token missing');
    }

    if (!this.validateToken(tokenFromHeader, tokenFromCookie)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }

  private generateAndSetToken(request: Request, response: Response): void {
    // Check if token already exists
    if (request.cookies[this.cookieName]) {
      return;
    }

    // Generate new token
    const token = randomBytes(32).toString('hex');
    const hash = this.hashToken(token);

    // Set cookie with hashed token (double-submit pattern)
    response.cookie(this.cookieName, hash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });
  }

  private validateToken(headerToken: string, cookieToken: string): boolean {
    const hashedHeaderToken = this.hashToken(headerToken);
    return hashedHeaderToken === cookieToken;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
