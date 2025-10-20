import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';

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
  programs?: string[];
}

const SEATS_AERO_PROGRAMS = [
  'american',
  'delta',
  'united',
  'aeroplan',
  'alaska',
  'velocity',
  'qantas',
  'flyingblue',
  'jetblue',
  'emirates',
  'etihad',
  'qatar',
  'singapore',
  'lufthansa',
  'turkish',
  'finnair',
  'ethiopian',
  'saudia',
  'eurobonus',
  'virginatlantic',
  'aeromexico',
  'connectmiles',
  'azul',
  'smiles',
];

@Injectable()
export class SeatsAeroPartnerService {
  private readonly logger = new Logger(SeatsAeroPartnerService.name);
  private readonly http: AxiosInstance;
  private readonly apiKey: string;
  private readonly rawBaseUrl: string | undefined;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly minuteRateLimit = 30;
  private readonly hourRateLimit = 500;
  private readonly minuteWindowMs = 60_000;
  private readonly hourWindowMs = 3_600_000;
  private readonly recentMinuteRequests: number[] = [];
  private readonly recentHourRequests: number[] = [];

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('SEATS_AERO_PARTNER_API_KEY') ||
      this.configService.get<string>('SEATS_AERO_API_KEY') ||
      'pro_34GoHwfqK5fP3esJgqAhxv4cOmj';

    if (!this.apiKey) {
      throw new Error('SeatsAero API key is required to fetch live deals');
    }

    this.rawBaseUrl =
      this.configService.get<string>('SEATS_AERO_PARTNER_BASE_URL') ||
      this.configService.get<string>('SEATS_AERO_BASE_URL') ||
      undefined;

    this.baseUrl = this.normalizeBaseUrl(this.rawBaseUrl);

    const timeout = this.configService.get<string>('SEATS_AERO_TIMEOUT_MS');
    this.timeoutMs = this.resolveTimeout(timeout);

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeoutMs,
      headers: {
        'Partner-Authorization': this.apiKey,
        Accept: 'application/json',
      },
    });

    this.logger.log(`SeatsAero partner API configured with base URL ${this.baseUrl}`);
  }

  async search(options: SeatsAeroPartnerSearchOptions = {}): Promise<{
    deals: SeatsAeroPartnerDeal[];
    total: number;
  }> {
    const endpoint = options.origin && options.destination ? '/search' : '/availability';
    const normalizedPrograms = this.resolvePrograms(options);
    const baseTake = options.take && options.take > 0 ? Math.min(options.take, 200) : 50;
    const perProgramTake = this.resolvePerProgramTake(baseTake, normalizedPrograms.length);

    const baseParams: Record<string, string | number> = {
      take: perProgramTake,
    };

    if (typeof options.skip === 'number' && Number.isFinite(options.skip)) {
      baseParams.skip = options.skip;
    }

    if (options.origin && options.destination) {
      baseParams.origin = options.origin;
      baseParams.destination = options.destination;

      if (options.departureDate) {
        baseParams.departureDate = options.departureDate;
      }

      if (options.returnDate) {
        baseParams.returnDate = options.returnDate;
      }

      if (options.cabin) {
        baseParams.cabin = options.cabin;
      }
    }

    const aggregatedDeals: SeatsAeroPartnerDeal[] = [];
    const failures: { program: string; error: unknown }[] = [];

    for (const program of normalizedPrograms) {
      try {
        const programDeals = await this.fetchDealsForProgram({
          endpoint,
          program,
          params: baseParams,
        });

        aggregatedDeals.push(...programDeals);
      } catch (error) {
        failures.push({ program, error });
        const normalizedError = this.normalizeAxiosError(error);
        this.logger.warn(
          `SeatsAero request failed for program ${program}: ${normalizedError.message}`,
        );
      }
    }

    if (failures.length === normalizedPrograms.length) {
      const error = failures[0]?.error ?? new Error('All SeatsAero requests failed');
      const normalizedError = this.normalizeAxiosError(error);
      this.logger.error('Failed to fetch SeatsAero live deals', normalizedError);
      throw normalizedError;
    }

    const dedupedDeals = this.deduplicateDeals(aggregatedDeals);
    const sortedDeals = this.sortDeals(dedupedDeals);
    const limitedDeals = sortedDeals.slice(0, baseTake);

    if (failures.length > 0) {
      this.logger.warn(
        `SeatsAero returned partial results. Successful programs: ${normalizedPrograms
          .filter((program) => !failures.find((failure) => failure.program === program))
          .join(', ') || 'none'}; Failed programs: ${failures
          .map((failure) => failure.program)
          .join(', ')}`,
      );
    }

    return { deals: limitedDeals, total: dedupedDeals.length };
  }

  getDiagnostics() {
    return {
      baseUrl: this.baseUrl,
      configuredBaseUrl: this.rawBaseUrl ?? null,
      timeoutMs: this.timeoutMs,
      hasApiKey: Boolean(this.apiKey),
    };
  }

  describeError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const requestUrl = this.resolveRequestUrl(axiosError);

      return {
        type: 'axios',
        message: axiosError.message,
        code: axiosError.code ?? null,
        status: axiosError.response?.status ?? null,
        data: axiosError.response?.data ?? null,
        requestUrl,
        method: axiosError.config?.method ?? null,
      };
    }

    if (error instanceof Error) {
      return {
        type: 'error',
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return {
      type: 'unknown',
      message: 'Unable to describe error',
    };
  }

  private resolvePrograms(options: SeatsAeroPartnerSearchOptions): string[] {
    const normalized: string[] = [];

    const fromOptions = [
      ...(options.program ? [options.program] : []),
      ...(Array.isArray(options.programs) ? options.programs : []),
    ];

    for (const candidate of fromOptions) {
      const sanitized = this.sanitizeProgram(candidate);
      if (sanitized && !normalized.includes(sanitized)) {
        normalized.push(sanitized);
      }
    }

    if (normalized.length > 0) {
      return normalized;
    }

    return [...SEATS_AERO_PROGRAMS];
  }

  private sanitizeProgram(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      return null;
    }

    if (SEATS_AERO_PROGRAMS.includes(trimmed)) {
      return trimmed;
    }

    this.logger.warn(`Ignoring unsupported SeatsAero program "${value}"`);
    return null;
  }

  private resolvePerProgramTake(baseTake: number, programCount: number): number {
    if (programCount <= 1) {
      return baseTake;
    }

    const perProgram = Math.max(1, Math.ceil(baseTake / programCount));
    return Math.min(perProgram, 200);
  }

  private async fetchDealsForProgram({
    endpoint,
    program,
    params,
  }: {
    endpoint: string;
    program: string;
    params: Record<string, string | number>;
  }): Promise<SeatsAeroPartnerDeal[]> {
    const queryParams: Record<string, string | number> = {
      ...params,
      source: program,
    };

    await this.enforceRateLimits();

    const response = await this.http.get<SeatsAeroPartnerSearchResponse>(endpoint, {
      params: queryParams,
    });

    const payload = response.data ?? {};
    const deals = this.extractDeals(payload).map((deal) => this.normalizeDeal(deal));

    return deals.map((deal) => this.ensureDealProgram(deal, program));
  }

  private ensureDealProgram(deal: SeatsAeroPartnerDeal, program: string): SeatsAeroPartnerDeal {
    const normalizedProgram = deal.program?.toLowerCase();
    if (normalizedProgram === program) {
      return deal;
    }

    return {
      ...deal,
      program: deal.program ?? program,
      loyaltyProgram: deal.loyaltyProgram ?? program,
      airline: deal.airline ?? program,
      carrier: deal.carrier ?? program,
    };
  }

  private deduplicateDeals(deals: SeatsAeroPartnerDeal[]): SeatsAeroPartnerDeal[] {
    const seen = new Set<string>();
    const deduped: SeatsAeroPartnerDeal[] = [];

    for (const deal of deals) {
      const key = this.buildDealKey(deal);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      deduped.push(deal);
    }

    return deduped;
  }

  private buildDealKey(deal: SeatsAeroPartnerDeal): string {
    if (deal.id) {
      return deal.id;
    }

    const origin = deal.origin ?? 'unknown-origin';
    const destination = deal.destination ?? 'unknown-destination';
    const departure = deal.departure ?? 'unknown-departure';
    const program = deal.program ?? deal.loyaltyProgram ?? 'unknown-program';
    const miles = Number.isFinite(deal.miles) ? deal.miles : -1;

    return `${program}::${origin}::${destination}::${departure}::${miles}`;
  }

  private sortDeals(deals: SeatsAeroPartnerDeal[]): SeatsAeroPartnerDeal[] {
    return [...deals].sort((a, b) => {
      const scoreA = typeof a.score === 'number' ? a.score : -Infinity;
      const scoreB = typeof b.score === 'number' ? b.score : -Infinity;

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      const milesA = typeof a.miles === 'number' ? a.miles : Number.POSITIVE_INFINITY;
      const milesB = typeof b.miles === 'number' ? b.miles : Number.POSITIVE_INFINITY;

      if (milesA !== milesB) {
        return milesA - milesB;
      }

      const departureA = a.departure ?? '';
      const departureB = b.departure ?? '';

      return departureA.localeCompare(departureB);
    });
  }

  private async enforceRateLimits(): Promise<void> {
    while (true) {
      const now = Date.now();

      this.trimTimestamps(this.recentMinuteRequests, this.minuteWindowMs, now);
      this.trimTimestamps(this.recentHourRequests, this.hourWindowMs, now);

      const minuteExceeded = this.recentMinuteRequests.length >= this.minuteRateLimit;
      const hourExceeded = this.recentHourRequests.length >= this.hourRateLimit;

      if (!minuteExceeded && !hourExceeded) {
        this.recentMinuteRequests.push(now);
        this.recentHourRequests.push(now);
        return;
      }

      const waitForMinute = minuteExceeded
        ? this.minuteWindowMs - (now - this.recentMinuteRequests[0])
        : 0;
      const waitForHour = hourExceeded
        ? this.hourWindowMs - (now - this.recentHourRequests[0])
        : 0;
      const waitMs = Math.max(waitForMinute, waitForHour, 50);

      await this.delay(waitMs);
    }
  }

  private trimTimestamps(buffer: number[], windowMs: number, now: number) {
    while (buffer.length > 0 && now - buffer[0] >= windowMs) {
      buffer.shift();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extractDeals(payload: SeatsAeroPartnerSearchResponse): SeatsAeroPartnerDeal[] {
    if (Array.isArray(payload.data)) {
      // Handle bulk availability format
      return payload.data.map((availability: any) => this.mapAvailabilityToDeal(availability));
    }

    if (Array.isArray(payload.results)) {
      return payload.results.map((deal: SeatsAeroPartnerDeal) => this.normalizeDeal(deal));
    }

    if (Array.isArray(payload.availability)) {
      return payload.availability.map((deal: SeatsAeroPartnerDeal) => this.normalizeDeal(deal));
    }

    return [];
  }

  private mapAvailabilityToDeal(availability: any): SeatsAeroPartnerDeal {
    const route = availability.Route || {};
    const cabin = this.determineBestCabin(availability);
    const miles = this.getMilesForCabin(availability, cabin);
    const taxes = this.getTaxesForCabin(availability, cabin);
    const seats = this.getSeatsForCabin(availability, cabin);

    return {
      id: availability.ID,
      origin: route.OriginAirport,
      destination: route.DestinationAirport,
      departure: availability.Date,
      arrival: availability.Date, // Same day for now
      airline: route.Source,
      carrier: route.Source,
      cabin: cabin,
      program: route.Source,
      loyaltyProgram: route.Source,
      miles: miles,
      points: miles,
      seats: seats,
      seatsAvailable: seats,
      taxes: taxes,
      fees: 0,
      totalTaxes: taxes,
      totalFees: 0,
      currency: availability.TaxesCurrency || 'USD',
      taxesCurrency: availability.TaxesCurrency || 'USD',
      bookingUrl: this.extractBookingUrl(availability),
      availability: seats,
      score: this.computeDealScore(miles, taxes, seats),
      cpp: taxes > 0 ? miles / (taxes / 100) : 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      updatedAt: availability.UpdatedAt || new Date().toISOString(),
      createdAt: availability.CreatedAt || new Date().toISOString(),
      watcherId: 'seats-aero-bulk',
      watcherName: 'SeatsAero Bulk Availability',
      segments: [{
        marketingCarrier: route.Source,
        operatingCarrier: route.Source,
        origin: route.OriginAirport,
        destination: route.DestinationAirport,
        departure: availability.Date,
        arrival: availability.Date,
        cabin: cabin,
        fareClass: this.getFareClassForCabin(cabin),
        aircraft: undefined,
      }],
    };
  }

  private determineBestCabin(availability: any): string {
    // Prioritize business class, then economy, then first
    if ((availability.JAvailable || availability.JAvailableRaw) && 
        (availability.JMileageCost !== "0" && availability.JMileageCost !== null)) return 'business';
    if ((availability.YAvailable || availability.YAvailableRaw) && 
        (availability.YMileageCost !== "0" && availability.YMileageCost !== null)) return 'economy';
    if ((availability.FAvailable || availability.FAvailableRaw) && 
        (availability.FMileageCost !== "0" && availability.FMileageCost !== null)) return 'first';
    if ((availability.WAvailable || availability.WAvailableRaw) && 
        (availability.WMileageCost !== "0" && availability.WMileageCost !== null)) return 'premium_economy';
    
    // Fallback to any available cabin with miles > 0
    if (availability.YMileageCost !== "0" && availability.YMileageCost !== null) return 'economy';
    if (availability.JMileageCost !== "0" && availability.JMileageCost !== null) return 'business';
    if (availability.FMileageCost !== "0" && availability.FMileageCost !== null) return 'first';
    if (availability.WMileageCost !== "0" && availability.WMileageCost !== null) return 'premium_economy';
    
    return 'economy'; // Default fallback
  }

  private getMilesForCabin(availability: any, cabin: string): number {
    switch (cabin) {
      case 'business':
        return parseInt(availability.JMileageCost || availability.JMileageCostRaw || '0');
      case 'first':
        return parseInt(availability.FMileageCost || availability.FMileageCostRaw || '0');
      case 'premium_economy':
        return parseInt(availability.WMileageCost || availability.WMileageCostRaw || '0');
      case 'economy':
      default:
        return parseInt(availability.YMileageCost || availability.YMileageCostRaw || '0');
    }
  }

  private getTaxesForCabin(availability: any, cabin: string): number {
    switch (cabin) {
      case 'business':
        return parseInt(availability.JTotalTaxes || availability.JTotalTaxesRaw || '0');
      case 'first':
        return parseInt(availability.FTotalTaxes || availability.FTotalTaxesRaw || '0');
      case 'premium_economy':
        return parseInt(availability.WTotalTaxes || availability.WTotalTaxesRaw || '0');
      case 'economy':
      default:
        return parseInt(availability.YTotalTaxes || availability.YTotalTaxesRaw || '0');
    }
  }

  private getSeatsForCabin(availability: any, cabin: string): number {
    switch (cabin) {
      case 'business':
        return parseInt(availability.JRemainingSeats || availability.JRemainingSeatsRaw || '0');
      case 'first':
        return parseInt(availability.FRemainingSeats || availability.FRemainingSeatsRaw || '0');
      case 'premium_economy':
        return parseInt(availability.WRemainingSeats || availability.WRemainingSeatsRaw || '0');
      case 'economy':
      default:
        return parseInt(availability.YRemainingSeats || availability.YRemainingSeatsRaw || '0');
    }
  }

  private getFareClassForCabin(cabin: string): string {
    switch (cabin) {
      case 'business': return 'J';
      case 'first': return 'F';
      case 'premium_economy': return 'W';
      case 'economy': return 'Y';
      default: return 'Y';
    }
  }

  private computeDealScore(miles: number, taxes: number, seats: number): number {
    let score = 70; // Base score
    
    // Higher score for more seats
    if (seats > 5) score += 10;
    else if (seats > 2) score += 5;
    
    // Higher score for lower miles (better value)
    if (miles < 50000) score += 15;
    else if (miles < 100000) score += 10;
    
    // Higher score for lower taxes
    if (taxes < 500) score += 10;
    else if (taxes < 1000) score += 5;
    
    return Math.min(100, score);
  }

  private normalizeDeal(deal: SeatsAeroPartnerDeal): SeatsAeroPartnerDeal {
    const bookingUrl = this.extractBookingUrl(deal);

    if (!bookingUrl || deal.bookingUrl === bookingUrl) {
      return deal;
    }

    return { ...deal, bookingUrl };
  }

  private extractBookingUrl(source: unknown): string | undefined {
    if (!source || typeof source !== 'object') {
      return undefined;
    }

    const candidates: string[] = [];
    const visited = new Set<unknown>();

    const prioritizedKeys = [
      'bookingUrl',
      'BookingUrl',
      'bookingURL',
      'BookingURL',
      'bookUrl',
      'BookUrl',
      'bookURL',
      'BookURL',
      'bookWithPointsUrl',
      'BookWithPointsUrl',
      'bookWithMilesUrl',
      'BookWithMilesUrl',
      'bookWithAirlineUrl',
      'BookWithAirlineUrl',
      'bookWithCarrierUrl',
      'BookWithCarrierUrl',
      'bookWithPartnerUrl',
      'BookWithPartnerUrl',
      'deepLink',
      'DeepLink',
      'deeplink',
      'Deeplink',
      'link',
      'Link',
      'url',
      'Url',
      'URL',
    ];

    const collectFromObject = (value: unknown) => {
      if (!value || typeof value !== 'object' || visited.has(value)) {
        return;
      }

      visited.add(value);

      const record = value as Record<string, unknown>;
      for (const key of prioritizedKeys) {
        const candidate = record[key];
        if (typeof candidate === 'string') {
          candidates.push(candidate);
        }
      }

      if (Array.isArray(record.links)) {
        for (const entry of record.links) {
          collectFromObject(entry);
        }
      } else if (record.links && typeof record.links === 'object') {
        collectFromObject(record.links);
      }

      if (Array.isArray(record.options)) {
        for (const entry of record.options) {
          collectFromObject(entry);
        }
      } else if (record.options && typeof record.options === 'object') {
        collectFromObject(record.options);
      }

      if (Array.isArray(record.Segments)) {
        for (const entry of record.Segments) {
          collectFromObject(entry);
        }
      }

      if (Array.isArray(record.segments)) {
        for (const entry of record.segments) {
          collectFromObject(entry);
        }
      }

      const nestedKeys = [
        'Route',
        'route',
        'routes',
        'Routes',
        'Details',
        'details',
        'Meta',
        'meta',
      ];

      for (const key of nestedKeys) {
        if (Array.isArray(record[key])) {
          for (const entry of record[key] as unknown[]) {
            collectFromObject(entry);
          }
        } else if (record[key] && typeof record[key] === 'object') {
          collectFromObject(record[key]);
        }
      }
    };

    collectFromObject(source);

    for (const candidate of candidates) {
      const sanitized = this.sanitizeBookingUrl(candidate);
      if (sanitized) {
        return sanitized;
      }
    }

    return undefined;
  }

  private sanitizeBookingUrl(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const normalized = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;

    if (/^https?:\/\//i.test(normalized)) {
      return this.tryParseUrl(normalized);
    }

    if (/^www\./i.test(normalized)) {
      return this.tryParseUrl(`https://${normalized}`);
    }

    return undefined;
  }

  private tryParseUrl(value: string): string | undefined {
    try {
      const url = new URL(value);
      return url.toString();
    } catch {
      return undefined;
    }
  }

  private normalizeBaseUrl(value: string | undefined): string {
    const fallback = 'https://seats.aero/partnerapi';
    if (!value || !value.trim()) {
      return fallback;
    }

    const trimmed = value.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      const url = new URL(withProtocol);

      if (url.hostname === 'api.seats.aero') {
        url.hostname = 'seats.aero';
      }

      const sanitizedPath = url.pathname.replace(/\/(availability|search)$/i, '').replace(/\/+$/, '');

      if (!sanitizedPath || sanitizedPath === '/') {
        url.pathname = '/partnerapi';
      } else if (/partnerapi$/i.test(sanitizedPath)) {
        url.pathname = sanitizedPath.startsWith('/') ? sanitizedPath : `/${sanitizedPath}`;
      } else if (/partnerapi/i.test(sanitizedPath)) {
        const index = sanitizedPath.toLowerCase().lastIndexOf('partnerapi');
        const basePath = sanitizedPath.slice(0, index + 'partnerapi'.length);
        url.pathname = basePath.startsWith('/') ? basePath : `/${basePath}`;
      } else {
        this.logger.warn(
          `Unrecognised SeatsAero base URL path "${sanitizedPath}". Falling back to default partner endpoint.`,
        );
        url.pathname = '/partnerapi';
      }

      url.pathname = url.pathname.replace(/\/+$/, '');
      return `${url.origin}${url.pathname}`;
    } catch (error) {
      this.logger.warn(
        `Invalid SeatsAero base URL "${value}". Falling back to default partner endpoint.`,
        error instanceof Error ? error : undefined,
      );
      return fallback;
    }
  }

  private resolveTimeout(value: string | undefined): number {
    if (!value) {
      return 20000;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      this.logger.warn(`Invalid SeatsAero timeout "${value}". Falling back to 20000ms.`);
      return 20000;
    }

    return parsed;
  }

  private normalizeAxiosError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const code = axiosError.code ?? 'ERR_UNKNOWN';
      const requestUrl = this.resolveRequestUrl(axiosError);
      const messageParts = [`SeatsAero request failed (${code}`];

      if (status) {
        messageParts[0] += `, status ${status}`;
      }

      messageParts[0] += ')';

      if (requestUrl) {
        messageParts.push(`URL: ${requestUrl}`);
      }

      const message = messageParts.join(' - ');
      const wrappedError = new Error(message);
      (wrappedError as Error & { cause?: unknown }).cause = error;
      return wrappedError;
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('SeatsAero request failed with an unknown error');
  }

  private resolveRequestUrl(error: AxiosError): string | null {
    const { baseURL, url } = error.config ?? {};

    if (baseURL || url) {
      try {
        const finalUrl = new URL(url ?? '', baseURL ?? this.baseUrl);
        return finalUrl.toString();
      } catch (err) {
        this.logger.debug('Failed to resolve SeatsAero request URL from error config', err as Error);
      }
    }

    return null;
  }
}
