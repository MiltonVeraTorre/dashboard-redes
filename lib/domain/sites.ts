/**
 * Sites Domain Layer
 *
 * This module contains the business logic for site management and monitoring.
 * Integrates with Observium API for real network data while maintaining
 * fallback to mock data for development.
 */

import { Site, Link } from './entities';
import { getSites as getRepositorySites, getLinks } from '../repositories/metrics';
import * as ObserviumAdapter from '../adapters/ObserviumApiAdapter';

export interface SitesDomain {
  getSites(options?: GetSitesOptions): Promise<Site[]>;
  getSiteWithLinks(siteId: string): Promise<{ site: Site; links: Link[] } | null>;
}

export interface GetSitesOptions {
  plaza?: string;
  limit?: number;
  useRealData?: boolean; // Flag to use Observium vs mock data
}

/**
 * Get sites with optional filtering
 * Integrates with Observium API for real data
 */
export async function getSites(options: GetSitesOptions = {}): Promise<Site[]> {
  const { plaza, limit, useRealData = true } = options;

  try {
    let sites: Site[];

    if (useRealData) {
      // Try to get real data from Observium
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
    } else {
      // Fallback to repository (mock data)
      sites = await getRepositorySites({ plaza });
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      sites = sites.slice(0, limit);
    }

    return sites;
  } catch (error) {
    console.warn('Failed to fetch sites from Observium, falling back to mock data:', error);

    // Fallback to mock data if Observium fails
    let sites = await getRepositorySites({ plaza });

    if (limit && limit > 0) {
      sites = sites.slice(0, limit);
    }

    return sites;
  }
}

/**
 * Get a site with its associated links
 * Integrates with Observium API for real monitoring data
 */
export async function getSiteWithLinks(siteId: string, useRealData: boolean = true): Promise<{ site: Site; links: Link[] } | null> {
  try {
    if (useRealData) {
      // Try to get real data from Observium
      const deviceId = parseInt(siteId);

      if (isNaN(deviceId)) {
        // If siteId is not a number, fall back to mock data
        return getSiteWithLinksFromRepository(siteId);
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
        const capacity = port.ifHighSpeed ? port.ifHighSpeed : (port.ifSpeed ? port.ifSpeed / 1000000 : 0);
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
    } else {
      // Use mock data
      return getSiteWithLinksFromRepository(siteId);
    }
  } catch (error) {
    console.warn(`Failed to fetch site ${siteId} from Observium, falling back to mock data:`, error);

    // Fallback to mock data if Observium fails
    return getSiteWithLinksFromRepository(siteId);
  }
}

/**
 * Helper function to get site with links from repository (mock data)
 */
async function getSiteWithLinksFromRepository(siteId: string): Promise<{ site: Site; links: Link[] } | null> {
  // Get all sites from repository
  const sites = await getRepositorySites();

  // Find the requested site
  const site = sites.find(s => s.id === siteId);
  if (!site) {
    return null;
  }

  // Get links for this site
  const links = await getLinks({ siteId });

  return { site, links };
}

/**
 * Calculate current usage from Observium port statistics
 * Uses the higher of input or output octets per second
 */
function calculateCurrentUsage(port: ObserviumAdapter.ObserviumPort): number {
  // This is a simplified calculation
  // In a real implementation, you would need rate data or calculate from deltas
  const inOctetsPerSec = port.ifInOctets || 0;
  const outOctetsPerSec = port.ifOutOctets || 0;

  // Convert octets per second to Mbps (8 bits per octet, 1,000,000 bits per Mbps)
  const inMbps = (inOctetsPerSec * 8) / 1000000;
  const outMbps = (outOctetsPerSec * 8) / 1000000;

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
