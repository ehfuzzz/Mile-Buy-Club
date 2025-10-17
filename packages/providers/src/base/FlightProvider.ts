/**
 * Abstract Flight Provider Base Class
 * All flight providers must extend this class and implement required methods
 */

import Bottleneck from 'bottleneck';
import {
  ProviderConfig,
  ProviderResponse,
  ProviderError,
  ProviderRateLimitError,
  ProviderAuthenticationError,
  ProviderValidationError,
  FlightSearchParams,
  Flight,
  ProviderHealthCheck,
} from './types';

export abstract class FlightProvider {
  protected config: ProviderConfig;
  protected limiter: Bottleneck;
  protected lastHealthCheck: ProviderHealthCheck | null = null;

  constructor(config: ProviderConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      retryDelayMs: 1000,
      ...config,
    };

    // Initialize rate limiter
    this.limiter = new Bottleneck({
      maxConcurrent: 5,
      minTime: this.calculateMinTime(),
      reservoir: this.config.rateLimit?.requestsPerMinute || 60,
      reservoirRefreshAmount: this.config.rateLimit?.requestsPerMinute || 60,
      reservoirRefreshInterval: 60 * 1000, // 1 minute
    });

    this.validateConfig();
  }

  /**
   * Main search method - wraps actual implementation with rate limiting
   */
  async search(
    params: FlightSearchParams,
  ): Promise<ProviderResponse<Flight[]>> {
    try {
      this.validateSearchParams(params);

      const result = await this.limiter.schedule(async () => {
        return this.searchWithRetry(params, 0);
      });

      return {
        success: true,
        data: result,
        metadata: {
          timestamp: Date.now(),
          duration: 0,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Search with exponential backoff retry logic
   */
  private async searchWithRetry(
    params: FlightSearchParams,
    retryCount: number,
  ): Promise<Flight[]> {
    try {
      const startTime = Date.now();
      const flights = await this.executeSearch(params);
      const duration = Date.now() - startTime;

      return flights;
    } catch (error) {
      if (retryCount < (this.config.maxRetries || 3)) {
        const delay = (this.config.retryDelayMs || 1000) * Math.pow(2, retryCount);
        await this.sleep(delay);
        return this.searchWithRetry(params, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Validate search parameters
   */
  protected validateSearchParams(params: FlightSearchParams): void {
    if (!params.origin) {
      throw new ProviderValidationError('Origin airport is required', 'origin');
    }
    if (!params.destination) {
      throw new ProviderValidationError(
        'Destination airport is required',
        'destination',
      );
    }
    if (!params.departDate) {
      throw new ProviderValidationError(
        'Departure date is required',
        'departDate',
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(params.departDate)) {
      throw new ProviderValidationError(
        'Departure date must be in YYYY-MM-DD format',
        'departDate',
      );
    }

    if (
      params.returnDate &&
      !dateRegex.test(params.returnDate)
    ) {
      throw new ProviderValidationError(
        'Return date must be in YYYY-MM-DD format',
        'returnDate',
      );
    }

    if (!params.passengers || params.passengers.adults < 1) {
      throw new ProviderValidationError(
        'At least one adult passenger is required',
        'passengers',
      );
    }
  }

  /**
   * Validate provider configuration
   */
  protected validateConfig(): void {
    if (!this.config.apiKey && this.config.type !== 'cash') {
      throw new ProviderAuthenticationError(
        `API key required for ${this.config.name} provider`,
      );
    }
  }

  /**
   * Calculate minimum time between requests based on rate limit
   */
  private calculateMinTime(): number {
    if (!this.config.rateLimit) return 0;
    const requestsPerMinute = this.config.rateLimit.requestsPerMinute;
    return Math.ceil(60000 / requestsPerMinute);
  }

  /**
   * Handle errors and convert to standardized format
   */
  protected handleError(error: any): ProviderResponse<Flight[]> {
    let providerError = error;

    if (error instanceof ProviderError) {
      providerError = error;
    } else if (error.message?.includes('rate limit')) {
      providerError = new ProviderRateLimitError(error.message, 60);
    } else if (error.status === 401 || error.message?.includes('Unauthorized')) {
      providerError = new ProviderAuthenticationError();
    } else if (error.status === 400 || error.message?.includes('validation')) {
      providerError = new ProviderValidationError(error.message);
    } else {
      providerError = new ProviderError(
        'UNKNOWN_ERROR',
        error.message || 'Unknown error occurred',
        error.status,
        true,
      );
    }

    return {
      success: false,
      data: [],
      error: {
        code: providerError.code,
        message: providerError.message,
        statusCode: providerError.statusCode,
        retryable: providerError.retryable,
      },
      metadata: {
        timestamp: Date.now(),
        duration: 0,
      },
    };
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ProviderHealthCheck> {
    const startTime = Date.now();
    try {
      // Try a minimal search to verify connectivity
      await this.executeHealthCheck();
      const responseTime = Date.now() - startTime;

      this.lastHealthCheck = {
        status: 'healthy',
        lastChecked: new Date(),
        responseTime,
      };

      return this.lastHealthCheck;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.lastHealthCheck = {
        status: responseTime > 10000 ? 'degraded' : 'down',
        lastChecked: new Date(),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      return this.lastHealthCheck;
    }
  }

  /**
   * Implement health check logic - override in subclass
   */
  protected abstract executeHealthCheck(): Promise<void>;

  /**
   * Implement actual search logic - override in subclass
   */
  protected abstract executeSearch(params: FlightSearchParams): Promise<Flight[]>;

  /**
   * Helper to sleep for a given duration
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get provider status
   */
  getStatus(): ProviderHealthCheck | null {
    return this.lastHealthCheck;
  }

  /**
   * Reset rate limiter
   */
  resetRateLimiter(): void {
    this.limiter.stop({ dropWaitingJobs: false });
    this.limiter = new Bottleneck({
      maxConcurrent: 5,
      minTime: this.calculateMinTime(),
    });
  }
}
