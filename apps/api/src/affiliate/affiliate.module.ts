import { Module } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { AffiliateController } from './affiliate.controller';
import { LinkGenerator } from './link-generator';
import { AttributionService } from './attribution.service';
import { ReportingService } from './reporting.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AffiliateController],
  providers: [
    AffiliateService,
    LinkGenerator,
    AttributionService,
    ReportingService,
  ],
  exports: [AffiliateService, AttributionService],
})
export class AffiliateModule {}
