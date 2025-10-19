import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface SeatsAeroPartnerSegment {
  marketingCarrier?: string;
  operatingCarrier?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departure?: string;
  arrival?: string;
  aircraft?: string;
  cabin?: string;
  fareClass?: string;
}

export interface SeatsAeroPartnerDeal {
  id?: string;
  origin?: string;
  destination?: string;
  departure?: string;
  arrival?: string;
  airline?: string;
  carrier?: string;
  flightNumber?: string;
  cabin?: string;
  program?: string;
  loyaltyProgram?: string;
  miles?: number;
  points?: number;
  seats?: number;
  seatsAvailable?: number;
  taxes?: number;
  fees?: number;
  totalTaxes?: number;
  totalFees?: number;
  currency?: string;
  taxesCurrency?: string;
  bookingUrl?: string;
  availability?: number;
  score?: number;
  cpp?: number;
  expiresAt?: string;
  updatedAt?: string;
  createdAt?: string;
  watcherId?: string;
  watcherName?: string;
  segments?: SeatsAeroPartnerSegment[];
}

interface SeatsAeroPartnerSearchResponse {
  data?: SeatsAeroPartnerDeal[];
  availability?: SeatsAeroPartnerDeal[];
  results?: SeatsAeroPartnerDeal[];
  meta?: {
    total?: number;
    [key: string]: unknown;
  };
}

interface SeatsAeroPartnerSearchOptions {
  take?: number;
  skip?: number;
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  cabin?: string;
  program?: string;
}

@Injectable()
export class SeatsAeroPartnerService {
  private readonly logger = new Logger(SeatsAeroPartnerService.name);
  private readonly http: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('SEATS_AERO_PARTNER_API_KEY') ||
      this.configService.get<string>('SEATS_AERO_API_KEY') ||
      'pro_34GoHwfqK5fP3esJgqAhxv4cOmj';

    if (!apiKey) {
      throw new Error('SeatsAero API key is required to fetch live deals');
    }

    const baseUrl =
      this.configService.get<string>('SEATS_AERO_PARTNER_BASE_URL') ||
      this.configService.get<string>('SEATS_AERO_BASE_URL') ||
      'https://seats.aero/partnerapi';

    const timeout = Number(this.configService.get<string>('SEATS_AERO_TIMEOUT_MS'));

    this.http = axios.create({
      baseURL: baseUrl.replace(/\/$/, ''),
      timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : 20000,
      headers: {
        'Partner-Authorization': apiKey,
        Accept: 'application/json',
      },
    });
  }

  async search(options: SeatsAeroPartnerSearchOptions = {}): Promise<{
    deals: SeatsAeroPartnerDeal[];
    total: number;
  }> {
    const params: Record<string, string | number | undefined> = {
      take: options.take && options.take > 0 ? Math.min(options.take, 200) : 50,
      skip: options.skip,
      origin: options.origin,
      destination: options.destination,
      departureDate: options.departureDate,
      returnDate: options.returnDate,
      cabin: options.cabin,
      program: options.program,
    };

    for (const key of Object.keys(params)) {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key];
      }
    }

    try {
      const response = await this.http.get<SeatsAeroPartnerSearchResponse>('/search', {
        params,
      });

      const payload = response.data ?? {};
      const deals = this.extractDeals(payload);
      const total =
        typeof payload.meta?.total === 'number' && payload.meta.total >= 0
          ? payload.meta.total
          : deals.length;

      return { deals, total };
    } catch (error) {
      this.logger.error('Failed to fetch SeatsAero live deals', error as Error);
      throw error;
    }
  }

  private extractDeals(payload: SeatsAeroPartnerSearchResponse): SeatsAeroPartnerDeal[] {
    if (Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    if (Array.isArray(payload.availability)) {
      return payload.availability;
    }

    return [];
  }
}
