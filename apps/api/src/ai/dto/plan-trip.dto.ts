import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PlanTripDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['flight', 'hotel', 'mixed'])
  watcherFocus!: 'flight' | 'hotel' | 'mixed';

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  travelers?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  budget?: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(16)
  @IsOptional()
  styleTags?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(16)
  @IsOptional()
  interests?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(16)
  @IsOptional()
  loyaltyPrograms?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  @IsOptional()
  preferredAirlines?: string[];

  @IsBoolean()
  @IsOptional()
  includeCashDeals?: boolean;

  @IsBoolean()
  @IsOptional()
  includePointsDeals?: boolean;

  @IsBoolean()
  @IsOptional()
  includeBlendDeals?: boolean;

  @IsObject()
  @IsOptional()
  accessibilityNeeds?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  tone?: 'adventure' | 'luxury' | 'family' | 'business' | 'romantic' | 'balanced';

  @IsString()
  @IsOptional()
  existingTripPlanId?: string;

  @IsString()
  @IsOptional()
  existingSessionId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayNotEmpty()
  mediaUrls?: string[];

  @IsObject()
  @IsOptional()
  customInstructions?: Record<string, unknown>;
}
