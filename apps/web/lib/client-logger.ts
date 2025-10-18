/**
 * Client-side error logging
 * Sends critical errors to the server for monitoring
 */

interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
}

class ClientLogger {
  private queue: ErrorLog[] = [];
  private flushInterval = 5000; // 5 seconds
  private maxQueueSize = 10;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startFlushInterval();
      this.setupGlobalErrorHandler();
    }
  }

  private setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      this.error(event.error?.message || event.message, event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', event.reason);
    });
  }

  error(message: string, error?: Error) {
    this.log('error', message, error);
  }

  warn(message: string) {
    this.log('warn', message);
  }

  info(message: string) {
    this.log('info', message);
  }

  private log(level: 'error' | 'warn' | 'info', message: string, error?: Error) {
    // Don't log in development
    if (process.env.NODE_ENV === 'development') {
      console[level](message, error);
      return;
    }

    const errorLog: ErrorLog = {
      message: this.sanitize(message),
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      level,
    };

    this.queue.push(errorLog);

    // Flush immediately for errors
    if (level === 'error' || this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private sanitize(message: string): string {
    // Remove potential sensitive data
    return message
      .replace(/password=\w+/gi, 'password=***')
      .replace(/token=\w+/gi, 'token=***')
      .replace(/apiKey=\w+/gi, 'apiKey=***')
      .replace(/\b\d{16}\b/g, '****') // Credit card numbers
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****'); // SSN
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const logs = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      // If sending fails, add back to queue
      this.queue.unshift(...logs);
      console.error('Failed to send logs to server:', error);
    }
  }

  private startFlushInterval() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
}

// Export singleton instance
export const clientLogger = new ClientLogger();
