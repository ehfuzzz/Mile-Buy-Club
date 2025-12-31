import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, HttpException } from '@nestjs/common';
import { z } from 'zod';
import { TRIP_QUERY_SCHEMA, PLAN_RESPONSE_SCHEMA, TripQuery } from '@mile/shared';
import { PlanService } from './plan.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { RequestWithId } from '../common/types/request-with-id';
import {
  GET_SAVED_PLAN_RESPONSE_SCHEMA,
  LIST_SAVED_PLANS_RESPONSE_SCHEMA,
  SAVE_PLAN_REQUEST_SCHEMA,
  SAVE_PLAN_RESPONSE_SCHEMA,
  SAVED_PLAN_SCHEMA,
} from './saved-plans.schemas';
import { SavedPlansService } from './saved-plans.service';

@Controller('planner')
export class PlannerController {
  constructor(
    private readonly planService: PlanService,
    private readonly onboardingService: OnboardingService,
    private readonly savedPlansService: SavedPlansService,
  ) {}

  @Post('plan')
  @HttpCode(HttpStatus.OK)
  async plan(@Body() body: unknown, @Req() req: RequestWithId) {
    const requestId = req.requestId;
    const parseResult = TRIP_QUERY_SCHEMA.safeParse(body);
    if (!parseResult.success) {
      return {
        type: 'needs_input',
        requestId,
        missing: parseResult.error.issues.map((issue) => ({ path: issue.path.join('.') || 'root', reason: issue.message })),
      } as z.infer<typeof PLAN_RESPONSE_SCHEMA>;
    }

    const sessionId = req.headers['x-onboarding-session'] as string | undefined;
    if (!sessionId) {
      return {
        type: 'needs_input',
        requestId,
        missing: [{ path: 'session', reason: 'Missing onboarding session' }],
      } as z.infer<typeof PLAN_RESPONSE_SCHEMA>;
    }

    const userStateResponse = await this.onboardingService.getStateForSession(sessionId, requestId);
    const query: TripQuery = parseResult.data;
    return this.planService.plan({ query, userState: userStateResponse.userState, requestId });
  }

  @Post('plans')
  async savePlan(@Body() body: unknown, @Req() req: RequestWithId) {
    const requestId = req.requestId;
    const sessionId = req.headers['x-onboarding-session'] as string | undefined;
    if (!sessionId) {
      throw new HttpException(
        { errorCode: 'MISSING_SESSION', requestId },
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await this.savedPlansService.savePlan(sessionId, body, requestId);
    return SAVE_PLAN_RESPONSE_SCHEMA.parse(response);
  }

  @Get('plans')
  async listPlans(@Req() req: RequestWithId) {
    const requestId = req.requestId;
    const sessionId = req.headers['x-onboarding-session'] as string | undefined;
    if (!sessionId) {
      throw new HttpException(
        { errorCode: 'MISSING_SESSION', requestId },
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await this.savedPlansService.listPlans(sessionId, requestId);
    return LIST_SAVED_PLANS_RESPONSE_SCHEMA.parse(response);
  }

  @Get('plans/:id')
  async getPlan(@Param('id') id: string, @Req() req: RequestWithId) {
    const requestId = req.requestId;
    const sessionId = req.headers['x-onboarding-session'] as string | undefined;
    if (!sessionId) {
      throw new HttpException(
        { errorCode: 'MISSING_SESSION', requestId },
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await this.savedPlansService.getPlan(sessionId, id, requestId);
    return GET_SAVED_PLAN_RESPONSE_SCHEMA.parse(response);
  }

  @Post('plans/:id/public')
  @HttpCode(HttpStatus.OK)
  async makePublic(@Param('id') id: string, @Req() req: RequestWithId) {
    const requestId = req.requestId;
    const sessionId = req.headers['x-onboarding-session'] as string | undefined;
    if (!sessionId) {
      throw new HttpException(
        { errorCode: 'MISSING_SESSION', requestId },
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await this.savedPlansService.makePublic(sessionId, id, requestId);
    return SAVE_PLAN_RESPONSE_SCHEMA.parse({
      id: response.plan.id,
      shareUrl: response.shareUrl,
      savedPlan: response.plan,
    });
  }

  @Post('plans/:id/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeShare(@Param('id') id: string, @Req() req: RequestWithId) {
    const requestId = req.requestId;
    const sessionId = req.headers['x-onboarding-session'] as string | undefined;
    if (!sessionId) {
      throw new HttpException(
        { errorCode: 'MISSING_SESSION', requestId },
        HttpStatus.BAD_REQUEST,
      );
    }

    const plan = await this.savedPlansService.revokeShare(sessionId, id, requestId);
    return SAVED_PLAN_SCHEMA.parse(plan);
  }
}

@Controller('share')
export class PlannerShareController {
  constructor(private readonly savedPlansService: SavedPlansService) {}

  @Get('plans/:token')
  async getSharedPlan(@Param('token') token: string, @Req() req: RequestWithId) {
    const requestId = req.requestId;
    const response = await this.savedPlansService.getPlanByShareToken(token, requestId);
    return GET_SAVED_PLAN_RESPONSE_SCHEMA.parse(response);
  }
}
