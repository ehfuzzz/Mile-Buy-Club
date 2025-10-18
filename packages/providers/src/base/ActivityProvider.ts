/**
 * Abstract Activity Provider Base Class
 */
import Bottleneck from 'bottleneck';
import {
  ProviderConfig,
  ProviderResponse,
  ProviderValidationError,
  ActivitySearchParams,
  Activity,
  ProviderHealthCheck,
} from './types';

export abstract class ActivityProvider {
  protected config: ProviderConfig;
  protected limiter: Bottleneck;

  constructor(config: ProviderConfig) {
    this.config = { timeout: 30000, maxRetries: 3, retryDelayMs: 1000, ...config };
    this.limiter = new Bottleneck({
      maxConcurrent: 5,
      minTime: Math.ceil(60000 / (config.rateLimit?.requestsPerMinute || 60)),
    });
  }

  async search(params: ActivitySearchParams): Promise<ProviderResponse<Activity[]>> {
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

  protected validateSearchParams(params: ActivitySearchParams): void {
    if (!params.location) throw new ProviderValidationError('Location required', 'location');
  }

  async healthCheck(): Promise<ProviderHealthCheck> {
    const start = Date.now();
    try {
      await this.executeHealthCheck();
      return { status: 'healthy', lastChecked: new Date(), responseTime: Date.now() - start };
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
  protected abstract executeSearch(params: ActivitySearchParams): Promise<Activity[]>;
}
