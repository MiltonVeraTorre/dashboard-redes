/**
 * Utility functions for working with the Observium API
 */

import { observiumApi } from './ObserviumApiAdapter';
import { Alert, Link, NetworkOverview, Plaza, Site } from '../domain/entities';

/**
 * Fetch network overview data from Observium
 */
export async function fetchNetworkOverview(): Promise<NetworkOverview> {
  try {
    // Fetch devices from Observium
    const devicesResponse = await observiumApi.get('/devices', {
      params: {
        fields: 'device_id,hostname,status,location'
      }
    });

    // Fetch ports from Observium
    const portsResponse = await observiumApi.get('/ports', {
      params: {
        fields: 'port_id,device_id,ifName,ifSpeed,ifOperStatus,ifAdminStatus'
      }
    });

    // Fetch alerts from Observium
    const alertsResponse = await observiumApi.get('/alerts', {
      params: {
        status: 'failed',
        limit: 10
      }
    });

    // Process the data to create a NetworkOverview object
    return processObserviumData(
      devicesResponse.data,
      portsResponse.data,
      alertsResponse.data
    );
  } catch (error) {
    console.error('Error fetching data from Observium:', error);
    throw error;
  }
}

/**
 * Process Observium data to create a NetworkOverview object
 */
function processObserviumData(
  devicesData: any,
  portsData: any,
  alertsData: any
): NetworkOverview {
  // Extract devices
  const devices = devicesData.devices || {};
  const devicesList = Object.values(devices) as any[];

  // Create sites from devices
  const sites: Site[] = devicesList.map((device: any) => ({
    id: device.device_id,
    name: device.hostname || `Device ${device.device_id}`,
    plaza: device.location || 'Unknown',
  }));

  // Group devices by location (plaza)
  const sitesPerPlaza: Record<Plaza, number> = {};
  sites.forEach(site => {
    sitesPerPlaza[site.plaza] = (sitesPerPlaza[site.plaza] || 0) + 1;
  });

  // Count critical sites (devices with status down)
  const criticalSites = devicesList.filter((device: any) => 
    device.status === 'down'
  ).length;

  // Process ports data
  const ports = portsData.ports || {};
  const portsList = Object.values(ports) as any[];

  // Create links from ports
  const links: Link[] = portsList.map((port: any) => {
    // Simulate utilization based on port status
    // In a real implementation, this would use actual traffic data from counters
    let utilization = 0;
    if (port.ifOperStatus === 'up') {
      // Simulate random utilization between 20% and 90%
      utilization = Math.floor(Math.random() * 70) + 20;
    }

    // Determine status based on utilization
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (utilization >= 80) {
      status = 'critical';
    } else if (utilization >= 60) {
      status = 'warning';
    }

    return {
      id: port.port_id,
      siteId: port.device_id,
      name: port.ifName || `Port ${port.port_id}`,
      capacity: parseInt(port.ifSpeed) / 1000000 || 100, // Convert to Mbps
      currentUsage: (utilization * parseInt(port.ifSpeed) / 1000000) / 100 || 0,
      utilizationPercentage: utilization,
      status,
      lastUpdated: new Date(),
    };
  });

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

  // Process alerts
  const alerts = alertsData.alerts || [];
  const recentAlerts: Alert[] = alerts.map((alert: any) => ({
    id: alert.alert_id || String(Math.random()),
    siteId: alert.device_id || '',
    linkId: alert.entity_type === 'port' ? alert.entity_id : undefined,
    type: mapAlertType(alert.alert_test_id, alert.entity_type),
    severity: mapAlertSeverity(alert.severity),
    message: alert.alert_message || 'Unknown alert',
    timestamp: new Date(alert.alert_timestamp * 1000 || Date.now()),
    acknowledged: alert.alert_status !== 'failed',
  }));

  return {
    totalSites: sites.length,
    sitesPerPlaza,
    criticalSites,
    averageUtilization,
    utilizationByPlaza,
    recentAlerts,
  };
}

/**
 * Map Observium alert type to our domain alert type
 */
function mapAlertType(alertTestId: string, entityType: string): 'capacity' | 'latency' | 'packet_loss' | 'downtime' {
  // In a real implementation, this would map Observium alert types to our domain types
  // For now, we'll use a simple mapping based on entity type
  if (entityType === 'port') {
    return 'capacity';
  } else if (entityType === 'device') {
    return 'downtime';
  } else {
    return 'latency';
  }
}

/**
 * Map Observium alert severity to our domain alert severity
 */
function mapAlertSeverity(severity: string): 'info' | 'warning' | 'critical' {
  // In a real implementation, this would map Observium severity levels to our domain levels
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
}
