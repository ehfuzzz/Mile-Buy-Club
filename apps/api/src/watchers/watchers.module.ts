import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { DealsModule } from '../deals/deals.module';
import { WatchersController } from './watchers.controller';
import { WatchersService } from './watchers.service';

@Module({
  imports: [PrismaModule, DealsModule],
  controllers: [WatchersController],
  providers: [WatchersService],
})
export class WatchersModule {}
