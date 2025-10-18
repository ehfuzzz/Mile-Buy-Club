/**
 * Abstract Flight Provider Base Class
 */
import Bottleneck from 'bottleneck';
import {
  ProviderConfig,
  ProviderResponse,
  ProviderError,
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
    this.config = { timeout: 30000, maxRetries: 3, retryDelayMs: 1000, ...config };
    this.limiter = new Bottleneck({
      maxConcurrent: 5,
      minTime: this.calculateMinTime(),
      reservoir: this.config.rateLimit?.requestsPerMinute || 60,
      reservoirRefreshAmount: this.config.rateLimit?.requestsPerMinute || 60,
      reservoirRefreshInterval: 60 * 1000,
    });
  }

  async search(params: FlightSearchParams): Promise<ProviderResponse<Flight[]>> {
    try {
      this.validateSearchParams(params);
      const result = await this.limiter.schedule(() => this.searchWithRetry(params, 0));
      return { success: true, data: result, metadata: { timestamp: Date.now(), duration: 0 } };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async searchWithRetry(params: FlightSearchParams, retryCount: number): Promise<Flight[]> {
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

  protected validateSearchParams(params: FlightSearchParams): void {
    if (!params.origin) throw new ProviderValidationError('Origin required', 'origin');
    if (!params.destination) throw new ProviderValidationError('Destination required', 'destination');
    if (!params.departDate) throw new ProviderValidationError('Depart date required', 'departDate');
  }

  private calculateMinTime(): number {
    if (!this.config.rateLimit) return 0;
    return Math.ceil(60000 / this.config.rateLimit.requestsPerMinute);
  }

  protected handleError(error: any): ProviderResponse<Flight[]> {
    return {
      success: false,
      data: [],
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        statusCode: error.statusCode,
        retryable: error.retryable || false,
      },
      metadata: { timestamp: Date.now(), duration: 0 },
    };
  }

  async healthCheck(): Promise<ProviderHealthCheck> {
    const startTime = Date.now();
    try {
      await this.executeHealthCheck();
      this.lastHealthCheck = {
        status: 'healthy',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
      return this.lastHealthCheck;
    } catch (error) {
      this.lastHealthCheck = {
        status: 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      return this.lastHealthCheck;
    }
  }

  protected abstract executeHealthCheck(): Promise<void>;
  protected abstract executeSearch(params: FlightSearchParams): Promise<Flight[]>;
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
