import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { OnboardingMessageDto } from './dto/message.dto';
import { ExtractProfileDto } from './dto/extract.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('onboarding/session')
  createSession(@Body() dto: CreateSessionDto) {
    return this.onboardingService.createSession(dto);
  }

  @Post('onboarding/message')
  appendMessage(@Body() dto: OnboardingMessageDto) {
    return this.onboardingService.appendMessage(dto);
  }

  @Post('onboarding/extract')
  extractProfile(@Body() dto: ExtractProfileDto) {
    return this.onboardingService.extractProfile(dto);
  }

  @Get('profile')
  getProfile(@Query('userId') userId: string) {
    return this.onboardingService.getProfile(userId);
  }

  @Patch('profile')
  updateProfile(@Query('userId') userId: string, @Body() dto: UpdateProfileDto) {
    return this.onboardingService.updateProfile(userId, dto);
  }
}
