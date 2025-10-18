/**
 * Provider Registry - Central coordinator for all providers
 */
import { FlightProvider } from './base/FlightProvider';
import { HotelProvider } from './base/HotelProvider';
import { ActivityProvider } from './base/ActivityProvider';
import {
  ProviderName,
  ProviderType,
  ProviderHealthCheck,
  FlightSearchParams,
  HotelSearchParams,
  ActivitySearchParams,
} from './base/types';

type AnyProvider = FlightProvider | HotelProvider | ActivityProvider;

export class ProviderRegistry {
  private flightProviders = new Map<ProviderName, FlightProvider>();
  private hotelProviders = new Map<ProviderName, HotelProvider>();
  private activityProviders = new Map<ProviderName, ActivityProvider>();
  private healthCheckStatus = new Map<ProviderName, ProviderHealthCheck>();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  registerFlightProvider(name: ProviderName, provider: FlightProvider): void {
    this.flightProviders.set(name, provider);
  }

  registerHotelProvider(name: ProviderName, provider: HotelProvider): void {
    this.hotelProviders.set(name, provider);
  }

  registerActivityProvider(name: ProviderName, provider: ActivityProvider): void {
    this.activityProviders.set(name, provider);
  }

  getFlightProvider(name: ProviderName): FlightProvider | undefined {
    return this.flightProviders.get(name);
  }

  getHotelProvider(name: ProviderName): HotelProvider | undefined {
    return this.hotelProviders.get(name);
  }

  getActivityProvider(name: ProviderName): ActivityProvider | undefined {
    return this.activityProviders.get(name);
  }

  async searchFlights(params: FlightSearchParams, providerName?: ProviderName) {
    const provider = providerName
      ? this.getFlightProvider(providerName)
      : this.flightProviders.values().next().value;
    if (!provider) throw new Error('No flight provider available');
    return provider.search(params);
  }

  async searchHotels(params: HotelSearchParams, providerName?: ProviderName) {
    const provider = providerName
      ? this.getHotelProvider(providerName)
      : this.hotelProviders.values().next().value;
    if (!provider) throw new Error('No hotel provider available');
    return provider.search(params);
  }

  async searchActivities(params: ActivitySearchParams, providerName?: ProviderName) {
    const provider = providerName
      ? this.getActivityProvider(providerName)
      : this.activityProviders.values().next().value;
    if (!provider) throw new Error('No activity provider available');
    return provider.search(params);
  }

  async searchFlightsAcrossProviders(params: FlightSearchParams) {
    const promises = Array.from(this.flightProviders.entries()).map(([name, provider]) =>
      provider
        .search(params)
        .then((result) => ({ provider: name, result }))
        .catch((error) => ({ provider: name, error: error.message }))
    );
    return Promise.all(promises);
  }

  async searchHotelsAcrossProviders(params: HotelSearchParams) {
    const promises = Array.from(this.hotelProviders.entries()).map(([name, provider]) =>
      provider
        .search(params)
        .then((result) => ({ provider: name, result }))
        .catch((error) => ({ provider: name, error: error.message }))
    );
    return Promise.all(promises);
  }

  async checkAllHealth(): Promise<Map<ProviderName, ProviderHealthCheck>> {
    const allProviders: Array<[ProviderName, AnyProvider]> = [
      ...Array.from(this.flightProviders.entries()),
      ...Array.from(this.hotelProviders.entries()),
      ...Array.from(this.activityProviders.entries()),
    ];

    const checks = await Promise.allSettled(
      allProviders.map(async ([name, provider]) => ({
        name,
        health: await provider.healthCheck(),
      }))
    );

    const result = new Map<ProviderName, ProviderHealthCheck>();
    checks.forEach((check) => {
      if (check.status === 'fulfilled') {
        result.set(check.value.name, check.value.health);
        this.healthCheckStatus.set(check.value.name, check.value.health);
      }
    });
    return result;
  }

  startHealthCheckLoop(intervalMs: number = 60000): void {
    if (this.healthCheckInterval) return;
    this.healthCheckInterval = setInterval(() => this.checkAllHealth(), intervalMs);
  }

  stopHealthCheckLoop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  listProviders(type: ProviderType): ProviderName[] {
    switch (type) {
      case ProviderType.FLIGHT:
        return Array.from(this.flightProviders.keys());
      case ProviderType.HOTEL:
        return Array.from(this.hotelProviders.keys());
      case ProviderType.ACTIVITY:
        return Array.from(this.activityProviders.keys());
    }
  }

  getSummary() {
    return {
      flightProviders: this.flightProviders.size,
      hotelProviders: this.hotelProviders.size,
      activityProviders: this.activityProviders.size,
      health: Object.fromEntries(this.healthCheckStatus),
    };
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
