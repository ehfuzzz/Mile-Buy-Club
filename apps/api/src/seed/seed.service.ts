import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedSampleData() {
    this.logger.log('Starting to seed sample data');

    try {
      // Create a sample user if none exists
      let user = await this.prisma.user.findFirst();
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: 'demo@milebuyclub.com',
            name: 'Demo User',
          },
        });
        this.logger.log('Created demo user');
      }

      // Create a sample watcher
      let watcher = await this.prisma.watcher.findFirst();
      if (!watcher) {
        watcher = await this.prisma.watcher.create({
          data: {
            userId: user.id,
            name: 'NYC to Europe',
            type: 'flight',
            description: 'Search for business class flights from NYC to Europe',
            searchParams: {
              origin: 'NYC',
              destination: 'LHR',
              cabin: 'business',
              maxPrice: 2000,
              maxMiles: 100000,
            },
            isActive: true,
          },
        });
        this.logger.log('Created sample watcher');
      }

      // Create sample deals
      const sampleDeals = [
        {
          watcherId: watcher.id,
          userId: user.id,
          externalId: 'sample-flight-1',
          title: 'NYC to LHR Business Class',
          type: 'flight',
          description: 'British Airways business class flight from NYC to London',
          provider: 'SEATS_AERO',
          origin: 'NYC',
          destination: 'LHR',
          airline: 'BA',
          cabin: 'business',
          price: 250,
          currency: 'USD',
          availability: 2,
          score: 85,
          cpp: 2.4,
          value: 57000,
          status: 'active',
          departDate: new Date('2024-12-15'),
          returnDate: new Date('2024-12-22'),
          rawData: {
            id: 'sample-flight-1',
            provider: 'SEATS_AERO',
            origin: 'NYC',
            destination: 'LHR',
            departureTime: '2024-12-15T14:30:00Z',
            arrivalTime: '2024-12-15T22:45:00Z',
            milesRequired: 57000,
            price: 250,
            currency: 'USD',
            airline: 'BA',
            cabin: 'business',
            bookingUrl: 'https://example.com/booking/1',
            segments: [
              {
                marketingCarrier: 'BA',
                flightNumber: 'BA114',
                origin: 'NYC',
                destination: 'LHR',
                departureTime: '2024-12-15T14:30:00Z',
                arrivalTime: '2024-12-15T22:45:00Z',
                cabin: 'business',
              },
            ],
          },
          pricingOptions: [
            {
              type: 'award',
              miles: 57000,
              cashAmount: 250,
              cashCurrency: 'USD',
              provider: 'SEATS_AERO',
              bookingUrl: 'https://example.com/booking/1',
              description: 'Award availability via SeatsAero',
            },
          ],
        },
        {
          watcherId: watcher.id,
          userId: user.id,
          externalId: 'sample-flight-2',
          title: 'NYC to CDG Business Class',
          type: 'flight',
          description: 'Air France business class flight from NYC to Paris',
          provider: 'SEATS_AERO',
          origin: 'NYC',
          destination: 'CDG',
          airline: 'AF',
          cabin: 'business',
          price: 280,
          currency: 'USD',
          availability: 1,
          score: 78,
          cpp: 2.1,
          value: 63000,
          status: 'active',
          departDate: new Date('2024-12-20'),
          returnDate: new Date('2024-12-27'),
          rawData: {
            id: 'sample-flight-2',
            provider: 'SEATS_AERO',
            origin: 'NYC',
            destination: 'CDG',
            departureTime: '2024-12-20T16:00:00Z',
            arrivalTime: '2024-12-21T06:30:00Z',
            milesRequired: 63000,
            price: 280,
            currency: 'USD',
            airline: 'AF',
            cabin: 'business',
            bookingUrl: 'https://example.com/booking/2',
            segments: [
              {
                marketingCarrier: 'AF',
                flightNumber: 'AF7',
                origin: 'NYC',
                destination: 'CDG',
                departureTime: '2024-12-20T16:00:00Z',
                arrivalTime: '2024-12-21T06:30:00Z',
                cabin: 'business',
              },
            ],
          },
          pricingOptions: [
            {
              type: 'award',
              miles: 63000,
              cashAmount: 280,
              cashCurrency: 'USD',
              provider: 'SEATS_AERO',
              bookingUrl: 'https://example.com/booking/2',
              description: 'Award availability via SeatsAero',
            },
          ],
        },
        {
          watcherId: watcher.id,
          userId: user.id,
          externalId: 'sample-flight-3',
          title: 'NYC to FCO Business Class',
          type: 'flight',
          description: 'Alitalia business class flight from NYC to Rome',
          provider: 'SEATS_AERO',
          origin: 'NYC',
          destination: 'FCO',
          airline: 'AZ',
          cabin: 'business',
          price: 230,
          currency: 'USD',
          availability: 3,
          score: 92,
          cpp: 2.8,
          value: 52000,
          status: 'active',
          departDate: new Date('2024-12-18'),
          returnDate: new Date('2024-12-25'),
          rawData: {
            id: 'sample-flight-3',
            provider: 'SEATS_AERO',
            origin: 'NYC',
            destination: 'FCO',
            departureTime: '2024-12-18T18:00:00Z',
            arrivalTime: '2024-12-19T08:15:00Z',
            milesRequired: 52000,
            price: 230,
            currency: 'USD',
            airline: 'AZ',
            cabin: 'business',
            bookingUrl: 'https://example.com/booking/3',
            segments: [
              {
                marketingCarrier: 'AZ',
                flightNumber: 'AZ610',
                origin: 'NYC',
                destination: 'FCO',
                departureTime: '2024-12-18T18:00:00Z',
                arrivalTime: '2024-12-19T08:15:00Z',
                cabin: 'business',
              },
            ],
          },
          pricingOptions: [
            {
              type: 'award',
              miles: 52000,
              cashAmount: 230,
              cashCurrency: 'USD',
              provider: 'SEATS_AERO',
              bookingUrl: 'https://example.com/booking/3',
              description: 'Award availability via SeatsAero',
            },
          ],
        },
      ];

      for (const dealData of sampleDeals) {
        await this.prisma.deal.upsert({
          where: {
            watcherId_provider_externalId: {
              watcherId: dealData.watcherId,
              provider: dealData.provider,
              externalId: dealData.externalId,
            },
          },
          update: {
            price: dealData.price,
            currency: dealData.currency,
            availability: dealData.availability,
            score: dealData.score,
            cpp: dealData.cpp,
            value: dealData.value,
            status: dealData.status,
            rawData: dealData.rawData,
            pricingOptions: dealData.pricingOptions,
            updatedAt: new Date(),
          },
          create: dealData,
        });
      }

      this.logger.log(`Created ${sampleDeals.length} sample deals`);

      return {
        success: true,
        message: `Populated database with ${sampleDeals.length} sample deals`,
        deals: sampleDeals.length,
        user: user.id,
        watcher: watcher.id,
      };

    } catch (error) {
      this.logger.error('Failed to seed sample data:', error);
      return {
        success: false,
        message: 'Failed to seed sample data',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
