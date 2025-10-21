"use strict";
/**
 * Value Calculator
 * Core engine for calculating award value and cents-per-point
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCPP = calculateCPP;
exports.getValueRating = getValueRating;
exports.calculateValue = calculateValue;
exports.calculateValueWithTransfers = calculateValueWithTransfers;
exports.compareDealOptions = compareDealOptions;
exports.shouldBookWithPoints = shouldBookWithPoints;
exports.formatCurrency = formatCurrency;
exports.formatPoints = formatPoints;
const transfer_partners_1 = require("./transfer-partners");
/**
 * Calculate cents per point (cpp) value
 */
function calculateCPP(awardPricing, cashPricing) {
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
function getValueRating(cpp) {
    if (cpp >= 2.5)
        return 'exceptional';
    if (cpp >= 2.0)
        return 'excellent';
    if (cpp >= 1.5)
        return 'very_good';
    if (cpp >= 1.2)
        return 'good';
    if (cpp >= 1.0)
        return 'fair';
    return 'poor';
}
/**
 * Calculate full value comparison
 */
function calculateValue(awardPricing, cashPricing, itinerary, options = {}) {
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
    const reasons = generateReasons(cpp, awardPricing, cashPricing, itinerary, dealQuality);
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
function getDealQuality(cpp, cabin, program) {
    const avgValue = (0, transfer_partners_1.getAverageRedemptionValue)(program);
    // Compare to average redemption for this program
    const vsAverage = cpp / avgValue;
    // Premium cabins should be held to higher standard
    const premiumCabin = cabin === 'business' || cabin === 'first';
    if (premiumCabin) {
        if (cpp >= 2.0 && vsAverage >= 1.3)
            return 'excellent';
        if (cpp >= 1.5 && vsAverage >= 1.0)
            return 'good';
        if (cpp >= 1.2)
            return 'fair';
        return 'poor';
    }
    else {
        // Economy cabins
        if (cpp >= 1.8 && vsAverage >= 1.5)
            return 'excellent';
        if (cpp >= 1.4 && vsAverage >= 1.2)
            return 'good';
        if (cpp >= 1.0)
            return 'fair';
        return 'poor';
    }
}
/**
 * Generate human-readable reasons for the valuation
 */
function generateReasons(cpp, awardPricing, cashPricing, itinerary, dealQuality) {
    const reasons = [];
    const avgValue = (0, transfer_partners_1.getAverageRedemptionValue)(awardPricing.program);
    // Value comparison
    if (cpp >= 2.0) {
        reasons.push(`Excellent value at ${cpp.toFixed(2)} cents per point`);
    }
    else if (cpp >= 1.5) {
        reasons.push(`Good value at ${cpp.toFixed(2)} cents per point`);
    }
    else if (cpp >= 1.0) {
        reasons.push(`Fair value at ${cpp.toFixed(2)} cents per point`);
    }
    else {
        reasons.push(`Below average value at ${cpp.toFixed(2)} cents per point`);
    }
    // Compare to program average
    const vsAverage = (cpp / avgValue) * 100 - 100;
    if (Math.abs(vsAverage) >= 20) {
        if (vsAverage > 0) {
            reasons.push(`${Math.round(vsAverage)}% better than typical ${awardPricing.program} redemption`);
        }
        else {
            reasons.push(`${Math.round(Math.abs(vsAverage))}% worse than typical ${awardPricing.program} redemption`);
        }
    }
    // Cabin considerations
    if (itinerary.cabin === 'business' || itinerary.cabin === 'first') {
        if (cpp >= 2.0) {
            reasons.push(`Outstanding value for premium cabin travel`);
        }
        else if (cpp < 1.5) {
            reasons.push(`Consider if premium cabin is worth the points cost`);
        }
    }
    // Surcharge warnings
    const surchargePercent = (awardPricing.totalCash / cashPricing.totalCost) * 100;
    if (surchargePercent > 30) {
        reasons.push(`High surcharges ($${(awardPricing.totalCash / 100).toFixed(2)}) reduce value`);
    }
    else if (surchargePercent < 10) {
        reasons.push(`Low surcharges make this an attractive redemption`);
    }
    // Transfer requirements
    if (awardPricing.transferRequired && awardPricing.transferFrom) {
        const transferPartner = (0, transfer_partners_1.getTransferPartner)(awardPricing.transferFrom, awardPricing.program);
        if (transferPartner) {
            if (transferPartner.transferTime === 'instant') {
                reasons.push(`Instant transfer from ${awardPricing.transferFrom}`);
            }
            else {
                reasons.push(`Requires transfer from ${awardPricing.transferFrom} (${transferPartner.transferTime})`);
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
    }
    else if (dealQuality === 'poor') {
        reasons.push(`Consider paying cash or waiting for better availability`);
    }
    return reasons;
}
/**
 * Calculate value with transfer scenarios
 * Useful for showing "what if you had X card" scenarios
 */
function calculateValueWithTransfers(baseProgram, pointsCost, surcharges, taxes, fees, cashPricing, itinerary) {
    const results = new Map();
    // Direct booking (no transfer)
    const directAward = {
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
        const transferPartner = (0, transfer_partners_1.getTransferPartner)(source, baseProgram);
        if (!transferPartner)
            continue;
        const effectiveRatio = (0, transfer_partners_1.calculateEffectiveRatio)([transferPartner]);
        const transferredPoints = Math.ceil(pointsCost / effectiveRatio);
        const transferAward = {
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
        results.set(`${source} → ${baseProgram}`, calculateValue(transferAward, cashPricing, itinerary));
    }
    return results;
}
/**
 * Find all programs that can transfer to the target
 */
function findAllTransferSources(target) {
    const sources = new Set();
    // Check all possible transfer paths
    const allPrograms = [
        'CHASE_UR',
        'AMEX_MR',
        'CITI_TYP',
        'CAPITAL_ONE',
        'BILT',
    ];
    for (const source of allPrograms) {
        const paths = (0, transfer_partners_1.findTransferPaths)(source, target, 1); // Direct only
        if (paths.length > 0) {
            sources.add(source);
        }
    }
    return Array.from(sources);
}
/**
 * Compare multiple award options for the same itinerary
 */
function compareDealOptions(options, cashPricing, itinerary) {
    return options
        .map(option => {
        const awardPricing = {
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
function shouldBookWithPoints(valueCalc, userPrograms) {
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
function formatCurrency(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}
/**
 * Format points with commas
 */
function formatPoints(points) {
    return points.toLocaleString();
}
//# sourceMappingURL=calculator.js.map