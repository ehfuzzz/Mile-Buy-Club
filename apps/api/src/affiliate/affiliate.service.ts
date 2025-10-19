import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { createLogger } from '@mile/shared/src/logger';
import { LinkGenerator } from './link-generator';
import { AttributionService } from './attribution.service';
import { getErrorMessage, getErrorStack } from '../common/utils/error.utils';

const logger = createLogger('AffiliateService');

export interface AffiliateClick {
  userId?: string;
  dealId: string;
  provider: string;
  affiliateNetwork: string;
  originalUrl: string;
  trackedUrl: string;
  clickedAt: Date;
  attributionCookie: string;
}

export interface ConversionWebhook {
  networkId: string;
  transactionId: string;
  clickId: string;
  amount: number;
  commission: number;
  conversionDate: Date;
}

@Injectable()
export class AffiliateService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private linkGenerator: LinkGenerator,
    private attributionService: AttributionService
  ) {}

  /**
   * Generate a tracked affiliate link
   */
  async generateAffiliateLink(params: {
    userId?: string;
    dealId: string;
    provider: string;
    destinationUrl: string;
    network: 'impact' | 'cj' | 'booking' | 'direct';
  }): Promise<{ trackedUrl: string; clickId: string }> {
    const { userId, dealId, provider, destinationUrl, network } = params;

    // Generate unique click ID
    const clickId = this.generateClickId();

    // Build tracked URL with parameters
    const trackedUrl = this.linkGenerator.buildTrackedUrl({
      network,
      destinationUrl,
      clickId,
      subId1: dealId,
      subId2: provider,
      subId3: userId || 'guest',
    });

    // Store click record
    await this.recordClick({
      userId,
      dealId,
      provider,
      affiliateNetwork: network,
      originalUrl: destinationUrl,
      trackedUrl,
      clickedAt: new Date(),
      attributionCookie: clickId,
    });

    // Set attribution cookie (30 days)
    this.attributionService.setAttributionCookie(clickId, 30);

    logger.info('Affiliate link generated', {
      clickId,
      dealId,
      provider,
      network,
    });

    return { trackedUrl, clickId };
  }

  /**
   * Record affiliate click
   */
  private async recordClick(click: AffiliateClick): Promise<void> {
    try {
      // TODO: Replace with actual Prisma call when AffiliateClick model exists
      // await this.prisma.affiliateClick.create({
      //   data: {
      //     userId: click.userId,
      //     dealId: click.dealId,
      //     provider: click.provider,
      //     network: click.affiliateNetwork,
      //     originalUrl: click.originalUrl,
      //     trackedUrl: click.trackedUrl,
      //     clickedAt: click.clickedAt,
      //     attributionCookie: click.attributionCookie,
      //   },
      // });

      logger.info('Click recorded', {
        dealId: click.dealId,
        provider: click.provider,
      });
    } catch (error) {
      logger.error('Failed to record click', {
        error: getErrorMessage(error),
        stack: getErrorStack(error),
      });
    }
  }

  /**
   * Handle conversion webhook from affiliate network
   */
  async handleConversionWebhook(webhook: ConversionWebhook): Promise<void> {
    try {
      // Find the original click
      const attribution = await this.attributionService.findClickByNetworkId(
        webhook.clickId
      );

      if (!attribution) {
        logger.warn('No matching click found for conversion', {
          clickId: webhook.clickId,
        });
        return;
      }

      // Record conversion
      // TODO: Replace with actual Prisma call when AffiliateConversion model exists
      // await this.prisma.affiliateConversion.create({
      //   data: {
      //     clickId: attribution.clickId,
      //     userId: attribution.userId,
      //     dealId: attribution.dealId,
      //     transactionId: webhook.transactionId,
      //     amount: webhook.amount,
      //     commission: webhook.commission,
      //     network: attribution.network,
      //     conversionDate: webhook.conversionDate,
      //   },
      // });

      logger.info('Conversion recorded', {
        clickId: webhook.clickId,
        amount: webhook.amount,
        commission: webhook.commission,
      });

      // Send notification to admin
      // TODO: Integrate with notification service
    } catch (error) {
      logger.error('Failed to process conversion webhook', {
        error: getErrorMessage(error),
        stack: getErrorStack(error),
      });
    }
  }

  /**
   * Get estimated revenue for a time period
   */
  async getRevenueEstimate(params: {
    startDate: Date;
    endDate: Date;
    groupBy?: 'provider' | 'network' | 'day';
  }): Promise<any> {
    const { startDate, endDate, groupBy } = params;

    // TODO: Implement with actual Prisma aggregation
    const mockData = {
      range: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: groupBy ?? 'provider',
      },
      totalClicks: 12456,
      totalConversions: 187,
      conversionRate: 0.015,
      totalRevenue: 8420.5,
      totalCommission: 842.05,
      byProvider: [
        { provider: 'Booking.com', clicks: 5432, revenue: 3200, commission: 320 },
        { provider: 'Expedia', clicks: 4123, revenue: 2800, commission: 280 },
        { provider: 'Hotels.com', clicks: 2901, revenue: 2420.5, commission: 242.05 },
      ],
    };

    return mockData;
  }

  /**
   * Get user's click history
   */
  async getUserClickHistory(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const resultLimit = Math.max(1, Math.min(limit, 500));
      // TODO: Replace with actual Prisma query
      // return await this.prisma.affiliateClick.findMany({
      //   where: { userId },
      //   orderBy: { clickedAt: 'desc' },
      //   take: limit,
      //   include: {
      //     deal: true,
      //     conversion: true,
      //   },
      // });

      return Array.from({ length: 0 }).slice(0, resultLimit);
    } catch (error) {
      logger.error('Failed to get user click history', {
        userId,
        error: getErrorMessage(error),
        stack: getErrorStack(error),
      });
      return [];
    }
  }

  /**
   * Generate unique click ID
   */
  private generateClickId(): string {
    return `clk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
