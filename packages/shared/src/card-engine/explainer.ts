import { CreditCard } from './types';

export class Explainer {
  /**
   * Generate human-readable reasons for recommending a card
   */
  static generateReasons(card: CreditCard, gaps: any[], balance: any): string[] {
    const reasons: string[] = [];

    // Gap filling reasons
    card.programs.forEach((program) => {
      const gap = gaps.find((g) => g.program === program);
      if (gap) {
        reasons.push(`Fills gap in ${program} coverage`);
      }
    });

    // Transfer partner reasons
    if (card.transferPartners.length > 5) {
      reasons.push(
        `Flexible: transfers to ${card.transferPartners.length}+ airline/hotel partners`
      );
    }

    // Bonus value reason
    if (card.signupBonus.value >= 800) {
      reasons.push(
        `High signup bonus: ${card.signupBonus.points.toLocaleString()} points worth $${card.signupBonus.value}`
      );
    }

    // Benefits reasons
    if (card.benefits.some((b) => b.toLowerCase().includes('lounge'))) {
      reasons.push(`Includes lounge access benefits`);
    }

    if (card.benefits.some((b) => b.toLowerCase().includes('credit'))) {
      reasons.push(`Annual credits help offset the fee`);
    }

    // No fee reason
    if (card.annualFee === 0) {
      reasons.push(`No annual fee - great for everyday spending`);
    }

    // CPP value reason
    if (card.valuationCPP >= 1.5) {
      reasons.push(
        `High point value: ${card.valuationCPP}¢ per point when transferred`
      );
    }

    // Portfolio balance reasons
    if (!balance.hasNoFeeCard && card.annualFee === 0) {
      reasons.push(`Adds a no-fee option to your portfolio`);
    }

    if (!balance.hasFlexiblePoints && card.transferPartners.length > 0) {
      reasons.push(`Brings flexible transfer options to your arsenal`);
    }

    // Limit to top 4 reasons
    return reasons.slice(0, 4);
  }

  /**
   * Generate "why this card" explanation
   */
  static generateExplanation(recommendation: any): string {
    const { card, gapsFilled, estimatedAnnualValue, effectiveAnnualFee } =
      recommendation;

    let explanation = `The ${card.name} is recommended because:\n\n`;

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
