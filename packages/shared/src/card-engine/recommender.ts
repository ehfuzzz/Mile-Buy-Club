import { CreditCard, UserProfile, CardRecommendation } from './types';
import { GapAnalyzer } from './gap-analyzer';
import { Explainer } from './explainer';
import cardDatabase from './card-database.json';

export class CardRecommender {
  /**
   * Generate card recommendations for a user
   */
  static recommend(userProfile: UserProfile, maxRecommendations: number = 3): CardRecommendation[] {
    // Get user's current cards
    const userCardIds = new Set(
      userProfile.cards.filter((c) => !c.closed).map((c) => c.cardId)
    );

    // Get all available cards (exclude ones user already has)
    const availableCards = cardDatabase.cards
      .filter((card: any) => !userCardIds.has(card.id))
      .map((card: any) => card as CreditCard);

    // Identify gaps in user's portfolio
    const gaps = GapAnalyzer.identifyGaps(userProfile);
    const balance = GapAnalyzer.analyzeBalance(userProfile);

    // Score each card
    const scoredCards: CardRecommendation[] = availableCards.map((card) => {
      const score = this.scoreCard(card, userProfile, gaps, balance);
      const reasons = Explainer.generateReasons(card, gaps, balance);
      const gapsFilled = this.identifyFilledGaps(card, gaps);
      const estimatedValue = this.estimateAnnualValue(card, userProfile);
      const effectiveFee = this.calculateEffectiveFee(card);

      return {
        card,
        score,
        reasons,
        gapsFilled,
        estimatedAnnualValue: estimatedValue,
        effectiveAnnualFee: effectiveFee,
      };
    });

    // Sort by score and return top N
    return scoredCards
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);
  }

  /**
   * Score a card based on user profile
   */
  private static scoreCard(
    card: CreditCard,
    userProfile: UserProfile,
    gaps: any[],
    balance: any
  ): number {
    let score = 0;

    // Gap filling (primary scoring factor)
    const gapsFilled = this.identifyFilledGaps(card, gaps);
    score += gapsFilled.length * 30;

    // High-importance gaps get extra points
    const highImportanceGaps = gapsFilled.filter(
      (g) => gaps.find((gap) => gap.program === g)?.importance === 'high'
    );
    score += highImportanceGaps.length * 20;

    // Bonus value (secondary factor)
    const signupBonusValue = card.signupBonus.value;
    score += Math.min(signupBonusValue / 50, 20); // Cap at 20 points

    // Transfer partners (tertiary factor)
    score += Math.min(card.transferPartners.length * 2, 15);

    // Annual fee vs benefit (penalty for high fees)
    const effectiveFee = this.calculateEffectiveFee(card);
    if (effectiveFee > 200) score -= 10;
    if (effectiveFee < 0) score += 10; // Credits exceed fee

    // User preferences
    if (userProfile.preferences) {
      const { maxAnnualFee, valuationFocus, avoidIssuers } = userProfile.preferences;

      if (maxAnnualFee && card.annualFee > maxAnnualFee) {
        score -= 20;
      }

      if (valuationFocus === 'cpp' && card.valuationCPP >= 1.5) {
        score += 15;
      }

      if (valuationFocus === 'simple' && card.valuationCPP === 1.0) {
        score += 15;
      }

      if (avoidIssuers && avoidIssuers.includes(card.issuer)) {
        score -= 30;
      }
    }

    // Balance improvements
    if (!balance.hasNoFeeCard && card.annualFee === 0) {
      score += 15;
    }

    if (!balance.hasFlexiblePoints && card.transferPartners.length > 0) {
      score += 20;
    }

    return Math.max(0, score);
  }

  /**
   * Identify which gaps a card fills
   */
  private static identifyFilledGaps(card: CreditCard, gaps: any[]): string[] {
    const filled: string[] = [];

    gaps.forEach((gap) => {
      if (card.programs.includes(gap.program)) {
        filled.push(gap.program);
      }

      // Check transfer partners
      if (card.transferPartners.includes(gap.program)) {
        filled.push(gap.program);
      }
    });

    return filled;
  }

  /**
   * Estimate annual value from a card
   */
  private static estimateAnnualValue(
    card: CreditCard,
    userProfile: UserProfile
  ): number {
    let value = 0;

    // Signup bonus (amortized over 2 years)
    value += card.signupBonus.value / 2;

    // Earning rates (estimated based on spending patterns)
    if (userProfile.spendingPatterns) {
      const { travel = 5000, dining = 3000, hotels = 2000, other = 10000 } =
        userProfile.spendingPatterns;

      card.earningRates.forEach((rate) => {
        let annualSpend = other;
        if (rate.category === 'travel') annualSpend = travel;
        if (rate.category === 'dining') annualSpend = dining;
        if (rate.category === 'hotels' || rate.category === 'marriott' || rate.category === 'hilton')
          annualSpend = hotels;

        const pointsEarned = annualSpend * rate.rate;
        value += pointsEarned * (card.valuationCPP / 100);
      });
    } else {
      // Default estimate: $20k annual spend
      const avgRate =
        card.earningRates.reduce((sum, r) => sum + r.rate, 0) /
        card.earningRates.length;
      value += 20000 * avgRate * (card.valuationCPP / 100);
    }

    return Math.round(value);
  }

  /**
   * Calculate effective annual fee (after credits)
   */
  private static calculateEffectiveFee(card: CreditCard): number {
    let effectiveFee = card.annualFee;

    // Parse benefits for credits
    card.benefits.forEach((benefit) => {
      const creditMatch = benefit.match(/\$(\d+)/);
      if (creditMatch && benefit.toLowerCase().includes('credit')) {
        effectiveFee -= parseInt(creditMatch[1]);
      }
    });

    return effectiveFee;
  }
}
