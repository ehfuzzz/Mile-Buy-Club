// Email template exports
export { DealAlertEmail } from './templates/deal-alert';
export { WeeklyDigestEmail } from './templates/weekly-digest';
export { WelcomeEmail } from './templates/welcome';
export { CardRecommendationEmail } from './templates/card-recommendation';

// Email service utilities
export class EmailService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  static async sendDealAlert(data: {
    to: string;
    userName: string;
    deal: any;
    watcherName: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/email/deal-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send deal alert email');
    }

    return response.json();
  }

  static async sendWeeklyDigest(data: {
    to: string;
    userName: string;
    week: any;
    stats: any;
    topDeals: any[];
    recommendations: any[];
  }) {
    const response = await fetch(`${this.baseUrl}/api/email/weekly-digest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send weekly digest email');
    }

    return response.json();
  }

  static async sendWelcomeEmail(data: {
    to: string;
    userName: string;
    userEmail: string;
    nextSteps: any[];
    features: any[];
  }) {
    const response = await fetch(`${this.baseUrl}/api/email/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send welcome email');
    }

    return response.json();
  }

  static async sendCardRecommendation(data: {
    to: string;
    userName: string;
    recommendations: any[];
    portfolioAnalysis: any;
  }) {
    const response = await fetch(`${this.baseUrl}/api/email/card-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send card recommendation email');
    }

    return response.json();
  }
}

// Email template data types
export interface DealAlertData {
  to: string;
  userName: string;
  deal: {
    route: string;
    airline: string;
    cabin: string;
    price: number;
    miles: number;
    cpp: number;
    value: number;
    expiresAt: string;
    bookingUrl: string;
  };
  watcherName: string;
}

export interface WeeklyDigestData {
  to: string;
  userName: string;
  week: {
    startDate: string;
    endDate: string;
  };
  stats: {
    dealsFound: number;
    topDeals: number;
    savings: number;
    watchers: number;
  };
  topDeals: Array<{
    route: string;
    airline: string;
    price: number;
    miles: number;
    cpp: number;
    value: number;
    bookingUrl: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    actionUrl: string;
  }>;
}

export interface WelcomeEmailData {
  to: string;
  userName: string;
  userEmail: string;
  nextSteps: Array<{
    title: string;
    description: string;
    actionUrl: string;
    actionText: string;
  }>;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface CardRecommendationData {
  to: string;
  userName: string;
  recommendations: Array<{
    name: string;
    issuer: string;
    annualFee: number;
    signupBonus: number;
    bonusValue: number;
    category: string;
    rating: number;
    recommendationScore: number;
    reason: string;
    benefits: string[];
    transferPartners: string[];
    applicationUrl: string;
  }>;
  portfolioAnalysis: {
    currentValue: number;
    potentialValue: number;
    gaps: string[];
    coverage: number;
  };
}
