import { IsIn, IsString } from 'class-validator';

export class OnboardingMessageDto {
  @IsString()
  sessionId!: string;

  @IsIn(['user', 'assistant', 'system'])
  role!: 'user' | 'assistant' | 'system';

  @IsString()
  content!: string;
}
