/**
 * Observium Repository
 *
 * This module provides functions to fetch data from the Observium API
 * and transform it into domain entities.
 */

import {
  observiumApi,
  fetchDevices as fetchObserviumDevices,
  fetchPorts as fetchObserviumPorts,
  ObserviumDevice,
  ObserviumAlert
} from '@/lib/adapters/ObserviumApiAdapter';
import {
  ObserviumPort,
  ObserviumAlertsResponse
} from '@/lib/domain/observium-types';
import {
  Alert,
  Site,
  Link
} from '@/lib/domain/entities';

/**
 * Fetch devices from Observium API
 * Only returns real data - throws errors if API is unavailable
 */
export async function fetchDevices(): Promise<ObserviumDevice[]> {
  try {
    // Use the proper adapter function that handles the response format correctly
    // Note: fields parameter removed because it causes Observium API to return 0 devices
    const devices = await fetchObserviumDevices({});

    console.log(`📊 Repository: Found ${devices.length} devices from Observium`);
    return devices;
  } catch (error) {
    console.error('Error fetching devices from Observium API:', error);
    throw new Error(`Failed to fetch devices from Observium API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch ports from Observium API
 * Only returns real data - throws errors if API is unavailable
 * Fetches devices first, then ports for each device to avoid memory exhaustion
 * Limits to first 50 devices to prevent connection timeouts
 */
export async function fetchPorts(): Promise<ObserviumPort[]> {
  try {
    // First fetch all devices to get device IDs
    console.log('📊 Repository: Fetching devices to get device IDs for port queries');
    // Note: fields parameter removed because it causes Observium API to return 0 devices
    const devices = await fetchObserviumDevices({});

    if (devices.length === 0) {
      console.log('📊 Repository: No devices found, returning empty ports array');
      return [];
    }

    // Limit to first 50 devices to prevent connection timeouts and excessive API calls
    const limitedDevices = devices.slice(0, 50);
    const deviceIds = limitedDevices.map(device => device.device_id);
    console.log(`📊 Repository: Fetching ports for ${deviceIds.length} devices (limited from ${devices.length} total devices)`);

    // Fetch ports for limited devices (the adapter will handle individual calls)
    const ports = await fetchObserviumPorts({
      device_id: deviceIds,
      ifOperStatus: 'up'
    });

    console.log(`📊 Repository: Found ${ports.length} ports from Observium`);
    return ports;
  } catch (error) {
    console.error('Error fetching ports from Observium API:', error);
    throw new Error(`Failed to fetch ports from Observium API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch alerts from Observium API
 */
export async function fetchAlerts(limit: number = 10): Promise<ObserviumAlert[]> {
  try {
    const response = await observiumApi.get<ObserviumAlertsResponse>('/alerts', {
      params: {
        status: 'failed',
        limit
      }
    });

    const alerts = response.data.alerts || {};
    return Object.values(alerts);
  } catch (error) {
    console.error('Error fetching alerts from Observium:', error);
    throw error;
  }
}

/**
 * Map Observium alert type to domain alert type
 */
function mapAlertType(entityType: string): 'capacity' | 'latency' | 'packet_loss' | 'downtime' {
  if (entityType === 'port') {
    return 'capacity';
  } else if (entityType === 'device') {
    return 'downtime';
  } else {
    return 'latency';
  }
}

/**
 * Map Observium alert severity to domain alert severity
 */
function mapAlertSeverity(severity: string): 'info' | 'warning' | 'critical' {
  switch (severity.toLowerCase()) {
    case 'crit':
    case 'critical':
      return 'critical';
    case 'warning':
    case 'warn':
      return 'warning';
    default:
      return 'info';
  }
}

/**
 * Convert Observium devices to domain sites
 */
export function mapDevicesToSites(devices: ObserviumDevice[]): Site[] {
  return devices.map(device => ({
    id: device.device_id.toString(),
    name: device.hostname || `Device ${device.device_id}`,
    plaza: device.location || 'Unknown',
  }));
}

/**
 * Convert Observium ports to domain links
 * Only uses real traffic data - no simulation or fallbacks
 */
export function mapPortsToLinks(ports: ObserviumPort[]): Link[] {
  return ports.map(port => {
    // Calculate utilization from real Observium data only
    let utilization = 0;
    let capacity = 0;
    let currentUsage = 0;

    // Get capacity in Mbps
    if (port.ifHighSpeed && Number(port.ifHighSpeed) > 0) {
      capacity = Number(port.ifHighSpeed); // Already in Mbps
    } else if (port.ifSpeed && Number(port.ifSpeed) > 0) {
      capacity = Number(port.ifSpeed) / 1000000; // Convert from bps to Mbps
    }

    // Only calculate utilization if we have real traffic rate data
    // Use the _rate fields which contain octets per second, not cumulative counters
    if (capacity > 0 && (port.ifInOctets_rate || port.ifOutOctets_rate)) {
      // Convert octets per second to Mbps (8 bits per octet, 1,000,000 bits per Mbps)
      const inMbps = (Number(port.ifInOctets_rate || 0) * 8) / 1000000;
      const outMbps = (Number(port.ifOutOctets_rate || 0) * 8) / 1000000;

      // Use the higher of input or output utilization
      currentUsage = Math.max(inMbps, outMbps);
      utilization = Math.min((currentUsage / capacity) * 100, 100); // Cap at 100%
    }
    // If no real traffic data available, utilization remains 0

    // Determine status based on real utilization and operational status
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (port.ifOperStatus !== 'up') {
      status = 'critical';
    } else if (utilization >= 85) {
      status = 'critical';
    } else if (utilization >= 70) {
      status = 'warning';
    }

    return {
      id: port.port_id.toString(),
      siteId: port.device_id?.toString() || '',
      name: port.ifName || port.ifAlias || `Port ${port.port_id}`,
      capacity,
      currentUsage,
      utilizationPercentage: Math.round(utilization * 100) / 100, // Round to 2 decimal places
      status,
      lastUpdated: port.poll_time ? new Date(Number(port.poll_time) * 1000) : new Date(),
    };
  });
}

/**
 * Convert Observium alerts to domain alerts
 */
export function mapObserviumAlertsToDomainAlerts(alerts: ObserviumAlert[]): Alert[] {
  return alerts.map(alert => ({
    id: alert.alert_table_id,
    siteId: alert.device_id.toString(),
    linkId: alert.entity_type === 'port' ? alert.entity_id.toString() : undefined,
    type: mapAlertType(alert.entity_type),
    severity: mapAlertSeverity(alert.severity),
    message: alert.last_message || 'Unknown alert',
    timestamp: alert.last_changed ? new Date(parseInt(alert.last_changed) * 1000) : new Date(),
    acknowledged: alert.alert_status !== '0',
  }));
}


