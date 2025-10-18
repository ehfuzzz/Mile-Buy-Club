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

interface SeatsAeroAvailabilitySegment {
  marketingCarrier: string;
  operatingCarrier?: string;
  flightNumber?: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  cabin?: string;
  fareClass?: string;
}

interface SeatsAeroAvailability {
  id?: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  airline?: string;
  flightNumber?: string;
  cabin?: string;
  miles?: number;
  seatsAvailable?: number;
  bookingUrl?: string;
  currency?: string;
  taxes?: number;
  fees?: number;
  program?: string;
  segments?: SeatsAeroAvailabilitySegment[];
}

export interface SeatsAeroProviderConfig extends ProviderConfig {
  apiKey: string;
  program?: string;
}

export class SeatsAeroFlightProvider extends FlightProvider {
  private readonly http: AxiosInstance;

  constructor(private readonly seatsConfig: SeatsAeroProviderConfig) {
    super(seatsConfig);

    if (!seatsConfig.apiKey) {
      throw new ProviderValidationError('SeatsAero API key is required', 'apiKey');
    }

    this.http = axios.create({
      baseURL: seatsConfig.baseUrl ?? 'https://api.seats.aero',
      timeout: seatsConfig.timeout ?? 20000,
      headers: {
        'x-api-key': seatsConfig.apiKey,
        'content-type': 'application/json',
      },
    });
  }

  protected async executeHealthCheck(): Promise<void> {
    await this.http.get('/v1/status');
  }

  protected async executeSearch(params: FlightSearchParams): Promise<Flight[]> {
    try {
      const response = await this.http.get<{ availability: SeatsAeroAvailability[] }>(
        '/v1/award/search',
        {
          params: {
            origin: params.origin,
            destination: params.destination,
            departureDate: params.departDate,
            returnDate: params.returnDate,
            cabin: params.cabin,
            program: this.seatsConfig.program,
            passengers: params.passengers?.adults ?? 1,
          },
        }
      );

      const availability = response.data?.availability ?? [];
      if (!Array.isArray(availability)) {
        throw new ProviderError('INVALID_RESPONSE', 'SeatsAero returned an unexpected payload');
      }

      return availability.map((item) => this.mapAvailability(item, params));
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private mapAvailability(item: SeatsAeroAvailability, params: FlightSearchParams): Flight {
    const id =
      item.id ||
      `${item.program ?? 'seats_aero'}-${item.origin}-${item.destination}-${item.departure}-${item.flightNumber ?? 'unknown'}`;

    const currency = item.currency ?? 'USD';
    const cashDue = item.taxes ?? item.fees ?? 0;

    const pricingOptions: FlightPricingOption[] = [];

    if (typeof item.miles === 'number') {
      pricingOptions.push({
        type: 'award',
        miles: item.miles,
        cashAmount: cashDue,
        cashCurrency: currency,
        provider: this.config.name,
        bookingUrl: item.bookingUrl,
        description: item.program ? `Book via ${item.program}` : undefined,
      });

      const pointsPlusCash = this.estimatePointsPlusCashOption(item.miles, cashDue, currency);
      if (pointsPlusCash) {
        pricingOptions.push(pointsPlusCash);
      }
    }

    return {
      id,
      provider: this.config.name,
      origin: item.origin ?? params.origin,
      destination: item.destination ?? params.destination,
      departureTime: item.departure,
      arrivalTime: item.arrival,
      price: cashDue,
      currency,
      airline: item.airline,
      flightNumber: item.flightNumber,
      cabin: (item.cabin ?? params.cabin) as Flight['cabin'],
      milesRequired: item.miles,
      bookingUrl: item.bookingUrl,
      availability: item.seatsAvailable,
      taxes: item.taxes,
      fees: item.fees,
      segments: item.segments?.map((segment) => ({
        marketingCarrier: segment.marketingCarrier,
        operatingCarrier: segment.operatingCarrier,
        flightNumber: segment.flightNumber,
        origin: segment.origin,
        destination: segment.destination,
        departureTime: segment.departure,
        arrivalTime: segment.arrival,
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
  ): FlightPricingOption | null {
    if (!Number.isFinite(miles) || miles <= 0) {
      return null;
    }

    // Heuristic: assume the traveler can buy back up to 40% of the miles at 1.3 cpp
    const milesOffset = Math.round(miles * 0.4);
    const remainingMiles = Math.max(Math.round(miles - milesOffset), 0);
    const cashFromOffset = Math.round(milesOffset * 1.3) / 100;
    const totalCash = Math.round((cashDue + cashFromOffset) * 100) / 100;

    return {
      type: 'points_plus_cash',
      miles: remainingMiles > 0 ? remainingMiles : undefined,
      cashAmount: totalCash,
      cashCurrency: currency,
      provider: this.config.name,
      bookingUrl: undefined,
      description: 'Estimated blend using 40% miles buy-back at 1.3¢ valuation',
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
        return new ProviderRateLimitError('SeatsAero rate limit exceeded', retryAfterSeconds);
      }

      if (status === 401 || status === 403) {
        return new ProviderAuthenticationError('SeatsAero authentication failed');
      }

      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'SeatsAero request failed';
      return new ProviderError('HTTP_ERROR', message, status, !!status && status >= 500);
    }

    if (error instanceof ProviderError) {
      return error;
    }

    const fallbackMessage = error instanceof Error ? error.message : 'Unknown error';
    return new ProviderError('UNKNOWN_ERROR', fallbackMessage);
  }
}
