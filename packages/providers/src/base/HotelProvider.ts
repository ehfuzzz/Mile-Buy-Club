/**
 * Abstract Hotel Provider Base Class
 */
import Bottleneck from 'bottleneck';
import {
  ProviderConfig,
  ProviderResponse,
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
    this.config = { timeout: 30000, maxRetries: 3, retryDelayMs: 1000, ...config };
    this.limiter = new Bottleneck({
      maxConcurrent: 5,
      minTime: Math.ceil(60000 / (config.rateLimit?.requestsPerMinute || 60)),
      reservoir: config.rateLimit?.requestsPerMinute || 60,
      reservoirRefreshAmount: config.rateLimit?.requestsPerMinute || 60,
      reservoirRefreshInterval: 60 * 1000,
    });
  }

  async search(params: HotelSearchParams): Promise<ProviderResponse<Hotel[]>> {
    try {
      this.validateSearchParams(params);
      const result = await this.limiter.schedule(() => this.executeSearch(params));
      return { success: true, data: result, metadata: { timestamp: Date.now(), duration: 0 } };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { code: 'ERROR', message: error.message, retryable: false },
        metadata: { timestamp: Date.now(), duration: 0 },
      };
    }
  }

  protected validateSearchParams(params: HotelSearchParams): void {
    if (!params.destination) throw new ProviderValidationError('Destination required', 'destination');
    if (!params.checkIn) throw new ProviderValidationError('Check-in required', 'checkIn');
    if (!params.checkOut) throw new ProviderValidationError('Check-out required', 'checkOut');
  }

  async healthCheck(): Promise<ProviderHealthCheck> {
    const start = Date.now();
    try {
      await this.executeHealthCheck();
      return {
        status: 'healthy',
        lastChecked: new Date(),
        responseTime: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown',
      };
    }
  }

  protected abstract executeHealthCheck(): Promise<void>;
  protected abstract executeSearch(params: HotelSearchParams): Promise<Hotel[]>;
}
