import { CreditCard } from './types';

export class Explainer {
  /**
   * Generate human-readable reasons for recommending a card
   */
  static generateReasons(card: CreditCard, gaps: any[], balance: any): string[] {
    const reasons: string[] = [];

    const coverage = new Set<string>([card.rewardsProgram, ...(card.programs ?? []), ...card.transferPartners]);
    coverage.forEach((program) => {
      const gap = gaps.find((g: any) => g.program === program);
      if (gap) {
        reasons.push(`Fills gap in ${program} coverage`);
      }
    });

    if (card.transferPartners.length > 5) {
      reasons.push(
        `Flexible: transfers to ${card.transferPartners.length}+ airline/hotel partners`
      );
    }

    const welcomeValue = card.welcomeOffer?.estimatedValueUsd ?? card.signupBonus.value;
    if (welcomeValue && welcomeValue >= 600) {
      reasons.push(
        `Welcome offer worth ~$${Math.round(welcomeValue)} when requirements are met`
      );
    }

    if (card.credits?.some((credit) => credit.type === 'AIRLINE_INCIDENTAL')) {
      reasons.push(`Includes airline incidental credits for seat fees & bags`);
    }

    if (card.credits?.some((credit) => credit.type === 'PORTAL_TRAVEL_CREDIT')) {
      reasons.push(`Portal travel credit helps offset the annual fee`);
    }

    if (card.perks?.some((perk) => perk.type === 'LOUNGE_ACCESS')) {
      reasons.push(`Includes lounge access benefits`);
    }

    if (card.annualFee === 0) {
      reasons.push(`No annual fee - great for everyday spending`);
    }

    if (!balance.hasNoFeeCard && card.annualFee === 0) {
      reasons.push(`Adds a no-fee option to your portfolio`);
    }

    if (!balance.hasFlexiblePoints && card.transferPartners.length > 0) {
      reasons.push(`Brings flexible transfer options to your arsenal`);
    }

    if (card.valuationCPP >= 1.5) {
      reasons.push(`High point value at ${card.valuationCPP}¢ per point`);
    }

    return reasons.slice(0, 4);
  }

  /**
   * Generate "why this card" explanation
   */
  static generateExplanation(recommendation: any): string {
    const { card, gapsFilled, estimatedAnnualValue, effectiveAnnualFee } = recommendation;

    let explanation = `The ${card.productName ?? card.name} is recommended because:\n\n`;

    if (gapsFilled.length > 0) {
      explanation += `It fills gaps in: ${gapsFilled.join(', ')}.\n\n`;
    }

    explanation += `Annual Value: ~$${estimatedAnnualValue}\n`;
    explanation += `Effective Fee: $${effectiveAnnualFee}\n`;
    explanation += `Net Benefit: $${estimatedAnnualValue - effectiveAnnualFee}\n\n`;

    explanation += `Key Benefits:\n`;
    card.benefits.slice(0, 3).forEach((benefit: string) => {
      explanation += `• ${benefit}\n`;
    });

    return explanation;
  }
}
