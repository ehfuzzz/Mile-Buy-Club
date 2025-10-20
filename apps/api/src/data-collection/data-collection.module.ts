import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../common/prisma/prisma.module';
import { DealsModule } from '../deals/deals.module';
import { SeatsAeroCollectorService } from './seats-aero-collector.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    forwardRef(() => DealsModule),
  ],
  providers: [SeatsAeroCollectorService],
  exports: [SeatsAeroCollectorService],
})
export class DataCollectionModule {}
