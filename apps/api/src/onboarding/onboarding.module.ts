import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { LocationsService } from './locations.service';
import { OnboardingChatService } from './onboarding-chat.service';
import { LlamaClientService } from './llama-client.service';

@Module({
  imports: [PrismaModule],
  controllers: [OnboardingController],
  providers: [OnboardingService, LocationsService, OnboardingChatService, LlamaClientService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
