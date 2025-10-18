/**
 * Scheduler Service
 * Manages cron jobs, calculates optimal run times, load balances
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QUEUE_NAMES } from './queue.module';

interface WatcherSchedule {
  watcherId: string;
  userId: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  preferredTime?: string; // HH:mm format
  lastRun?: Date;
}

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private watcherSchedules: WatcherSchedule[] = [];

  constructor(
    @InjectQueue(QUEUE_NAMES.WATCHER) private watcherQueue: Queue,
    @InjectQueue(QUEUE_NAMES.DEAL_CLEANUP) private cleanupQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ALERT_DIGEST) private digestQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('Scheduler service initialized');
    this.loadWatcherSchedules();
  }

  /**
   * Run watcher checks every 5 minutes
   * Processes watchers based on their frequency settings
   */
  @Cron('*/5 * * * *')
  async scheduleWatcherRuns() {
    this.logger.log('Running scheduled watcher check');
    
    const dueWatchers = this.getDueWatchers();
    const loadBalanced = this.loadBalanceWatchers(dueWatchers);

    for (const watcher of loadBalanced) {
      await this.scheduleWatcherJob(watcher);
    }

    this.logger.log(`Scheduled ${loadBalanced.length} watcher jobs`);
  }

  /**
   * Cleanup expired deals daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduleDealCleanup() {
    this.logger.log('Scheduling deal cleanup');
    
    await this.cleanupQueue.add({
      maxAgeHours: 24,
      batchSize: 100,
    });
  }

  /**
   * Send daily digests at 8 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async scheduleDailyDigests() {
    this.logger.log('Scheduling daily digests');
    
    const users = await this.getUsersForDailyDigest();
    
    for (const userId of users) {
      await this.digestQueue.add({
        userId,
        digestType: 'daily',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });
    }
  }

  /**
   * Send weekly digests on Monday at 8 AM
   */
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_8AM)
  async scheduleWeeklyDigests() {
    // Only run on Mondays
    if (new Date().getDay() !== 1) return;

    this.logger.log('Scheduling weekly digests');
    
    const users = await this.getUsersForWeeklyDigest();
    
    for (const userId of users) {
      await this.digestQueue.add({
        userId,
        digestType: 'weekly',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });
    }
  }

  /**
   * Manual trigger for a specific watcher
   */
  async triggerWatcher(watcherId: string, priority: number = 0): Promise<void> {
    const watcher = this.watcherSchedules.find(w => w.watcherId === watcherId);
    if (!watcher) {
      throw new Error(`Watcher ${watcherId} not found`);
    }

    await this.scheduleWatcherJob(watcher, priority);
    this.logger.log(`Manually triggered watcher ${watcherId}`);
  }

  /**
   * Add or update a watcher schedule
   */
  async registerWatcher(schedule: WatcherSchedule): Promise<void> {
    const existing = this.watcherSchedules.findIndex(w => w.watcherId === schedule.watcherId);
    
    if (existing >= 0) {
      this.watcherSchedules[existing] = schedule;
    } else {
      this.watcherSchedules.push(schedule);
    }

    this.logger.log(`Registered watcher ${schedule.watcherId} with ${schedule.frequency} frequency`);
  }

  /**
   * Remove a watcher from scheduling
   */
  async unregisterWatcher(watcherId: string): Promise<void> {
    this.watcherSchedules = this.watcherSchedules.filter(w => w.watcherId !== watcherId);
    this.logger.log(`Unregistered watcher ${watcherId}`);
  }

  private async scheduleWatcherJob(watcher: WatcherSchedule, priority: number = 0): Promise<void> {
    await this.watcherQueue.add({
      watcherId: watcher.watcherId,
      userId: watcher.userId,
      watcherType: 'flight', // TODO: Get from watcher config
      searchParams: {}, // TODO: Get from watcher config
      priority,
    }, {
      priority,
      removeOnComplete: true,
    });

    watcher.lastRun = new Date();
  }

  private getDueWatchers(): WatcherSchedule[] {
    const now = Date.now();
    
    return this.watcherSchedules.filter(watcher => {
      if (!watcher.lastRun) return true;

      const timeSinceLastRun = now - watcher.lastRun.getTime();
      const frequencyMs = this.getFrequencyMs(watcher.frequency);

      return timeSinceLastRun >= frequencyMs;
    });
  }

  private getFrequencyMs(frequency: string): number {
    switch (frequency) {
      case 'hourly': return 60 * 60 * 1000;
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private loadBalanceWatchers(watchers: WatcherSchedule[]): WatcherSchedule[] {
    // Spread watchers across time slots to avoid API rate limits
    // Limit to 20 watchers per batch
    const maxPerBatch = 20;
    
    if (watchers.length <= maxPerBatch) {
      return watchers;
    }

    // Prioritize watchers that haven't run in the longest time
    const sorted = watchers.sort((a, b) => {
      const aTime = a.lastRun?.getTime() || 0;
      const bTime = b.lastRun?.getTime() || 0;
      return aTime - bTime;
    });

    return sorted.slice(0, maxPerBatch);
  }

  private async loadWatcherSchedules(): Promise<void> {
    // TODO: Load from database
    // Example:
    // const watchers = await this.prisma.watcher.findMany({
    //   where: { active: true }
    // });
    
    this.logger.log('Loading watcher schedules from database');
  }

  private async getUsersForDailyDigest(): Promise<string[]> {
    // TODO: Query users with daily digest enabled
    return [];
  }

  private async getUsersForWeeklyDigest(): Promise<string[]> {
    // TODO: Query users with weekly digest enabled
    return [];
  }
}
