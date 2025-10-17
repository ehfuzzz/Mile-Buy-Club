/**
 * Transfer Partners Database
 * Static database of credit card to loyalty program transfer ratios
 */

import { TransferPartner } from './types';

/**
 * Comprehensive transfer partner relationships
 * Format: from_to with underscore separator
 */
export const TRANSFER_PARTNERS: Record<string, TransferPartner> = {
  // ============================================================================
  // CHASE ULTIMATE REWARDS TRANSFERS
  // ============================================================================
  
  'CHASE_UR_UNITED': {
    from: 'CHASE_UR',
    to: 'UNITED',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CHASE_UR_SOUTHWEST': {
    from: 'CHASE_UR',
    to: 'SOUTHWEST',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CHASE_UR_JETBLUE': {
    from: 'CHASE_UR',
    to: 'JETBLUE',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CHASE_UR_AIR_CANADA': {
    from: 'CHASE_UR',
    to: 'AIR_CANADA',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CHASE_UR_VIRGIN_ATLANTIC': {
    from: 'CHASE_UR',
    to: 'VIRGIN_ATLANTIC',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CHASE_UR_SINGAPORE': {
    from: 'CHASE_UR',
    to: 'SINGAPORE',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CHASE_UR_HYATT': {
    from: 'CHASE_UR',
    to: 'HYATT',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CHASE_UR_MARRIOTT': {
    from: 'CHASE_UR',
    to: 'MARRIOTT',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CHASE_UR_IHG': {
    from: 'CHASE_UR',
    to: 'IHG',
    ratio: 1.0,
    transferTime: 'instant',
  },

  // ============================================================================
  // AMEX MEMBERSHIP REWARDS TRANSFERS
  // ============================================================================
  
  'AMEX_MR_DELTA': {
    from: 'AMEX_MR',
    to: 'DELTA',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'AMEX_MR_JETBLUE': {
    from: 'AMEX_MR',
    to: 'JETBLUE',
    ratio: 1.0,
    transferTime: 'instant',
    bonuses: [
      {
        multiplier: 1.3,
        minTransfer: 1000,
        description: '30% bonus on transfers (periodic promotion)',
      },
    ],
  },
  'AMEX_MR_AIR_CANADA': {
    from: 'AMEX_MR',
    to: 'AIR_CANADA',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'AMEX_MR_VIRGIN_ATLANTIC': {
    from: 'AMEX_MR',
    to: 'VIRGIN_ATLANTIC',
    ratio: 1.0,
    transferTime: 'instant',
    bonuses: [
      {
        multiplier: 1.3,
        minTransfer: 1000,
        description: '30% bonus on transfers (periodic promotion)',
      },
    ],
  },
  'AMEX_MR_SINGAPORE': {
    from: 'AMEX_MR',
    to: 'SINGAPORE',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'AMEX_MR_HILTON': {
    from: 'AMEX_MR',
    to: 'HILTON',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'AMEX_MR_MARRIOTT': {
    from: 'AMEX_MR',
    to: 'MARRIOTT',
    ratio: 1.0,
    transferTime: 'instant',
  },

  // ============================================================================
  // CITI THANKYOU POINTS TRANSFERS
  // ============================================================================
  
  'CITI_TYP_JETBLUE': {
    from: 'CITI_TYP',
    to: 'JETBLUE',
    ratio: 1.0,
    transferTime: '1-2 days',
  },
  'CITI_TYP_VIRGIN_ATLANTIC': {
    from: 'CITI_TYP',
    to: 'VIRGIN_ATLANTIC',
    ratio: 1.0,
    transferTime: '1-2 days',
  },
  'CITI_TYP_SINGAPORE': {
    from: 'CITI_TYP',
    to: 'SINGAPORE',
    ratio: 1.0,
    transferTime: '1-2 days',
  },
  'CITI_TYP_MARRIOTT': {
    from: 'CITI_TYP',
    to: 'MARRIOTT',
    ratio: 1.0,
    transferTime: '1-2 days',
  },

  // ============================================================================
  // CAPITAL ONE MILES TRANSFERS
  // ============================================================================
  
  'CAPITAL_ONE_UNITED': {
    from: 'CAPITAL_ONE',
    to: 'UNITED',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CAPITAL_ONE_JETBLUE': {
    from: 'CAPITAL_ONE',
    to: 'JETBLUE',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CAPITAL_ONE_AIR_CANADA': {
    from: 'CAPITAL_ONE',
    to: 'AIR_CANADA',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CAPITAL_ONE_VIRGIN_ATLANTIC': {
    from: 'CAPITAL_ONE',
    to: 'VIRGIN_ATLANTIC',
    ratio: 1.0,
    transferTime: 'instant',
  },
  'CAPITAL_ONE_SINGAPORE': {
    from: 'CAPITAL_ONE',
    to: 'SINGAPORE',
    ratio: 1.0,
    transferTime: 'instant',
  },

  // ============================================================================
  // BILT REWARDS TRANSFERS
  // ============================================================================
  
  'BILT_UNITED': {
    from: 'BILT',
    to: 'UNITED',
    ratio: 1.0,
    transferTime: '1-2 days',
  },
  'BILT_AA': {
    from: 'BILT',
    to: 'AA',
    ratio: 1.0,
    transferTime: '1-2 days',
  },
  'BILT_AIR_CANADA': {
    from: 'BILT',
    to: 'AIR_CANADA',
    ratio: 1.0,
    transferTime: '1-2 days',
  },
  'BILT_VIRGIN_ATLANTIC': {
    from: 'BILT',
    to: 'VIRGIN_ATLANTIC',
    ratio: 1.0,
    transferTime: '1-2 days',
  },
  'BILT_HYATT': {
    from: 'BILT',
    to: 'HYATT',
    ratio: 1.0,
    transferTime: '1-2 days',
  },
};

/**
 * Get transfer partner relationship
 */
export function getTransferPartner(from: string, to: string): TransferPartner | null {
  const key = `${from}_${to}`;
  return TRANSFER_PARTNERS[key] || null;
}

/**
 * Get all transfer partners for a source program
 */
export function getTransferPartnersFrom(from: string): TransferPartner[] {
  return Object.values(TRANSFER_PARTNERS).filter(tp => tp.from === from);
}

/**
 * Get all programs that can transfer to a destination
 */
export function getTransferPartnersTo(to: string): TransferPartner[] {
  return Object.values(TRANSFER_PARTNERS).filter(tp => tp.to === to);
}

/**
 * Check if direct transfer is possible
 */
export function canTransferDirect(from: string, to: string): boolean {
  return getTransferPartner(from, to) !== null;
}

/**
 * Find all possible transfer paths (including multi-hop)
 * Limited to 2 hops maximum for practical purposes
 */
export function findTransferPaths(
  from: string,
  to: string,
  maxHops: number = 2
): TransferPartner[][] {
  const paths: TransferPartner[][] = [];

  // Direct transfer
  const direct = getTransferPartner(from, to);
  if (direct) {
    paths.push([direct]);
  }

  if (maxHops >= 2) {
    // Two-hop transfers (not common but possible)
    const firstHops = getTransferPartnersFrom(from);
    for (const firstHop of firstHops) {
      const secondHop = getTransferPartner(firstHop.to, to);
      if (secondHop) {
        paths.push([firstHop, secondHop]);
      }
    }
  }

  return paths;
}

/**
 * Calculate effective ratio for a transfer path
 */
export function calculateEffectiveRatio(path: TransferPartner[]): number {
  return path.reduce((ratio, partner) => ratio * partner.ratio, 1.0);
}

/**
 * Estimate total transfer time for a path
 */
export function estimateTransferTime(path: TransferPartner[]): string {
  const hasDelay = path.some(p => p.transferTime !== 'instant');
  
  if (!hasDelay) {
    return 'instant';
  }
  
  // Parse and sum up the times
  let totalDays = 0;
  for (const partner of path) {
    if (partner.transferTime === 'instant') {
      continue;
    } else if (partner.transferTime === '1-2 days') {
      totalDays += 2; // Use max
    } else if (partner.transferTime === '3-5 days') {
      totalDays += 5;
    } else if (partner.transferTime === '5-7 days') {
      totalDays += 7;
    }
  }
  
  if (totalDays <= 2) {
    return '1-2 days';
  } else if (totalDays <= 5) {
    return '3-5 days';
  } else if (totalDays <= 7) {
    return '5-7 days';
  } else {
    return `${totalDays} days`;
  }
}

/**
 * Average redemption values by program (in cents per point/mile)
 * These are conservative baseline values based on analysis
 */
export const AVERAGE_REDEMPTION_VALUES: Record<string, number> = {
  // Airlines
  AA: 1.4,
  DELTA: 1.2,
  UNITED: 1.3,
  SOUTHWEST: 1.4,
  JETBLUE: 1.3,
  AIR_CANADA: 1.5,
  VIRGIN_ATLANTIC: 1.8,
  SINGAPORE: 2.0,
  
  // Hotels
  MARRIOTT: 0.8,
  HILTON: 0.5,
  HYATT: 1.7,
  IHG: 0.6,
  
  // Credit Card Points
  CHASE_UR: 1.5, // Via portal or transfers
  AMEX_MR: 1.5,
  CITI_TYP: 1.3,
  CAPITAL_ONE: 1.0, // Flat rate
  BILT: 1.5,
};

/**
 * Get average redemption value for a program
 */
export function getAverageRedemptionValue(program: string): number {
  return AVERAGE_REDEMPTION_VALUES[program] || 1.0;
}
