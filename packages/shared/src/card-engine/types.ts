export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  network: string;
  annualFee: number;
  programs: string[];
  signupBonus: {
    points: number;
    requirement: string;
    value: number;
  };
  earningRates: Array<{
    category: string;
    rate: number;
  }>;
  benefits: string[];
  transferPartners: string[];
  valuationCPP: number;
  bestFor: string[];
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
