import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class VideoFrameDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsNumber()
  @Min(0)
  @Max(86400)
  @IsOptional()
  timestampSeconds?: number;
}

export class AnalyzeMediaDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsArray()
  @ArrayMaxSize(24)
  @ValidateNested({ each: true })
  @Type(() => VideoFrameDto)
  @IsOptional()
  videoFrames?: VideoFrameDto[];

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsObject()
  @IsOptional()
  geoBias?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  tripPlanId?: string;
}
