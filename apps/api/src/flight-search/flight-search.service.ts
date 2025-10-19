import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { FlightSearchRequest } from './flight-search.controller';

@Injectable()
export class FlightSearchService {
  private readonly logger = new Logger(FlightSearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async searchFlights(searchRequest: FlightSearchRequest) {
    this.logger.log('Starting flight search', { searchRequest });

    // Temporarily disabled due to providers package issues
    return {
      success: false,
      message: 'Flight search temporarily disabled due to providers package issues.',
      flights: [],
    };
  }

  async populateSampleData() {
    this.logger.log('Flight search temporarily disabled due to providers package issues');
    return { success: false, message: 'Flight search temporarily disabled.' };
  }
}
