/**
 * Value Engine Type Definitions
 * Core types for award value calculation system
 */

export interface FlightItinerary {
  origin: string; // IATA code
  destination: string;
  departDate: Date;
  returnDate?: Date;
  cabin: CabinClass;
  passengers: number;
  segments: FlightSegment[];
}

export interface FlightSegment {
  origin: string;
  destination: string;
  date: Date;
  airline: string;
  flightNumber: string;
  duration: number; // minutes
  cabin: CabinClass;
  aircraft?: string;
}

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface AwardPricing {
  program: string; // Program code (e.g., 'UNITED', 'CHASE_UR')
  pointsCost: number;
  surcharges: number; // In cents
  taxes: number; // In cents
  fees: number; // In cents
  totalCash: number; // surcharges + taxes + fees
  
  // Transfer requirements
  transferRequired: boolean;
  transferFrom?: string; // Source program
  transferRatio?: number; // e.g., 1.0 for 1:1, 0.8 for 1:0.8
  transferTime?: string; // e.g., "instant", "1-2 days"
}

export interface CashPricing {
  totalCost: number; // In cents
  baseFare: number;
  taxes: number;
  fees: number;
  source: string; // Provider name
}

export interface ValueCalculation {
  // Core metrics
  cpp: number; // Cents per point
  totalValue: number; // Total value derived (in cents)
  valueRating: ValueRating;
  
  // Breakdown
  awardPricing: AwardPricing;
  cashPricing: CashPricing;
  savings: number; // How much saved vs cash (in cents)
  savingsPercent: number;
  
  // Context
  isGoodDeal: boolean;
  dealQuality: 'excellent' | 'good' | 'fair' | 'poor';
  reasons: string[]; // Why this is/isn't a good deal
}

export type ValueRating = 
  | 'exceptional' // cpp >= 2.5
  | 'excellent'   // cpp >= 2.0
  | 'very_good'   // cpp >= 1.5
  | 'good'        // cpp >= 1.2
  | 'fair'        // cpp >= 1.0
  | 'poor';       // cpp < 1.0

export interface TransferPartner {
  from: string; // Source program code
  to: string; // Destination program code
  ratio: number; // Transfer ratio (1.0 = 1:1, 0.8 = 1:0.8)
  transferTime: string; // "instant", "1-2 days", "3-5 days"
  bonuses?: TransferBonus[];
}

export interface TransferBonus {
  multiplier: number; // e.g., 1.2 for 20% bonus
  minTransfer?: number;
  expiresAt?: Date;
  description: string;
}

export interface BookingInstructions {
  steps: BookingStep[];
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'moderate' | 'difficult';
  tips: string[];
  phoneNumber?: string;
  typicalWaitTime?: string;
}

export interface BookingStep {
  order: number;
  action: string;
  details?: string;
  url?: string;
  screenshot?: string;
}

export interface ValueComparisonOptions {
  includeTransferBonuses?: boolean;
  transferBonusScenarios?: number[]; // e.g., [1.1, 1.2] for 10%, 20%
  alternativeCabins?: CabinClass[];
  flexDays?: number; // Check dates ±N days
}
