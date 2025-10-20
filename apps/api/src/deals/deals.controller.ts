import { Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  @Post('admin/refresh-seats-aero')
  @ApiOperation({ summary: 'Trigger SeatsAero cache refresh' })
  async refreshSeatsAeroData() {
    await this.dealsService.refreshSeatsAeroData();
    return { message: 'SeatsAero data refresh initiated' };
  }

  @Get('admin/seats-aero-stats')
  @ApiOperation({ summary: 'Get cached SeatsAero program counts' })
  async getSeatsAeroStats() {
    return this.dealsService.getSeatsAeroStats();
  }

  @Get(':dealId/booking-url')
  @ApiOperation({ summary: 'Get booking URL for a specific deal' })
  async getBookingUrl(@Param('dealId') dealId: string) {
    const bookingUrl = await this.dealsService.getBookingUrlForDeal(dealId);
    return { bookingUrl };
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
