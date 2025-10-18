import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Simple in-memory rate limiter (for demonstration; use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// Combined middleware function
export default withAuth(
  function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // CSRF token handling
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      const csrfCookie = request.cookies.get('csrf-token')?.value;

      // In production, validate CSRF token
      // For now, just log if missing
      if (!csrfToken || !csrfCookie) {
        console.warn('CSRF token missing for state-changing request');
      }
    }

    // Rate limiting for auth endpoints
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      const ip = request.ip || 'unknown';
      
      if (!rateLimit(ip)) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        });
      }
    }

    // Add security headers (backup to next.config.js)
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only require auth for dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return Boolean(token);
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all request paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};