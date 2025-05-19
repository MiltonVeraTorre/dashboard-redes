/**
 * Observium API Adapter
 *
 * This module provides an adapter for the Observium API, allowing the application
 * to fetch network data from Observium in a standardized format.
 */

// Import entities
import { Site, Link, Alert } from '../domain/entities';

// Observium API response types (simplified)
// These types are used for documentation purposes
/**
 * @typedef ObserviumDevice
 * @property {string} device_id - Device ID
 * @property {string} hostname - Device hostname
 * @property {string} location - Device location
 * @property {number} status - Status code
 * @property {string} last_ping - Last ping timestamp
 */

/**
 * @typedef ObserviumPort
 * @property {string} port_id - Port ID
 * @property {string} device_id - Parent device ID
 * @property {string} ifName - Interface name
 * @property {number} ifSpeed - Interface speed
 * @property {string} ifOperStatus - Operational status
 * @property {number} ifInOctets_rate - Inbound octets rate
 * @property {number} ifOutOctets_rate - Outbound octets rate
 */

/**
 * @typedef ObserviumAlert
 * @property {string} alert_id - Alert ID
 * @property {string} device_id - Device ID
 * @property {string} entity_id - Entity ID
 * @property {string} entity_type - Entity type
 * @property {number} severity - Severity level
 * @property {string} message - Alert message
 * @property {string} timestamp - Alert timestamp
 * @property {number} state - Alert state
 */

/**
 * Fetch devices from Observium and convert them to Site entities
 */
export async function fetchSites(): Promise<Site[]> {
  try {
    // In a real implementation, this would make an HTTP request to the Observium API
    // For now, we'll just return an empty array
    console.log('Fetching sites from Observium API...');

    // Example of how this would be implemented:
    // const response = await fetch(`${config.observium.baseUrl}/api/v0/devices?token=${config.observium.token}`);
    // const data = await response.json();
    // const devices: ObserviumDevice[] = data.devices;

    // return devices.map(device => ({
    //   id: device.device_id,
    //   name: device.hostname,
    //   plaza: extractPlazaFromLocation(device.location),
    //   address: device.location,
    // }));

    return [];
  } catch (error) {
    console.error('Error fetching sites from Observium:', error);
    return [];
  }
}

/**
 * Fetch ports from Observium and convert them to Link entities
 */
export async function fetchLinks(): Promise<Link[]> {
  try {
    // In a real implementation, this would make an HTTP request to the Observium API
    // For now, we'll just return an empty array
    console.log('Fetching links from Observium API...');

    // Example of how this would be implemented:
    // const response = await fetch(`${config.observium.baseUrl}/api/v0/ports?token=${config.observium.token}`);
    // const data = await response.json();
    // const ports: ObserviumPort[] = data.ports;

    // return ports.map(port => {
    //   const currentUsage = (port.ifInOctets_rate + port.ifOutOctets_rate) / 1000000; // Convert to Mbps
    //   const utilizationPercentage = (currentUsage / port.ifSpeed) * 100;
    //
    //   return {
    //     id: port.port_id,
    //     siteId: port.device_id,
    //     name: port.ifName,
    //     capacity: port.ifSpeed / 1000000, // Convert to Mbps
    //     currentUsage,
    //     utilizationPercentage,
    //     status: mapObserviumStatus(port.ifOperStatus, utilizationPercentage),
    //     lastUpdated: new Date(),
    //   };
    // });

    return [];
  } catch (error) {
    console.error('Error fetching links from Observium:', error);
    return [];
  }
}

/**
 * Fetch alerts from Observium and convert them to Alert entities
 */
export async function fetchAlerts(): Promise<Alert[]> {
  try {
    // In a real implementation, this would make an HTTP request to the Observium API
    // For now, we'll just return an empty array
    console.log('Fetching alerts from Observium API...');

    // Example of how this would be implemented:
    // const response = await fetch(`${config.observium.baseUrl}/api/v0/alerts?token=${config.observium.token}`);
    // const data = await response.json();
    // const alerts: ObserviumAlert[] = data.alerts;

    // return alerts.map(alert => ({
    //   id: alert.alert_id,
    //   siteId: alert.device_id,
    //   linkId: alert.entity_type === 'port' ? alert.entity_id : undefined,
    //   type: mapObserviumAlertType(alert.entity_type),
    //   severity: mapObserviumSeverity(alert.severity),
    //   message: alert.message,
    //   timestamp: new Date(alert.timestamp),
    //   acknowledged: alert.state === 2,
    // }));

    return [];
  } catch (error) {
    console.error('Error fetching alerts from Observium:', error);
    return [];
  }
}

/**
 * Extract plaza from location string
 *
 * This function is used in the commented-out code above as an example
 * of how the implementation would work in a real application.
 *
 * @param location - The location string from Observium
 * @returns The extracted plaza name
 */
// Example function for documentation purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractPlazaFromLocation(_location: string): string {
  // This would need to be customized based on how locations are formatted in Observium
  // For now, we'll just return a default value
  return 'CDMX';
}

/**
 * Map Observium port status to our application's status values
 *
 * This function is used in the commented-out code above as an example
 * of how the implementation would work in a real application.
 *
 * @param operStatus - The operational status from Observium
 * @param utilizationPercentage - The utilization percentage
 * @returns The mapped status value for our application
 */
// Example function for documentation purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapObserviumStatus(
  operStatus: string,
  utilizationPercentage: number
): 'normal' | 'warning' | 'critical' {
  if (operStatus !== 'up') {
    return 'critical';
  }

  if (utilizationPercentage >= 80) {
    return 'critical';
  } else if (utilizationPercentage >= 60) {
    return 'warning';
  } else {
    return 'normal';
  }
}

/**
 * Map Observium alert type to our application's alert type
 *
 * This function is used in the commented-out code above as an example
 * of how the implementation would work in a real application.
 *
 * @param entityType - The entity type from Observium
 * @returns The mapped alert type for our application
 */
// Example function for documentation purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapObserviumAlertType(
  entityType: string
): 'capacity' | 'latency' | 'packet_loss' | 'downtime' {
  switch (entityType) {
    case 'port':
      return 'capacity';
    case 'device':
      return 'downtime';
    default:
      return 'capacity';
  }
}

/**
 * Map Observium severity to our application's severity
 *
 * This function is used in the commented-out code above as an example
 * of how the implementation would work in a real application.
 *
 * @param severity - The severity level from Observium
 * @returns The mapped severity level for our application
 */
// Example function for documentation purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapObserviumSeverity(
  severity: number
): 'info' | 'warning' | 'critical' {
  switch (severity) {
    case 1:
      return 'info';
    case 2:
      return 'warning';
    case 3:
    case 4:
      return 'critical';
    default:
      return 'info';
  }
}
