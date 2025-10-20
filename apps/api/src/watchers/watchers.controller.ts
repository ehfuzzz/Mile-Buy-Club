import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DealsService } from '../deals/deals.service';
import { WatchersService } from './watchers.service';

@ApiTags('watchers')
@Controller('watchers')
export class WatchersController {
  constructor(
    private readonly watchersService: WatchersService,
    private readonly dealsService: DealsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List watchers with their latest deal snapshots' })
  @ApiQuery({ name: 'userId', required: false })
  async listWatchers(@Query('userId') userId?: string) {
    return this.watchersService.listWatchers(userId);
  }

  @Get('deals')
  @ApiOperation({ summary: 'List deals across all watchers' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'programs',
    required: false,
    description: 'Comma-separated list of loyalty programs to query (defaults to all)',
  })
  async listDeals(
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('programs') programs?: string,
  ) {
    const take = limit ? Number(limit) : undefined;
    const programList = programs
      ? programs
          .split(',')
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      : undefined;

    return this.dealsService.listDeals(userId, take, programList);
  }
}
