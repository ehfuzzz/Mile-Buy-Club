import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import { createLogger } from '@mile/shared/src/logger';

const logger = createLogger('Metrics');

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  
  // Counters
  private readonly watcherRunsCounter: Counter;
  private readonly dealsFoundCounter: Counter;
  private readonly apiCallsCounter: Counter;
  private readonly errorsCounter: Counter;
  
  // Gauges
  private readonly activeWatchersGauge: Gauge;
  private readonly activeUsersGauge: Gauge;
  
  // Histograms
  private readonly apiResponseTime: Histogram;

  constructor() {
    this.registry = new Registry();
    
    // Enable default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register: this.registry });
    
    // Initialize custom metrics
    this.watcherRunsCounter = new Counter({
      name: 'watcher_runs_total',
      help: 'Total number of watcher runs',
      labelNames: ['status'],
      registers: [this.registry],
    });
    
    this.dealsFoundCounter = new Counter({
      name: 'deals_found_total',
      help: 'Total number of deals found',
      labelNames: ['type', 'provider'],
      registers: [this.registry],
    });
    
    this.apiCallsCounter = new Counter({
      name: 'api_calls_total',
      help: 'Total number of API calls',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });
    
    this.errorsCounter = new Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'component'],
      registers: [this.registry],
    });
    
    this.activeWatchersGauge = new Gauge({
      name: 'active_watchers',
      help: 'Number of currently active watchers',
      registers: [this.registry],
    });
    
    this.activeUsersGauge = new Gauge({
      name: 'active_users',
      help: 'Number of active users',
      registers: [this.registry],
    });
    
    this.apiResponseTime = new Histogram({
      name: 'api_response_time_seconds',
      help: 'API response time in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
    
    logger.info('Metrics service initialized');
  }
  
  // Increment watcher runs
  incrementWatcherRuns(status: 'success' | 'failure') {
    this.watcherRunsCounter.inc({ status });
  }
  
  // Increment deals found
  incrementDealsFound(type: string, provider: string) {
    this.dealsFoundCounter.inc({ type, provider });
  }
  
  // Track API call
  trackApiCall(method: string, path: string, status: number) {
    this.apiCallsCounter.inc({ method, path, status });
  }
  
  // Track error
  trackError(type: string, component: string) {
    this.errorsCounter.inc({ type, component });
  }
  
  // Set active watchers count
  setActiveWatchers(count: number) {
    this.activeWatchersGauge.set(count);
  }
  
  // Set active users count
  setActiveUsers(count: number) {
    this.activeUsersGauge.set(count);
  }
  
  // Observe API response time
  observeResponseTime(method: string, path: string, durationSeconds: number) {
    this.apiResponseTime.observe({ method, path }, durationSeconds);
  }
  
  // Get metrics in Prometheus format
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
