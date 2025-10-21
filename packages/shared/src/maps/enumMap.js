"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCabin = normalizeCabin;
exports.normalizeAlertMode = normalizeAlertMode;
exports.normalizeAlliance = normalizeAlliance;
exports.normalizePrefMode = normalizePrefMode;
const CABIN_MAP = {
    economy: 'Y',
    coach: 'Y',
    y: 'Y',
    main: 'Y',
    standard: 'Y',
    premium: 'W',
    'premium economy': 'W',
    w: 'W',
    business: 'J',
    biz: 'J',
    'biz class': 'J',
    'business class': 'J',
    j: 'J',
    first: 'F',
    'first class': 'F',
    f: 'F',
};
const ALERT_MODE_MAP = {
    high: 'HIGH_QUALITY',
    'high quality': 'HIGH_QUALITY',
    quality: 'HIGH_QUALITY',
    digest: 'DIGEST',
    summary: 'DIGEST',
    weekly: 'DIGEST',
};
const ALLIANCE_MAP = {
    star: 'STAR',
    'star alliance': 'STAR',
    oneworld: 'ONEWORLD',
    'one world': 'ONEWORLD',
    skyteam: 'SKYTEAM',
    'sky team': 'SKYTEAM',
    none: 'NONE',
    independent: 'NONE',
};
const PREF_MODE_MAP = {
    prefer: 'PREFER',
    favorite: 'PREFER',
    favourites: 'PREFER',
    love: 'PREFER',
    avoid: 'AVOID',
    dislike: 'AVOID',
    nope: 'AVOID',
};
function normalizeKey(value) {
    if (!value) {
        return null;
    }
    return value.trim().toLowerCase();
}
function normalizeCabin(value) {
    const normalized = normalizeKey(value);
    if (!normalized) {
        return null;
    }
    if (CABIN_MAP[normalized]) {
        return CABIN_MAP[normalized];
    }
    const direct = normalized.toUpperCase();
    if (direct === 'Y' || direct === 'W' || direct === 'J' || direct === 'F') {
        return direct;
    }
    return null;
}
function normalizeAlertMode(value) {
    const normalized = normalizeKey(value);
    if (!normalized) {
        return null;
    }
    if (ALERT_MODE_MAP[normalized]) {
        return ALERT_MODE_MAP[normalized];
    }
    const direct = normalized.replace(/[-\s]/g, '_').toUpperCase();
    if (direct === 'HIGH_QUALITY' || direct === 'DIGEST') {
        return direct;
    }
    return null;
}
function normalizeAlliance(value) {
    const normalized = normalizeKey(value);
    if (!normalized) {
        return null;
    }
    if (ALLIANCE_MAP[normalized]) {
        return ALLIANCE_MAP[normalized];
    }
    const direct = normalized.replace(/[-\s]/g, '').toUpperCase();
    if (direct === 'STAR' || direct === 'ONEWORLD' || direct === 'SKYTEAM' || direct === 'NONE') {
        return direct;
    }
    return null;
}
function normalizePrefMode(value) {
    const normalized = normalizeKey(value);
    if (!normalized) {
        return null;
    }
    if (PREF_MODE_MAP[normalized]) {
        return PREF_MODE_MAP[normalized];
    }
    const direct = normalized.toUpperCase();
    if (direct === 'PREFER' || direct === 'AVOID') {
        return direct;
    }
    return null;
}
//# sourceMappingURL=enumMap.js.map