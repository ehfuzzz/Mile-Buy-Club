/**
 * Transfer Partners Database
 * Static database of credit card to loyalty program transfer ratios
 */
import { TransferPartner } from './types';
/**
 * Comprehensive transfer partner relationships
 * Format: from_to with underscore separator
 */
export declare const TRANSFER_PARTNERS: Record<string, TransferPartner>;
/**
 * Get transfer partner relationship
 */
export declare function getTransferPartner(from: string, to: string): TransferPartner | null;
/**
 * Get all transfer partners for a source program
 */
export declare function getTransferPartnersFrom(from: string): TransferPartner[];
/**
 * Get all programs that can transfer to a destination
 */
export declare function getTransferPartnersTo(to: string): TransferPartner[];
/**
 * Check if direct transfer is possible
 */
export declare function canTransferDirect(from: string, to: string): boolean;
/**
 * Find all possible transfer paths (including multi-hop)
 * Limited to 2 hops maximum for practical purposes
 */
export declare function findTransferPaths(from: string, to: string, maxHops?: number): TransferPartner[][];
/**
 * Calculate effective ratio for a transfer path
 */
export declare function calculateEffectiveRatio(path: TransferPartner[]): number;
/**
 * Estimate total transfer time for a path
 */
export declare function estimateTransferTime(path: TransferPartner[]): string;
/**
 * Average redemption values by program (in cents per point/mile)
 * These are conservative baseline values based on analysis
 */
export declare const AVERAGE_REDEMPTION_VALUES: Record<string, number>;
/**
 * Get average redemption value for a program
 */
export declare function getAverageRedemptionValue(program: string): number;
//# sourceMappingURL=transfer-partners.d.ts.map