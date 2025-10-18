import { PrismaClient } from '@prisma/client';

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
  const cards = await Promise.all([
    prisma.creditCard.create({
      data: {
        name: 'Chase Sapphire Reserve',
        issuer: 'Chase',
        network: 'visa',
        category: 'premium',
        signupBonus: '75,000 points',
        annualFee: 55000,
        flightCpp: 1.5,
        hotelCpp: 1.25,
      },
    }),
    prisma.creditCard.create({
      data: {
        name: 'American Express Platinum',
        issuer: 'Amex',
        network: 'amex',
        category: 'premium',
        signupBonus: '150,000 points',
        annualFee: 69900,
        flightCpp: 1.4,
        hotelCpp: 1.2,
      },
    }),
  ]);

  console.log(`✅ Created ${cards.length} credit cards`);

  // Link user to cards
  for (const card of cards) {
    await prisma.userCreditCard.create({
      data: {
        userId: user.id,
        cardId: card.id,
        lastFourDigits: '1234',
        expiryMonth: 12,
        expiryYear: 2026,
        isPrimary: card.id === cards[0].id,
      },
    });
  }

  console.log(`✅ Linked user to credit cards`);

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
