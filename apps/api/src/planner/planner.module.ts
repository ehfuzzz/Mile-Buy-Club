import { Module } from '@nestjs/common';
import { PlannerController } from './planner.controller';
import { PlanService } from './plan.service';
import { FlightCacheRepository } from './flight-cache.repository';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [OnboardingModule],
  controllers: [PlannerController],
  providers: [PlanService, FlightCacheRepository],
  exports: [PlanService],
})
export class PlannerModule {}
