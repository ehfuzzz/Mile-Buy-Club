import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { PrismaService } from '../common/prisma/prisma.service';

interface DealAlertEmailPayload {
  dealId: string;
  title: string;
  price: number;
  currency: string;
  milesRequired?: number;
  cashPrice?: number;
  cashCurrency?: string;
  pointsCashPrice?: number;
  pointsCashCurrency?: string;
  bookingUrl?: string;
  airline?: string;
  cabin?: string;
  origin?: string;
  destination?: string;
  departTime?: string;
  pricingType?: string;
  availability?: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: Transporter | null = null;
  private readonly notificationsEnabled: boolean;
  private readonly emailNotificationsEnabled: boolean;

  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {
    this.notificationsEnabled = this.parseBoolean(this.configService.get('ENABLE_NOTIFICATIONS'), true);
    this.emailNotificationsEnabled = this.parseBoolean(
      this.configService.get('ENABLE_EMAIL_NOTIFICATIONS'),
      true,
    );
  }

  async createDealAlert(
    userId: string,
    dealId: string,
    title: string,
    message: string,
    sentVia: 'email' | 'push' | 'sms' | 'in-app'
  ): Promise<void> {
    if (!this.notificationsEnabled) {
      return;
    }

    await this.prisma.alert.upsert({
      where: { userId_dealId_type: { userId, dealId, type: 'deal_found' } },
      update: {
        title,
        message,
        sentVia,
        isRead: false,
        isClicked: false,
        createdAt: new Date(),
      },
      create: {
        userId,
        dealId,
        type: 'deal_found',
        title,
        message,
        sentVia,
      },
    });
  }

  async sendDealEmail(
    userId: string,
    watcherName: string,
    deals: DealAlertEmailPayload[],
  ): Promise<void> {
    if (!this.notificationsEnabled || !this.emailNotificationsEnabled) {
      this.logger.debug('Email notifications disabled, skipping send');
      return;
    }

    const transporter = await this.getTransporter();
    if (!transporter) {
      this.logger.warn('Email transporter not available, skipping deal email');
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      this.logger.warn(`User ${userId} missing email address, skipping notification`);
      return;
    }

    const fromAddress = this.configService.get('MAIL_FROM_ADDRESS') ?? 'alerts@milebuyclub.test';
    const fromName = this.configService.get('MAIL_FROM_NAME') ?? 'Mile Buy Club Alerts';

    const displayName = user.name?.split(' ')[0] ?? 'there';
    const html = this.buildDealsEmail(displayName, watcherName, deals);
    const subject = `${deals.length} new award deal${deals.length > 1 ? 's' : ''} found for ${watcherName}`;

    try {
      await transporter.sendMail({
        to: user.email,
        from: `${fromName} <${fromAddress}>`,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send deal alert email to ${user.email}`, error as Error);
    }
  }

  private async getTransporter(): Promise<Transporter | null> {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get('SMTP_HOST') ?? this.configService.get('MAIL_HOST') ?? 'localhost';
    const port = this.parseNumber(this.configService.get('SMTP_PORT'), 1025);
    const secure = port === 465;

    const username = this.configService.get('SMTP_USER') ?? this.configService.get('MAIL_USERNAME');
    const password = this.configService.get('SMTP_PASS') ?? this.configService.get('MAIL_PASSWORD');

    const transportOptions: any = {
      host,
      port,
      secure,
    };

    if (username && password) {
      transportOptions.auth = { user: username, pass: password };
    }

    try {
      this.transporter = nodemailer.createTransport(transportOptions);
      return this.transporter;
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error as Error);
      return null;
    }
  }

  private buildDealsEmail(
    firstName: string,
    watcherName: string,
    deals: DealAlertEmailPayload[],
  ): string {
    const rows = deals
      .map((deal) => {
        const pricingSnippets: string[] = [];

        if (deal.milesRequired) {
          const milesText = `${deal.milesRequired.toLocaleString()} miles`;
          const cashDue = deal.pointsCashPrice ?? deal.price;
          if (cashDue) {
            pricingSnippets.push(
              `${milesText} + ${deal.pointsCashCurrency ?? deal.currency} ${cashDue.toFixed(2)}`,
            );
          } else {
            pricingSnippets.push(milesText);
          }
        }

        if (deal.pointsCashPrice && deal.pointsCashCurrency && deal.pointsCashPrice > 0) {
          pricingSnippets.push(
            `Blend: ${deal.pointsCashCurrency} ${deal.pointsCashPrice.toFixed(2)}`,
          );
        }

        if (deal.cashPrice && deal.cashPrice > 0) {
          pricingSnippets.push(
            `Cash: ${deal.cashCurrency ?? deal.currency} ${deal.cashPrice.toFixed(2)}`,
          );
        }

        if (pricingSnippets.length === 0) {
          pricingSnippets.push(`${deal.currency} ${deal.price.toFixed(2)}`);
        }

        const pricingText = pricingSnippets.join(' · ');
        const cabinText = deal.cabin ? deal.cabin.replace('_', ' ') : 'Any cabin';
        const routeText = deal.origin && deal.destination ? `${deal.origin} → ${deal.destination}` : 'Award deal';
        const variantLabel = deal.pricingType
          ? deal.pricingType === 'award'
            ? 'Award fare'
            : deal.pricingType === 'cash'
            ? 'Cash fare'
            : 'Points + cash fare'
          : 'Deal';
        const availabilityLabel =
          typeof deal.availability === 'number'
            ? ` · ${deal.availability} seat${deal.availability === 1 ? '' : 's'} left`
            : '';
        const airlineText = deal.airline ? `${deal.airline}${deal.bookingUrl ? ' · ' : ''}` : '';
        const link = deal.bookingUrl
          ? `<a href="${deal.bookingUrl}" target="_blank" rel="noopener noreferrer">View booking</a>`
          : '';

        return `
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 16px; font-weight: 600; color: #111827;">${deal.title}</div>
              <div style="font-size: 14px; color: #4b5563; margin-top: 4px;">${variantLabel} · ${routeText} · ${cabinText}${availabilityLabel}</div>
              <div style="font-size: 14px; color: #1f2937; margin-top: 6px;">${airlineText}${pricingText}</div>
              ${link ? `<div style="margin-top: 8px;">${link}</div>` : ''}
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9fafb; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
            <h1 style="margin: 0; font-size: 22px; color: #111827;">Hi ${firstName},</h1>
            <p style="margin: 12px 0 0; font-size: 16px; color: #374151;">
              We just found ${deals.length} new award deal${deals.length > 1 ? 's' : ''} for <strong>${watcherName}</strong>.
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">${rows}</table>
          <div style="padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; background: #f3f4f6;">
            You're receiving this alert because you enabled notifications for this watcher.
          </div>
        </div>
      </div>
    `;
  }

  private parseNumber(value: string | number | undefined | null, fallback: number): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : fallback;
    }

    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private parseBoolean(value: string | boolean | undefined | null, fallback: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
    }

    return fallback;
  }
}
