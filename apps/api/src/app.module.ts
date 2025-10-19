import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { DealsModule } from './deals/deals.module';
import { FlightSearchModule } from './flight-search/flight-search.module';
import { SeedModule } from './seed/seed.module';

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
    FlightSearchModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
