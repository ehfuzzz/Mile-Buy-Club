import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { DealsModule } from './deals/deals.module';
import { DataCollectionModule } from './data-collection/data-collection.module';
import { FlightSearchModule } from './flight-search/flight-search.module';
import { SeedModule } from './seed/seed.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { PlannerModule } from './planner/planner.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ProvidersModule,
    HealthModule,
    UsersModule,
    DealsModule,
    DataCollectionModule,
    FlightSearchModule,
    SeedModule,
    OnboardingModule,
    PlannerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
