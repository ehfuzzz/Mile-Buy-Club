import { AlertMode, Cabin, LocationKind as PrismaLocationKind } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

const LocationKind = (PrismaLocationKind as any) ?? { AIRPORT: 'AIRPORT', CITY: 'CITY', REGION: 'REGION' } as const;
const CabinEnum = (Cabin as any) ?? { Y: 'Y', W: 'W', J: 'J', F: 'F' } as const;
const AlertModeEnum = (AlertMode as any) ?? { HIGH_QUALITY: 'HIGH_QUALITY', DIGEST: 'DIGEST' } as const;

class LocationInputDto {
  @IsEnum(LocationKind as Record<string, string>)
  kind!: keyof typeof LocationKind;

  @IsOptional()
  @IsString()
  code?: string | null;

  @IsString()
  name!: string;
}

class PreferenceInputDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prefer?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  avoid?: string[];
}

class BudgetInputDto {
  @IsOptional()
  @IsInt()
  maxPoints?: number | null;

  @IsOptional()
  @IsInt()
  maxCashUsd?: number | null;

  @IsOptional()
  @IsNumber()
  minCppCents?: number | null;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsEnum(CabinEnum as Record<string, string>)
  preferredCabin?: Cabin | null;

  @IsOptional()
  @IsInt()
  companions?: number | null;

  @IsOptional()
  @IsBoolean()
  openJawOk?: boolean | null;

  @IsOptional()
  @IsBoolean()
  mixedAirlinesOk?: boolean | null;

  @IsOptional()
  @IsInt()
  dateFlexDays?: number | null;

  @IsOptional()
  @IsInt()
  typicalTripLenMin?: number | null;

  @IsOptional()
  @IsInt()
  typicalTripLenMax?: number | null;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LocationInputDto)
  homeBases?: LocationInputDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LocationInputDto)
  destinationsWish?: LocationInputDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LocationInputDto)
  destinationsAvoid?: LocationInputDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferenceInputDto)
  airlines?: PreferenceInputDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferenceInputDto)
  alliances?: PreferenceInputDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferenceInputDto)
  hotelPrograms?: PreferenceInputDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetInputDto)
  budget?: BudgetInputDto;

  @IsOptional()
  @IsEnum(AlertModeEnum as Record<string, string>)
  alertMode?: AlertMode | null;

  @IsOptional()
  @IsString()
  timezone?: string | null;
}

export { LocationInputDto, PreferenceInputDto, BudgetInputDto };
