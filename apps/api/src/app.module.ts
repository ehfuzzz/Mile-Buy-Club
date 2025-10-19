import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { QueueModule } from './jobs/queue.module';
import { ProvidersModule } from './providers/providers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { DealsModule } from './deals/deals.module';
import { WatchersModule } from './watchers/watchers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ProvidersModule,
    NotificationsModule,
    QueueModule,
    AiModule,
    HealthModule,
    UsersModule,
    DealsModule,
    WatchersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
