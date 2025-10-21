import { Injectable } from '@nestjs/common';
import { Location, LocationKind, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

export interface ResolveLocationInput {
  kind: LocationKind;
  code?: string | null;
  name: string;
  countryCode?: string | null;
  regionCode?: string | null;
  lat?: number | null;
  lon?: number | null;
}

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveLocation(
    input: ResolveLocationInput,
    client?: PrismaClientLike,
  ): Promise<Location> {
    const db = client ?? this.prisma;
    const normalizedCode = input.code ? input.code.trim().toUpperCase() : null;
    const where: Prisma.LocationWhereInput = {
      kind: input.kind,
    };

    if (normalizedCode) {
      where.OR = [
        { iata: normalizedCode },
        { name: { equals: input.name, mode: 'insensitive' } },
      ];
    } else {
      where.name = { equals: input.name, mode: 'insensitive' };
    }

    const existing = await db.location.findFirst({ where });
    if (existing) {
      return existing;
    }

    return db.location.create({
      data: {
        kind: input.kind,
        iata: normalizedCode,
        name: input.name,
        countryCode: input.countryCode ?? null,
        regionCode: input.regionCode ?? null,
        lat: input.lat ?? null,
        lon: input.lon ?? null,
      },
    });
  }
}
