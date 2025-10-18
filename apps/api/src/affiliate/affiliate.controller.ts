import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AffiliateService } from './affiliate.service';
import { ReportingService } from './reporting.service';

@ApiTags('affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(
    private readonly affiliateService: AffiliateService,
    private readonly reportingService: ReportingService
  ) {}

  @Post('link')
  @ApiOperation({ summary: 'Generate tracked affiliate link' })
  @ApiResponse({ status: 201, description: 'Affiliate link generated' })
  async generateLink(
    @Body()
    body: {
      userId?: string;
      dealId: string;
      provider: string;
      destinationUrl: string;
      network: 'impact' | 'cj' | 'booking' | 'direct';
    },
    @Res({ passthrough: true }) response: Response
  ) {
    const { trackedUrl, clickId } = await this.affiliateService.generateAffiliateLink(
      body
    );

    // Set attribution cookie
    response.cookie('mbc_attribution', clickId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { trackedUrl, clickId };
  }

  @Post('webhook/conversion')
  @ApiOperation({ summary: 'Handle conversion webhook from affiliate network' })
  @ApiResponse({ status: 200, description: 'Conversion processed' })
  async handleConversion(
    @Body()
    webhook: {
      networkId: string;
      transactionId: string;
      clickId: string;
      amount: number;
      commission: number;
      conversionDate: string;
    }
  ) {
    await this.affiliateService.handleConversionWebhook({
      ...webhook,
      conversionDate: new Date(webhook.conversionDate),
    });

    return { success: true };
  }

  @Get('report')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiResponse({ status: 200, description: 'Revenue report' })
  async getReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportingService.generateRevenueReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue estimate' })
  @ApiResponse({ status: 200, description: 'Revenue estimate' })
  async getRevenue(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy?: 'provider' | 'network' | 'day'
  ) {
    return this.affiliateService.getRevenueEstimate({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      groupBy,
    });
  }

  @Get('clicks/:userId')
  @ApiOperation({ summary: 'Get user click history' })
  @ApiResponse({ status: 200, description: 'User click history' })
  async getUserClicks(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.affiliateService.getUserClickHistory(userId, limit ? +limit : 50);
  }
}
