/**
 * BullMQ Queue Module
 * Sets up Redis-based job queues for background processing
 */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WatcherProcessor } from './watcher.processor';
import { DealCleanupProcessor } from './deal-cleanup.processor';
import { AlertDigestProcessor } from './alert-digest.processor';
import { SchedulerService } from './scheduler.service';

export const QUEUE_NAMES = {
  WATCHER: 'watcher-queue',
  DEAL_CLEANUP: 'deal-cleanup-queue',
  ALERT_DIGEST: 'alert-digest-queue',
} as const;

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            age: 3600, // Keep completed jobs for 1 hour
            count: 100,
          },
          removeOnFail: {
            age: 86400, // Keep failed jobs for 24 hours
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.WATCHER },
      { name: QUEUE_NAMES.DEAL_CLEANUP },
      { name: QUEUE_NAMES.ALERT_DIGEST }
    ),
  ],
  providers: [
    WatcherProcessor,
    DealCleanupProcessor,
    AlertDigestProcessor,
    SchedulerService,
  ],
  exports: [BullModule, SchedulerService],
})
export class QueueModule {}
