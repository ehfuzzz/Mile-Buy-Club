/**
 * Watcher Processor
 * Processes watcher runs: batch searches, deduplicate, cache, store deals, send alerts
 */
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import {
  Flight,
  FlightPricingOption,
  FlightPricingOptionType,
  FlightSearchParams,
  ProviderName,
  ProviderResponse,
  ProviderType,
  providerRegistry,
} from '@mile/providers';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QUEUE_NAMES } from './queue.module';

interface WatcherJobData {
  watcherId: string;
  userId: string;
  watcherType: 'flight' | 'hotel' | 'activity';
  searchParams: any;
  priority: number;
}

interface ProcessedDeal {
  watcherId: string;
  type: 'flight';
  provider: ProviderName;
  externalId: string;
  title: string;
  price: number;
  currency: string;
  milesRequired?: number;
  cabin?: string;
  airline?: string;
  origin: string;
  destination: string;
  departTime?: string;
  arrivalTime?: string;
  bookingUrl?: string;
  availability?: number;
  taxes?: number;
  cashPrice?: number;
  cashCurrency?: string;
  pointsCashPrice?: number;
  pointsCashCurrency?: string;
  pointsCashMiles?: number;
  pricingOptions?: FlightPricingOption[];
  primaryPricingType: FlightPricingOptionType;
  score: number;
  data: Flight;
  persistedDealId?: string;
}

type FlightProviderSearchResult =
  | { provider: ProviderName; result: ProviderResponse<Flight[]> }
  | { provider: ProviderName; error: string };

@Injectable()
@Processor(QUEUE_NAMES.WATCHER)
export class WatcherProcessor {
  private readonly logger = new Logger(WatcherProcessor.name);
  private searchCache = new Map<string, { data: Flight[]; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Process({ concurrency: 5 })
  async processWatcher(job: Job<WatcherJobData>): Promise<ProcessedDeal[]> {
    const { watcherId, userId, watcherType, searchParams, priority } = job.data;

    this.logger.log(
      `Processing watcher ${watcherId} for user ${userId} with priority ${priority ?? 'normal'}`
    );

    try {
      if (watcherType !== 'flight') {
        this.logger.warn(`Watcher type ${watcherType} is not yet supported for automated processing`);
        return [];
      }

      const normalizedParams = this.normalizeFlightParams(searchParams);

      // 1. Check cache first
      const cacheKey = this.generateCacheKey(watcherType, normalizedParams);
      const cached = this.getCachedResult(cacheKey);

      if (cached) {
        this.logger.log(`Cache hit for ${cacheKey}`);
        const dealsFromCache = this.processResults(watcherId, cached, normalizedParams);

        if (dealsFromCache.length === 0) {
          await this.expireDealsNotInList(watcherId, []);
          return [];
        }

        const persistedFromCache = await this.storeDeals(userId, dealsFromCache, normalizedParams);
        await this.checkAndSendAlerts(userId, watcherId, persistedFromCache);
        return persistedFromCache;
      }

      // 2. Perform search (deduplicated via cache)
      const results = await this.performSearch(watcherType, normalizedParams);

      // 3. Cache the results
      this.setCachedResult(cacheKey, results);

      // 4. Process and rank deals
      const deals = this.processResults(watcherId, results, normalizedParams);

      if (deals.length === 0) {
        await this.expireDealsNotInList(watcherId, []);
        this.logger.log(`Completed watcher ${watcherId}: no available deals after filtering`);
        return [];
      }

      // 5. Store new deals to database
      const persistedDeals = await this.storeDeals(userId, deals, normalizedParams);

      // 6. Check for alert-worthy deals
      await this.checkAndSendAlerts(userId, watcherId, persistedDeals);

      this.logger.log(`Completed watcher ${watcherId}: ${deals.length} deals found`);

      return persistedDeals;
    } catch (error) {
      this.logger.error(`Error processing watcher ${watcherId}:`, error);
      throw error;
    }
  }

  private generateCacheKey(type: string, params: any): string {
    const normalized = JSON.stringify(params, Object.keys(params).sort());
    return `${type}:${normalized}`;
  }

  private getCachedResult(key: string): Flight[] | null {
    const cached = this.searchCache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.searchCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedResult(key: string, data: Flight[]): void {
    this.searchCache.set(key, { data, timestamp: Date.now() });

    // Cleanup old cache entries
    if (this.searchCache.size > 1000) {
      const oldest = Array.from(this.searchCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 200);
      oldest.forEach(([key]) => this.searchCache.delete(key));
    }
  }

  private async performSearch(type: string, params: FlightSearchParams): Promise<Flight[]> {
    if (type !== 'flight') {
      return [];
    }

    const providers = providerRegistry.listProviders(ProviderType.FLIGHT);
    if (providers.length === 0) {
      this.logger.warn('No flight providers registered; skipping search');
      return [];
    }

    this.logger.log(`Performing ${type} search across ${providers.length} providers`);

    const providerResults = (await providerRegistry.searchFlightsAcrossProviders(
      params,
    )) as FlightProviderSearchResult[];

    const flights: Flight[] = [];

    for (const entry of providerResults) {
      if ('error' in entry) {
        this.logger.warn(`Provider ${entry.provider} failed: ${entry.error}`);
        continue;
      }

      if (!entry.result.success || !entry.result.data) {
        this.logger.warn(`Provider ${entry.provider} returned no successful data`);
        continue;
      }

      flights.push(
        ...entry.result.data.map((flight) => ({
          ...flight,
          provider: flight.provider ?? entry.provider,
        })),
      );
    }

    return flights;
  }

  private processResults(
    watcherId: string,
    results: Flight[],
    searchParams: FlightSearchParams,
  ): ProcessedDeal[] {
    const allDeals: ProcessedDeal[] = [];
    const seenKeys = new Set<string>();

    for (const flight of results) {
      if (!this.isFlightAvailable(flight, searchParams)) {
        this.logger.debug(
          `Skipping ${flight.provider}:${flight.id} - insufficient availability for requested passengers`,
        );
        continue;
      }

      const flightDeals = this.expandFlightDeals(watcherId, flight, searchParams);

      for (const deal of flightDeals) {
        const dedupeKey = `${deal.provider}:${deal.externalId}`;
        if (seenKeys.has(dedupeKey)) {
          continue;
        }
        seenKeys.add(dedupeKey);
        allDeals.push(deal);
      }
    }

    return allDeals.sort((a, b) => b.score - a.score);
  }

  private expandFlightDeals(
    watcherId: string,
    flight: Flight,
    searchParams: FlightSearchParams,
  ): ProcessedDeal[] {
    const pricingOptions = this.normalizePricingOptions(flight);

    if (pricingOptions.length === 0) {
      return [
        this.buildProcessedDeal(watcherId, flight, searchParams, pricingOptions, undefined, 'base'),
      ];
    }

    const deals: ProcessedDeal[] = [];
    const seenVariantKeys = new Set<string>();

    pricingOptions.forEach((option) => {
      const variantKey = this.buildPricingOptionKey(option);
      if (seenVariantKeys.has(variantKey)) {
        return;
      }
      seenVariantKeys.add(variantKey);
      deals.push(
        this.buildProcessedDeal(watcherId, flight, searchParams, pricingOptions, option, variantKey),
      );
    });

    return deals;
  }

  private buildProcessedDeal(
    watcherId: string,
    flight: Flight,
    searchParams: FlightSearchParams,
    pricingOptions: FlightPricingOption[],
    primaryOption?: FlightPricingOption,
    variantKey: string = 'base',
  ): ProcessedDeal {
    const awardOption = this.findPricingOption(pricingOptions, 'award');
    const cashOption = this.findPricingOption(pricingOptions, 'cash');
    const pointsPlusCashOption = this.findPricingOption(pricingOptions, 'points_plus_cash');
    const primary = primaryOption ?? this.pickPrimaryPricingOption(flight, pricingOptions);

    const currency = primary?.cashCurrency ?? flight.currency ?? cashOption?.cashCurrency ?? 'USD';
    const price = primary?.cashAmount ?? flight.price ?? cashOption?.cashAmount ?? 0;
    const bookingUrl =
      primary?.bookingUrl ??
      flight.bookingUrl ??
      awardOption?.bookingUrl ??
      cashOption?.bookingUrl ??
      pointsPlusCashOption?.bookingUrl;

    const milesRequired =
      primary?.type === 'award' || primary?.type === 'points_plus_cash'
        ? primary.miles ?? awardOption?.miles ?? flight.milesRequired
        : awardOption?.miles ?? flight.milesRequired;

    const cashPrice =
      primary?.type === 'cash'
        ? primary.cashAmount
        : cashOption?.cashAmount ?? flight.cashPrice ?? undefined;

    const pointsCashPrice =
      primary?.type === 'points_plus_cash'
        ? primary.cashAmount
        : pointsPlusCashOption?.cashAmount ?? flight.pointsCashPrice ?? awardOption?.cashAmount;

    const pointsCashMiles =
      primary?.type === 'points_plus_cash'
        ? primary.miles
        : pointsPlusCashOption?.miles ?? flight.pointsCashMiles ?? undefined;

    const title = this.formatDealTitle(
      flight,
      searchParams,
      primary?.type ?? (flight.milesRequired ? 'award' : 'cash'),
      milesRequired ?? undefined,
      price,
      currency,
      pointsCashMiles ?? undefined,
    );

    const externalId = primary ? `${flight.id}:${variantKey}` : `${flight.id}:base`;

    const deal: ProcessedDeal = {
      watcherId,
      type: 'flight',
      provider: flight.provider,
      externalId,
      title,
      price,
      currency,
      milesRequired: milesRequired ?? undefined,
      cabin: flight.cabin,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      bookingUrl: bookingUrl ?? undefined,
      availability: flight.availability,
      taxes: flight.taxes,
      cashPrice: cashPrice ?? undefined,
      cashCurrency:
        cashOption?.cashCurrency ?? flight.cashCurrency ?? (cashPrice !== undefined ? currency : undefined),
      pointsCashPrice: pointsCashPrice ?? undefined,
      pointsCashCurrency:
        pointsCashPrice !== undefined
          ? pointsPlusCashOption?.cashCurrency ?? flight.pointsCashCurrency ?? currency
          : undefined,
      pointsCashMiles: pointsCashMiles ?? undefined,
      pricingOptions: pricingOptions.length > 0 ? pricingOptions : undefined,
      primaryPricingType: primary?.type ?? (flight.milesRequired ? 'award' : 'cash'),
      score: 0,
      data: flight,
    };

    deal.score = this.calculateDealScore(deal);

    return deal;
  }

  private buildPricingOptionKey(option: FlightPricingOption): string {
    const milesPart = typeof option.miles === 'number' ? option.miles : 'na';
    const cashAmountPart =
      typeof option.cashAmount === 'number' ? option.cashAmount.toFixed(2) : 'na';
    const currency = option.cashCurrency ?? 'USD';
    return `${option.type}-${milesPart}-${currency}-${cashAmountPart}`;
  }

  private formatDealTitle(
    flight: Flight,
    searchParams: FlightSearchParams,
    pricingType: FlightPricingOptionType,
    milesRequired: number | undefined,
    cashComponent: number,
    currency: string,
    blendedMiles?: number,
  ): string {
    const baseTitle = `${flight.airline ?? flight.provider} ${flight.origin} → ${flight.destination} ${this.formatDate(
      flight.departureTime ?? searchParams.departDate,
    )}`;

    const labelParts: string[] = [];
    if (pricingType === 'award') {
      if (typeof milesRequired === 'number') {
        labelParts.push(`${milesRequired.toLocaleString()} miles`);
      }
      if (cashComponent) {
        labelParts.push(`${currency} ${cashComponent.toFixed(2)}`);
      }
    } else if (pricingType === 'cash') {
      labelParts.push(`${currency} ${cashComponent.toFixed(2)} cash`);
    } else if (pricingType === 'points_plus_cash') {
      if (typeof blendedMiles === 'number' && blendedMiles > 0) {
        labelParts.push(`${blendedMiles.toLocaleString()} miles`);
      }
      labelParts.push(`${currency} ${cashComponent.toFixed(2)} cash`);
    }

    if (labelParts.length === 0) {
      return baseTitle;
    }

    return `[${labelParts.join(' + ')}] ${baseTitle}`;
  }

  private isFlightAvailable(flight: Flight, searchParams: FlightSearchParams): boolean {
    const passengerCount = this.getPassengerCount(searchParams);
    if (typeof flight.availability === 'number') {
      return flight.availability >= passengerCount && flight.availability > 0;
    }

    return true;
  }

  private getPassengerCount(params: FlightSearchParams): number {
    const adults = params.passengers?.adults ?? 1;
    const children = params.passengers?.children ?? 0;
    const infants = params.passengers?.infants ?? 0;
    return adults + children + infants;
  }

  private normalizePricingOptions(flight: Flight): FlightPricingOption[] {
    const options: FlightPricingOption[] = [];

    if (Array.isArray(flight.pricingOptions)) {
      options.push(...flight.pricingOptions);
    }

    if (
      typeof flight.milesRequired === 'number' &&
      !options.some((option) => option.type === 'award')
    ) {
      options.push({
        type: 'award',
        miles: flight.milesRequired,
        cashAmount: flight.pointsCashPrice ?? flight.price ?? 0,
        cashCurrency: flight.pointsCashCurrency ?? flight.currency ?? 'USD',
        provider: flight.provider,
        bookingUrl: flight.bookingUrl,
      });
    }

    if (typeof flight.cashPrice === 'number' && !options.some((opt) => opt.type === 'cash')) {
      options.push({
        type: 'cash',
        cashAmount: flight.cashPrice,
        cashCurrency: flight.cashCurrency ?? flight.currency ?? 'USD',
        provider: flight.provider,
        bookingUrl: flight.bookingUrl,
      });
    }

    if (
      (typeof flight.pointsCashPrice === 'number' || typeof flight.pointsCashMiles === 'number') &&
      !options.some((opt) => opt.type === 'points_plus_cash')
    ) {
      options.push({
        type: 'points_plus_cash',
        miles: flight.pointsCashMiles,
        cashAmount: flight.pointsCashPrice ?? flight.price ?? 0,
        cashCurrency: flight.pointsCashCurrency ?? flight.currency ?? 'USD',
        provider: flight.provider,
        bookingUrl: flight.bookingUrl,
        isEstimated: true,
        description: 'Provider supplied blended pricing',
      });
    }

    return options;
  }

  private findPricingOption(
    options: FlightPricingOption[],
    type: FlightPricingOptionType,
  ): FlightPricingOption | undefined {
    return options.find((option) => option.type === type);
  }

  private pickPrimaryPricingOption(
    flight: Flight,
    options: FlightPricingOption[],
  ): FlightPricingOption | undefined {
    const award = this.findPricingOption(options, 'award');
    const pointsPlusCash = this.findPricingOption(options, 'points_plus_cash');
    const cash = this.findPricingOption(options, 'cash');

    if (award && typeof flight.milesRequired === 'number') {
      return award;
    }

    if (pointsPlusCash && typeof pointsPlusCash.miles === 'number') {
      return pointsPlusCash;
    }

    return award ?? cash ?? pointsPlusCash;
  }

  private formatDate(value?: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
        }).format(date);
  }

  private calculateDealScore(deal: ProcessedDeal): number {
    const baseScore = 35;

    let valueScore = 0;
    if (typeof deal.milesRequired === 'number' && deal.milesRequired > 0) {
      valueScore += Math.max(0, 35 - deal.milesRequired / 1200);
      const blendedCash = deal.pointsCashPrice ?? deal.price;
      valueScore += blendedCash ? Math.max(0, 20 - Math.max(0, blendedCash - 150) / 12) : 15;
    } else if (typeof deal.cashPrice === 'number') {
      valueScore += Math.max(0, 45 - Math.max(0, deal.cashPrice - 200) / 6);
    } else {
      valueScore += deal.price ? Math.max(0, 30 - Math.max(0, deal.price - 200) / 8) : 10;
    }

    const cabinBonus =
      deal.cabin === 'first'
        ? 18
        : deal.cabin === 'business'
        ? 14
        : deal.cabin === 'premium_economy'
        ? 7
        : 0;

    const availabilityBonus = deal.availability ? Math.min(15, deal.availability * 3) : 5;

    return Math.min(100, Math.round(baseScore + valueScore + cabinBonus + availabilityBonus));
  }

  private calculateCpp(deal: ProcessedDeal): number | null {
    if (!deal.milesRequired || deal.milesRequired <= 0) {
      return null;
    }

    const cashComponent = deal.pointsCashPrice ?? deal.price;
    if (!cashComponent || cashComponent <= 0) {
      return null;
    }

    const cpp = (cashComponent / deal.milesRequired) * 100;
    return Math.round(cpp * 100) / 100;
  }

  private calculateEstimatedValue(deal: ProcessedDeal): number | null {
    if (!deal.milesRequired || deal.milesRequired <= 0) {
      return null;
    }

    const assumedCentsPerMile = 1.5;
    const estimatedCashValue = (deal.milesRequired * assumedCentsPerMile) / 100;
    const cashComponent = deal.pointsCashPrice ?? deal.price ?? 0;
    const estimatedSavings = estimatedCashValue - cashComponent;
    return Math.round(estimatedSavings * 100) / 100;
  }

  private async storeDeals(
    userId: string,
    deals: ProcessedDeal[],
    searchParams: FlightSearchParams,
  ): Promise<ProcessedDeal[]> {
    if (deals.length === 0) {
      return deals;
    }

    const operations = deals.map((deal) => {
      const departDateValue = deal.departTime ?? searchParams.departDate;
      const returnDateValue = searchParams.returnDate ?? deal.arrivalTime ?? null;

      const departDate = this.parseDate(departDateValue);
      const returnDate = this.parseDate(returnDateValue);

      return this.prisma.deal.upsert({
        where: {
          watcherId_provider_externalId: {
            watcherId: deal.watcherId,
            provider: deal.provider,
            externalId: deal.externalId,
          },
        },
        update: {
          price: deal.price,
          currency: deal.currency,
          milesRequired: deal.milesRequired ?? null,
          cabin: deal.cabin ?? null,
          airline: deal.airline ?? null,
          origin: deal.origin,
          destination: deal.destination,
          departDate,
          returnDate,
          bookingUrl: deal.bookingUrl ?? null,
          taxes: deal.taxes ?? null,
          cashPrice: deal.cashPrice ?? null,
          cashCurrency: deal.cashCurrency ?? null,
          pointsCashPrice: deal.pointsCashPrice ?? null,
          pointsCashCurrency: deal.pointsCashCurrency ?? null,
          pointsCashMiles: deal.pointsCashMiles ?? null,
          availability: deal.availability ?? null,
          primaryPricingType: deal.primaryPricingType,
          pricingOptions: deal.pricingOptions ?? null,
          score: deal.score,
          title: deal.title,
          description: this.buildAlertMessage(deal),
          cpp: this.calculateCpp(deal),
          value: this.calculateEstimatedValue(deal),
          scoreBreakdown: {
            milesRequired: deal.milesRequired ?? null,
            taxes: deal.taxes ?? null,
            availability: deal.availability ?? null,
            cashPrice: deal.cashPrice ?? null,
            pointsCashPrice: deal.pointsCashPrice ?? null,
          },
          isNew: false,
        },
        create: {
          watcherId: deal.watcherId,
          userId,
          title: deal.title,
          description: this.buildAlertMessage(deal),
          type: 'flight',
          origin: deal.origin,
          destination: deal.destination,
          departDate,
          returnDate,
          cabin: deal.cabin ?? null,
          airline: deal.airline ?? null,
          milesRequired: deal.milesRequired ?? null,
          price: deal.price,
          currency: deal.currency,
          taxes: deal.taxes ?? null,
          cashPrice: deal.cashPrice ?? null,
          cashCurrency: deal.cashCurrency ?? null,
          pointsCashPrice: deal.pointsCashPrice ?? null,
          pointsCashCurrency: deal.pointsCashCurrency ?? null,
          pointsCashMiles: deal.pointsCashMiles ?? null,
          score: deal.score,
          scoreBreakdown: {
            milesRequired: deal.milesRequired ?? null,
            taxes: deal.taxes ?? null,
            availability: deal.availability ?? null,
            cashPrice: deal.cashPrice ?? null,
            pointsCashPrice: deal.pointsCashPrice ?? null,
          },
          provider: deal.provider,
          bookingUrl: deal.bookingUrl ?? null,
          status: 'active',
          isNew: true,
          externalId: deal.externalId,
          availability: deal.availability ?? null,
          primaryPricingType: deal.primaryPricingType,
          pricingOptions: deal.pricingOptions ?? null,
          cpp: this.calculateCpp(deal),
          value: this.calculateEstimatedValue(deal),
        },
      });
    });

    const persistedDeals = await this.prisma.$transaction(operations);
    persistedDeals.forEach((record, index) => {
      deals[index].persistedDealId = record.id;
    });

    const watcherId = deals[0]?.watcherId;
    if (watcherId) {
      await this.expireDealsNotInList(
        watcherId,
        persistedDeals.map((record) => record.id),
      );
    }

    this.logger.log(`Stored ${persistedDeals.length} deals for watcher ${deals[0]?.watcherId}`);

    return deals;
  }

  private async expireDealsNotInList(watcherId: string, activeIds: string[]): Promise<void> {
    const baseUpdate = {
      data: {
        status: 'expired',
        isNew: false,
      },
    };

    if (activeIds.length === 0) {
      await this.prisma.deal.updateMany({
        where: {
          watcherId,
          status: 'active',
        },
        ...baseUpdate,
      });
      return;
    }

    await this.prisma.deal.updateMany({
      where: {
        watcherId,
        status: 'active',
        id: { notIn: activeIds },
      },
      ...baseUpdate,
    });
  }

  private async checkAndSendAlerts(userId: string, watcherId: string, deals: ProcessedDeal[]): Promise<void> {
    if (deals.length === 0) {
      return;
    }

    const watcher = await this.prisma.watcher.findUnique({
      where: { id: watcherId },
      select: { name: true, minScore: true, notifyEmail: true, notifyPush: true },
    });

    const threshold = watcher?.minScore ?? 80;
    const watcherName = watcher?.name ?? 'flight watcher';

    const alertableDeals = deals.filter((deal) => deal.persistedDealId && deal.score >= threshold);

    if (alertableDeals.length === 0) {
      return;
    }

    this.logger.log(`Found ${alertableDeals.length} alert-worthy deals for user ${userId}`);

    for (const deal of alertableDeals) {
      if (!deal.persistedDealId) {
        continue;
      }

      await this.notifications.createDealAlert(
        userId,
        deal.persistedDealId,
        deal.title,
        this.buildAlertMessage(deal),
        watcher?.notifyEmail ? 'email' : watcher?.notifyPush ? 'push' : 'in-app',
      );
    }

    if (watcher?.notifyEmail) {
      await this.notifications.sendDealEmail(
        userId,
        watcherName,
        alertableDeals.map((deal) => ({
          dealId: deal.persistedDealId!,
          title: deal.title,
          price: deal.price,
          currency: deal.currency,
          milesRequired: deal.milesRequired,
          cashPrice: deal.cashPrice,
          cashCurrency: deal.cashCurrency,
          pointsCashPrice: deal.pointsCashPrice,
          pointsCashCurrency: deal.pointsCashCurrency,
          bookingUrl: deal.bookingUrl,
          airline: deal.airline,
          cabin: deal.cabin,
          origin: deal.origin,
          destination: deal.destination,
          departTime: deal.departTime,
          pricingType: deal.primaryPricingType,
          availability: deal.availability,
        })),
      );
    }
  }

  private normalizeFlightParams(params: any): FlightSearchParams {
    const passengers = params?.passengers ?? { adults: 1, children: 0, infants: 0 };

    return {
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate ?? params.departureDate,
      returnDate: params.returnDate ?? undefined,
      passengers,
      cabin: params.cabin,
    };
  }

  private buildAlertMessage(deal: ProcessedDeal): string {
    const route = `${deal.origin} → ${deal.destination}`;
    const airline = deal.airline ?? deal.provider;

    const pricingSnippets: string[] = [];

    if (deal.milesRequired) {
      const milesText = `${deal.milesRequired.toLocaleString()} miles`;
      const cashDue = deal.pointsCashPrice ?? deal.price;
      if (cashDue) {
        pricingSnippets.push(`${milesText} + ${deal.pointsCashCurrency ?? deal.currency} ${cashDue.toFixed(2)}`);
      } else {
        pricingSnippets.push(milesText);
      }
    }

    if (
      typeof deal.pointsCashMiles === 'number' &&
      deal.pointsCashMiles > 0 &&
      deal.pointsCashPrice
    ) {
      pricingSnippets.push(
        `${deal.pointsCashMiles.toLocaleString()} miles + ${deal.pointsCashCurrency ?? deal.currency} ${deal.pointsCashPrice.toFixed(2)} (blend)`,
      );
    }

    if (typeof deal.cashPrice === 'number' && deal.cashPrice > 0) {
      pricingSnippets.push(`${deal.cashCurrency ?? deal.currency} ${deal.cashPrice.toFixed(2)} cash`);
    }

    if (pricingSnippets.length === 0) {
      const fallbackPrice = typeof deal.price === 'number' ? deal.price : 0;
      pricingSnippets.push(`${deal.currency} ${fallbackPrice.toFixed(2)}`);
    }

    const descriptor = this.describePrimaryPricing(deal);

    return `${descriptor ? `${descriptor} ` : ''}${airline} ${route} for ${pricingSnippets.join(
      ' | ',
    )}`;
  }

  private describePrimaryPricing(deal: ProcessedDeal): string | null {
    switch (deal.primaryPricingType) {
      case 'award':
        return 'Award fare';
      case 'cash':
        return 'Cash fare';
      case 'points_plus_cash':
        return 'Points + cash fare';
      default:
        return null;
    }
  }

  private parseDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
