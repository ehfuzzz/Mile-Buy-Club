import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  tripPlanId?: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @IsOptional()
  followUpPrompts?: string[];

  @IsObject()
  @IsOptional()
  contextOverrides?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  tone?: 'concierge' | 'executive' | 'friendly' | 'expert';
}
