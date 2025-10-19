import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// Temporarily commented out to test backend startup
// import {
//   ProviderName,
//   ProviderType,
//   providerRegistry,
//   SeatsAeroFlightProvider,
//   SeatsAeroProviderConfig,
//   PointMeFlightProvider,
//   PointMeProviderConfig,
//   KiwiFlightProvider,
//   KiwiProviderConfig,
// } from '@mile/providers';

@Injectable()
export class ProviderRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ProviderRegistryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    this.registerSeatsAero();
    this.registerPointMe();
    this.registerKiwi();

    if (providerRegistry.listProviders(ProviderType.FLIGHT).length > 0) {
      providerRegistry.startHealthCheckLoop(5 * 60 * 1000);
      this.logger.log('Provider health check loop started');
    }
  }

  private registerSeatsAero(): void {
    const apiKey = this.configService.get<string>('SEATS_AERO_API_KEY');
    if (!apiKey) {
      this.logger.warn('SEATS_AERO_API_KEY missing - SeatsAero provider will not be registered');
      return;
    }

    const config: SeatsAeroProviderConfig = {
      name: ProviderName.SEATS_AERO,
      type: ProviderType.FLIGHT,
      apiKey,
      baseUrl: this.configService.get<string>('SEATS_AERO_BASE_URL') ?? 'https://api.seats.aero',
      timeout: this.parseNumber(this.configService.get<string>('SEATS_AERO_TIMEOUT_MS'), 20000),
      program: this.configService.get<string>('SEATS_AERO_PROGRAM') ?? undefined,
      rateLimit: {
        requestsPerMinute: this.parseNumber(this.configService.get<string>('SEATS_AERO_RPM'), 30),
        requestsPerHour: this.parseNumber(this.configService.get<string>('SEATS_AERO_RPH'), 500),
      },
    };

    const provider = new SeatsAeroFlightProvider(config);
    providerRegistry.registerFlightProvider(ProviderName.SEATS_AERO, provider);
    this.logger.log('SeatsAero flight provider registered');
  }

  private registerPointMe(): void {
    const apiKey = this.configService.get<string>('POINT_ME_API_KEY');
    if (!apiKey) {
      this.logger.warn('POINT_ME_API_KEY missing - Point.Me provider will not be registered');
      return;
    }

    const programs = this.parseCsv(this.configService.get<string>('POINT_ME_PROGRAMS'));

    const config: PointMeProviderConfig = {
      name: ProviderName.POINT_ME,
      type: ProviderType.FLIGHT,
      apiKey,
      baseUrl: this.configService.get<string>('POINT_ME_BASE_URL') ?? 'https://api.point.me',
      timeout: this.parseNumber(this.configService.get<string>('POINT_ME_TIMEOUT_MS'), 20000),
      programs: programs.length > 0 ? programs : undefined,
      rateLimit: {
        requestsPerMinute: this.parseNumber(this.configService.get<string>('POINT_ME_RPM'), 20),
        requestsPerHour: this.parseNumber(this.configService.get<string>('POINT_ME_RPH'), 400),
      },
    };

    const provider = new PointMeFlightProvider(config);
    providerRegistry.registerFlightProvider(ProviderName.POINT_ME, provider);
    this.logger.log('Point.Me flight provider registered');
  }

  private registerKiwi(): void {
    const apiKey = this.configService.get<string>('KIWI_API_KEY');
    if (!apiKey) {
      this.logger.warn('KIWI_API_KEY missing - Kiwi provider will not be registered');
      return;
    }

    const config: KiwiProviderConfig = {
      name: ProviderName.KIWI,
      type: ProviderType.FLIGHT,
      apiKey,
      baseUrl: this.configService.get<string>('KIWI_BASE_URL') ?? 'https://tequila-api.kiwi.com',
      timeout: this.parseNumber(this.configService.get<string>('KIWI_TIMEOUT_MS'), 25000),
      currency: this.configService.get<string>('KIWI_CURRENCY') ?? 'USD',
      market: this.configService.get<string>('KIWI_MARKET') ?? 'us',
      maxStopovers: this.parseOptionalNumber(this.configService.get<string>('KIWI_MAX_STOPOVERS')),
      limit: this.parseNumber(this.configService.get<string>('KIWI_RESULT_LIMIT'), 30),
      rateLimit: {
        requestsPerMinute: this.parseNumber(this.configService.get<string>('KIWI_RPM'), 40),
        requestsPerHour: this.parseNumber(this.configService.get<string>('KIWI_RPH'), 800),
      },
    };

    const provider = new KiwiFlightProvider(config);
    providerRegistry.registerFlightProvider(ProviderName.KIWI, provider);
    this.logger.log('Kiwi flight provider registered');
  }

  private parseNumber(value: string | undefined | null, fallback: number): number {
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private parseOptionalNumber(value: string | undefined | null): number | undefined {
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parseCsv(value: string | undefined | null): string[] {
    if (!value) {
      return [];
    }

    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
}
