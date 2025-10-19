import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { createLogger } from '@mile/shared/src/logger';
import { getErrorMessage, getErrorStack } from '../common/utils/error.utils';

const logger = createLogger('AffiliateReporting');

export interface RevenueReport {
  period: { start: Date; end: Date };
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalCommission: number;
  byProvider: ProviderRevenue[];
  byNetwork: NetworkRevenue[];
  topDeals: DealRevenue[];
}

interface ProviderRevenue {
  provider: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface NetworkRevenue {
  network: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

interface DealRevenue {
  dealId: string;
  dealTitle: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate comprehensive revenue report
   */
  async generateRevenueReport(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<RevenueReport> {
    const { startDate, endDate } = params;

    try {
      // TODO: Replace with actual Prisma aggregations
      // const [clicks, conversions] = await Promise.all([
      //   this.prisma.affiliateClick.count({
      //     where: {
      //       clickedAt: { gte: startDate, lte: endDate },
      //     },
      //   }),
      //   this.prisma.affiliateConversion.findMany({
      //     where: {
      //       conversionDate: { gte: startDate, lte: endDate },
      //     },
      //     include: {
      //       click: true,
      //     },
      //   }),
      // ]);

      // Mock data for now
      const report: RevenueReport = {
        period: { start: startDate, end: endDate },
        totalClicks: 12456,
        totalConversions: 187,
        conversionRate: 0.015,
        totalRevenue: 8420.5,
        totalCommission: 842.05,
        byProvider: [
          {
            provider: 'Booking.com',
            clicks: 5432,
            conversions: 82,
            revenue: 3200,
            commission: 320,
          },
          {
            provider: 'Expedia',
            clicks: 4123,
            conversions: 62,
            revenue: 2800,
            commission: 280,
          },
          {
            provider: 'Hotels.com',
            clicks: 2901,
            conversions: 43,
            revenue: 2420.5,
            commission: 242.05,
          },
        ],
        byNetwork: [
          {
            network: 'booking',
            clicks: 5432,
            conversions: 82,
            revenue: 3200,
            commission: 320,
          },
          {
            network: 'impact',
            clicks: 4893,
            conversions: 73,
            revenue: 3780,
            commission: 378,
          },
          {
            network: 'cj',
            clicks: 2131,
            conversions: 32,
            revenue: 1440.5,
            commission: 144.05,
          },
        ],
        topDeals: [
          {
            dealId: 'deal-123',
            dealTitle: 'Paris Business Class - 50k points',
            clicks: 423,
            conversions: 12,
            revenue: 450,
          },
          {
            dealId: 'deal-456',
            dealTitle: 'Maldives Luxury Resort - $299/night',
            clicks: 381,
            conversions: 11,
            revenue: 420,
          },
          {
            dealId: 'deal-789',
            dealTitle: 'Tokyo First Class - 70k points',
            clicks: 352,
            conversions: 10,
            revenue: 380,
          },
        ],
      };

      logger.info('Revenue report generated', {
        startDate,
        endDate,
        totalRevenue: report.totalRevenue,
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate revenue report', {
        error: getErrorMessage(error),
        stack: getErrorStack(error),
      });
      throw error instanceof Error ? error : new Error(getErrorMessage(error));
    }
  }

  /**
   * Get daily revenue trend
   */
  async getDailyRevenueTrend(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<any[]> {
    const { startDate, endDate } = params;
    const dayInMs = 24 * 60 * 60 * 1000;
    const days = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / dayInMs)
    );

    // TODO: Replace with real aggregation once analytics is wired up
    return Array.from({ length: days }).map((_, index) => ({
      date: new Date(startDate.getTime() + index * dayInMs).toISOString(),
      revenue: 0,
      conversions: 0,
    }));
  }

  /**
   * Export report as CSV
   */
  async exportReportCSV(report: RevenueReport): Promise<string> {
    const rows = [
      ['Provider', 'Clicks', 'Conversions', 'Revenue', 'Commission'],
      ...report.byProvider.map((p) => [
        p.provider,
        p.clicks.toString(),
        p.conversions.toString(),
        p.revenue.toFixed(2),
        p.commission.toFixed(2),
      ]),
    ];

    return rows.map((row) => row.join(',')).join('\n');
  }
}
