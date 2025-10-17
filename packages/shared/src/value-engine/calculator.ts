/**
 * Value Calculator
 * Core engine for calculating award value and cents-per-point
 */

import {
  AwardPricing,
  CashPricing,
  ValueCalculation,
  ValueRating,
  FlightItinerary,
  ValueComparisonOptions,
} from './types';
import {
  getTransferPartner,
  findTransferPaths,
  calculateEffectiveRatio,
  estimateTransferTime,
  getAverageRedemptionValue,
} from './transfer-partners';

/**
 * Calculate cents per point (cpp) value
 */
export function calculateCPP(
  awardPricing: AwardPricing,
  cashPricing: CashPricing
): number {
  // Value = (Cash Price - Taxes/Fees paid on award) / Points Cost
  const cashValue = cashPricing.totalCost;
  const awardCashOutlay = awardPricing.totalCash;
  const pointsCost = awardPricing.pointsCost;

  if (pointsCost === 0) {
    return 0;
  }

  const value = cashValue - awardCashOutlay;
  const cpp = value / pointsCost;

  return Math.max(0, cpp); // Never negative
}

/**
 * Determine value rating based on cpp
 */
export function getValueRating(cpp: number): ValueRating {
  if (cpp >= 2.5) return 'exceptional';
  if (cpp >= 2.0) return 'excellent';
  if (cpp >= 1.5) return 'very_good';
  if (cpp >= 1.2) return 'good';
  if (cpp >= 1.0) return 'fair';
  return 'poor';
}

/**
 * Calculate full value comparison
 */
export function calculateValue(
  awardPricing: AwardPricing,
  cashPricing: CashPricing,
  itinerary: FlightItinerary,
  options: ValueComparisonOptions = {}
): ValueCalculation {
  const cpp = calculateCPP(awardPricing, cashPricing);
  const valueRating = getValueRating(cpp);
  
  // Calculate savings
  const totalValue = cpp * awardPricing.pointsCost;
  const savings = cashPricing.totalCost - awardPricing.totalCash;
  const savingsPercent = cashPricing.totalCost > 0 
    ? (savings / cashPricing.totalCost) * 100 
    : 0;

  // Determine deal quality
  const dealQuality = getDealQuality(cpp, itinerary.cabin, awardPricing.program);
  const isGoodDeal = cpp >= 1.5 || (cpp >= 1.2 && itinerary.cabin !== 'economy');

  // Generate reasoning
  const reasons = generateReasons(
    cpp,
    awardPricing,
    cashPricing,
    itinerary,
    dealQuality
  );

  return {
    cpp,
    totalValue,
    valueRating,
    awardPricing,
    cashPricing,
    savings,
    savingsPercent,
    isGoodDeal,
    dealQuality,
    reasons,
  };
}

/**
 * Determine overall deal quality
 */
function getDealQuality(
  cpp: number,
  cabin: string,
  program: string
): 'excellent' | 'good' | 'fair' | 'poor' {
  const avgValue = getAverageRedemptionValue(program);
  
  // Compare to average redemption for this program
  const vsAverage = cpp / avgValue;
  
  // Premium cabins should be held to higher standard
  const premiumCabin = cabin === 'business' || cabin === 'first';
  
  if (premiumCabin) {
    if (cpp >= 2.0 && vsAverage >= 1.3) return 'excellent';
    if (cpp >= 1.5 && vsAverage >= 1.0) return 'good';
    if (cpp >= 1.2) return 'fair';
    return 'poor';
  } else {
    // Economy cabins
    if (cpp >= 1.8 && vsAverage >= 1.5) return 'excellent';
    if (cpp >= 1.4 && vsAverage >= 1.2) return 'good';
    if (cpp >= 1.0) return 'fair';
    return 'poor';
  }
}

/**
 * Generate human-readable reasons for the valuation
 */
function generateReasons(
  cpp: number,
  awardPricing: AwardPricing,
  cashPricing: CashPricing,
  itinerary: FlightItinerary,
  dealQuality: string
): string[] {
  const reasons: string[] = [];
  const avgValue = getAverageRedemptionValue(awardPricing.program);

  // Value comparison
  if (cpp >= 2.0) {
    reasons.push(`Excellent value at ${cpp.toFixed(2)} cents per point`);
  } else if (cpp >= 1.5) {
    reasons.push(`Good value at ${cpp.toFixed(2)} cents per point`);
  } else if (cpp >= 1.0) {
    reasons.push(`Fair value at ${cpp.toFixed(2)} cents per point`);
  } else {
    reasons.push(`Below average value at ${cpp.toFixed(2)} cents per point`);
  }

  // Compare to program average
  const vsAverage = (cpp / avgValue) * 100 - 100;
  if (Math.abs(vsAverage) >= 20) {
    if (vsAverage > 0) {
      reasons.push(
        `${Math.round(vsAverage)}% better than typical ${awardPricing.program} redemption`
      );
    } else {
      reasons.push(
        `${Math.round(Math.abs(vsAverage))}% worse than typical ${awardPricing.program} redemption`
      );
    }
  }

  // Cabin considerations
  if (itinerary.cabin === 'business' || itinerary.cabin === 'first') {
    if (cpp >= 2.0) {
      reasons.push(`Outstanding value for premium cabin travel`);
    } else if (cpp < 1.5) {
      reasons.push(`Consider if premium cabin is worth the points cost`);
    }
  }

  // Surcharge warnings
  const surchargePercent = (awardPricing.totalCash / cashPricing.totalCost) * 100;
  if (surchargePercent > 30) {
    reasons.push(
      `High surcharges ($${(awardPricing.totalCash / 100).toFixed(2)}) reduce value`
    );
  } else if (surchargePercent < 10) {
    reasons.push(`Low surcharges make this an attractive redemption`);
  }

  // Transfer requirements
  if (awardPricing.transferRequired && awardPricing.transferFrom) {
    const transferPartner = getTransferPartner(
      awardPricing.transferFrom,
      awardPricing.program
    );
    if (transferPartner) {
      if (transferPartner.transferTime === 'instant') {
        reasons.push(`Instant transfer from ${awardPricing.transferFrom}`);
      } else {
        reasons.push(
          `Requires transfer from ${awardPricing.transferFrom} (${transferPartner.transferTime})`
        );
      }
    }
  }

  // Route considerations
  const nonstop = itinerary.segments.length === 1;
  if (nonstop && cpp >= 1.5) {
    reasons.push(`Nonstop flight adds convenience`);
  }

  // Overall recommendation
  if (dealQuality === 'excellent') {
    reasons.push(`Book now - this is an exceptional deal`);
  } else if (dealQuality === 'poor') {
    reasons.push(`Consider paying cash or waiting for better availability`);
  }

  return reasons;
}

/**
 * Calculate value with transfer scenarios
 * Useful for showing "what if you had X card" scenarios
 */
export function calculateValueWithTransfers(
  baseProgram: string,
  pointsCost: number,
  surcharges: number,
  taxes: number,
  fees: number,
  cashPricing: CashPricing,
  itinerary: FlightItinerary
): Map<string, ValueCalculation> {
  const results = new Map<string, ValueCalculation>();

  // Direct booking (no transfer)
  const directAward: AwardPricing = {
    program: baseProgram,
    pointsCost,
    surcharges,
    taxes,
    fees,
    totalCash: surcharges + taxes + fees,
    transferRequired: false,
  };
  
  results.set(baseProgram, calculateValue(directAward, cashPricing, itinerary));

  // Calculate via transfer partners
  const transferSources = findAllTransferSources(baseProgram);
  
  for (const source of transferSources) {
    const transferPartner = getTransferPartner(source, baseProgram);
    if (!transferPartner) continue;

    const effectiveRatio = calculateEffectiveRatio([transferPartner]);
    const transferredPoints = Math.ceil(pointsCost / effectiveRatio);

    const transferAward: AwardPricing = {
      program: baseProgram,
      pointsCost: transferredPoints,
      surcharges,
      taxes,
      fees,
      totalCash: surcharges + taxes + fees,
      transferRequired: true,
      transferFrom: source,
      transferRatio: effectiveRatio,
      transferTime: transferPartner.transferTime,
    };

    results.set(
      `${source} → ${baseProgram}`,
      calculateValue(transferAward, cashPricing, itinerary)
    );
  }

  return results;
}

/**
 * Find all programs that can transfer to the target
 */
function findAllTransferSources(target: string): string[] {
  const sources = new Set<string>();
  
  // Check all possible transfer paths
  const allPrograms = [
    'CHASE_UR',
    'AMEX_MR',
    'CITI_TYP',
    'CAPITAL_ONE',
    'BILT',
  ];

  for (const source of allPrograms) {
    const paths = findTransferPaths(source, target, 1); // Direct only
    if (paths.length > 0) {
      sources.add(source);
    }
  }

  return Array.from(sources);
}

/**
 * Compare multiple award options for the same itinerary
 */
export function compareDealOptions(
  options: Array<{
    program: string;
    pointsCost: number;
    surcharges: number;
    taxes: number;
    fees: number;
  }>,
  cashPricing: CashPricing,
  itinerary: FlightItinerary
): ValueCalculation[] {
  return options
    .map(option => {
      const awardPricing: AwardPricing = {
        program: option.program,
        pointsCost: option.pointsCost,
        surcharges: option.surcharges,
        taxes: option.taxes,
        fees: option.fees,
        totalCash: option.surcharges + option.taxes + option.fees,
        transferRequired: false,
      };
      
      return calculateValue(awardPricing, cashPricing, itinerary);
    })
    .sort((a, b) => b.cpp - a.cpp); // Sort by best value first
}

/**
 * Determine if booking via points makes sense
 */
export function shouldBookWithPoints(
  valueCalc: ValueCalculation,
  userPrograms: string[]
): {
  recommendation: 'book' | 'maybe' | 'skip';
  reason: string;
} {
  const { cpp, awardPricing, dealQuality } = valueCalc;

  // Excellent deals - book!
  if (cpp >= 2.0 && dealQuality === 'excellent') {
    return {
      recommendation: 'book',
      reason: 'Outstanding value - book this immediately',
    };
  }

  // Good deals in premium cabins
  if (cpp >= 1.5 && (valueCalc.awardPricing.program.includes('business') || 
                     valueCalc.awardPricing.program.includes('first'))) {
    return {
      recommendation: 'book',
      reason: 'Great value for premium cabin - highly recommended',
    };
  }

  // Decent value
  if (cpp >= 1.3) {
    return {
      recommendation: 'maybe',
      reason: 'Solid redemption if you have the points to spare',
    };
  }

  // Transfer required and marginal value
  if (awardPricing.transferRequired && cpp < 1.5) {
    return {
      recommendation: 'skip',
      reason: 'Transfer required for only marginal value - consider cash',
    };
  }

  // Poor value
  if (cpp < 1.0 || dealQuality === 'poor') {
    return {
      recommendation: 'skip',
      reason: 'Better to pay cash or save points for better redemption',
    };
  }

  return {
    recommendation: 'maybe',
    reason: 'Fair value - depends on your points balance and preferences',
  };
}

/**
 * Format currency in cents to display string
 */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format points with commas
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}
