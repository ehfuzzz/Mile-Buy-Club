export type CreditFrequencyUnit =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMIANNUAL'
  | 'ANNUAL'
  | 'EVERY_N_YEARS';

export interface CreditFrequency {
  unit: CreditFrequencyUnit;
  resetRule: 'CALENDAR_YEAR' | 'CARDMEMBER_YEAR' | 'JAN_JUN_JUL_DEC' | 'MONTHLY_ROLLING' | string;
  nYears?: number;
}

export interface CreditAmount {
  currency: string;
  value: number;
}

export interface CreditEligibility {
  requiresEnrollment?: boolean;
  channel?: string;
  portal?: string;
  portalCollections?: string[];
  mccAllow?: string[];
  mccBlock?: string[];
  merchantAllow?: string[];
  minSpendUsd?: number;
  minNights?: number;
  singleStayOnly?: boolean;
  geography?: string[];
  notes?: string;
  [key: string]: unknown;
}

export interface CreditRecognition {
  matchOn?: string[];
  postingLagDays?: number;
  [key: string]: unknown;
}

export interface CardCredit {
  creditId: string;
  title: string;
  type:
    | 'GENERIC_TRAVEL'
    | 'AIRLINE_INCIDENTAL'
    | 'HOTEL_PORTAL_BOOKING'
    | 'HOTEL_ANY'
    | 'RIDESHARE_MONTHLY'
    | 'DINING_MONTHLY'
    | 'TRUSTED_TRAVELER_CREDIT'
    | 'PORTAL_TRAVEL_CREDIT'
    | 'MERCHANT_SPECIFIC'
    | 'ANNIVERSARY_POINTS'
    | string;
  amount: CreditAmount;
  frequency: CreditFrequency;
  eligibility?: CreditEligibility;
  recognition?: CreditRecognition;
  carryover?: boolean;
  proRataRefundable?: boolean;
}

export interface CardEarnRate {
  category: string;
  rateX: number;
}

export interface CardPerk {
  type: string;
  [key: string]: unknown;
}

export interface CardProtection {
  type: string;
  [key: string]: unknown;
}

export interface WelcomeOffer {
  points?: number;
  miles?: number;
  spendRequirement?: string;
  estimatedValueUsd?: number;
  expiresAtUtc?: string;
  notes?: string;
}

export interface SignupBonus {
  points: number;
  requirement: string;
  value: number;
}

export interface CreditCard {
  id: string;
  cardId: string;
  name?: string;
  issuer: string;
  network: string;
  productName: string;
  annualFee: number;
  annualFeeUsd: number;
  rewardsProgram: string;
  programs: string[];
  earn: CardEarnRate[];
  earningRates: Array<{ category: string; rate: number }>;
  transferPartners: string[];
  credits: CardCredit[];
  perks: CardPerk[];
  protections: CardProtection[];
  welcomeOffer?: WelcomeOffer;
  signupBonus: SignupBonus;
  valuationCPP: number;
  benefits: string[];
  bestFor: string[];
  pointValueCents?: number;
  sourceOfTruthUrl: string;
  lastVerifiedUtc: string;
  metadata?: Record<string, unknown>;
}

export interface UserCard {
  cardId: string;
  acquiredDate: Date;
  closed: boolean;
}

export interface UserProfile {
  cards: UserCard[];
  programs: string[];
  spendingPatterns?: {
    travel?: number;
    dining?: number;
    hotels?: number;
    other?: number;
  };
  preferences?: {
    maxAnnualFee?: number;
    valuationFocus?: 'cpp' | 'simple' | 'elite-status';
    avoidIssuers?: string[];
  };
}

export interface CardRecommendation {
  card: CreditCard;
  score: number;
  reasons: string[];
  gapsFilled: string[];
  estimatedAnnualValue: number;
  effectiveAnnualFee: number;
}

export interface ProgramGap {
  program: string;
  importance: 'high' | 'medium' | 'low';
  reason: string;
}
