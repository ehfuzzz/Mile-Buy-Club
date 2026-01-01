import { LocationKind as PrismaLocationKind } from '@prisma/client';
import { LocationsService } from '../locations.service';

describe('LocationsService', () => {
  const LocationKind = (PrismaLocationKind as any) ?? { AIRPORT: 'AIRPORT', CITY: 'CITY', REGION: 'REGION' } as const;
  const findFirst = jest.fn();
  const create = jest.fn();
  const prismaMock = {
    location: {
      findFirst,
      create,
    },
  } as any;

  const service = new LocationsService(prismaMock);

  beforeEach(() => {
    findFirst.mockReset();
    create.mockReset();
  });

  it('returns an existing location when present', async () => {
    findFirst.mockResolvedValue({ id: 'loc_1', name: 'New York City' });

    const result = await service.resolveLocation({
      kind: LocationKind.CITY,
      code: 'NYC',
      name: 'New York City',
    });

    expect(findFirst).toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'loc_1', name: 'New York City' });
  });

  it('creates a location when none exists', async () => {
    findFirst.mockResolvedValue(null);
    create.mockResolvedValue({ id: 'loc_2', name: 'Lisbon' });

    const result = await service.resolveLocation({
      kind: LocationKind.CITY,
      code: 'LIS',
      name: 'Lisbon',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        kind: LocationKind.CITY,
        iata: 'LIS',
        name: 'Lisbon',
        countryCode: null,
        regionCode: null,
        lat: null,
        lon: null,
      },
    });
    expect(result).toEqual({ id: 'loc_2', name: 'Lisbon' });
  });
});
