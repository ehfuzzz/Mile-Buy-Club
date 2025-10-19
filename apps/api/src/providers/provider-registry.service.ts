import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderName, ProviderType, providerRegistry, SeatsAeroFlightProvider, SeatsAeroProviderConfig } from '@mile/providers';

@Injectable()
export class ProviderRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ProviderRegistryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    this.registerSeatsAero();
    if (providerRegistry.listProviders(ProviderType.FLIGHT).length > 0) {
      providerRegistry.startHealthCheckLoop(5 * 60 * 1000);
      this.logger.log('Provider health check loop started');
    }
  }

  private registerSeatsAero(): void {
    const apiKey =
      this.configService.get<string>('SEATS_AERO_API_KEY') ||
      this.configService.get<string>('SEATS_AERO_PARTNER_API_KEY') ||
      'pro_34GoHwfqK5fP3esJgqAhxv4cOmj';

    if (!apiKey) {
      this.logger.warn('SEATS_AERO_API_KEY missing - SeatsAero provider will not be registered');
      return;
    }

    const config: SeatsAeroProviderConfig = {
      name: ProviderName.SEATS_AERO,
      type: ProviderType.FLIGHT,
      apiKey,
      baseUrl:
        this.configService.get<string>('SEATS_AERO_BASE_URL') ??
        this.configService.get<string>('SEATS_AERO_PARTNER_BASE_URL') ??
        'https://seats.aero/partnerapi',
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

  private parseNumber(value: string | undefined | null, fallback: number): number {
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
