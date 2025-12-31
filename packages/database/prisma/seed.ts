import {
  PrismaClient,
  LocationKind,
  AlertMode,
  Alliance,
  LoyaltyKind,
  DestMode,
  TripStyle,
  InterestTag,
  PrefMode,
} from '@prisma/client';
import cardCatalogJson from '../../shared/src/card-engine/card-database.data.json';

interface CardCatalog {
  cards: SeedCard[];
}

interface SeedCard {
  id?: string;
  cardId?: string;
  name?: string;
  productName?: string;
  issuer: string;
  network: string;
  annualFeeUsd?: number;
  annualFee?: number;
  rewardsProgram: string;
  pointValueCents?: number;
  valuationCPP?: number;
  welcomeOffer?: Record<string, unknown>;
  signupBonus?: {
    points?: number;
    requirement?: string;
    value?: number;
  };
  programs?: string[];
  benefits?: string[];
  bestFor?: string[];
  earn?: Array<{ category: string; rateX: number }>;
  transferPartners?: string[];
  credits?: Array<{
    creditId: string;
    title: string;
    type: string;
    amount: { currency: string; value: number };
    frequency: { unit: string; resetRule: string; nYears?: number };
    eligibility?: Record<string, unknown>;
    recognition?: Record<string, unknown>;
  }>;
  perks?: Record<string, unknown>[];
  protections?: Record<string, unknown>[];
  sourceOfTruthUrl?: string;
  lastVerifiedUtc?: string;
}

const cardCatalog = cardCatalogJson as CardCatalog;

const locationSeeds = [
  {
    kind: LocationKind.AIRPORT,
    iata: 'JFK',
    name: 'John F. Kennedy International Airport',
    countryCode: 'US',
    regionCode: 'NY',
    lat: 40.6413,
    lon: -73.7781,
  },
  {
    kind: LocationKind.AIRPORT,
    iata: 'EWR',
    name: 'Newark Liberty International Airport',
    countryCode: 'US',
    regionCode: 'NJ',
    lat: 40.6895,
    lon: -74.1745,
  },
  {
    kind: LocationKind.CITY,
    iata: 'NYC',
    name: 'New York City',
    countryCode: 'US',
    regionCode: 'NY',
  },
  {
    kind: LocationKind.AIRPORT,
    iata: 'LIS',
    name: 'Lisbon Humberto Delgado Airport',
    countryCode: 'PT',
    lat: 38.7742,
    lon: -9.1342,
  },
  {
    kind: LocationKind.AIRPORT,
    iata: 'CDG',
    name: 'Paris Charles de Gaulle Airport',
    countryCode: 'FR',
    lat: 49.0097,
    lon: 2.5479,
  },
  {
    kind: LocationKind.CITY,
    iata: 'PAR',
    name: 'Paris',
    countryCode: 'FR',
  },
  {
    kind: LocationKind.REGION,
    iata: null,
    name: 'Europe',
    countryCode: 'EU',
    regionCode: 'EU',
  },
  {
    kind: LocationKind.REGION,
    iata: null,
    name: 'North America',
    countryCode: 'US',
    regionCode: 'NA',
  },
];

const airlineSeeds = [
  { code2: 'UA', name: 'United Airlines', alliance: Alliance.STAR },
  { code2: 'AC', name: 'Air Canada', alliance: Alliance.STAR },
  { code2: 'LH', name: 'Lufthansa', alliance: Alliance.STAR },
  { code2: 'NH', name: 'ANA All Nippon Airways', alliance: Alliance.STAR },
  { code2: 'SQ', name: 'Singapore Airlines', alliance: Alliance.STAR },
  { code2: 'AA', name: 'American Airlines', alliance: Alliance.ONEWORLD },
  { code2: 'BA', name: 'British Airways', alliance: Alliance.ONEWORLD },
  { code2: 'JL', name: 'Japan Airlines', alliance: Alliance.ONEWORLD },
  { code2: 'QR', name: 'Qatar Airways', alliance: Alliance.ONEWORLD },
  { code2: 'CX', name: 'Cathay Pacific', alliance: Alliance.ONEWORLD },
  { code2: 'DL', name: 'Delta Air Lines', alliance: Alliance.SKYTEAM },
  { code2: 'AF', name: 'Air France', alliance: Alliance.SKYTEAM },
  { code2: 'KL', name: 'KLM Royal Dutch Airlines', alliance: Alliance.SKYTEAM },
  { code2: 'KE', name: 'Korean Air', alliance: Alliance.SKYTEAM },
  { code2: 'AM', name: 'Aeromexico', alliance: Alliance.SKYTEAM },
  { code2: 'EK', name: 'Emirates', alliance: Alliance.NONE },
  { code2: 'EY', name: 'Etihad Airways', alliance: Alliance.NONE },
  { code2: 'QF', name: 'Qantas Airways', alliance: Alliance.ONEWORLD },
  { code2: 'TK', name: 'Turkish Airlines', alliance: Alliance.STAR },
  { code2: 'VS', name: 'Virgin Atlantic', alliance: Alliance.NONE },
  { code2: 'B6', name: 'JetBlue Airways', alliance: Alliance.NONE },
  { code2: 'WN', name: 'Southwest Airlines', alliance: Alliance.NONE },
];

const hotelProgramSeeds = [
  { id: 'HYATT', name: 'World of Hyatt' },
  { id: 'MARRIOTT', name: 'Marriott Bonvoy' },
  { id: 'HILTON', name: 'Hilton Honors' },
  { id: 'IHG', name: 'IHG One Rewards' },
  { id: 'ACCOR', name: 'Accor Live Limitless' },
  { id: 'CHOICE', name: 'Choice Privileges' },
  { id: 'RADISSON', name: 'Radisson Rewards' },
  { id: 'WYNDHAM', name: 'Wyndham Rewards' },
  { id: 'MELIA', name: 'MeliaRewards' },
  { id: 'FOUR_SEASONS', name: 'Four Seasons Preferred Partner' },
];

const loyaltyProgramSeeds = [
  { id: 'AEROPLAN', name: 'Air Canada Aeroplan', kind: LoyaltyKind.AIR },
  { id: 'MILEAGEPLUS', name: 'United MileagePlus', kind: LoyaltyKind.AIR },
  { id: 'AADVANTAGE', name: 'American Airlines AAdvantage', kind: LoyaltyKind.AIR },
  { id: 'SKYMILES', name: 'Delta SkyMiles', kind: LoyaltyKind.AIR },
  { id: 'EXECUTIVE_CLUB', name: 'British Airways Executive Club', kind: LoyaltyKind.AIR },
  { id: 'KRISFLYER', name: 'Singapore Airlines KrisFlyer', kind: LoyaltyKind.AIR },
  { id: 'AVIOS', name: 'Avios', kind: LoyaltyKind.AIR },
  { id: 'HYATT_POINTS', name: 'World of Hyatt', kind: LoyaltyKind.HOTEL },
  { id: 'MARRIOTT_POINTS', name: 'Marriott Bonvoy', kind: LoyaltyKind.HOTEL },
  { id: 'HILTON_POINTS', name: 'Hilton Honors', kind: LoyaltyKind.HOTEL },
  { id: 'IHG_POINTS', name: 'IHG One Rewards', kind: LoyaltyKind.HOTEL },
];

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data
  await prisma.savedDeal.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.watcher.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.userCreditCard.deleteMany();
  await prisma.userCard.deleteMany();
  await prisma.cardCreditDefinition.deleteMany();
  await prisma.cardEarnRate.deleteMany();
  await prisma.cardTransferPartner.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.cardCatalog.deleteMany();
  await prisma.userLoyaltyBalance.deleteMany();
  await prisma.loyaltyProgram.deleteMany();
  await prisma.userHotelProgramPref.deleteMany();
  await prisma.userAlliancePref.deleteMany();
  await prisma.userAirlinePref.deleteMany();
  await prisma.userAccessibility.deleteMany();
  await prisma.userDietary.deleteMany();
  await prisma.userInterest.deleteMany();
  await prisma.userTripStyle.deleteMany();
  await prisma.userDestinationPref.deleteMany();
  await prisma.userHomeBase.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.onboardingMessage.deleteMany();
  await prisma.onboardingSession.deleteMany();
  await prisma.onboardingUserState.deleteMany();
  await prisma.location.deleteMany();
  await prisma.airline.deleteMany();
  await prisma.hotelProgram.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.event.deleteMany();
  await prisma.analytics.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      id: 'demo-user',
      email: 'demo@milebyclub.com',
      name: 'Demo User',
      bio: 'Award flight seeker',
      timezone: 'America/New_York',
      notificationPreference: 'daily',
    },
  });

  console.log(`✅ Created demo user: ${user.email}`);

  await prisma.onboardingUserState.create({
    data: {
      userId: user.id,
      state: {
        version: 1,
        onboarding: {
          status: 'new',
          startedAt: new Date().toISOString(),
        },
        profile: {},
        travelPrefs: { homeAirports: [] },
        points: { programs: [], transferPreferences: [] },
        hotelPrefs: { chains: [] },
        constraints: {},
      },
      version: 1,
    },
  });

  await prisma.location.createMany({ data: locationSeeds });
  console.log(`✅ Seeded ${locationSeeds.length} locations`);

  await prisma.airline.createMany({ data: airlineSeeds });
  console.log(`✅ Seeded ${airlineSeeds.length} airlines`);

  await prisma.hotelProgram.createMany({ data: hotelProgramSeeds });
  console.log(`✅ Seeded ${hotelProgramSeeds.length} hotel programs`);

  await prisma.loyaltyProgram.createMany({ data: loyaltyProgramSeeds });
  console.log(`✅ Seeded ${loyaltyProgramSeeds.length} loyalty programs`);

  const profile = await prisma.userProfile.create({
    data: {
      userId: user.id,
      alertMode: AlertMode.HIGH_QUALITY,
      timezone: 'America/New_York',
      mixedAirlinesOk: true,
      openJawOk: false,
    },
  });

  const nyc = await prisma.location.findFirstOrThrow({ where: { iata: 'NYC' } });
  const lis = await prisma.location.findFirstOrThrow({ where: { iata: 'LIS' } });
  const cdg = await prisma.location.findFirstOrThrow({ where: { iata: 'CDG' } });

  await prisma.userHomeBase.create({
    data: {
      userId: user.id,
      locationId: nyc.id,
      source: 'SEED',
    },
  });

  await prisma.userDestinationPref.createMany({
    data: [
      {
        userId: user.id,
        locationId: lis.id,
        mode: DestMode.WISH,
        notes: 'Dream trip to Portugal',
      },
      {
        userId: user.id,
        locationId: cdg.id,
        mode: DestMode.AVOID,
        notes: 'Avoid CDG connections',
      },
    ],
  });

  await prisma.userTripStyle.createMany({
    data: [
      { userId: user.id, style: TripStyle.CITY },
      { userId: user.id, style: TripStyle.PACE_CHILL },
    ],
  });

  await prisma.userInterest.createMany({
    data: [
      { userId: user.id, tag: InterestTag.FOOD_TOURS },
      { userId: user.id, tag: InterestTag.MUSEUMS },
    ],
  });

  await prisma.userAirlinePref.create({
    data: {
      userId: user.id,
      code2: 'UA',
      mode: PrefMode.PREFER,
    },
  });

  await prisma.userAlliancePref.create({
    data: {
      userId: user.id,
      alliance: Alliance.STAR,
      mode: PrefMode.PREFER,
    },
  });

  await prisma.userHotelProgramPref.create({
    data: {
      userId: user.id,
      programId: 'HYATT',
      mode: PrefMode.PREFER,
    },
  });

  await prisma.userLoyaltyBalance.create({
    data: {
      userId: profile.userId,
      programId: 'AEROPLAN',
      approxPoints: 85000,
    },
  });

  await prisma.userLoyaltyBalance.create({
    data: {
      userId: profile.userId,
      programId: 'HYATT_POINTS',
      approxPoints: 120000,
    },
  });

  // Create credit cards
  const cardsData = cardCatalog.cards as SeedCard[];
  const catalogEntries = cardsData.slice(0, 25).map((cardData, index) => ({
    cardId:
      cardData.cardId ??
      cardData.id ??
      (cardData.name ? cardData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : `card_${index}`),
    issuer: cardData.issuer,
    productName: cardData.productName ?? cardData.name ?? 'Unknown Card',
  }));

  if (catalogEntries.length > 0) {
    await prisma.cardCatalog.createMany({ data: catalogEntries, skipDuplicates: true });
    console.log(`✅ Seeded ${catalogEntries.length} card catalog entries`);
  }
  const cards = await Promise.all(
    cardsData.map(async (cardData) => {
      const cardId = cardData.cardId ?? cardData.id;
      const annualFee = Math.round(cardData.annualFeeUsd ?? cardData.annualFee ?? 0);

      return prisma.creditCard.create({
        data: {
          cardId,
          issuer: cardData.issuer,
          network: cardData.network,
          productName: cardData.productName ?? cardData.name,
          annualFeeUsd: annualFee,
          rewardsProgram: cardData.rewardsProgram,
          pointValueCents: cardData.pointValueCents ?? cardData.valuationCPP ?? null,
          welcomeOffer: cardData.welcomeOffer ?? {
            points: cardData.signupBonus?.points ?? 0,
            requirement: cardData.signupBonus?.requirement ?? '',
            value: cardData.signupBonus?.value ?? 0,
          },
          metadata: {
            programs: cardData.programs,
            benefits: cardData.benefits,
            bestFor: cardData.bestFor,
            signupBonus: cardData.signupBonus,
            valuationCPP: cardData.valuationCPP,
          },
          perks: cardData.perks ?? [],
          protections: cardData.protections ?? [],
          sourceOfTruthUrl: cardData.sourceOfTruthUrl ?? null,
          lastVerifiedUtc: cardData.lastVerifiedUtc
            ? new Date(cardData.lastVerifiedUtc)
            : null,
          earnRates: {
            create: (cardData.earn ?? []).map((rate) => ({
              category: rate.category,
              rateX: rate.rateX,
            })),
          },
          transferPartners: {
            create: (cardData.transferPartners ?? []).map((partner: string) => ({
              partner,
            })),
          },
          credits: {
            create: (cardData.credits ?? []).map((credit) => ({
              creditId: credit.creditId,
              title: credit.title,
              type: credit.type,
              amountCurrency: credit.amount.currency,
              amountValue: credit.amount.value,
              frequencyUnit: credit.frequency.unit,
              frequencyResetRule: credit.frequency.resetRule,
              frequencyNYears: credit.frequency.nYears ?? null,
              eligibility: credit.eligibility ?? undefined,
              recognition: credit.recognition ?? undefined,
            })),
          },
        },
      });
    })
  );

  console.log(`✅ Created ${cards.length} credit cards`);

  // Link user to a sample card for demos
  if (cards.length > 0) {
    const primaryCard = cards[0];
    await prisma.userCreditCard.create({
      data: {
        userId: user.id,
        cardId: primaryCard.cardId,
        lastFourDigits: '1234',
        expiryMonth: 12,
        expiryYear: 2026,
        isPrimary: true,
      },
    });
    console.log('✅ Linked user to primary demo credit card');
  }

  if (catalogEntries.length > 0) {
    await prisma.userCard.create({
      data: {
        userId: profile.userId,
        cardId: catalogEntries[0].cardId,
        openedAt: new Date(),
      },
    });
    console.log('✅ Linked user profile to card catalog entry');
  }

  // Create a watcher
  const watcher = await prisma.watcher.create({
    data: {
      userId: user.id,
      name: 'New York to London',
      type: 'flight',
      description: 'Looking for business class awards to London',
      frequency: 'daily',
      minScore: 80.0,
      searchParams: {
        origin: 'JFK',
        destination: 'LHR',
        cabin: 'business',
        passengers: 1,
      },
    },
  });

  console.log(`✅ Created watcher: ${watcher.name}`);

  // Create sample deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        watcherId: watcher.id,
        userId: user.id,
        title: 'UA to London Business Class - 120k miles',
        type: 'flight',
        origin: 'JFK',
        destination: 'LHR',
        cabin: 'business',
        airline: 'United',
        price: 12000,
        milesRequired: 120000,
        cpp: 10.0,
        score: 85.5,
        status: 'active',
        bookingUrl: 'https://www.united.com',
        provider: 'united',
        primaryPricingType: 'award',
        pricingOptions: [
          {
            type: 'award',
            miles: 120000,
            cashAmount: 5.6,
            cashCurrency: 'USD',
            provider: 'united',
          },
          {
            type: 'cash',
            cashAmount: 4800,
            cashCurrency: 'USD',
            provider: 'united',
          },
        ],
        cashPrice: 4800,
        cashCurrency: 'USD',
        pointsCashPrice: 5.6,
        pointsCashCurrency: 'USD',
        availability: 2,
        departDate: new Date('2024-08-01T18:00:00Z'),
        returnDate: new Date('2024-08-02T06:30:00Z'),
        rawData: {
          id: 'ua-jfk-lhr-120k',
          provider: 'united',
          origin: 'JFK',
          destination: 'LHR',
          departureTime: '2024-08-01T18:00:00.000Z',
          arrivalTime: '2024-08-02T06:30:00.000Z',
          airline: 'United',
          cabin: 'business',
          availability: 2,
          pricingOptions: [
            {
              type: 'award',
              miles: 120000,
              cashAmount: 5.6,
              cashCurrency: 'USD',
              provider: 'united',
            },
            {
              type: 'cash',
              cashAmount: 4800,
              cashCurrency: 'USD',
              provider: 'united',
            },
          ],
          segments: [
            {
              marketingCarrier: 'UA',
              flightNumber: '922',
              origin: 'JFK',
              destination: 'LHR',
              departureTime: '2024-08-01T18:00:00.000Z',
              arrivalTime: '2024-08-02T06:30:00.000Z',
              aircraft: 'B787-9',
              durationMinutes: 390,
              cabin: 'business',
            },
          ],
        },
      },
    }),
    prisma.deal.create({
      data: {
        watcherId: watcher.id,
        userId: user.id,
        title: 'AA to London First Class - 130k miles',
        type: 'flight',
        origin: 'JFK',
        destination: 'LHR',
        cabin: 'first',
        airline: 'American',
        price: 13000,
        milesRequired: 130000,
        cpp: 10.0,
        score: 92.0,
        status: 'active',
        bookingUrl: 'https://www.aa.com',
        provider: 'aa',
        primaryPricingType: 'points_plus_cash',
        pricingOptions: [
          {
            type: 'award',
            miles: 130000,
            cashAmount: 5.6,
            cashCurrency: 'USD',
            provider: 'aa',
          },
          {
            type: 'points_plus_cash',
            miles: 65000,
            cashAmount: 2500,
            cashCurrency: 'USD',
            provider: 'aa',
            description: 'AAdvantage points + cash saver',
          },
          {
            type: 'cash',
            cashAmount: 5200,
            cashCurrency: 'USD',
            provider: 'aa',
          },
        ],
        cashPrice: 5200,
        cashCurrency: 'USD',
        pointsCashPrice: 2500,
        pointsCashCurrency: 'USD',
        pointsCashMiles: 65000,
        availability: 1,
        departDate: new Date('2024-08-05T20:00:00Z'),
        returnDate: new Date('2024-08-06T07:45:00Z'),
        rawData: {
          id: 'aa-jfk-lhr-130k',
          provider: 'aa',
          origin: 'JFK',
          destination: 'LHR',
          departureTime: '2024-08-05T20:00:00.000Z',
          arrivalTime: '2024-08-06T07:45:00.000Z',
          airline: 'American Airlines',
          cabin: 'first',
          availability: 1,
          pricingOptions: [
            {
              type: 'award',
              miles: 130000,
              cashAmount: 5.6,
              cashCurrency: 'USD',
              provider: 'aa',
            },
            {
              type: 'points_plus_cash',
              miles: 65000,
              cashAmount: 2500,
              cashCurrency: 'USD',
              provider: 'aa',
              description: 'AAdvantage points + cash saver',
            },
            {
              type: 'cash',
              cashAmount: 5200,
              cashCurrency: 'USD',
              provider: 'aa',
            },
          ],
          segments: [
            {
              marketingCarrier: 'AA',
              flightNumber: '100',
              origin: 'JFK',
              destination: 'LHR',
              departureTime: '2024-08-05T20:00:00.000Z',
              arrivalTime: '2024-08-06T07:45:00.000Z',
              aircraft: 'B777-300ER',
              durationMinutes: 405,
              cabin: 'first',
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${deals.length} sample deals`);

  // Create a trip
  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      name: 'Summer 2024 European Adventure',
      destination: 'London, Paris, Rome',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-21'),
      travelers: 2,
      budget: 5000,
      status: 'planning',
    },
  });

  console.log(`✅ Created trip: ${trip.name}`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
