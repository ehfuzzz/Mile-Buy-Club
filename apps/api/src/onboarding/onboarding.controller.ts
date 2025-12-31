import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithId } from '../common/types/request-with-id';
import { randomUUID } from 'crypto';
import { OnboardingService } from './onboarding.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { OnboardingMessageDto } from './dto/message.dto';
import { ExtractProfileDto } from './dto/extract.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  private parseSessionFromCookies(rawCookie?: string): string | undefined {
    if (!rawCookie) {
      return undefined;
    }

    const cookies = rawCookie.split(';').map((pair) => pair.trim().split('='));
    const sessionPair = cookies.find(([name]) => name === 'onboarding_session');
    return sessionPair?.[1];
  }

  private resolveSessionId(req: RequestWithId, headerSessionId?: string) {
    return headerSessionId || this.parseSessionFromCookies(req.headers.cookie);
  }

  @Post('onboarding/session')
  @HttpCode(HttpStatus.OK)
  async createSession(
    @Body() dto: CreateSessionDto,
    @Req() req: RequestWithId,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-onboarding-session') headerSessionId?: string,
  ) {
    const requestId = req.requestId ?? randomUUID();
    const response = await this.onboardingService.createSession(dto, {
      requestId,
      sessionId: this.resolveSessionId(req, headerSessionId),
    });

    res.cookie('onboarding_session', response.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    res.setHeader('x-onboarding-session', response.sessionId);

    return response;
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

  @Get('onboarding/state')
  async getState(
    @Req() req: RequestWithId,
    @Headers('x-onboarding-session') headerSessionId?: string,
  ) {
    const requestId = req.requestId ?? randomUUID();
    const sessionId = this.resolveSessionId(req, headerSessionId);
    if (!sessionId) {
      throw new UnauthorizedException({
        errorCode: 'UNAUTHORIZED',
        message: 'Missing onboarding session',
        requestId,
      });
    }

    return this.onboardingService.getStateForSession(sessionId, requestId);
  }

  @Post('onboarding/state/patch')
  @HttpCode(HttpStatus.OK)
  async patchState(
    @Req() req: RequestWithId,
    @Body() patchPayload: unknown,
    @Headers('x-onboarding-session') headerSessionId?: string,
  ) {
    const requestId = req.requestId ?? randomUUID();
    const sessionId = this.resolveSessionId(req, headerSessionId);
    if (!sessionId) {
      throw new UnauthorizedException({
        errorCode: 'UNAUTHORIZED',
        message: 'Missing onboarding session',
        requestId,
      });
    }

    return this.onboardingService.patchState(sessionId, patchPayload, requestId);
  }
}
