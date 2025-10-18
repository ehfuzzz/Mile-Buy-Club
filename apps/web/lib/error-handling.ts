// Error handling utilities and types

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  requestId?: string;
}

export class CustomError extends Error {
  public type: ErrorType;
  public code?: string;
  public details?: any;
  public timestamp: Date;
  public userId?: string;
  public requestId?: string;

  constructor(
    type: ErrorType,
    message: string,
    code?: string,
    details?: any,
    userId?: string,
    requestId?: string
  ) {
    super(message);
    this.name = 'CustomError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.userId = userId;
    this.requestId = requestId;
  }
}

// Error factory functions
export function createNetworkError(message: string, details?: any): CustomError {
  return new CustomError(ErrorType.NETWORK, message, 'NETWORK_ERROR', details);
}

export function createValidationError(message: string, details?: any): CustomError {
  return new CustomError(ErrorType.VALIDATION, message, 'VALIDATION_ERROR', details);
}

export function createAuthError(message: string, details?: any): CustomError {
  return new CustomError(ErrorType.AUTHENTICATION, message, 'AUTH_ERROR', details);
}

export function createNotFoundError(message: string, details?: any): CustomError {
  return new CustomError(ErrorType.NOT_FOUND, message, 'NOT_FOUND_ERROR', details);
}

export function createServerError(message: string, details?: any): CustomError {
  return new CustomError(ErrorType.SERVER, message, 'SERVER_ERROR', details);
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | CustomError, context?: string): AppError {
    let appError: AppError;

    if (error instanceof CustomError) {
      appError = {
        type: error.type,
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: error.timestamp,
        userId: error.userId,
        requestId: error.requestId
      };
    } else {
      // Convert generic Error to AppError
      appError = {
        type: this.determineErrorType(error),
        message: error.message,
        code: 'UNKNOWN_ERROR',
        details: {
          name: error.name,
          stack: error.stack,
          context
        },
        timestamp: new Date()
      };
    }

    // Log error
    this.logError(appError);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(appError);
    }

    return appError;
  }

  private determineErrorType(error: Error): ErrorType {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    if (error.name === 'ValidationError') {
      return ErrorType.VALIDATION;
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return ErrorType.AUTHENTICATION;
    }
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return ErrorType.AUTHORIZATION;
    }
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return ErrorType.NOT_FOUND;
    }
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return ErrorType.SERVER;
    }
    return ErrorType.UNKNOWN;
  }

  private logError(error: AppError): void {
    this.errorLog.push(error);
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', error);
    }
  }

  private sendToMonitoring(error: AppError): void {
    // In a real application, this would send to a monitoring service like Sentry
    // For now, we'll just log it
    console.error('Sending to monitoring service:', error);
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// API error handling
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = 'An error occurred';
  let errorType = ErrorType.SERVER;

  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorMessage;
    
    switch (response.status) {
      case 400:
        errorType = ErrorType.VALIDATION;
        break;
      case 401:
        errorType = ErrorType.AUTHENTICATION;
        break;
      case 403:
        errorType = ErrorType.AUTHORIZATION;
        break;
      case 404:
        errorType = ErrorType.NOT_FOUND;
        break;
      case 500:
        errorType = ErrorType.SERVER;
        break;
      default:
        errorType = ErrorType.UNKNOWN;
    }
  } catch {
    // If we can't parse the error response, use the status text
    errorMessage = response.statusText || errorMessage;
  }

  throw new CustomError(
    errorType,
    errorMessage,
    `HTTP_${response.status}`,
    { status: response.status, statusText: response.statusText }
  );
}

// Async error wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance();
      const appError = errorHandler.handleError(error as Error, context);
      throw appError;
    }
  };
}

// Error boundary helper
export function getErrorDisplayMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case ErrorType.VALIDATION:
      return error.message || 'Please check your input and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Please sign in to continue.';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorType.SERVER:
      return 'Something went wrong on our end. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// Retry utility
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError!;
}
