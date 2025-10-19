import { CreditCard, UserProfile, CardRecommendation } from './types';
import cardDatabase from './card-database.data.json';
import { GapAnalyzer } from './gap-analyzer';
import { Explainer } from './explainer';

function estimateAnnualCreditValue(card: CreditCard): number {
  if (!card.credits || card.credits.length === 0) {
    return 0;
  }

  return card.credits.reduce((total, credit) => {
    if (!credit.amount || credit.amount.currency !== 'USD') {
      return total;
    }

    const amount = credit.amount.value;
    switch (credit.frequency.unit) {
      case 'MONTHLY':
        return total + amount * 12;
      case 'QUARTERLY':
        return total + amount * 4;
      case 'SEMIANNUAL':
        return total + amount * 2;
      case 'EVERY_N_YEARS':
        return total + amount / Math.max(credit.frequency.nYears ?? 1, 1);
      case 'ANNUAL':
      default:
        return total + amount;
    }
  }, 0);
}

export class CardRecommender {
  /**
   * Generate card recommendations for a user
   */
  static recommend(userProfile: UserProfile, maxRecommendations: number = 3): CardRecommendation[] {
    const userCardIds = new Set(
      userProfile.cards.filter((c) => !c.closed).map((c) => c.cardId)
    );

    const availableCards = (cardDatabase.cards as CreditCard[])
      .filter((card: any) => !userCardIds.has(card.cardId ?? card.id))
      .map((card: any) => card as CreditCard);

    const gaps = GapAnalyzer.identifyGaps(userProfile);
    const balance = GapAnalyzer.analyzeBalance(userProfile);

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

    return scoredCards.sort((a, b) => b.score - a.score).slice(0, maxRecommendations);
  }

  private static scoreCard(
    card: CreditCard,
    userProfile: UserProfile,
    gaps: any[],
    balance: any
  ): number {
    let score = 0;

    const gapsFilled = this.identifyFilledGaps(card, gaps);
    score += gapsFilled.length * 30;

    const highImportanceGaps = gapsFilled.filter(
      (g) => gaps.find((gap) => gap.program === g)?.importance === 'high'
    );
    score += highImportanceGaps.length * 20;

    const welcomeValue = card.welcomeOffer?.estimatedValueUsd ?? card.signupBonus.value;
    if (welcomeValue) {
      score += Math.min(welcomeValue / 50, 20);
    }

    score += Math.min(card.transferPartners.length * 2, 15);

    const effectiveFee = this.calculateEffectiveFee(card);
    if (effectiveFee > 200) score -= 10;
    if (effectiveFee < 0) score += 10;

    if (userProfile.preferences) {
      const { maxAnnualFee, valuationFocus, avoidIssuers } = userProfile.preferences;

      if (maxAnnualFee !== undefined && card.annualFee > maxAnnualFee) {
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

    if (!balance.hasNoFeeCard && card.annualFee === 0) {
      score += 15;
    }

    if (!balance.hasFlexiblePoints && card.transferPartners.length > 0) {
      score += 20;
    }

    return Math.max(0, Math.round(score));
  }

  private static identifyFilledGaps(card: CreditCard, gaps: any[]): string[] {
    const filled: string[] = [];
    const coverage = new Set<string>([card.rewardsProgram, ...(card.programs ?? []), ...card.transferPartners]);

    gaps.forEach((gap) => {
      if (coverage.has(gap.program)) {
        filled.push(gap.program);
      }
    });

    return Array.from(new Set(filled));
  }

  private static estimateAnnualValue(card: CreditCard, userProfile: UserProfile): number {
    let value = 0;

    const welcomeValue = card.welcomeOffer?.estimatedValueUsd ?? card.signupBonus.value;
    if (welcomeValue) {
      value += welcomeValue / 2;
    }

    const centsPerPoint = card.valuationCPP;

    if (userProfile.spendingPatterns && card.earn.length > 0) {
      const { travel = 5000, dining = 3000, hotels = 2000, other = 10000 } =
        userProfile.spendingPatterns;

      card.earn.forEach((rate) => {
        let annualSpend = other;
        if (rate.category.includes('travel')) annualSpend = travel;
        if (rate.category.includes('dining')) annualSpend = dining;
        if (rate.category.includes('hotel') || rate.category.includes('lodging'))
          annualSpend = hotels;
        if (rate.category.includes('airfare')) annualSpend = travel;

        const pointsEarned = annualSpend * rate.rateX;
        value += pointsEarned * (centsPerPoint / 100);
      });
    } else if (card.earn.length > 0) {
      const avgRate =
        card.earn.reduce((sum, r) => sum + r.rateX, 0) / card.earn.length;
      value += 20000 * avgRate * (centsPerPoint / 100);
    }

    return Math.round(value);
  }

  private static calculateEffectiveFee(card: CreditCard): number {
    let effectiveFee = card.annualFee;
    const annualCreditValue = estimateAnnualCreditValue(card);

    if (annualCreditValue > 0) {
      effectiveFee -= annualCreditValue;
    } else {
      card.benefits.forEach((benefit) => {
        const creditMatch = benefit.match(/\$(\d+)/);
        if (creditMatch && benefit.toLowerCase().includes('credit')) {
          effectiveFee -= parseInt(creditMatch[1], 10);
        }
      });
    }

    return Math.round(effectiveFee);
  }
}
