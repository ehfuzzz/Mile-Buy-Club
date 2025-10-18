import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TrackedLinkParams {
  network: 'impact' | 'cj' | 'booking' | 'direct';
  destinationUrl: string;
  clickId: string;
  subId1?: string;
  subId2?: string;
  subId3?: string;
}

@Injectable()
export class LinkGenerator {
  constructor(private configService: ConfigService) {}

  /**
   * Build tracked affiliate URL with network-specific parameters
   */
  buildTrackedUrl(params: TrackedLinkParams): string {
    const { network, destinationUrl, clickId, subId1, subId2, subId3 } = params;

    switch (network) {
      case 'impact':
        return this.buildImpactUrl(destinationUrl, clickId, subId1, subId2, subId3);
      case 'cj':
        return this.buildCJUrl(destinationUrl, clickId, subId1, subId2, subId3);
      case 'booking':
        return this.buildBookingUrl(destinationUrl, clickId, subId1);
      case 'direct':
        return this.buildDirectUrl(destinationUrl, clickId, subId1);
      default:
        return destinationUrl;
    }
  }

  /**
   * Build Impact Radius affiliate link
   */
  private buildImpactUrl(
    url: string,
    clickId: string,
    subId1?: string,
    subId2?: string,
    subId3?: string
  ): string {
    const impactCampaignId = this.configService.get('IMPACT_CAMPAIGN_ID');
    const impactAccountId = this.configService.get('IMPACT_ACCOUNT_ID');

    const baseUrl = `https://impact.com/campaign-promo/${impactCampaignId}`;
    const params = new URLSearchParams({
      accountId: impactAccountId,
      clickId,
      ...(subId1 && { subId1 }),
      ...(subId2 && { subId2 }),
      ...(subId3 && { subId3 }),
      u: encodeURIComponent(url),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Build Commission Junction affiliate link
   */
  private buildCJUrl(
    url: string,
    clickId: string,
    subId1?: string,
    subId2?: string,
    subId3?: string
  ): string {
    const cjWebsiteId = this.configService.get('CJ_WEBSITE_ID');

    const params = new URLSearchParams({
      website: cjWebsiteId,
      clickId,
      ...(subId1 && { subId1 }),
      ...(subId2 && { subId2 }),
      ...(subId3 && { subId3 }),
      url: encodeURIComponent(url),
    });

    return `https://www.anrdoezrs.net/links/${cjWebsiteId}/type/dlg/${params.toString()}`;
  }

  /**
   * Build Booking.com affiliate link
   */
  private buildBookingUrl(url: string, clickId: string, subId1?: string): string {
    const bookingAffiliateId = this.configService.get('BOOKING_AFFILIATE_ID');

    const params = new URLSearchParams({
      aid: bookingAffiliateId,
      label: clickId,
      ...(subId1 && { sid: subId1 }),
    });

    // Add params to existing URL
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  /**
   * Build direct affiliate link (for custom partnerships)
   */
  private buildDirectUrl(url: string, clickId: string, subId1?: string): string {
    const params = new URLSearchParams({
      ref: 'milebuyclub',
      click_id: clickId,
      ...(subId1 && { deal_id: subId1 }),
    });

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  /**
   * Shorten URL using link shortener (optional)
   */
  async shortenUrl(longUrl: string): Promise<string> {
    // TODO: Integrate with link shortener service (Bitly, TinyURL, etc.)
    // For now, return original URL
    return longUrl;
  }
}
