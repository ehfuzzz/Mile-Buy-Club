import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { SeatsAeroPartnerService } from '../deals/seats-aero-partner.service';

@Injectable()
export class SeatsAeroCollectorService {
  private readonly logger = new Logger(SeatsAeroCollectorService.name);
  private readonly airlines = [
    'united',
    'american',
    'delta',
    'aeroplan',
    'lufthansa',
    'singapore',
    'cathay',
    'emirates',
    'qatar',
    'british',
    'virgin-atlantic',
    'klm',
    'air-france',
    'alaska',
    'southwest',
  ];

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => SeatsAeroPartnerService))
    private readonly seatsAeroService: SeatsAeroPartnerService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async collectAllAirlinesData(): Promise<void> {
    this.logger.log('Starting scheduled SeatsAero data collection');

    for (const airline of this.airlines) {
      try {
        await this.collectAirlineData(airline);
        await this.delay(2000);
      } catch (error) {
        this.logger.error(`Failed to collect data for ${airline}`, error as Error);
      }
    }

    this.logger.log('Completed scheduled SeatsAero data collection');
  }

  async collectAirlineData(airline: string): Promise<void> {
    this.logger.debug(`Collecting SeatsAero data for ${airline}`);

    const { deals } = await this.seatsAeroService.search({
      programs: [airline],
      take: 100,
    });

    const persisted = await this.storeDealsInDatabase(deals, airline);

    this.logger.debug(`Stored ${persisted} SeatsAero deals for ${airline}`);
  }

  private async storeDealsInDatabase(deals: any[], airline: string): Promise<number> {
    let stored = 0;

    for (const deal of deals) {
      if (!deal?.id) {
        continue;
      }

      const miles = this.toInteger(deal.miles ?? deal.points);
      const cashPrice =
        this.toNumber(deal.cashPrice) ?? this.toNumber(deal.taxes) ?? null;

      try {
        await this.prisma.seatsAeroDeal.upsert({
          where: { externalId: deal.id },
          update: {
            airline: deal.airline ?? airline,
            program: deal.program ?? airline,
            origin: deal.origin ?? null,
            destination: deal.destination ?? null,
            departureDate: deal.departure ? new Date(deal.departure) : null,
            cabin: deal.cabin ?? null,
            miles,
            cashPrice,
            bookingUrl: deal.bookingUrl ?? null,
            rawData: deal,
            expiresAt: deal.expiresAt ? new Date(deal.expiresAt) : null,
          },
          create: {
            externalId: deal.id,
            airline: deal.airline ?? airline,
            program: deal.program ?? airline,
            origin: deal.origin ?? null,
            destination: deal.destination ?? null,
            departureDate: deal.departure ? new Date(deal.departure) : null,
            cabin: deal.cabin ?? null,
            miles,
            cashPrice,
            bookingUrl: deal.bookingUrl ?? null,
            rawData: deal,
            expiresAt: deal.expiresAt ? new Date(deal.expiresAt) : null,
          },
        });

        stored += 1;
      } catch (error) {
        this.logger.error(`Failed to store SeatsAero deal ${deal.id}`, error as Error);
      }
    }

    return stored;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private toInteger(value: unknown): number | null {
    const asNumber = this.toNumber(value);
    return asNumber !== null ? Math.round(asNumber) : null;
  }
}
