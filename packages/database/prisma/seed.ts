import { PrismaClient, ProgramType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (in development)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Clearing existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.searchCache.deleteMany();
    await prisma.apiUsage.deleteMany();
    await prisma.dataExport.deleteMany();
    await prisma.affiliateClick.deleteMany();
    await prisma.tripItem.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.watcher.deleteMany();
    await prisma.userCard.deleteMany();
    await prisma.userProgram.deleteMany();
    await prisma.user.deleteMany();
    await prisma.creditCardCatalog.deleteMany();
    await prisma.loyaltyProgram.deleteMany();
    await prisma.featureFlag.deleteMany();
  }

  // ============================================================================
  // LOYALTY PROGRAMS
  // ============================================================================

  console.log('Creating loyalty programs...');

  const programs = await Promise.all([
    // Airlines - US Carriers
    prisma.loyaltyProgram.create({
      data: {
        code: 'AA',
        name: 'American Airlines AAdvantage',
        type: ProgramType.airline,
        alliance: 'OneWorld',
        currency: 'miles',
        transferPartners: ['CITI_TYP', 'BILT'],
        logoUrl: '/logos/aa.svg',
        websiteUrl: 'https://www.aa.com/aadvantage',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'DELTA',
        name: 'Delta SkyMiles',
        type: ProgramType.airline,
        alliance: 'SkyTeam',
        currency: 'miles',
        transferPartners: ['AMEX_MR'],
        logoUrl: '/logos/delta.svg',
        websiteUrl: 'https://www.delta.com/skymiles',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'UNITED',
        name: 'United MileagePlus',
        type: ProgramType.airline,
        alliance: 'Star Alliance',
        currency: 'miles',
        transferPartners: ['CHASE_UR', 'BILT', 'CAPITAL_ONE'],
        logoUrl: '/logos/united.svg',
        websiteUrl: 'https://www.united.com/mileageplus',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'SOUTHWEST',
        name: 'Southwest Rapid Rewards',
        type: ProgramType.airline,
        currency: 'points',
        transferPartners: ['CHASE_UR'],
        logoUrl: '/logos/southwest.svg',
        websiteUrl: 'https://www.southwest.com/rapidrewards',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'JETBLUE',
        name: 'JetBlue TrueBlue',
        type: ProgramType.airline,
        currency: 'points',
        transferPartners: ['CHASE_UR', 'CITI_TYP', 'AMEX_MR'],
        logoUrl: '/logos/jetblue.svg',
        websiteUrl: 'https://www.jetblue.com/trueblue',
      },
    }),

    // Airlines - International
    prisma.loyaltyProgram.create({
      data: {
        code: 'AIR_CANADA',
        name: 'Air Canada Aeroplan',
        type: ProgramType.airline,
        alliance: 'Star Alliance',
        currency: 'points',
        transferPartners: ['CHASE_UR', 'AMEX_MR', 'CAPITAL_ONE', 'BILT'],
        logoUrl: '/logos/air-canada.svg',
        websiteUrl: 'https://www.aircanada.com/aeroplan',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'VIRGIN_ATLANTIC',
        name: 'Virgin Atlantic Flying Club',
        type: ProgramType.airline,
        currency: 'miles',
        transferPartners: ['CHASE_UR', 'AMEX_MR', 'CITI_TYP', 'CAPITAL_ONE', 'BILT'],
        logoUrl: '/logos/virgin-atlantic.svg',
        websiteUrl: 'https://www.virginatlantic.com/flyingclub',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'SINGAPORE',
        name: 'Singapore Airlines KrisFlyer',
        type: ProgramType.airline,
        alliance: 'Star Alliance',
        currency: 'miles',
        transferPartners: ['CHASE_UR', 'AMEX_MR', 'CITI_TYP', 'CAPITAL_ONE', 'BILT'],
        logoUrl: '/logos/singapore.svg',
        websiteUrl: 'https://www.singaporeair.com/krisflyer',
      },
    }),

    // Hotels
    prisma.loyaltyProgram.create({
      data: {
        code: 'MARRIOTT',
        name: 'Marriott Bonvoy',
        type: ProgramType.hotel,
        currency: 'points',
        transferPartners: ['CHASE_UR', 'AMEX_MR', 'CITI_TYP'],
        logoUrl: '/logos/marriott.svg',
        websiteUrl: 'https://www.marriott.com/bonvoy',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'HILTON',
        name: 'Hilton Honors',
        type: ProgramType.hotel,
        currency: 'points',
        transferPartners: ['AMEX_MR'],
        logoUrl: '/logos/hilton.svg',
        websiteUrl: 'https://www.hilton.com/honors',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'HYATT',
        name: 'World of Hyatt',
        type: ProgramType.hotel,
        currency: 'points',
        transferPartners: ['CHASE_UR', 'BILT'],
        logoUrl: '/logos/hyatt.svg',
        websiteUrl: 'https://www.hyatt.com/world-of-hyatt',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'IHG',
        name: 'IHG One Rewards',
        type: ProgramType.hotel,
        currency: 'points',
        transferPartners: ['CHASE_UR'],
        logoUrl: '/logos/ihg.svg',
        websiteUrl: 'https://www.ihg.com/onerewards',
      },
    }),

    // Credit Card Programs
    prisma.loyaltyProgram.create({
      data: {
        code: 'CHASE_UR',
        name: 'Chase Ultimate Rewards',
        type: ProgramType.credit_card,
        currency: 'points',
        logoUrl: '/logos/chase.svg',
        websiteUrl: 'https://www.chase.com/ultimaterewards',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'AMEX_MR',
        name: 'American Express Membership Rewards',
        type: ProgramType.credit_card,
        currency: 'points',
        logoUrl: '/logos/amex.svg',
        websiteUrl: 'https://www.americanexpress.com/rewards',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'CITI_TYP',
        name: 'Citi ThankYou Points',
        type: ProgramType.credit_card,
        currency: 'points',
        logoUrl: '/logos/citi.svg',
        websiteUrl: 'https://www.citi.com/thankyou',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'CAPITAL_ONE',
        name: 'Capital One Miles',
        type: ProgramType.credit_card,
        currency: 'miles',
        logoUrl: '/logos/capital-one.svg',
        websiteUrl: 'https://www.capitalone.com/rewards',
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        code: 'BILT',
        name: 'Bilt Rewards',
        type: ProgramType.credit_card,
        currency: 'points',
        logoUrl: '/logos/bilt.svg',
        websiteUrl: 'https://www.biltrewards.com',
      },
    }),
  ]);

  console.log(`✅ Created ${programs.length} loyalty programs`);

  // ============================================================================
  // CREDIT CARDS
  // ============================================================================

  console.log('Creating credit card catalog...');

  const cards = await Promise.all([
    // Chase Cards
    prisma.creditCardCatalog.create({
      data: {
        issuer: 'Chase',
        name: 'Chase Sapphire Preferred',
        network: 'Visa',
        annualFee: 9500, // $95
        bonusPoints: 60000,
        bonusSpend: 400000, // $4,000
        bonusMonths: 3,
        programsLinked: ['CHASE_UR'],
        transferRatio: '1:1',
        affiliateUrl: 'https://example.com/chase-sapphire-preferred',
        affiliateNetwork: 'CJ',
        commissionRate: 150.00, // $150
        imageUrl: '/cards/chase-sapphire-preferred.png',
        description: 'Earn 5x on travel through Chase portal, 3x on dining, 2x on other travel. Points transfer 1:1 to airline and hotel partners.',
      },
    }),
    prisma.creditCardCatalog.create({
      data: {
        issuer: 'Chase',
        name: 'Chase Sapphire Reserve',
        network: 'Visa',
        annualFee: 55000, // $550
        bonusPoints: 60000,
        bonusSpend: 400000,
        bonusMonths: 3,
        programsLinked: ['CHASE_UR'],
        transferRatio: '1:1.5',
        affiliateUrl: 'https://example.com/chase-sapphire-reserve',
        affiliateNetwork: 'CJ',
        commissionRate: 200.00,
        imageUrl: '/cards/chase-sapphire-reserve.png',
        description: 'Premium travel card with $300 travel credit, Priority Pass, 10x on hotels/car rentals through Chase, 5x on flights, 3x on dining.',
      },
    }),
    prisma.creditCardCatalog.create({
      data: {
        issuer: 'Chase',
        name: 'World of Hyatt Credit Card',
        network: 'Visa',
        annualFee: 9500,
        bonusPoints: 30000,
        bonusSpend: 300000,
        bonusMonths: 3,
        programsLinked: ['HYATT'],
        transferRatio: '1:1',
        affiliateUrl: 'https://example.com/world-of-hyatt',
        affiliateNetwork: 'CJ',
        commissionRate: 100.00,
        imageUrl: '/cards/world-of-hyatt.png',
        description: 'Earn up to 9x on Hyatt stays, free annual night (Category 1-4), Discoverist status.',
      },
    }),

    // Amex Cards
    prisma.creditCardCatalog.create({
      data: {
        issuer: 'American Express',
        name: 'American Express Gold',
        network: 'Amex',
        annualFee: 25000, // $250
        bonusPoints: 60000,
        bonusSpend: 400000,
        bonusMonths: 6,
        programsLinked: ['AMEX_MR'],
        transferRatio: '1:1',
        affiliateUrl: 'https://example.com/amex-gold',
        affiliateNetwork: 'Impact',
        commissionRate: 150.00,
        imageUrl: '/cards/amex-gold.png',
        description: '4x on dining and groceries (up to $25k/year), 3x on flights. $120 dining credit.',
      },
    }),
    prisma.creditCardCatalog.create({
      data: {
        issuer: 'American Express',
        name: 'American Express Platinum',
        network: 'Amex',
        annualFee: 69500, // $695
        bonusPoints: 80000,
        bonusSpend: 600000,
        bonusMonths: 6,
        programsLinked: ['AMEX_MR'],
        transferRatio: '1:1',
        affiliateUrl: 'https://example.com/amex-platinum',
        affiliateNetwork: 'Impact',
        commissionRate: 250.00,
        imageUrl: '/cards/amex-platinum.png',
        description: 'Premium card with 5x on flights, Centurion Lounge access, hotel elite status, $200 airline credit.',
      },
    }),
    prisma.creditCardCatalog.create({
      data: {
        issuer: 'American Express',
        name: 'Hilton Honors Aspire',
        network: 'Amex',
        annualFee: 45000,
        bonusPoints: 150000,
        bonusSpend: 400000,
        bonusMonths: 3,
        programsLinked: ['HILTON'],
        transferRatio: '1:1',
        affiliateUrl: 'https://example.com/hilton-aspire',
        affiliateNetwork: 'Impact',
        commissionRate: 150.00,
        imageUrl: '/cards/hilton-aspire.png',
        description: 'Diamond status, free weekend night, Priority Pass, $250 airline credit.',
      },
    }),

    // Capital One Cards
    prisma.creditCardCatalog.create({
      data: {
        issuer: 'Capital One',
        name: 'Capital One Venture X',
        network: 'Visa',
        annualFee: 39500,
        bonusPoints: 75000,
        bonusSpend: 400000,
        bonusMonths: 3,
        programsLinked: ['CAPITAL_ONE'],
        transferRatio: '1:1',
        affiliateUrl: 'https://example.com/venture-x',
        affiliateNetwork: 'CJ',
        commissionRate: 175.00,
        imageUrl: '/cards/venture-x.png',
        description: '10x on hotels/car rentals (Capital One Travel), 5x on flights, 2x on everything. $300 travel credit, Priority Pass.',
      },
    }),

    // Bilt Card
    prisma.creditCardCatalog.create({
      data: {
        issuer: 'Bilt',
        name: 'Bilt Mastercard',
        network: 'Mastercard',
        annualFee: 0,
        bonusPoints: 0,
        programsLinked: ['BILT'],
        transferRatio: '1:1',
        affiliateUrl: 'https://example.com/bilt',
        affiliateNetwork: 'Impact',
        commissionRate: 75.00,
        imageUrl: '/cards/bilt.png',
        description: 'Earn points on rent (no fee!), 3x dining, 2x travel, 1x everything. No annual fee.',
      },
    }),
  ]);

  console.log(`✅ Created ${cards.length} credit cards`);

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================

  console.log('Creating feature flags...');

  const flags = await Promise.all([
    prisma.featureFlag.create({
      data: {
        key: 'card_recommendations',
        name: 'Card Recommendations',
        description: 'Show credit card recommendations to users',
        isEnabled: true,
        rolloutPercentage: 100,
      },
    }),
    prisma.featureFlag.create({
      data: {
        key: 'sms_notifications',
        name: 'SMS Notifications',
        description: 'Allow users to receive SMS alerts',
        isEnabled: false,
        rolloutPercentage: 0,
      },
    }),
    prisma.featureFlag.create({
      data: {
        key: 'advanced_filters',
        name: 'Advanced Search Filters',
        description: 'Show advanced filtering options in search',
        isEnabled: true,
        rolloutPercentage: 100,
      },
    }),
    prisma.featureFlag.create({
      data: {
        key: 'trip_sharing',
        name: 'Trip Sharing',
        description: 'Allow users to share trip itineraries',
        isEnabled: true,
        rolloutPercentage: 100,
      },
    }),
    prisma.featureFlag.create({
      data: {
        key: 'hotel_booking',
        name: 'Hotel Booking Integration',
        description: 'Show hotel booking options',
        isEnabled: true,
        rolloutPercentage: 100,
      },
    }),
  ]);

  console.log(`✅ Created ${flags.length} feature flags`);

  // ============================================================================
  // DEMO USER & DATA
  // ============================================================================

  console.log('Creating demo user...');

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@milebyclub.com',
      authProvider: 'credentials',
      name: 'Demo User',
      homeAirports: ['JFK', 'LGA', 'EWR'],
      defaultCabin: 'economy',
      marketingConsent: true,
      cardSuggestionsConsent: true,
      analyticsConsent: true,
    },
  });

  console.log(`✅ Created demo user: ${demoUser.email}`);

  // Link demo user to programs
  const userPrograms = await Promise.all([
    prisma.userProgram.create({
      data: {
        userId: demoUser.id,
        programId: programs.find((p) => p.code === 'CHASE_UR')!.id,
        statusLevel: 'Member',
      },
    }),
    prisma.userProgram.create({
      data: {
        userId: demoUser.id,
        programId: programs.find((p) => p.code === 'UNITED')!.id,
        memberId: 'DEMO123456',
        statusLevel: 'Silver',
      },
    }),
    prisma.userProgram.create({
      data: {
        userId: demoUser.id,
        programId: programs.find((p) => p.code === 'HYATT')!.id,
        statusLevel: 'Discoverist',
      },
    }),
  ]);

  console.log(`✅ Linked ${userPrograms.length} programs to demo user`);

  // Add demo user cards
  const userCards = await Promise.all([
    prisma.userCard.create({
      data: {
        userId: demoUser.id,
        cardId: cards.find((c) => c.name === 'Chase Sapphire Preferred')!.id,
        openedAt: new Date('2023-01-15'),
      },
    }),
    prisma.userCard.create({
      data: {
        userId: demoUser.id,
        cardId: cards.find((c) => c.name === 'World of Hyatt Credit Card')!.id,
        openedAt: new Date('2023-06-01'),
      },
    }),
  ]);

  console.log(`✅ Added ${userCards.length} cards to demo user`);

  // Create demo watcher
  const watcher = await prisma.watcher.create({
    data: {
      userId: demoUser.id,
      name: 'NYC to London - Spring 2025',
      origins: ['JFK', 'EWR'],
      destinations: ['LHR', 'LGW'],
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-04-15'),
      flexDays: 3,
      cabin: 'business',
      passengers: 2,
      programsFilter: ['UNITED', 'VIRGIN_ATLANTIC'],
      minValue: 1.5,
      frequencyMinutes: 360,
      nextRunAt: new Date(Date.now() + 360 * 60 * 1000),
      isActive: true,
    },
  });

  console.log(`✅ Created demo watcher: ${watcher.name}`);

  // Create sample deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        watcherId: watcher.id,
        userId: demoUser.id,
        type: 'award_flight',
        provider: 'united',
        origin: 'EWR',
        destination: 'LHR',
        departDate: new Date('2025-04-05'),
        returnDate: new Date('2025-04-12'),
        pointsCost: 140000,
        cashCost: 3200.00,
        taxesFees: 150.00,
        cpp: 2.18,
        programId: programs.find((p) => p.code === 'UNITED')!.id,
        cabin: 'business',
        stops: 0,
        duration: 420,
        bookingUrl: 'https://www.united.com/booking/example',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        metadata: {
          aircraft: '787-9',
          airline: 'United',
          flightNumber: 'UA14',
        },
      },
    }),
    prisma.deal.create({
      data: {
        watcherId: watcher.id,
        userId: demoUser.id,
        type: 'award_flight',
        provider: 'virgin_atlantic',
        origin: 'JFK',
        destination: 'LHR',
        departDate: new Date('2025-04-06'),
        returnDate: new Date('2025-04-13'),
        pointsCost: 100000,
        cashCost: 3200.00,
        taxesFees: 250.00,
        cpp: 2.95,
        programId: programs.find((p) => p.code === 'VIRGIN_ATLANTIC')!.id,
        cabin: 'business',
        stops: 0,
        duration: 410,
        bookingUrl: 'https://www.virginatlantic.com/booking/example',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        metadata: {
          aircraft: 'A350',
          airline: 'Virgin Atlantic',
          flightNumber: 'VS4',
        },
      },
    }),
  ]);

  console.log(`✅ Created ${deals.length} sample deals`);

  // Create a sample trip
  const trip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'London Spring Adventure',
      destination: 'London, UK',
      startDate: new Date('2025-04-05'),
      endDate: new Date('2025-04-12'),
      notes: 'Exploring London with the family!',
    },
  });

  // Add flight to trip
  await prisma.tripItem.create({
    data: {
      tripId: trip.id,
      dealId: deals[0].id,
      type: 'flight',
      day: 1,
      order: 1,
      date: new Date('2025-04-05'),
      title: 'Flight to London',
    },
  });

  console.log(`✅ Created sample trip: ${trip.name}`);

  console.log('\n🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
