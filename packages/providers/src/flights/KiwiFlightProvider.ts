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
  ProviderName,
} from '../base/types';
import { FlightProvider } from '../base/FlightProvider';

interface KiwiRouteSegment {
  airline?: string;
  operating_airline?: string;
  flight_no?: number;
  flyFrom: string;
  flyTo: string;
  local_departure: string;
  local_arrival: string;
  return?: number;
  equipment?: string;
  fare_class?: string;
  cabin?: string;
}

interface KiwiFlight {
  id: string;
  flyFrom: string;
  flyTo: string;
  price: number;
  deep_link?: string;
  airlines?: string[];
  route: KiwiRouteSegment[];
  availability?: { seats?: number };
  fare?: { adults?: { base_fare?: number; taxes?: number } };
  duration?: { total?: number };
  currency?: string;
}

interface KiwiSearchResponse {
  data: KiwiFlight[];
  currency?: string;
}

export interface KiwiProviderConfig extends ProviderConfig {
  apiKey: string;
  locale?: string;
  currency?: string;
  market?: string;
  maxStopovers?: number;
  limit?: number;
}

export class KiwiFlightProvider extends FlightProvider {
  private readonly http: AxiosInstance;

  constructor(private readonly kiwiConfig: KiwiProviderConfig) {
    super(kiwiConfig);

    if (!kiwiConfig.apiKey) {
      throw new ProviderValidationError('Kiwi Tequila API key is required', 'apiKey');
    }

    this.http = axios.create({
      baseURL: kiwiConfig.baseUrl ?? 'https://tequila-api.kiwi.com',
      timeout: kiwiConfig.timeout ?? 25000,
      headers: {
        apikey: kiwiConfig.apiKey,
        'content-type': 'application/json',
      },
    });
  }

  protected async executeHealthCheck(): Promise<void> {
    await this.http.get('/v2/locations/query', {
      params: {
        term: 'NYC',
        locale: this.kiwiConfig.locale ?? 'en',
        location_types: 'airport',
        limit: 1,
      },
    });
  }

  protected async executeSearch(params: FlightSearchParams): Promise<Flight[]> {
    try {
      const formattedDate = this.formatDate(params.departDate);
      const formattedReturn = params.returnDate ? this.formatDate(params.returnDate) : undefined;

      const response = await this.http.get<KiwiSearchResponse>('/v2/search', {
        params: {
          fly_from: params.origin,
          fly_to: params.destination,
          date_from: formattedDate,
          date_to: formattedReturn ?? formattedDate,
          return_from: formattedReturn,
          return_to: formattedReturn,
          adults: params.passengers?.adults ?? 1,
          children: params.passengers?.children ?? 0,
          infants: params.passengers?.infants ?? 0,
          limit: this.kiwiConfig.limit ?? 30,
          curr: this.kiwiConfig.currency ?? 'USD',
          partner_market: this.kiwiConfig.market ?? 'us',
          locale: this.kiwiConfig.locale ?? 'en',
          selected_cabins: params.cabin?.toUpperCase() ?? undefined,
          max_stopovers:
            typeof this.kiwiConfig.maxStopovers === 'number' ? this.kiwiConfig.maxStopovers : undefined,
        },
      });

      const flights = response.data?.data ?? [];
      if (!Array.isArray(flights)) {
        throw new ProviderError('INVALID_RESPONSE', 'Kiwi returned an unexpected payload');
      }

      return flights.map((flight) => this.mapFlight(flight, response.data?.currency ?? 'USD'));
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private mapFlight(flight: KiwiFlight, currency: string): Flight {
    const firstSegment = flight.route?.[0];
    const lastSegment = flight.route?.[flight.route.length - 1];
    const carrier = flight.airlines?.[0] ?? firstSegment?.airline;

    const pricingOptions: FlightPricingOption[] = [
      {
        type: 'cash',
        cashAmount: flight.price,
        cashCurrency: currency,
        provider: ProviderName.KIWI,
        bookingUrl: flight.deep_link,
        description: 'Published cash fare via Kiwi',
      },
    ];

    const taxes = flight.fare?.adults?.taxes;
    const baseFare = flight.fare?.adults?.base_fare;

    return {
      id: flight.id,
      provider: ProviderName.KIWI,
      origin: flight.flyFrom,
      destination: flight.flyTo,
      departureTime: firstSegment?.local_departure ?? '',
      arrivalTime: lastSegment?.local_arrival ?? '',
      price: flight.price,
      currency,
      airline: carrier,
      flightNumber: firstSegment?.flight_no ? `${carrier ?? ''}${firstSegment.flight_no}` : undefined,
      cabin: (firstSegment?.cabin?.toLowerCase() as Flight['cabin']) ?? 'economy',
      bookingUrl: flight.deep_link,
      availability: flight.availability?.seats,
      taxes,
      fees: taxes && baseFare ? Math.max(flight.price - taxes - baseFare, 0) : undefined,
      segments: flight.route?.map((segment) => ({
        marketingCarrier: segment.airline ?? carrier ?? '',
        operatingCarrier: segment.operating_airline,
        flightNumber: segment.flight_no
          ? `${segment.airline ?? carrier ?? ''}${segment.flight_no}`
          : undefined,
        origin: segment.flyFrom,
        destination: segment.flyTo,
        departureTime: segment.local_departure,
        arrivalTime: segment.local_arrival,
        cabin: (segment.cabin?.toLowerCase() as Flight['cabin']) ?? 'economy',
        fareClass: segment.fare_class,
      })),
      cashPrice: flight.price,
      cashCurrency: currency,
      pricingOptions,
    };
  }

  private formatDate(date: string): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    const day = `${parsed.getUTCDate()}`.padStart(2, '0');
    const month = `${parsed.getUTCMonth() + 1}`.padStart(2, '0');
    const year = parsed.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }

  private normalizeError(error: unknown): ProviderError {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;

      if (status === 429) {
        const retryAfterHeader = axiosError.response?.headers?.['retry-after'];
        const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : 60;
        return new ProviderRateLimitError('Kiwi rate limit exceeded', retryAfterSeconds);
      }

      if (status === 401 || status === 403) {
        return new ProviderAuthenticationError('Kiwi authentication failed');
      }

      const message =
        axiosError.response?.data?.message || axiosError.message || 'Kiwi request failed';
      return new ProviderError('HTTP_ERROR', message, status, !!status && status >= 500);
    }

    if (error instanceof ProviderError) {
      return error;
    }

    const fallbackMessage = error instanceof Error ? error.message : 'Unknown error';
    return new ProviderError('UNKNOWN_ERROR', fallbackMessage);
  }
}
