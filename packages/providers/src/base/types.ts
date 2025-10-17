/**
 * Provider Abstraction Layer - Type Definitions
 * Defines all interfaces and types for pluggable provider architecture
 */

export enum ProviderType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  ACTIVITY = 'activity',
}

export enum ProviderName {
  // Flight providers
  AMADEUS = 'amadeus',
  KIWI = 'kiwi',
  SKYSCANNER = 'skyscanner',
  
  // Hotel providers
  BOOKING = 'booking',
  EXPEDIA = 'expedia',
  TRIP_DOT_COM = 'trip',
  
  // Activity providers
  VIATOR = 'viator',
  GET_YOUR_GUIDE = 'getyourguide',
}

export interface ProviderConfig {
  name: ProviderName;
  type: ProviderType;
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  headers?: Record<string, string>;
  proxy?: {
    host: string;
    port: number;
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
    requestId?: string;
    timestamp: number;
    duration: number;
    cacheHit?: boolean;
  };
}

export interface ProviderHealthCheck {
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
  responseTime: number;
  error?: string;
}

// ============================================================================
// FLIGHT PROVIDER TYPES
// ============================================================================

export interface FlightSearch {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
  directOnly?: boolean;
  maxStops?: number;
}

export interface FlightSegment {
  flightNumber: string;
  airline: string;
  airlineCode: string;
  aircraft?: string;
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration: number; // minutes
  stops: number;
  cabin: string;
}

export interface FlightFare {
  id: string;
  currency: string;
  adult: number;
  child?: number;
  infant?: number;
  totalPrice: number;
  breakDown?: {
    baseFare: number;
    taxes: number;
    fees: number;
  };
}

export interface Flight {
  id: string;
  provider: ProviderName;
  segments: FlightSegment[];
  fare: FlightFare;
  bookingUrl?: string;
  awardMiles?: {
    program: string;
    miles: number;
  };
  availableSeats: number;
  lastUpdated: Date;
}

export interface FlightSearchParams extends FlightSearch {
  filters?: {
    maxPrice?: number;
    minRating?: number;
    preferredAirlines?: string[];
  };
  sort?: 'price' | 'duration' | 'departure' | 'arrival';
  limit?: number;
  offset?: number;
}

// ============================================================================
// HOTEL PROVIDER TYPES
// ============================================================================

export interface HotelSearch {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface HotelAddress {
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface HotelAmenity {
  id: string;
  name: string;
  category: 'wifi' | 'pool' | 'gym' | 'parking' | 'restaurant' | 'spa' | 'business' | 'accessibility' | 'other';
  free?: boolean;
}

export interface HotelRoom {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  amenities: HotelAmenity[];
  images: string[];
  pricePerNight: number;
  currency: string;
  freeCancellation: boolean;
  cancellationDeadline?: string;
}

export interface Hotel {
  id: string;
  provider: ProviderName;
  name: string;
  address: HotelAddress;
  starRating: number;
  images: string[];
  description: string;
  amenities: HotelAmenity[];
  rooms: HotelRoom[];
  reviews?: {
    rating: number;
    count: number;
    url?: string;
  };
  bookingUrl?: string;
  loyaltyPrograms?: string[];
  lastUpdated: Date;
}

export interface HotelSearchParams extends HotelSearch {
  filters?: {
    maxPricePerNight?: number;
    minStarRating?: number;
    amenities?: string[];
    loyaltyPrograms?: string[];
    freeCancellation?: boolean;
  };
  sort?: 'price' | 'rating' | 'distance';
  limit?: number;
  offset?: number;
}

// ============================================================================
// ACTIVITY PROVIDER TYPES
// ============================================================================

export interface ActivitySearch {
  location: string;
  date?: string;
  category?: string;
}

export interface ActivityDuration {
  value: number;
  unit: 'hours' | 'days' | 'minutes';
}

export interface ActivityPrice {
  currency: string;
  value: number;
  originalValue?: number;
  discount?: number;
}

export interface Activity {
  id: string;
  provider: ProviderName;
  title: string;
  description: string;
  location: string;
  duration: ActivityDuration;
  category: string;
  images: string[];
  price: ActivityPrice;
  rating: number;
  reviewCount: number;
  reviews?: Array<{
    rating: number;
    comment: string;
    author: string;
    date: string;
  }>;
  whatIncluded?: string[];
  cancellationPolicy?: string;
  availableTimes?: string[];
  bookingUrl?: string;
  lastUpdated: Date;
}

export interface ActivitySearchParams extends ActivitySearch {
  filters?: {
    maxPrice?: number;
    minRating?: number;
    duration?: {
      min: number;
      max: number;
    };
    freeCancellation?: boolean;
  };
  sort?: 'price' | 'rating' | 'duration' | 'popularity';
  limit?: number;
  offset?: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ProviderError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ProviderRateLimitError extends ProviderError {
  constructor(
    message: string,
    public retryAfterSeconds: number,
  ) {
    super('RATE_LIMIT_EXCEEDED', message, 429, true);
    this.name = 'ProviderRateLimitError';
  }
}

export class ProviderAuthenticationError extends ProviderError {
  constructor(message: string = 'Authentication failed') {
    super('AUTHENTICATION_ERROR', message, 401, false);
    this.name = 'ProviderAuthenticationError';
  }
}

export class ProviderValidationError extends ProviderError {
  constructor(
    message: string,
    public field?: string,
  ) {
    super('VALIDATION_ERROR', message, 400, false);
    this.name = 'ProviderValidationError';
  }
}
