/**
 * Abstract Hotel Provider Base Class
 * All hotel providers must extend this class and implement required methods
 */

import Bottleneck from 'bottleneck';
import {
  ProviderConfig,
  ProviderResponse,
  ProviderError,
  ProviderRateLimitError,
  ProviderAuthenticationError,
  ProviderValidationError,
  HotelSearchParams,
  Hotel,
  ProviderHealthCheck,
} from './types';

export abstract class HotelProvider {
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

    this.limiter = new Bottleneck({
      maxConcurrent: 5,
      minTime: this.calculateMinTime(),
      reservoir: this.config.rateLimit?.requestsPerMinute || 60,
      reservoirRefreshAmount: this.config.rateLimit?.requestsPerMinute || 60,
      reservoirRefreshInterval: 60 * 1000,
    });

    this.validateConfig();
  }

  async search(
    params: HotelSearchParams,
  ): Promise<ProviderResponse<Hotel[]>> {
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

  private async searchWithRetry(
    params: HotelSearchParams,
    retryCount: number,
  ): Promise<Hotel[]> {
    try {
      return await this.executeSearch(params);
    } catch (error) {
      if (retryCount < (this.config.maxRetries || 3)) {
        const delay = (this.config.retryDelayMs || 1000) * Math.pow(2, retryCount);
        await this.sleep(delay);
        return this.searchWithRetry(params, retryCount + 1);
      }
      throw error;
    }
  }

  protected validateSearchParams(params: HotelSearchParams): void {
    if (!params.destination) {
      throw new ProviderValidationError(
        'Destination is required',
        'destination',
      );
    }
    if (!params.checkIn) {
      throw new ProviderValidationError('Check-in date is required', 'checkIn');
    }
    if (!params.checkOut) {
      throw new ProviderValidationError('Check-out date is required', 'checkOut');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(params.checkIn)) {
      throw new ProviderValidationError(
        'Check-in date must be in YYYY-MM-DD format',
        'checkIn',
      );
    }
    if (!dateRegex.test(params.checkOut)) {
      throw new ProviderValidationError(
        'Check-out date must be in YYYY-MM-DD format',
        'checkOut',
      );
    }

    if (params.guests < 1) {
      throw new ProviderValidationError(
        'At least one guest is required',
        'guests',
      );
    }

    if (params.rooms < 1) {
      throw new ProviderValidationError(
        'At least one room is required',
        'rooms',
      );
    }
  }

  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new ProviderAuthenticationError(
        `API key required for ${this.config.name} provider`,
      );
    }
  }

  private calculateMinTime(): number {
    if (!this.config.rateLimit) return 0;
    const requestsPerMinute = this.config.rateLimit.requestsPerMinute;
    return Math.ceil(60000 / requestsPerMinute);
  }

  protected handleError(error: any): ProviderResponse<Hotel[]> {
    let providerError = error;

    if (error instanceof ProviderError) {
      providerError = error;
    } else if (error.message?.includes('rate limit')) {
      providerError = new ProviderRateLimitError(error.message, 60);
    } else if (error.status === 401) {
      providerError = new ProviderAuthenticationError();
    } else if (error.status === 400) {
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

  async healthCheck(): Promise<ProviderHealthCheck> {
    const startTime = Date.now();
    try {
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

  protected abstract executeHealthCheck(): Promise<void>;
  protected abstract executeSearch(params: HotelSearchParams): Promise<Hotel[]>;

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStatus(): ProviderHealthCheck | null {
    return this.lastHealthCheck;
  }

  resetRateLimiter(): void {
    this.limiter.stop({ dropWaitingJobs: false });
    this.limiter = new Bottleneck({
      maxConcurrent: 5,
      minTime: this.calculateMinTime(),
    });
  }
}
