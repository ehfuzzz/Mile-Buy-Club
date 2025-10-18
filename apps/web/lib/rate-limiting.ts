// Rate limiting utilities and hooks

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  type: 'api' | 'watcher' | 'search' | 'notification';
}

export interface RateLimitState {
  current: number;
  limit: number;
  resetTime: number;
  windowMs: number;
  type: string;
  isLimited: boolean;
  timeUntilReset: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimitState> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Initialize default rate limits
    this.setConfig('api', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 100,
      type: 'api'
    });

    this.setConfig('watcher', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      type: 'watcher'
    });

    this.setConfig('search', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50,
      type: 'search'
    });

    this.setConfig('notification', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 20,
      type: 'notification'
    });
  }

  setConfig(type: string, config: RateLimitConfig): void {
    this.configs.set(type, config);
  }

  canMakeRequest(type: string, userId?: string): boolean {
    const key = userId ? `${type}:${userId}` : type;
    const config = this.configs.get(type);
    
    if (!config) {
      return true; // No limit configured
    }

    const now = Date.now();
    const state = this.limits.get(key);

    if (!state || now >= state.resetTime) {
      // Create new window
      const newState: RateLimitState = {
        current: 0,
        limit: config.maxRequests,
        resetTime: now + config.windowMs,
        windowMs: config.windowMs,
        type: config.type,
        isLimited: false,
        timeUntilReset: config.windowMs
      };
      this.limits.set(key, newState);
      return true;
    }

    return state.current < state.limit;
  }

  recordRequest(type: string, userId?: string): RateLimitState {
    const key = userId ? `${type}:${userId}` : type;
    const config = this.configs.get(type);
    
    if (!config) {
      return {
        current: 0,
        limit: Infinity,
        resetTime: Date.now(),
        windowMs: 0,
        type: config?.type || type,
        isLimited: false,
        timeUntilReset: 0
      };
    }

    const now = Date.now();
    const state = this.limits.get(key);

    if (!state || now >= state.resetTime) {
      // Create new window
      const newState: RateLimitState = {
        current: 1,
        limit: config.maxRequests,
        resetTime: now + config.windowMs,
        windowMs: config.windowMs,
        type: config.type,
        isLimited: false,
        timeUntilReset: config.windowMs
      };
      this.limits.set(key, newState);
      return newState;
    }

    // Update existing window
    const updatedState: RateLimitState = {
      ...state,
      current: state.current + 1,
      isLimited: state.current + 1 >= state.limit,
      timeUntilReset: Math.max(0, state.resetTime - now)
    };
    this.limits.set(key, updatedState);
    return updatedState;
  }

  getState(type: string, userId?: string): RateLimitState | null {
    const key = userId ? `${type}:${userId}` : type;
    const state = this.limits.get(key);
    
    if (!state) {
      return null;
    }

    const now = Date.now();
    if (now >= state.resetTime) {
      // Window has expired
      this.limits.delete(key);
      return null;
    }

    return {
      ...state,
      timeUntilReset: Math.max(0, state.resetTime - now)
    };
  }

  reset(type: string, userId?: string): void {
    const key = userId ? `${type}:${userId}` : type;
    this.limits.delete(key);
  }

  resetAll(): void {
    this.limits.clear();
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// React hook for rate limiting
export function useRateLimit(type: string, userId?: string) {
  const [state, setState] = React.useState<RateLimitState | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const updateState = React.useCallback(() => {
    const currentState = rateLimiter.getState(type, userId);
    setState(currentState);
  }, [type, userId]);

  const makeRequest = React.useCallback(async <T>(
    requestFn: () => Promise<T>
  ): Promise<T> => {
    if (!rateLimiter.canMakeRequest(type, userId)) {
      throw new Error(`Rate limit exceeded for ${type}`);
    }

    setIsLoading(true);
    try {
      const result = await requestFn();
      const newState = rateLimiter.recordRequest(type, userId);
      setState(newState);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [type, userId]);

  const canMakeRequest = React.useCallback(() => {
    return rateLimiter.canMakeRequest(type, userId);
  }, [type, userId]);

  React.useEffect(() => {
    updateState();
    const interval = setInterval(updateState, 1000); // Update every second
    return () => clearInterval(interval);
  }, [updateState]);

  return {
    state,
    isLoading,
    makeRequest,
    canMakeRequest,
    refresh: updateState
  };
}

// API wrapper with rate limiting
export function withRateLimit<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  type: string,
  userId?: string
) {
  return async (...args: T): Promise<R> => {
    if (!rateLimiter.canMakeRequest(type, userId)) {
      throw new Error(`Rate limit exceeded for ${type}. Please try again later.`);
    }

    const result = await fn(...args);
    rateLimiter.recordRequest(type, userId);
    return result;
  };
}

// Rate limit middleware for API routes
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (req: any, res: any, next: any) => {
    const userId = req.user?.id;
    const type = config.type;

    if (!rateLimiter.canMakeRequest(type, userId)) {
      const state = rateLimiter.getState(type, userId);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many ${type} requests. Please try again later.`,
        retryAfter: state?.timeUntilReset || 0,
        limit: state?.limit || 0,
        current: state?.current || 0,
        resetTime: state?.resetTime || Date.now()
      });
    }

    // Record the request
    const state = rateLimiter.recordRequest(type, userId);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': state.limit,
      'X-RateLimit-Remaining': Math.max(0, state.limit - state.current),
      'X-RateLimit-Reset': new Date(state.resetTime).toISOString()
    });

    next();
  };
}

// Utility functions
export function formatTimeUntilReset(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getRateLimitStatus(state: RateLimitState): 'normal' | 'warning' | 'limited' {
  const percentage = (state.current / state.limit) * 100;
  
  if (percentage >= 100) {
    return 'limited';
  } else if (percentage >= 80) {
    return 'warning';
  } else {
    return 'normal';
  }
}

// Import React for the hook
import React from 'react';
