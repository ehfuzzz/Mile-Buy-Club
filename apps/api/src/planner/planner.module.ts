import { Module } from '@nestjs/common';
import { PlannerController, PlannerShareController } from './planner.controller';
import { PlanService } from './plan.service';
import { FlightCacheRepository } from './flight-cache.repository';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { SavedPlansService } from './saved-plans.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [OnboardingModule, PrismaModule],
  controllers: [PlannerController, PlannerShareController],
  providers: [PlanService, FlightCacheRepository, SavedPlansService],
  exports: [PlanService],
})
export class PlannerModule {}
