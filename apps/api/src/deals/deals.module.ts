import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { DataCollectionModule } from '../data-collection/data-collection.module';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { SeatsAeroPartnerService } from './seats-aero-partner.service';

@Module({
  imports: [PrismaModule, forwardRef(() => DataCollectionModule)],
  controllers: [DealsController],
  providers: [DealsService, SeatsAeroPartnerService],
  exports: [DealsService, SeatsAeroPartnerService],
})
export class DealsModule {}
