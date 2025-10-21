import { AlertMode, Cabin, LocationKind } from '@prisma/client';
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

class LocationInputDto {
  @IsEnum(LocationKind)
  kind!: LocationKind;

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
  @IsEnum(Cabin)
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
  @IsEnum(AlertMode)
  alertMode?: AlertMode | null;

  @IsOptional()
  @IsString()
  timezone?: string | null;
}

export { LocationInputDto, PreferenceInputDto, BudgetInputDto };
