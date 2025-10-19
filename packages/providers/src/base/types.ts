/**
 * Provider Abstraction Layer - Type Definitions
 */

export enum ProviderType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  ACTIVITY = 'activity',
}

export enum ProviderName {
  AMADEUS = 'amadeus',
  SEATS_AERO = 'seats_aero',
  BOOKING = 'booking',
  EXPEDIA = 'expedia',
  VIATOR = 'viator',
  GET_YOUR_GUIDE = 'getyourguide',
}

export interface ProviderConfig {
  name: ProviderName;
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface ProviderResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode?: number;
    retryable?: boolean;
  };
  metadata?: {
    timestamp: number;
    duration: number;
  };
}

export interface ProviderHealthCheck {
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
  responseTime: number;
  error?: string;
}

export interface FlightSearch {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: { adults: number; children: number; infants: number };
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface FlightSegment {
  marketingCarrier: string;
  operatingCarrier?: string;
  flightNumber?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  aircraft?: string;
  durationMinutes?: number;
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
  fareClass?: string;
}

export type FlightPricingOptionType = 'award' | 'cash' | 'points_plus_cash';

export interface FlightPricingOption {
  type: FlightPricingOptionType;
  cashAmount: number;
  cashCurrency: string;
  miles?: number;
  pointsCurrency?: string;
  provider: ProviderName;
  bookingUrl?: string;
  description?: string;
  isEstimated?: boolean;
}

export interface Flight {
  id: string;
  provider: ProviderName;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  airline?: string;
  flightNumber?: string;
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
  milesRequired?: number;
  fareClass?: string;
  bookingUrl?: string;
  availability?: number;
  taxes?: number;
  fees?: number;
  segments?: FlightSegment[];
  cashPrice?: number;
  cashCurrency?: string;
  pointsCashPrice?: number;
  pointsCashCurrency?: string;
  pointsCashMiles?: number;
  pricingOptions?: FlightPricingOption[];
}

export type FlightSearchParams = FlightSearch;

export interface HotelSearch {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface Hotel {
  id: string;
  provider: ProviderName;
  name: string;
  location: string;
  pricePerNight: number;
  currency: string;
}

export type HotelSearchParams = HotelSearch;

export interface ActivitySearch {
  location: string;
  date?: string;
  category?: string;
}

export interface Activity {
  id: string;
  provider: ProviderName;
  title: string;
  location: string;
  price: number;
  currency: string;
}

export type ActivitySearchParams = ActivitySearch;

export class ProviderError extends Error {
  constructor(public code: string, message: string, public statusCode?: number, public retryable: boolean = false) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ProviderRateLimitError extends ProviderError {
  constructor(message: string, public retryAfterSeconds: number) {
    super('RATE_LIMIT_EXCEEDED', message, 429, true);
  }
}

export class ProviderAuthenticationError extends ProviderError {
  constructor(message = 'Authentication failed') {
    super('AUTHENTICATION_ERROR', message, 401, false);
  }
}

export class ProviderValidationError extends ProviderError {
  constructor(message: string, public field?: string) {
    super('VALIDATION_ERROR', message, 400, false);
  }
}
