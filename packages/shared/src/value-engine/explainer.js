"use strict";
/**
 * Booking Instructions Explainer
 * Generates step-by-step instructions for booking award flights
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBookingInstructions = generateBookingInstructions;
exports.generateQuickSteps = generateQuickSteps;
exports.getDifficultyExplanation = getDifficultyExplanation;
exports.getFirstTimerTips = getFirstTimerTips;
exports.getInsiderTips = getInsiderTips;
const transfer_partners_1 = require("./transfer-partners");
/**
 * Generate booking instructions for an award flight
 */
function generateBookingInstructions(program, awardPricing, origin, destination, date) {
    const steps = [];
    let estimatedTime = 0;
    let difficulty = 'easy';
    const tips = [];
    // If transfer required, add transfer steps first
    if (awardPricing.transferRequired && awardPricing.transferFrom) {
        const transferSteps = generateTransferSteps(awardPricing.transferFrom, program, awardPricing.pointsCost);
        steps.push(...transferSteps.steps);
        estimatedTime += transferSteps.time;
        tips.push(...transferSteps.tips);
        if (transferSteps.difficulty === 'moderate') {
            difficulty = 'moderate';
        }
    }
    // Add program-specific booking steps
    const programSteps = getProgramBookingSteps(program, origin, destination, date);
    steps.push(...programSteps.steps);
    estimatedTime += programSteps.time;
    tips.push(...programSteps.tips);
    if (programSteps.difficulty === 'difficult') {
        difficulty = 'difficult';
    }
    else if (programSteps.difficulty === 'moderate' && difficulty === 'easy') {
        difficulty = 'moderate';
    }
    return {
        steps: steps.map((step, index) => ({ ...step, order: index + 1 })),
        estimatedTime,
        difficulty,
        tips,
        phoneNumber: programSteps.phoneNumber,
        typicalWaitTime: programSteps.waitTime,
    };
}
/**
 * Generate transfer steps
 */
function generateTransferSteps(from, to, pointsNeeded) {
    const transferPartner = (0, transfer_partners_1.getTransferPartner)(from, to);
    const steps = [];
    const tips = [];
    if (!transferPartner) {
        return { steps: [], time: 0, difficulty: 'easy', tips: [] };
    }
    const sourceDisplayName = getProgramDisplayName(from);
    const destDisplayName = getProgramDisplayName(to);
    const transferTime = transferPartner.transferTime;
    // Step 1: Log in to source program
    steps.push({
        order: 1,
        action: `Log in to ${sourceDisplayName}`,
        details: `Go to your ${from} account portal`,
        url: getProgramUrl(from),
    });
    // Step 2: Navigate to transfer section
    steps.push({
        order: 2,
        action: 'Navigate to transfer partners',
        details: `Find the "Transfer Points" or "Travel Partners" section`,
    });
    // Step 3: Select destination program
    steps.push({
        order: 3,
        action: `Select ${destDisplayName} as transfer partner`,
        details: `Choose ${to} from the list of airline/hotel partners`,
    });
    // Step 4: Enter details
    steps.push({
        order: 4,
        action: 'Enter transfer details',
        details: `Enter ${pointsNeeded.toLocaleString()} points and your ${to} member ID`,
    });
    // Step 5: Confirm transfer
    steps.push({
        order: 5,
        action: 'Confirm and submit transfer',
        details: `Review the details and submit. Transfer time: ${transferTime}`,
    });
    // Tips specific to transfers
    if (transferTime !== 'instant') {
        tips.push(`Plan ahead: transfers take ${transferTime} to complete`);
        tips.push(`Make sure you have availability confirmed before transferring`);
    }
    else {
        tips.push(`Transfers are instant - perfect for last-minute bookings`);
    }
    tips.push(`Double-check your ${to} member ID before transferring`);
    tips.push(`Transfers are usually non-reversible`);
    // Check for bonuses
    if (transferPartner.bonuses && transferPartner.bonuses.length > 0) {
        const bonus = transferPartner.bonuses[0];
        tips.push(`🎁 Transfer bonus available: ${bonus.description}`);
    }
    const time = transferTime === 'instant' ? 5 : 10;
    const difficulty = transferTime === 'instant' ? 'easy' : 'moderate';
    return { steps, time, difficulty, tips };
}
/**
 * Get program-specific booking steps
 */
function getProgramBookingSteps(program, origin, destination, date) {
    // Program-specific instructions
    const instructions = {
        UNITED: {
            steps: [
                {
                    action: 'Log in to United.com',
                    details: 'Sign in to your MileagePlus account',
                    url: 'https://www.united.com',
                },
                {
                    action: 'Search for award flights',
                    details: 'Enter your route and dates, then click "Find flights"',
                },
                {
                    action: 'Filter by award availability',
                    details: 'Toggle "Award" or "Miles" option to see award availability',
                },
                {
                    action: 'Select your flights',
                    details: 'Choose outbound and return flights showing saver or standard award pricing',
                },
                {
                    action: 'Review and book',
                    details: 'Check total miles and fees, then complete booking',
                },
            ],
            time: 15,
            difficulty: 'easy',
            tips: [
                'Saver awards offer best value',
                'United shows partner availability including Star Alliance',
                'Book online to avoid phone booking fees',
            ],
            phoneNumber: '1-800-864-8331',
            waitTime: '10-30 minutes',
        },
        CHASE_UR: {
            steps: [
                {
                    action: 'Log in to Chase Ultimate Rewards',
                    details: 'Go to your Chase credit card account',
                    url: 'https://www.chase.com/ultimaterewards',
                },
                {
                    action: 'Navigate to Travel Portal',
                    details: 'Click "Travel" then "Book a trip"',
                },
                {
                    action: 'Search for flights',
                    details: 'Enter your route and dates',
                },
                {
                    action: 'Choose redemption method',
                    details: 'Pay with points (1.25x or 1.5x value depending on card)',
                },
                {
                    action: 'Complete booking',
                    details: 'Review and confirm your reservation',
                },
            ],
            time: 10,
            difficulty: 'easy',
            tips: [
                'Sapphire Reserve gets 1.5x value, Preferred gets 1.25x',
                'Portal bookings earn airline miles',
                'Can be better to transfer to partners for premium cabins',
            ],
        },
        VIRGIN_ATLANTIC: {
            steps: [
                {
                    action: 'Log in to Virgin Atlantic',
                    details: 'Sign in to Flying Club account',
                    url: 'https://www.virginatlantic.com',
                },
                {
                    action: 'Search award flights',
                    details: 'Use the "Book with miles" option',
                },
                {
                    action: 'Check partner availability',
                    details: 'Virgin shows Delta and partner flights',
                },
                {
                    action: 'Call to book complex routes',
                    details: 'Online booking limited - call for best availability',
                },
            ],
            time: 20,
            difficulty: 'moderate',
            tips: [
                'Great for Delta One and ANA flights',
                'Call center can see more availability than online',
                'Peak/off-peak pricing affects cost',
            ],
            phoneNumber: '1-800-365-9500',
            waitTime: '20-45 minutes',
        },
        HYATT: {
            steps: [
                {
                    action: 'Log in to World of Hyatt',
                    details: 'Sign in to your account',
                    url: 'https://www.hyatt.com',
                },
                {
                    action: 'Search for hotels',
                    details: 'Enter destination and dates',
                },
                {
                    action: 'Filter by award stays',
                    details: 'Toggle "Use Points" to see point pricing',
                },
                {
                    action: 'Select room and book',
                    details: 'Choose room type and complete reservation',
                },
            ],
            time: 10,
            difficulty: 'easy',
            tips: [
                'Category 1-4 properties offer best value',
                'Free cancellation on most awards',
                'Can combine points + cash',
            ],
            phoneNumber: '1-800-304-9288',
            waitTime: '5-15 minutes',
        },
    };
    // Default generic steps if program not found
    const defaultSteps = {
        steps: [
            {
                action: `Log in to ${getProgramDisplayName(program)}`,
                details: 'Sign in to your loyalty account',
                url: getProgramUrl(program),
            },
            {
                action: 'Search for award availability',
                details: `Enter ${origin} to ${destination} on ${date.toLocaleDateString()}`,
            },
            {
                action: 'Select flights or hotel',
                details: 'Choose your preferred option from available inventory',
            },
            {
                action: 'Review pricing',
                details: 'Check total points cost and any taxes/fees',
            },
            {
                action: 'Complete booking',
                details: 'Enter passenger details and confirm reservation',
            },
        ],
        time: 15,
        difficulty: 'moderate',
        tips: [
            'Book as early as possible for best availability',
            'Check change and cancellation policies',
            'Save confirmation number',
        ],
    };
    return instructions[program] || defaultSteps;
}
/**
 * Get display name for program
 */
function getProgramDisplayName(code) {
    const names = {
        CHASE_UR: 'Chase Ultimate Rewards',
        AMEX_MR: 'American Express Membership Rewards',
        CITI_TYP: 'Citi ThankYou Points',
        CAPITAL_ONE: 'Capital One',
        BILT: 'Bilt Rewards',
        UNITED: 'United MileagePlus',
        AA: 'American Airlines AAdvantage',
        DELTA: 'Delta SkyMiles',
        SOUTHWEST: 'Southwest Rapid Rewards',
        JETBLUE: 'JetBlue TrueBlue',
        AIR_CANADA: 'Air Canada Aeroplan',
        VIRGIN_ATLANTIC: 'Virgin Atlantic Flying Club',
        SINGAPORE: 'Singapore Airlines KrisFlyer',
        MARRIOTT: 'Marriott Bonvoy',
        HILTON: 'Hilton Honors',
        HYATT: 'World of Hyatt',
        IHG: 'IHG One Rewards',
    };
    return names[code] || code;
}
/**
 * Get program website URL
 */
function getProgramUrl(code) {
    const urls = {
        CHASE_UR: 'https://www.chase.com/ultimaterewards',
        AMEX_MR: 'https://www.americanexpress.com/rewards',
        CITI_TYP: 'https://www.citi.com/thankyou',
        CAPITAL_ONE: 'https://www.capitalone.com/rewards',
        BILT: 'https://www.biltrewards.com',
        UNITED: 'https://www.united.com/mileageplus',
        AA: 'https://www.aa.com/aadvantage',
        DELTA: 'https://www.delta.com/skymiles',
        SOUTHWEST: 'https://www.southwest.com/rapidrewards',
        JETBLUE: 'https://www.jetblue.com/trueblue',
        AIR_CANADA: 'https://www.aircanada.com/aeroplan',
        VIRGIN_ATLANTIC: 'https://www.virginatlantic.com/flyingclub',
        SINGAPORE: 'https://www.singaporeair.com/krisflyer',
        MARRIOTT: 'https://www.marriott.com/bonvoy',
        HILTON: 'https://www.hilton.com/honors',
        HYATT: 'https://www.hyatt.com/world-of-hyatt',
        IHG: 'https://www.ihg.com/onerewards',
    };
    return urls[code] || '#';
}
/**
 * Generate simplified "Quick Steps" for experienced users
 */
function generateQuickSteps(program, transferRequired, transferFrom) {
    const steps = [];
    if (transferRequired && transferFrom) {
        steps.push(`Transfer points from ${getProgramDisplayName(transferFrom)} to ${getProgramDisplayName(program)}`);
    }
    steps.push(`Search ${getProgramDisplayName(program)} for award availability`);
    steps.push('Select flights and review pricing');
    steps.push('Complete booking');
    return steps;
}
/**
 * Get booking difficulty explanation
 */
function getDifficultyExplanation(difficulty) {
    const explanations = {
        easy: 'Straightforward online booking with clear interface',
        moderate: 'May require phone call or multiple steps, but manageable',
        difficult: 'Complex booking process, often requires phone call with wait times',
    };
    return explanations[difficulty];
}
/**
 * Generate tips for first-time award bookers
 */
function getFirstTimerTips() {
    return [
        'Check availability before transferring points - transfers are usually irreversible',
        'Screenshot or save confirmation numbers immediately',
        'Set calendar reminders for check-in (24 hours before departure)',
        'Understand cancellation policies - most award tickets can be changed for a fee',
        'Call airline after booking to request seat assignments and add frequent flier numbers',
        'Book partner flights as soon as possible - award availability can disappear quickly',
        'Consider travel insurance for expensive redemptions',
    ];
}
/**
 * Generate program-specific insider tips
 */
function getInsiderTips(program) {
    const tips = {
        UNITED: [
            'Use ExpertFlyer or AwardHacker to check partner availability',
            'Book 337 days out for best availability',
            'Excursionist Perk allows free one-way on multi-city trips',
        ],
        CHASE_UR: [
            'Compare portal pricing vs transfer partners for each trip',
            'Premium cabins usually better with transfer partners',
            'Portal bookings count as revenue tickets (earn miles)',
        ],
        VIRGIN_ATLANTIC: [
            'Best for booking Delta One and ANA First Class',
            'Call for better availability than shown online',
            'Peak vs off-peak dates significantly affect pricing',
        ],
        HYATT: [
            'Best sweet spots: Category 1-4 properties',
            'Free cancellation until day of check-in',
            'Points + Cash option can stretch points further',
        ],
    };
    return tips[program] || [];
}
//# sourceMappingURL=explainer.js.map