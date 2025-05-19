/**
 * PRTG API Adapter
 *
 * This module provides an adapter for the PRTG API, allowing the application
 * to fetch network data from PRTG in a standardized format.
 */

// Import entities
import { Site, Link } from '../domain/entities';

// PRTG API response types (simplified)
// These interfaces are used for type documentation purposes
// They represent the expected structure of PRTG API responses
/**
 * @typedef PrtgDevice
 * @property {string} objid - Object ID
 * @property {string} device - Device name
 * @property {string} group - Device group
 * @property {string} location - Device location
 * @property {string} status - Status text
 * @property {number} status_raw - Status code
 */

/**
 * @typedef PrtgSensor
 * @property {string} objid - Object ID
 * @property {string} device_id - Parent device ID
 * @property {string} sensor - Sensor name
 * @property {string} status - Status text
 * @property {number} status_raw - Status code
 * @property {string} lastvalue - Last value as string
 * @property {number} lastvalue_raw - Last value as number
 */

/**
 * Fetch devices from PRTG and convert them to Site entities
 */
export async function fetchSites(): Promise<Site[]> {
  try {
    // In a real implementation, this would make an HTTP request to the PRTG API
    // For now, we'll just return an empty array
    console.log('Fetching sites from PRTG API...');

    // Example of how this would be implemented:
    // const response = await fetch(`${config.prtg.baseUrl}/api/table.json?content=devices&output=json&username=${config.prtg.username}&password=${config.prtg.password}`);
    // const data = await response.json();
    // const devices: PrtgDevice[] = data.devices;

    // return devices.map(device => ({
    //   id: device.objid,
    //   name: device.device,
    //   plaza: device.group,
    //   address: device.location,
    // }));

    return [];
  } catch (error) {
    console.error('Error fetching sites from PRTG:', error);
    return [];
  }
}

/**
 * Fetch sensors from PRTG and convert them to Link entities
 */
export async function fetchLinks(): Promise<Link[]> {
  try {
    // In a real implementation, this would make an HTTP request to the PRTG API
    // For now, we'll just return an empty array
    console.log('Fetching links from PRTG API...');

    // Example of how this would be implemented:
    // const response = await fetch(`${config.prtg.baseUrl}/api/table.json?content=sensors&output=json&username=${config.prtg.username}&password=${config.prtg.password}`);
    // const data = await response.json();
    // const sensors: PrtgSensor[] = data.sensors;

    // return sensors.map(sensor => ({
    //   id: sensor.objid,
    //   siteId: sensor.device_id,
    //   name: sensor.sensor,
    //   capacity: 1000, // This would need to be determined from the sensor data
    //   currentUsage: sensor.lastvalue_raw,
    //   utilizationPercentage: (sensor.lastvalue_raw / 1000) * 100,
    //   status: mapPrtgStatus(sensor.status_raw),
    //   lastUpdated: new Date(),
    // }));

    return [];
  } catch (error) {
    console.error('Error fetching links from PRTG:', error);
    return [];
  }
}

/**
 * Map PRTG status values to our application's status values
 *
 * This function is used in the commented-out code above as an example
 * of how the implementation would work in a real application.
 *
 * @param statusRaw - The raw status value from PRTG
 * @returns The mapped status value for our application
 */
// Example function for documentation purposes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapPrtgStatus(statusRaw: number): 'normal' | 'warning' | 'critical' {
  // PRTG status values:
  // 3: Up -> normal
  // 4: Warning -> warning
  // 5: Down -> critical
  // etc.

  switch (statusRaw) {
    case 3:
      return 'normal';
    case 4:
    case 10:
      return 'warning';
    case 5:
    case 13:
    case 14:
      return 'critical';
    default:
      return 'normal';
  }
}
