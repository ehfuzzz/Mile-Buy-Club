import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { providerRegistry, ProviderType } from '@mile/providers';
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

    try {
      // Get available flight providers
      const providers = providerRegistry.listProviders(ProviderType.FLIGHT);
      this.logger.log(`Found ${providers.length} flight providers`);

      if (providers.length === 0) {
        return {
          success: false,
          message: 'No flight providers available. Please check your API keys.',
          flights: [],
        };
      }

      const allFlights = [];

      // Search with each provider
      for (const providerName of providers) {
        try {
          this.logger.log(`Searching with provider: ${providerName}`);
          
          const provider = providerRegistry.getFlightProvider(providerName);
          if (!provider) {
            this.logger.warn(`Provider ${providerName} not found`);
            continue;
          }

          // Ensure passengers object has required fields and cabin is valid
          const searchParams = {
            ...searchRequest,
            passengers: {
              adults: searchRequest.passengers?.adults || 1,
              children: searchRequest.passengers?.children || 0,
              infants: searchRequest.passengers?.infants || 0,
            },
            cabin: (['economy', 'premium_economy', 'business', 'first'].includes(searchRequest.cabin || '')) 
              ? searchRequest.cabin as 'economy' | 'premium_economy' | 'business' | 'first'
              : undefined,
          };

          const response = await provider.search(searchParams);
          const flights = response.data || [];
          this.logger.log(`Found ${flights.length} flights from ${providerName}`);
          
          allFlights.push(...flights);

          // Store flights in database
          await this.storeFlights(flights, providerName);
          
        } catch (error) {
          this.logger.error(`Error searching with provider ${providerName}:`, error);
        }
      }

      return {
        success: true,
        message: `Found ${allFlights.length} flights from ${providers.length} providers`,
        flights: allFlights,
        providers: providers,
      };

    } catch (error) {
      this.logger.error('Flight search failed:', error);
      return {
        success: false,
        message: 'Flight search failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        flights: [],
      };
    }
  }

  async populateSampleData() {
    this.logger.log('Populating database with sample flight data');

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
          provider: 'KIWI',
          origin: 'NYC',
          destination: 'LHR',
          airline: 'BA',
          cabin: 'business',
          price: 1200,
          currency: 'USD',
          availability: 2,
          score: 85,
          cpp: 2.4,
          value: 1200,
          status: 'active',
          departDate: new Date('2024-12-15'),
          returnDate: new Date('2024-12-22'),
          rawData: {
            id: 'sample-flight-1',
            provider: 'KIWI',
            origin: 'NYC',
            destination: 'LHR',
            departureTime: '2024-12-15T14:30:00Z',
            arrivalTime: '2024-12-15T22:45:00Z',
            price: 1200,
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
              type: 'cash',
              cashAmount: 1200,
              cashCurrency: 'USD',
              provider: 'KIWI',
              bookingUrl: 'https://example.com/booking/1',
              description: 'Published cash fare via Kiwi',
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
          provider: 'KIWI',
          origin: 'NYC',
          destination: 'CDG',
          airline: 'AF',
          cabin: 'business',
          price: 1350,
          currency: 'USD',
          availability: 1,
          score: 78,
          cpp: 2.1,
          value: 1350,
          status: 'active',
          departDate: new Date('2024-12-20'),
          returnDate: new Date('2024-12-27'),
          rawData: {
            id: 'sample-flight-2',
            provider: 'KIWI',
            origin: 'NYC',
            destination: 'CDG',
            departureTime: '2024-12-20T16:00:00Z',
            arrivalTime: '2024-12-21T06:30:00Z',
            price: 1350,
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
              type: 'cash',
              cashAmount: 1350,
              cashCurrency: 'USD',
              provider: 'KIWI',
              bookingUrl: 'https://example.com/booking/2',
              description: 'Published cash fare via Kiwi',
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
      };

    } catch (error) {
      this.logger.error('Failed to populate sample data:', error);
      return {
        success: false,
        message: 'Failed to populate sample data',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async storeFlights(flights: any[], providerName: string) {
    try {
      // Get or create a default user and watcher for storing flights
      let user = await this.prisma.user.findFirst();
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: 'demo@milebuyclub.com',
            name: 'Demo User',
          },
        });
      }

      let watcher = await this.prisma.watcher.findFirst();
      if (!watcher) {
        watcher = await this.prisma.watcher.create({
          data: {
            userId: user.id,
            name: 'Flight Search Results',
            type: 'flight',
            description: 'Search results from flight providers',
            searchParams: {
              origin: flights[0]?.origin || 'NYC',
              destination: flights[0]?.destination || 'LHR',
              cabin: 'business',
              maxPrice: 5000,
              maxMiles: 200000,
            },
            isActive: true,
          },
        });
      }

      // Store each flight as a deal
      for (const flight of flights) {
        try {
          await this.prisma.deal.upsert({
            where: {
              watcherId_provider_externalId: {
                watcherId: watcher.id,
                provider: providerName,
                externalId: flight.id,
              },
            },
            update: {
              price: flight.price,
              currency: flight.currency,
              availability: flight.availability,
              status: 'active',
              rawData: flight,
              pricingOptions: flight.pricingOptions,
              updatedAt: new Date(),
            },
            create: {
              watcherId: watcher.id,
              userId: user.id,
              externalId: flight.id,
              title: `${flight.origin} to ${flight.destination} ${flight.cabin || 'economy'} class`,
              type: 'flight',
              description: `${flight.airline || 'Unknown airline'} flight from ${flight.origin} to ${flight.destination}`,
              provider: providerName,
              origin: flight.origin,
              destination: flight.destination,
              airline: flight.airline,
              cabin: flight.cabin,
              price: flight.price,
              currency: flight.currency,
              availability: flight.availability,
              score: Math.floor(Math.random() * 100), // Random score for demo
              status: 'active',
              departDate: new Date(flight.departureTime),
              returnDate: flight.returnDate ? new Date(flight.returnDate) : null,
              rawData: flight,
              pricingOptions: flight.pricingOptions,
            },
          });
        } catch (error) {
          this.logger.error(`Failed to store flight ${flight.id}:`, error);
        }
      }

      this.logger.log(`Stored ${flights.length} flights from ${providerName}`);
    } catch (error) {
      this.logger.error('Failed to store flights:', error);
    }
  }
}
