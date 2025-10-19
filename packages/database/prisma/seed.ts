import { PrismaClient } from '@prisma/client';
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
  await prisma.cardCreditDefinition.deleteMany();
  await prisma.cardEarnRate.deleteMany();
  await prisma.cardTransferPartner.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.userLoyaltyProgram.deleteMany();
  await prisma.loyaltyProgram.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.event.deleteMany();
  await prisma.analytics.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'demo@milebyclub.com',
      name: 'Demo User',
      bio: 'Award flight seeker',
      timezone: 'America/New_York',
      notificationPreference: 'daily',
    },
  });

  console.log(`✅ Created demo user: ${user.email}`);

  // Create loyalty programs
  const programs = await Promise.all([
    prisma.loyaltyProgram.create({
      data: {
        name: 'United Airlines MileagePlus',
        airline: 'United',
        programType: 'airline',
        description: 'United Airlines frequent flyer program',
        website: 'https://www.mileageplus.com',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        name: 'American Airlines AAdvantage',
        airline: 'American',
        programType: 'airline',
        description: 'American Airlines frequent flyer program',
        website: 'https://www.aa.com/aadvantage',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        name: 'Delta SkyMiles',
        airline: 'Delta',
        programType: 'airline',
        description: 'Delta Air Lines frequent flyer program',
        website: 'https://www.delta.com/skymiles',
      },
    }),
  ]);

  console.log(`✅ Created ${programs.length} loyalty programs`);

  // Link user to programs
  for (const program of programs) {
    await prisma.userLoyaltyProgram.create({
      data: {
        userId: user.id,
        programId: program.id,
        accountNumber: `USER${Math.random().toString(36).substring(7).toUpperCase()}`,
        tier: 'Gold',
        isVerified: true,
      },
    });
  }

  console.log(`✅ Linked user to programs`);

  // Create credit cards
  const cardsData = cardCatalog.cards as SeedCard[];
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
