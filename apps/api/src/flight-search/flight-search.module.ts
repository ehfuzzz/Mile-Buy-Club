import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlightSearchController } from './flight-search.controller';
import { FlightSearchService } from './flight-search.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [FlightSearchController],
  providers: [FlightSearchService],
  exports: [FlightSearchService],
})
export class FlightSearchModule {}
