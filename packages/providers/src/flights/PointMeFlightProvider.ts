import axios, { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import {
  Flight,
  FlightPricingOption,
  FlightSearchParams,
  ProviderAuthenticationError,
  ProviderConfig,
  ProviderError,
  ProviderRateLimitError,
  ProviderValidationError,
} from '../base/types';
import { FlightProvider } from '../base/FlightProvider';

interface PointMeSegment {
  marketingCarrier: string;
  operatingCarrier?: string;
  flightNumber?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  cabin?: string;
  fareClass?: string;
}

interface PointMeAward {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  airline?: string;
  flightNumber?: string;
  cabin?: string;
  miles?: number;
  taxes?: number;
  currency?: string;
  url?: string;
  availability?: number;
  program?: string;
  segments?: PointMeSegment[];
}

interface PointMeSearchResponse {
  data: PointMeAward[];
}

export interface PointMeProviderConfig extends ProviderConfig {
  apiKey: string;
  programs?: string[];
}

export class PointMeFlightProvider extends FlightProvider {
  private readonly http: AxiosInstance;

  constructor(private readonly pointMeConfig: PointMeProviderConfig) {
    super(pointMeConfig);

    if (!pointMeConfig.apiKey) {
      throw new ProviderValidationError('Point.Me API key is required', 'apiKey');
    }

    this.http = axios.create({
      baseURL: pointMeConfig.baseUrl ?? 'https://api.point.me',
      timeout: pointMeConfig.timeout ?? 20000,
      headers: {
        Authorization: `Bearer ${pointMeConfig.apiKey}`,
        'content-type': 'application/json',
      },
    });
  }

  protected async executeHealthCheck(): Promise<void> {
    await this.http.get('/v1/health');
  }

  protected async executeSearch(params: FlightSearchParams): Promise<Flight[]> {
    try {
      const response = await this.http.post<PointMeSearchResponse>('/v1/search/awards', {
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departDate,
        returnDate: params.returnDate,
        passengers: params.passengers?.adults ?? 1,
        cabin: params.cabin,
        programs: this.pointMeConfig.programs,
      });

      const awards = response.data?.data ?? [];
      if (!Array.isArray(awards)) {
        throw new ProviderError('INVALID_RESPONSE', 'Point.Me returned an unexpected payload');
      }

      return awards.map((award) => this.mapAward(award, params));
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private mapAward(award: PointMeAward, params: FlightSearchParams): Flight {
    const currency = award.currency ?? 'USD';
    const cashDue = award.taxes ?? 0;

    const pricingOptions: FlightPricingOption[] = [];
    if (typeof award.miles === 'number') {
      pricingOptions.push({
        type: 'award',
        miles: award.miles,
        cashAmount: cashDue,
        cashCurrency: currency,
        provider: this.pointMeConfig.name,
        bookingUrl: award.url,
        description: award.program ? `Book via ${award.program}` : undefined,
      });

      const pointsPlusCash = this.estimatePointsPlusCashOption(
        award.miles,
        cashDue,
        currency,
        award.url,
      );
      if (pointsPlusCash) {
        pricingOptions.push(pointsPlusCash);
      }
    }

    return {
      id: award.id,
      provider: this.pointMeConfig.name,
      origin: award.origin ?? params.origin,
      destination: award.destination ?? params.destination,
      departureTime: award.departureTime,
      arrivalTime: award.arrivalTime,
      price: cashDue,
      currency,
      airline: award.airline,
      flightNumber: award.flightNumber,
      cabin: (award.cabin ?? params.cabin) as Flight['cabin'],
      milesRequired: award.miles,
      bookingUrl: award.url,
      availability: award.availability,
      taxes: award.taxes,
      segments: award.segments?.map((segment) => ({
        marketingCarrier: segment.marketingCarrier,
        operatingCarrier: segment.operatingCarrier,
        flightNumber: segment.flightNumber,
        origin: segment.origin,
        destination: segment.destination,
        departureTime: segment.departureTime,
        arrivalTime: segment.arrivalTime,
        cabin: segment.cabin as Flight['cabin'],
        fareClass: segment.fareClass,
      })),
      pricingOptions: pricingOptions.length > 0 ? pricingOptions : undefined,
      pointsCashPrice: cashDue || undefined,
      pointsCashCurrency: pricingOptions.length > 0 ? currency : undefined,
      pointsCashMiles:
        pricingOptions.find((option) => option.type === 'points_plus_cash')?.miles ?? undefined,
    };
  }

  private estimatePointsPlusCashOption(
    miles: number,
    cashDue: number,
    currency: string,
    bookingUrl?: string,
  ): FlightPricingOption | null {
    if (!Number.isFinite(miles) || miles <= 0) {
      return null;
    }

    const milesOffset = Math.round(miles * 0.35);
    const remainingMiles = Math.max(Math.round(miles - milesOffset), 0);
    const cashFromOffset = Math.round(milesOffset * 1.35) / 100;
    const totalCash = Math.round((cashDue + cashFromOffset) * 100) / 100;

    return {
      type: 'points_plus_cash',
      miles: remainingMiles > 0 ? remainingMiles : undefined,
      cashAmount: totalCash,
      cashCurrency: currency,
      provider: this.pointMeConfig.name,
      bookingUrl,
      description: 'Estimated blend using 35% miles buy-back at 1.35¢ valuation',
      isEstimated: true,
    };
  }

  private normalizeError(error: unknown): ProviderError {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;

      if (status === 429) {
        const retryAfterHeader = axiosError.response?.headers?.['retry-after'];
        const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : 60;
        return new ProviderRateLimitError('Point.Me rate limit exceeded', retryAfterSeconds);
      }

      if (status === 401 || status === 403) {
        return new ProviderAuthenticationError('Point.Me authentication failed');
      }

      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Point.Me request failed';
      return new ProviderError('HTTP_ERROR', message, status, !!status && status >= 500);
    }

    if (error instanceof ProviderError) {
      return error;
    }

    const fallbackMessage = error instanceof Error ? error.message : 'Unknown error';
    return new ProviderError('UNKNOWN_ERROR', fallbackMessage);
  }
}
