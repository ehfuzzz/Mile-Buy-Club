"use strict";
/**
 * Value Engine - Main Export
 * Award flight value calculation and booking instruction system
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsiderTips = exports.getFirstTimerTips = exports.getDifficultyExplanation = exports.generateQuickSteps = exports.generateBookingInstructions = exports.getAverageRedemptionValue = exports.estimateTransferTime = exports.calculateEffectiveRatio = exports.findTransferPaths = exports.canTransferDirect = exports.getTransferPartnersTo = exports.getTransferPartnersFrom = exports.getTransferPartner = exports.AVERAGE_REDEMPTION_VALUES = exports.TRANSFER_PARTNERS = exports.formatPoints = exports.formatCurrency = exports.shouldBookWithPoints = exports.compareDealOptions = exports.calculateValueWithTransfers = exports.calculateValue = exports.getValueRating = exports.calculateCPP = void 0;
// Types
__exportStar(require("./types"), exports);
// Calculator
var calculator_1 = require("./calculator");
Object.defineProperty(exports, "calculateCPP", { enumerable: true, get: function () { return calculator_1.calculateCPP; } });
Object.defineProperty(exports, "getValueRating", { enumerable: true, get: function () { return calculator_1.getValueRating; } });
Object.defineProperty(exports, "calculateValue", { enumerable: true, get: function () { return calculator_1.calculateValue; } });
Object.defineProperty(exports, "calculateValueWithTransfers", { enumerable: true, get: function () { return calculator_1.calculateValueWithTransfers; } });
Object.defineProperty(exports, "compareDealOptions", { enumerable: true, get: function () { return calculator_1.compareDealOptions; } });
Object.defineProperty(exports, "shouldBookWithPoints", { enumerable: true, get: function () { return calculator_1.shouldBookWithPoints; } });
Object.defineProperty(exports, "formatCurrency", { enumerable: true, get: function () { return calculator_1.formatCurrency; } });
Object.defineProperty(exports, "formatPoints", { enumerable: true, get: function () { return calculator_1.formatPoints; } });
// Transfer Partners
var transfer_partners_1 = require("./transfer-partners");
Object.defineProperty(exports, "TRANSFER_PARTNERS", { enumerable: true, get: function () { return transfer_partners_1.TRANSFER_PARTNERS; } });
Object.defineProperty(exports, "AVERAGE_REDEMPTION_VALUES", { enumerable: true, get: function () { return transfer_partners_1.AVERAGE_REDEMPTION_VALUES; } });
Object.defineProperty(exports, "getTransferPartner", { enumerable: true, get: function () { return transfer_partners_1.getTransferPartner; } });
Object.defineProperty(exports, "getTransferPartnersFrom", { enumerable: true, get: function () { return transfer_partners_1.getTransferPartnersFrom; } });
Object.defineProperty(exports, "getTransferPartnersTo", { enumerable: true, get: function () { return transfer_partners_1.getTransferPartnersTo; } });
Object.defineProperty(exports, "canTransferDirect", { enumerable: true, get: function () { return transfer_partners_1.canTransferDirect; } });
Object.defineProperty(exports, "findTransferPaths", { enumerable: true, get: function () { return transfer_partners_1.findTransferPaths; } });
Object.defineProperty(exports, "calculateEffectiveRatio", { enumerable: true, get: function () { return transfer_partners_1.calculateEffectiveRatio; } });
Object.defineProperty(exports, "estimateTransferTime", { enumerable: true, get: function () { return transfer_partners_1.estimateTransferTime; } });
Object.defineProperty(exports, "getAverageRedemptionValue", { enumerable: true, get: function () { return transfer_partners_1.getAverageRedemptionValue; } });
// Explainer
var explainer_1 = require("./explainer");
Object.defineProperty(exports, "generateBookingInstructions", { enumerable: true, get: function () { return explainer_1.generateBookingInstructions; } });
Object.defineProperty(exports, "generateQuickSteps", { enumerable: true, get: function () { return explainer_1.generateQuickSteps; } });
Object.defineProperty(exports, "getDifficultyExplanation", { enumerable: true, get: function () { return explainer_1.getDifficultyExplanation; } });
Object.defineProperty(exports, "getFirstTimerTips", { enumerable: true, get: function () { return explainer_1.getFirstTimerTips; } });
Object.defineProperty(exports, "getInsiderTips", { enumerable: true, get: function () { return explainer_1.getInsiderTips; } });
//# sourceMappingURL=index.js.map