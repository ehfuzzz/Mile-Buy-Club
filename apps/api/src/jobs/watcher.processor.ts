/**
 * Watcher Processor
 * Processes watcher runs: batch searches, deduplicate, cache, store deals, send alerts
 */
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { QUEUE_NAMES } from './queue.module';

interface WatcherJobData {
  watcherId: string;
  userId: string;
  watcherType: 'flight' | 'hotel' | 'activity';
  searchParams: any;
  priority: number;
}

interface ProcessedDeal {
  watcherId: string;
  type: string;
  data: any;
  price: number;
  score: number;
}

@Injectable()
@Processor(QUEUE_NAMES.WATCHER)
export class WatcherProcessor {
  private readonly logger = new Logger(WatcherProcessor.name);
  private searchCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  @Process({ concurrency: 5 })
  async processWatcher(job: Job<WatcherJobData>): Promise<ProcessedDeal[]> {
    const { watcherId, userId, watcherType, searchParams, priority } = job.data;
    
    this.logger.log(`Processing watcher ${watcherId} for user ${userId}`);

    try {
      // 1. Check cache first
      const cacheKey = this.generateCacheKey(watcherType, searchParams);
      const cached = this.getCachedResult(cacheKey);
      
      if (cached) {
        this.logger.log(`Cache hit for ${cacheKey}`);
        return this.processResults(watcherId, cached, searchParams);
      }

      // 2. Perform search (deduplicated via cache)
      const results = await this.performSearch(watcherType, searchParams);
      
      // 3. Cache the results
      this.setCachedResult(cacheKey, results);

      // 4. Process and rank deals
      const deals = this.processResults(watcherId, results, searchParams);

      // 5. Store new deals to database
      await this.storeDeals(deals);

      // 6. Check for alert-worthy deals
      await this.checkAndSendAlerts(userId, watcherId, deals);

      this.logger.log(`Completed watcher ${watcherId}: ${deals.length} deals found`);
      
      return deals;
    } catch (error) {
      this.logger.error(`Error processing watcher ${watcherId}:`, error);
      throw error;
    }
  }

  private generateCacheKey(type: string, params: any): string {
    const normalized = JSON.stringify(params, Object.keys(params).sort());
    return `${type}:${normalized}`;
  }

  private getCachedResult(key: string): any | null {
    const cached = this.searchCache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.searchCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCachedResult(key: string, data: any): void {
    this.searchCache.set(key, { data, timestamp: Date.now() });
    
    // Cleanup old cache entries
    if (this.searchCache.size > 1000) {
      const oldest = Array.from(this.searchCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 200);
      oldest.forEach(([key]) => this.searchCache.delete(key));
    }
  }

  private async performSearch(type: string, params: any): Promise<any[]> {
    // TODO: Integrate with provider registry
    // This would call: providerRegistry.searchFlights(params)
    this.logger.log(`Performing ${type} search with params:`, params);
    
    // Mock implementation
    return [
      { id: '1', price: 500, type },
      { id: '2', price: 450, type },
    ];
  }

  private processResults(watcherId: string, results: any[], searchParams: any): ProcessedDeal[] {
    return results.map(result => ({
      watcherId,
      type: result.type,
      data: result,
      price: result.price,
      score: this.calculateDealScore(result, searchParams),
    }));
  }

  private calculateDealScore(result: any, searchParams: any): number {
    // Simple scoring (would integrate with Deal Ranking Algorithm - SONNET TASK 5)
    const baseScore = 100;
    const priceScore = Math.max(0, 100 - (result.price / 10));
    return (baseScore + priceScore) / 2;
  }

  private async storeDeals(deals: ProcessedDeal[]): Promise<void> {
    // TODO: Store to database via Prisma
    this.logger.log(`Storing ${deals.length} deals to database`);
  }

  private async checkAndSendAlerts(userId: string, watcherId: string, deals: ProcessedDeal[]): Promise<void> {
    // Alert for deals with score > 80
    const alertableDeals = deals.filter(deal => deal.score > 80);
    
    if (alertableDeals.length > 0) {
      this.logger.log(`Found ${alertableDeals.length} alert-worthy deals for user ${userId}`);
      // TODO: Send push notifications or emails
    }
  }
}
