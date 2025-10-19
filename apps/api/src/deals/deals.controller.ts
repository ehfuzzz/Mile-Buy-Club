import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DealsService } from './deals.service';

@ApiTags('deals')
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'List active deals for a user' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listDeals(@Query('userId') userId?: string, @Query('limit') limit?: string) {
    const take = limit ? Number(limit) : undefined;
    return this.dealsService.listDeals(userId, take);
  }

  @Get('debug')
  @ApiOperation({ summary: 'Debug SeatsAero service' })
  async debugSeatsAero() {
    return this.dealsService.debugSeatsAero();
  }

  @Get(':watcherId')
  @ApiOperation({ summary: 'List deals for a specific watcher' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listDealsForWatcher(
    @Param('watcherId') watcherId: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? Number(limit) : undefined;
    return this.dealsService.listDealsForWatcher(watcherId, userId, take);
  }
}
