import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { TRIP_QUERY_SCHEMA, PLAN_RESPONSE_SCHEMA, TripQuery } from '@mile/shared';
import { PlanService } from './plan.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { RequestWithId } from '../common/types/request-with-id';

@Controller('planner')
export class PlannerController {
  constructor(
    private readonly planService: PlanService,
    private readonly onboardingService: OnboardingService,
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
}
