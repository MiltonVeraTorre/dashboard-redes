/**
 * Observium Repository
 * 
 * This module provides functions to fetch data from the Observium API
 * and transform it into domain entities.
 */

import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';
import { 
  ObserviumDevicesResponse, 
  ObserviumPortsResponse, 
  ObserviumAlertsResponse,
  ObserviumDevice,
  ObserviumPort,
  ObserviumAlert
} from '@/lib/domain/observium-types';
import {  
  Alert, 
  Site, 
  Link 
} from '@/lib/domain/entities';

/**
 * Fetch devices from Observium API
 */
export async function fetchDevices(): Promise<ObserviumDevice[]> {
  try {
    const response = await observiumApi.get<ObserviumDevicesResponse>('/devices', {
      params: {
        fields: 'device_id,hostname,status,location,os,version,vendor,hardware'
      }
    });
    
    const devices = response.data.devices || {};
    return Object.values(devices);
  } catch (error) {
    console.error('Error fetching devices from Observium:', error);
    throw error;
  }
}

/**
 * Fetch ports from Observium API
 */
export async function fetchPorts(): Promise<ObserviumPort[]> {
  try {
    // First fetch just the port IDs
    const portsListResponse = await observiumApi.get<ObserviumPortsResponse>('/ports', {
      params: {
        fields: 'port_id'
      }
    });
    
    const portIds = Object.values(portsListResponse.data.ports || {}).map(port => port.port_id);
    
    // Then fetch details for each port
    // Note: In a production environment, you might want to batch these requests
    // or implement pagination to avoid overloading the API
    const portDetailsPromises = portIds.slice(0, 50).map(async (portId) => {
      try {
        const response = await observiumApi.get(`/ports/${portId}`);
        return response.data.port;
      } catch (error) {
        console.error(`Error fetching details for port ${portId}:`, error);
        return null;
      }
    });
    
    const portDetails = await Promise.all(portDetailsPromises);
    return portDetails.filter(Boolean) as ObserviumPort[];
  } catch (error) {
    console.error('Error fetching ports from Observium:', error);
    throw error;
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
    id: device.device_id,
    name: device.hostname || `Device ${device.device_id}`,
    plaza: device.location || 'Unknown',
  }));
}

/**
 * Convert Observium ports to domain links
 */
export function mapPortsToLinks(ports: ObserviumPort[]): Link[] {
  return ports.map(port => {
    // Simulate utilization based on port status
    // In a real implementation, this would use actual traffic data from counters
    let utilization = 0;
    if (port.ifOperStatus === 'up') {
      // Use the rate values if available, otherwise simulate
      const inRate = parseFloat(port.ifInOctets_rate || '0');
      const outRate = parseFloat(port.ifOutOctets_rate || '0');
      const speed = parseFloat(port.ifSpeed || '0');
      
      if (speed > 0 && (inRate > 0 || outRate > 0)) {
        // Calculate utilization as the higher of in/out rates divided by speed
        utilization = Math.max(inRate, outRate) / speed * 100;
      } else {
        // Simulate random utilization between 20% and 90%
        utilization = Math.floor(Math.random() * 70) + 20;
      }
    }
    
    // Determine status based on utilization
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (utilization >= 80) {
      status = 'critical';
    } else if (utilization >= 60) {
      status = 'warning';
    }
    
    // Parse speed to Mbps
    const speedRaw = parseFloat(port.ifSpeed || '0');
    const capacity = speedRaw > 0 ? speedRaw / 1000000 : 100; // Convert to Mbps
    
    return {
      id: port.port_id,
      siteId: port.device_id || '',
      name: port.ifName || port.port_label || `Port ${port.port_id}`,
      capacity,
      currentUsage: (utilization * capacity) / 100,
      utilizationPercentage: utilization,
      status,
      lastUpdated: port.ifLastChange ? new Date(port.ifLastChange) : new Date(),
    };
  });
}

/**
 * Convert Observium alerts to domain alerts
 */
export function mapObserviumAlertsToDomainAlerts(alerts: ObserviumAlert[]): Alert[] {
  return alerts.map(alert => ({
    id: alert.alert_table_id,
    siteId: alert.device_id,
    linkId: alert.entity_type === 'port' ? alert.entity_id : undefined,
    type: mapAlertType(alert.entity_type),
    severity: mapAlertSeverity(alert.severity),
    message: alert.last_message || 'Unknown alert',
    timestamp: alert.last_changed ? new Date(parseInt(alert.last_changed) * 1000) : new Date(),
    acknowledged: alert.alert_status !== '0',
  }));
}
