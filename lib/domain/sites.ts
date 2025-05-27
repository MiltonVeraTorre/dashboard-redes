/**
 * Sites Domain Layer
 *
 * This module contains the business logic for site management and monitoring.
 * Integrates with Observium API for real network data only.
 * No fallback to mock data - errors are thrown when API is unavailable.
 */

import { Site, Link } from './entities';
import * as ObserviumAdapter from '../adapters/ObserviumApiAdapter';

export interface SitesDomain {
  getSites(options?: GetSitesOptions): Promise<Site[]>;
  getSiteWithLinks(siteId: string): Promise<{ site: Site; links: Link[] } | null>;
}

export interface GetSitesOptions {
  plaza?: string;
  limit?: number;
}

/**
 * Get sites with optional filtering
 * Only uses real data from Observium API - throws errors if API is unavailable
 */
export async function getSites(options: GetSitesOptions = {}): Promise<Site[]> {
  const { plaza, limit } = options;

  try {
    let sites: Site[];

    if (plaza) {
      // Use plaza-specific method for better performance
      const observiumDevices = await ObserviumAdapter.fetchDevicesByPlaza(plaza);
      sites = observiumDevices.map(device => ({
        id: device.device_id.toString(),
        name: device.hostname,
        plaza: device.group || device.location || 'Unknown',
        address: device.location,
      }));
    } else {
      // Get all sites from Observium
      sites = await ObserviumAdapter.fetchSites();
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      sites = sites.slice(0, limit);
    }

    return sites;
  } catch (error) {
    console.error('Failed to fetch sites from Observium API:', error);
    throw new Error(`Unable to fetch sites from Observium API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a site with its associated links
 * Only uses real data from Observium API - throws errors if API is unavailable
 */
export async function getSiteWithLinks(siteId: string): Promise<{ site: Site; links: Link[] } | null> {
  try {
    const deviceId = parseInt(siteId);

    if (isNaN(deviceId)) {
      throw new Error(`Invalid site ID: ${siteId}. Site ID must be a numeric device ID from Observium.`);
    }

    // Get comprehensive monitoring data from Observium
    const monitoringData = await ObserviumAdapter.fetchDeviceMonitoringData(deviceId);

    if (!monitoringData.device) {
      return null;
    }

    // Transform Observium device to Site entity
    const site: Site = {
      id: monitoringData.device.device_id.toString(),
      name: monitoringData.device.hostname,
      plaza: monitoringData.device.group || monitoringData.device.location || 'Unknown',
      address: monitoringData.device.location,
    };

    // Transform Observium ports to Link entities
    const links: Link[] = monitoringData.ports.map(port => {
      const capacity = port.ifHighSpeed ? Number(port.ifHighSpeed) : (port.ifSpeed ? Number(port.ifSpeed) / 1000000 : 0);
      const currentUsage = calculateCurrentUsage(port);
      const utilizationPercentage = capacity > 0 ? Math.min((currentUsage / capacity) * 100, 100) : 0;

      return {
        id: port.port_id.toString(),
        siteId: port.device_id.toString(),
        name: port.ifAlias || port.ifName,
        capacity: capacity,
        currentUsage: currentUsage,
        utilizationPercentage: utilizationPercentage,
        status: determinePortStatus(utilizationPercentage, port.ifOperStatus),
        lastUpdated: port.poll_time ? new Date(port.poll_time) : new Date(),
      };
    });

    return { site, links };
  } catch (error) {
    console.error(`Failed to fetch site ${siteId} from Observium API:`, error);
    throw new Error(`Unable to fetch site ${siteId} from Observium API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate current usage from Observium port statistics
 * Uses actual traffic rate data from Observium (ifInOctets_rate/ifOutOctets_rate)
 * Returns 0 if no real traffic data is available
 */
function calculateCurrentUsage(port: ObserviumAdapter.ObserviumPort): number {
  // Use the rate fields which contain octets per second, not cumulative counters
  const inOctetsRate = Number(port.ifInOctets_rate || 0);
  const outOctetsRate = Number(port.ifOutOctets_rate || 0);

  // If no traffic rate data is available, return 0
  if (inOctetsRate === 0 && outOctetsRate === 0) {
    return 0;
  }

  // Convert octets per second to Mbps (8 bits per octet, 1,000,000 bits per Mbps)
  const inMbps = (inOctetsRate * 8) / 1000000;
  const outMbps = (outOctetsRate * 8) / 1000000;

  // Return the higher utilization
  return Math.max(inMbps, outMbps);
}

/**
 * Determine port status based on utilization and operational status
 */
function determinePortStatus(utilizationPercentage: number, ifOperStatus: string): 'normal' | 'warning' | 'critical' {
  if (ifOperStatus !== 'up') {
    return 'critical';
  }

  if (utilizationPercentage >= 90) {
    return 'critical';
  } else if (utilizationPercentage >= 75) {
    return 'warning';
  } else {
    return 'normal';
  }
}
