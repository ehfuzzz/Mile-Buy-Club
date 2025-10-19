import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('sample-data')
  @ApiOperation({ summary: 'Populate database with sample flight data' })
  async seedSampleData() {
    return this.seedService.seedSampleData();
  }
}
