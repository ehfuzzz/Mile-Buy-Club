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
      source: options.program || 'united', // Default to United for now
    };

    // Only add origin/destination if both are provided for cached search
    if (options.origin && options.destination) {
      params.origin = options.origin;
      params.destination = options.destination;
      params.departureDate = options.departureDate;
      params.returnDate = options.returnDate;
      params.cabin = options.cabin;
    }

    for (const key of Object.keys(params)) {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key];
      }
    }

    try {
      // Use bulk availability endpoint if no specific route, otherwise use cached search
      const endpoint = (options.origin && options.destination) ? '/search' : '/availability';
      console.log(`DEBUG: Making SeatsAero request to ${endpoint} with params:`, params);
      
      const response = await this.http.get<SeatsAeroPartnerSearchResponse>(endpoint, {
        params,
      });

      console.log(`DEBUG: SeatsAero response status: ${response.status}`);
      const payload = response.data ?? {};
      console.log(`DEBUG: SeatsAero response data keys:`, Object.keys(payload));
      
      const deals = this.extractDeals(payload);
      console.log(`DEBUG: Extracted ${deals.length} deals from response`);
      
      const total =
        typeof payload.meta?.total === 'number' && payload.meta.total >= 0
          ? payload.meta.total
          : deals.length;

      return { deals, total };
    } catch (error) {
      console.error('DEBUG: SeatsAero service error:', error);
      this.logger.error('Failed to fetch SeatsAero live deals', error as Error);
      throw error;
    }
  }

  private extractDeals(payload: SeatsAeroPartnerSearchResponse): SeatsAeroPartnerDeal[] {
    if (Array.isArray(payload.data)) {
      // Handle bulk availability format
      return payload.data.map((availability: any) => this.mapAvailabilityToDeal(availability));
    }

    if (Array.isArray(payload.results)) {
      return payload.results;
    }

    if (Array.isArray(payload.availability)) {
      return payload.availability;
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
}
