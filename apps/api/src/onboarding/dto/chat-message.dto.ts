import { IsString } from 'class-validator';

export class OnboardingChatMessageDto {
  @IsString()
  sessionId!: string;

  @IsString()
  message!: string;
}
