/**
 * Technical Service
 * 
 * This module provides services for fetching and processing technical data
 */

import { 
  fetchDevices, 
  fetchPorts,
  mapDevicesToSites,
  mapPortsToLinks
} from '@/lib/repositories/observium-repository';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';
import { Site, Link } from '@/lib/domain/entities';
import { ObserviumDevice, ObserviumPort } from '@/lib/domain/observium-types';

/**
 * Fetch all sites
 */
export async function fetchAllSites(): Promise<Site[]> {
  try {
    const devices = await fetchDevices();
    return mapDevicesToSites(devices);
  } catch (error) {
    console.error('Error fetching all sites:', error);
    throw error;
  }
}

/**
 * Fetch site details
 */
export async function fetchSiteDetails(siteId: string): Promise<{ site: Site; links: Link[] }> {
  try {
    // Fetch device details
    const deviceResponse = await observiumApi.get(`/devices/${siteId}`, {
      params: {
        fields: 'device_id,hostname,status,location,os,version'
      }
    });

    // Fetch ports for the device
    const portsResponse = await observiumApi.get('/ports', {
      params: {
        device_id: siteId,
        fields: 'port_id,device_id,ifName,ifSpeed,ifOperStatus,ifAdminStatus'
      }
    });

    // Process the data
    const device = deviceResponse.data.devices?.[siteId] as ObserviumDevice;
    if (!device) {
      throw new Error(`Device with ID ${siteId} not found`);
    }

    // Create site object
    const site: Site = {
      id: device.device_id,
      name: device.hostname || `Device ${device.device_id}`,
      plaza: device.location || 'Unknown',
    };

    // Process ports
    const ports = portsResponse.data.ports || {};
    const portsList = Object.values(ports) as ObserviumPort[];
    const links = mapPortsToLinks(portsList);

    return { site, links };
  } catch (error) {
    console.error(`Error fetching site details for site ${siteId}:`, error);
    throw error;
  }
}
