/**
 * Network Service
 *
 * This module provides services for fetching and processing network data
 */

import {
  fetchDevices,
  fetchPorts,
  fetchAlerts,
  mapDevicesToSites,
  mapPortsToLinks,
  mapObserviumAlertsToDomainAlerts
} from '@/lib/repositories/observium-repository';
import { NetworkOverview, Plaza } from '@/lib/domain/entities';
import { cacheService } from './cache-service';

// Cache TTL constants
const CACHE_TTL = {
  NETWORK_OVERVIEW: 5 * 60 * 1000, // 5 minutes
  CRITICAL_SITES: 5 * 60 * 1000,   // 5 minutes
  CONSUMPTION_TRENDS: 30 * 60 * 1000, // 30 minutes
  CAPACITY_UTILIZATION: 10 * 60 * 1000, // 10 minutes
};

/**
 * Fetch network overview data with caching
 */
export async function fetchNetworkOverview(): Promise<NetworkOverview> {
  // Check cache first
  const cacheKey = 'networkOverview';
  const cachedData = cacheService.get<NetworkOverview>(cacheKey);

  if (cachedData) {
    console.log('Using cached network overview data');
    return cachedData;
  }

  try {
    console.log('Fetching fresh network overview data');
    // Fetch data from Observium
    const [devices, ports, alerts] = await Promise.all([
      fetchDevices(),
      fetchPorts(),
      fetchAlerts(10)
    ]);

    // Map to domain entities
    const sites = mapDevicesToSites(devices);
    const links = mapPortsToLinks(ports);
    const recentAlerts = mapObserviumAlertsToDomainAlerts(alerts);

    // Group devices by location (plaza)
    const sitesPerPlaza: Record<Plaza, number> = {};
    sites.forEach(site => {
      sitesPerPlaza[site.plaza] = (sitesPerPlaza[site.plaza] || 0) + 1;
    });

    // Count critical sites (devices with status down)
    const criticalSites = devices.filter(device => device.status === '0').length;

    // Calculate utilization by plaza
    const utilizationByPlaza: Record<Plaza, number> = {};
    const linksByPlaza: Record<Plaza, number> = {};

    // Map each link to its site's plaza
    for (const link of links) {
      const site = sites.find(s => s.id === link.siteId);
      if (site) {
        const plaza = site.plaza;
        utilizationByPlaza[plaza] = (utilizationByPlaza[plaza] || 0) + link.utilizationPercentage;
        linksByPlaza[plaza] = (linksByPlaza[plaza] || 0) + 1;
      }
    }

    // Calculate average utilization by plaza
    Object.keys(utilizationByPlaza).forEach(plaza => {
      if (linksByPlaza[plaza] > 0) {
        utilizationByPlaza[plaza as Plaza] = utilizationByPlaza[plaza as Plaza] / linksByPlaza[plaza as Plaza];
      }
    });

    // Calculate overall average utilization
    const totalUtilization = links.reduce((sum, link) => sum + link.utilizationPercentage, 0);
    const averageUtilization = links.length > 0 ? totalUtilization / links.length : 0;

    const result = {
      totalSites: sites.length,
      sitesPerPlaza,
      criticalSites,
      averageUtilization,
      utilizationByPlaza,
      recentAlerts,
    };

    // Cache the result
    cacheService.set(cacheKey, result, CACHE_TTL.NETWORK_OVERVIEW);

    return result;
  } catch (error) {
    console.error('Error fetching network overview:', error);
    throw error;
  }
}

/**
 * Fetch critical sites ranked by utilization
 */
export async function fetchCriticalSites(limit: number = 5) {
  // Check cache first
  const cacheKey = `criticalSites-${limit}`;
  const cachedData = cacheService.get(cacheKey);

  if (cachedData) {
    console.log('Using cached critical sites data');
    return cachedData;
  }

  try {
    console.log('Fetching fresh critical sites data');
    // Fetch data from Observium
    const [devices, ports] = await Promise.all([
      fetchDevices(),
      fetchPorts()
    ]);

    // Map to domain entities
    const sites = mapDevicesToSites(devices);
    const links = mapPortsToLinks(ports);

    // Create a map of site IDs to utilization data
    const siteUtilization: Record<string, {
      id: string;
      name: string;
      plaza: string;
      utilizationPercentage: number;
      criticalLinks: number;
      totalLinks: number;
    }> = {};

    // Initialize with all sites
    sites.forEach(site => {
      siteUtilization[site.id] = {
        id: site.id,
        name: site.name,
        plaza: site.plaza,
        utilizationPercentage: 0,
        criticalLinks: 0,
        totalLinks: 0,
      };
    });

    // Calculate utilization for each site
    links.forEach(link => {
      const site = siteUtilization[link.siteId];
      if (site) {
        site.totalLinks++;
        site.utilizationPercentage =
          (site.utilizationPercentage * (site.totalLinks - 1) + link.utilizationPercentage) / site.totalLinks;

        // Count critical links (utilization >= 80%)
        if (link.utilizationPercentage >= 80) {
          site.criticalLinks++;
        }
      }
    });

    // Convert to array and filter out sites with no links
    const rankedSites = Object.values(siteUtilization).filter(site => site.totalLinks > 0);

    // Sort by number of critical links (descending)
    rankedSites.sort((a, b) => b.criticalLinks - a.criticalLinks);

    // Get the top N sites
    const result = rankedSites.slice(0, limit);

    // Cache the result
    cacheService.set(cacheKey, result, CACHE_TTL.CRITICAL_SITES);

    return result;
  } catch (error) {
    console.error('Error fetching critical sites:', error);
    throw error;
  }
}

/**
 * Fetch network consumption by plaza over time
 * Only uses real historical data from Observium - throws error if unavailable
 */
export async function fetchNetworkConsumptionByPlaza(): Promise<{
  plazas: Plaza[];
  data: Array<{
    plaza: Plaza;
    values: number[];
    timestamps: string[];
  }>;
}> {
  // Check cache first
  const cacheKey = 'networkConsumptionByPlaza';
  const cachedData = cacheService.get<{
    plazas: Plaza[];
    data: Array<{
      plaza: Plaza;
      values: number[];
      timestamps: string[];
    }>;
  }>(cacheKey);

  if (cachedData) {
    console.log('Using cached network consumption data');
    return cachedData;
  }

  try {
    console.log('Fetching fresh network consumption data');

    // TODO: Implement real historical data fetching from Observium
    // This would require additional API endpoints for historical consumption data
    throw new Error('Historical network consumption data is not yet available from Observium API. This feature requires implementation of historical data endpoints.');

  } catch (error) {
    console.error('Error fetching network consumption by plaza:', error);
    throw error;
  }
}

/**
 * Fetch capacity utilization by plaza
 * This provides data for the "Capacidad Utilizada" chart
 */
export async function fetchCapacityUtilizationByPlaza(): Promise<{
  plazas: Plaza[];
  utilization: number[];
}> {
  // Check cache first
  const cacheKey = 'capacityUtilizationByPlaza';
  const cachedData = cacheService.get<{
    plazas: Plaza[];
    utilization: number[];
  }>(cacheKey);

  if (cachedData) {
    console.log('Using cached capacity utilization data');
    return cachedData;
  }

  try {
    console.log('Fetching fresh capacity utilization data');
    // Fetch data from Observium
    const [devices, ports] = await Promise.all([
      fetchDevices(),
      fetchPorts()
    ]);

    // Map to domain entities
    const sites = mapDevicesToSites(devices);
    const links = mapPortsToLinks(ports);

    // Get unique plazas
    const plazas = Array.from(new Set(sites.map(site => site.plaza)));

    // Calculate utilization by plaza
    const utilizationByPlaza: Record<Plaza, number> = {};
    const linksByPlaza: Record<Plaza, number> = {};

    // Map each link to its site's plaza
    for (const link of links) {
      const site = sites.find(s => s.id === link.siteId);
      if (site) {
        const plaza = site.plaza;
        utilizationByPlaza[plaza] = (utilizationByPlaza[plaza] || 0) + link.utilizationPercentage;
        linksByPlaza[plaza] = (linksByPlaza[plaza] || 0) + 1;
      }
    }

    // Calculate average utilization by plaza
    plazas.forEach(plaza => {
      if (linksByPlaza[plaza] > 0) {
        utilizationByPlaza[plaza] = utilizationByPlaza[plaza] / linksByPlaza[plaza];
      } else {
        utilizationByPlaza[plaza] = 0;
      }
    });

    // Convert to arrays for the chart
    const utilization = plazas.map(plaza => utilizationByPlaza[plaza] || 0);

    const result = {
      plazas,
      utilization
    };

    // Cache the result
    cacheService.set(cacheKey, result, CACHE_TTL.CAPACITY_UTILIZATION);

    return result;
  } catch (error) {
    console.error('Error fetching capacity utilization by plaza:', error);
    throw error;
  }
}

/**
 * Fetch growth trends data
 * Only uses real historical data from Observium - throws error if unavailable
 */
export async function fetchGrowthTrends(): Promise<{
  months: string[];
  values: number[];
}> {
  // Check cache first
  const cacheKey = 'growthTrends';
  const cachedData = cacheService.get<{
    months: string[];
    values: number[];
  }>(cacheKey);

  if (cachedData) {
    console.log('Using cached growth trends data');
    return cachedData;
  }

  try {
    console.log('Fetching fresh growth trends data');

    // TODO: Implement real historical growth data fetching from Observium
    // This would require additional API endpoints for historical growth trends
    throw new Error('Historical growth trends data is not yet available from Observium API. This feature requires implementation of historical data endpoints.');

  } catch (error) {
    console.error('Error fetching growth trends:', error);
    throw error;
  }
}
