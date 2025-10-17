/**
 * Provider Registry
 * Central service for registering, managing, and coordinating providers
 */

import { FlightProvider } from './base/FlightProvider';
import { HotelProvider } from './base/HotelProvider';
import { ActivityProvider } from './base/ActivityProvider';
import {
  ProviderConfig,
  ProviderName,
  ProviderType,
  ProviderHealthCheck,
  FlightSearchParams,
  HotelSearchParams,
  ActivitySearchParams,
  Flight,
  Hotel,
  Activity,
} from './base/types';

type AnyProvider = FlightProvider | HotelProvider | ActivityProvider;

interface ProviderRegistryConfig {
  flightProviders: Map<ProviderName, FlightProvider>;
  hotelProviders: Map<ProviderName, HotelProvider>;
  activityProviders: Map<ProviderName, ActivityProvider>;
  defaultFlightProvider?: ProviderName;
  defaultHotelProvider?: ProviderName;
  defaultActivityProvider?: ProviderName;
}

export class ProviderRegistry {
  private config: ProviderRegistryConfig;
  private healthCheckInterval: NodeJS.Timer | null = null;
  private healthCheckStatus: Map<ProviderName, ProviderHealthCheck> = new Map();

  constructor() {
    this.config = {
      flightProviders: new Map(),
      hotelProviders: new Map(),
      activityProviders: new Map(),
    };
  }

  /**
   * Register a flight provider
   */
  registerFlightProvider(
    name: ProviderName,
    provider: FlightProvider,
    setAsDefault: boolean = false,
  ): void {
    this.config.flightProviders.set(name, provider);
    if (setAsDefault || !this.config.defaultFlightProvider) {
      this.config.defaultFlightProvider = name;
    }
  }

  /**
   * Register a hotel provider
   */
  registerHotelProvider(
    name: ProviderName,
    provider: HotelProvider,
    setAsDefault: boolean = false,
  ): void {
    this.config.hotelProviders.set(name, provider);
    if (setAsDefault || !this.config.defaultHotelProvider) {
      this.config.defaultHotelProvider = name;
    }
  }

  /**
   * Register an activity provider
   */
  registerActivityProvider(
    name: ProviderName,
    provider: ActivityProvider,
    setAsDefault: boolean = false,
  ): void {
    this.config.activityProviders.set(name, provider);
    if (setAsDefault || !this.config.defaultActivityProvider) {
      this.config.defaultActivityProvider = name;
    }
  }

  /**
   * Get a registered flight provider
   */
  getFlightProvider(name: ProviderName): FlightProvider | undefined {
    return this.config.flightProviders.get(name);
  }

  /**
   * Get a registered hotel provider
   */
  getHotelProvider(name: ProviderName): HotelProvider | undefined {
    return this.config.hotelProviders.get(name);
  }

  /**
   * Get a registered activity provider
   */
  getActivityProvider(name: ProviderName): ActivityProvider | undefined {
    return this.config.activityProviders.get(name);
  }

  /**
   * Get default flight provider
   */
  getDefaultFlightProvider(): FlightProvider | undefined {
    if (!this.config.defaultFlightProvider) return undefined;
    return this.config.flightProviders.get(this.config.defaultFlightProvider);
  }

  /**
   * Get default hotel provider
   */
  getDefaultHotelProvider(): HotelProvider | undefined {
    if (!this.config.defaultHotelProvider) return undefined;
    return this.config.hotelProviders.get(this.config.defaultHotelProvider);
  }

  /**
   * Get default activity provider
   */
  getDefaultActivityProvider(): ActivityProvider | undefined {
    if (!this.config.defaultActivityProvider) return undefined;
    return this.config.activityProviders.get(this.config.defaultActivityProvider);
  }

  /**
   * Search flights with specific provider or default
   */
  async searchFlights(
    params: FlightSearchParams,
    providerName?: ProviderName,
  ) {
    const provider = providerName
      ? this.getFlightProvider(providerName)
      : this.getDefaultFlightProvider();

    if (!provider) {
      throw new Error('No flight provider available');
    }

    return provider.search(params);
  }

  /**
   * Search hotels with specific provider or default
   */
  async searchHotels(
    params: HotelSearchParams,
    providerName?: ProviderName,
  ) {
    const provider = providerName
      ? this.getHotelProvider(providerName)
      : this.getDefaultHotelProvider();

    if (!provider) {
      throw new Error('No hotel provider available');
    }

    return provider.search(params);
  }

  /**
   * Search activities with specific provider or default
   */
  async searchActivities(
    params: ActivitySearchParams,
    providerName?: ProviderName,
  ) {
    const provider = providerName
      ? this.getActivityProvider(providerName)
      : this.getDefaultActivityProvider();

    if (!provider) {
      throw new Error('No activity provider available');
    }

    return provider.search(params);
  }

  /**
   * Search flights across all providers (parallel)
   */
  async searchFlightsAcrossProviders(
    params: FlightSearchParams,
  ) {
    const promises = Array.from(
      this.config.flightProviders.entries(),
    ).map(([name, provider]) =>
      provider
        .search(params)
        .then((result) => ({ provider: name, result }))
        .catch((error) => ({
          provider: name,
          error: error.message,
        })),
    );

    return Promise.all(promises);
  }

  /**
   * Search hotels across all providers (parallel)
   */
  async searchHotelsAcrossProviders(
    params: HotelSearchParams,
  ) {
    const promises = Array.from(
      this.config.hotelProviders.entries(),
    ).map(([name, provider]) =>
      provider
        .search(params)
        .then((result) => ({ provider: name, result }))
        .catch((error) => ({
          provider: name,
          error: error.message,
        })),
    );

    return Promise.all(promises);
  }

  /**
   * Search activities across all providers (parallel)
   */
  async searchActivitiesAcrossProviders(
    params: ActivitySearchParams,
  ) {
    const promises = Array.from(
      this.config.activityProviders.entries(),
    ).map(([name, provider]) =>
      provider
        .search(params)
        .then((result) => ({ provider: name, result }))
        .catch((error) => ({
          provider: name,
          error: error.message,
        })),
    );

    return Promise.all(promises);
  }

  /**
   * Get health status of all providers
   */
  async checkAllHealth(): Promise<Map<ProviderName, ProviderHealthCheck>> {
    const allProviders: Array<[ProviderName, AnyProvider]> = [
      ...Array.from(this.config.flightProviders.entries()),
      ...Array.from(this.config.hotelProviders.entries()),
      ...Array.from(this.config.activityProviders.entries()),
    ];

    const healthChecks = await Promise.allSettled(
      allProviders.map(async ([name, provider]) => ({
        name,
        health: await provider.healthCheck(),
      })),
    );

    const result = new Map<ProviderName, ProviderHealthCheck>();
    healthChecks.forEach((check) => {
      if (check.status === 'fulfilled') {
        result.set(check.value.name, check.value.health);
        this.healthCheckStatus.set(check.value.name, check.value.health);
      }
    });

    return result;
  }

  /**
   * Get cached health status
   */
  getHealthStatus(name: ProviderName): ProviderHealthCheck | undefined {
    return this.healthCheckStatus.get(name);
  }

  /**
   * Start periodic health checks
   */
  startHealthCheckLoop(intervalMs: number = 60000): void {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllHealth();
    }, intervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthCheckLoop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Remove a provider
   */
  removeProvider(name: ProviderName): void {
    this.config.flightProviders.delete(name);
    this.config.hotelProviders.delete(name);
    this.config.activityProviders.delete(name);
    this.healthCheckStatus.delete(name);

    if (this.config.defaultFlightProvider === name) {
      this.config.defaultFlightProvider = undefined;
    }
    if (this.config.defaultHotelProvider === name) {
      this.config.defaultHotelProvider = undefined;
    }
    if (this.config.defaultActivityProvider === name) {
      this.config.defaultActivityProvider = undefined;
    }
  }

  /**
   * Get list of registered providers by type
   */
  listProviders(type: ProviderType): ProviderName[] {
    switch (type) {
      case ProviderType.FLIGHT:
        return Array.from(this.config.flightProviders.keys());
      case ProviderType.HOTEL:
        return Array.from(this.config.hotelProviders.keys());
      case ProviderType.ACTIVITY:
        return Array.from(this.config.activityProviders.keys());
    }
  }

  /**
   * Get registry summary
   */
  getSummary() {
    return {
      flightProviders: this.config.flightProviders.size,
      hotelProviders: this.config.hotelProviders.size,
      activityProviders: this.config.activityProviders.size,
      defaultFlightProvider: this.config.defaultFlightProvider,
      defaultHotelProvider: this.config.defaultHotelProvider,
      defaultActivityProvider: this.config.defaultActivityProvider,
      health: Object.fromEntries(this.healthCheckStatus),
    };
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
