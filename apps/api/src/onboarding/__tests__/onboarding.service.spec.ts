import { OnboardingService } from '../onboarding.service';
import { LocationsService } from '../locations.service';
import { OnboardingExtraction } from '@mile/shared';

const mockExtraction: OnboardingExtraction = {
  home_bases: [{ kind: 'CITY', code: 'NYC', name: 'New York City' }],
  open_jaw_ok: true,
  mixed_airlines_ok: false,
  travel_window: { flex_days: 3, typical_trip_len_days: [5, 10] },
  destinations: {
    wish: [{ kind: 'CITY', code: 'LIS', name: 'Lisbon' }],
    avoid: [],
  },
  styles: ['CITY'],
  interests: [],
  dietary: [],
  accessibility: [],
  seating: { cabin: 'J', companions: 2 },
  budget: { max_points: 60000, max_cash_usd: 900, min_cpp_cents: 1.6 },
  airlines: { prefer: ['UA'], avoid: [] },
  alliances: { prefer: ['STAR'], avoid: [] },
  hotel_programs: { prefer: ['HYATT'], avoid: [] },
  loyalty_balances: [{ program_id: 'AEROPLAN', approx_points: 85000 }],
  cards: ['chase_sapphire_reserve'],
  notifications: { mode: 'HIGH_QUALITY', timezone: 'America/New_York' },
  raw_free_text: 'transcript',
};

describe('OnboardingService persistence', () => {
  const prismaMock = {
    onboardingSession: {
      findUnique: jest.fn(),
    },
    userProfile: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;

  const locationsMock: Partial<LocationsService> = {
    resolveLocation: jest.fn().mockResolvedValue({ id: 'loc-id', name: 'Location' }),
  };

  const service = new OnboardingService(prismaMock, locationsMock as LocationsService);

  beforeEach(() => {
    prismaMock.onboardingSession.findUnique.mockReset();
    prismaMock.userProfile.findUnique.mockReset();
    prismaMock.$transaction.mockReset();
    (locationsMock.resolveLocation as jest.Mock).mockClear();
  });

  it('wraps profile persistence in a Prisma transaction', async () => {
    prismaMock.onboardingSession.findUnique.mockResolvedValue({
      id: 'session-1',
      userId: 'demo-user',
      messages: [{ role: 'user', content: 'Hello', createdAt: new Date() }],
    });

    prismaMock.userProfile.findUnique.mockResolvedValue({ userId: 'demo-user' });

    const tx = {
      userProfile: { upsert: jest.fn().mockResolvedValue({ userId: 'demo-user' }) },
      userHomeBase: { deleteMany: jest.fn(), createMany: jest.fn() },
      userDestinationPref: { deleteMany: jest.fn(), createMany: jest.fn() },
      userTripStyle: { deleteMany: jest.fn(), createMany: jest.fn() },
      userInterest: { deleteMany: jest.fn(), createMany: jest.fn() },
      userDietary: { deleteMany: jest.fn(), createMany: jest.fn() },
      userAccessibility: { deleteMany: jest.fn(), createMany: jest.fn() },
      userAirlinePref: { deleteMany: jest.fn(), createMany: jest.fn() },
      airline: { upsert: jest.fn() },
      userAlliancePref: { deleteMany: jest.fn(), createMany: jest.fn() },
      userHotelProgramPref: { deleteMany: jest.fn(), createMany: jest.fn() },
      hotelProgram: { upsert: jest.fn() },
      userLoyaltyBalance: { deleteMany: jest.fn(), createMany: jest.fn() },
      loyaltyProgram: { upsert: jest.fn() },
      cardCatalog: { upsert: jest.fn() },
      userCard: { deleteMany: jest.fn(), createMany: jest.fn() },
      onboardingMessage: { create: jest.fn() },
    } as any;

    prismaMock.$transaction.mockImplementation(async (handler: any) => handler(tx));

    jest
      .spyOn(service as any, 'runExtraction')
      .mockResolvedValue(mockExtraction);

    await service.extractProfile({ sessionId: 'session-1', userId: 'demo-user' });

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.userProfile.upsert).toHaveBeenCalled();
  });
});
