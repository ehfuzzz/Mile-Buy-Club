import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { SeatsAeroPartnerService } from './seats-aero-partner.service';

@Module({
  imports: [PrismaModule],
  controllers: [DealsController],
  providers: [DealsService, SeatsAeroPartnerService],
  exports: [DealsService],
})
export class DealsModule {}
