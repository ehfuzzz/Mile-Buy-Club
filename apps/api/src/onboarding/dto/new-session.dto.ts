import { IsOptional, IsString } from 'class-validator';

export class OnboardingChatSessionDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
