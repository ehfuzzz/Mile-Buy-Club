import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { createLogger } from '@mile/shared/src/logger';
import { getErrorMessage, getErrorStack } from '../common/utils/error.utils';

const logger = createLogger('Health');

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
  })
  async healthCheck() {
    try {
      await this.prisma.healthCheck();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      logger.error('Health check failed', {
        error: getErrorMessage(error),
        stack: getErrorStack(error),
      });
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: getErrorMessage(error),
      };
    }
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  async liveness() {
    // Liveness: just check if the service is running
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
    schema: {
      example: {
        status: 'ready',
        timestamp: '2024-10-17T20:00:00Z',
        checks: {
          database: 'up',
          redis: 'up',
          providers: 'up',
        },
      },
    },
  })
  async readiness() {
    const checks = {
      database: 'down',
      redis: 'unknown',
      providers: 'unknown',
    };

    try {
      // Check database
      await this.prisma.healthCheck();
      checks.database = 'up';
    } catch (error) {
      logger.error('Database check failed', {
        error: getErrorMessage(error),
        stack: getErrorStack(error),
      });
    }

    // TODO: Add Redis check
    // TODO: Add provider health check

    const isReady = checks.database === 'up';

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
