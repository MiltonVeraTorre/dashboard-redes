/**
 * Observium API Adapter
 *
 * This module provides an adapter for the Observium API, allowing the application
 * to fetch network data from Observium in a standardized format.
 *
 * Implements methods for HU-02 Technical Monitoring feature:
 * - Device management and filtering
 * - Network ports and interfaces
 * - Performance counters and time-series data
 * - System monitoring (CPU, memory, sensors)
 * - Network discovery (neighbors)
 * - Alert management
 */

import axios, { AxiosInstance } from 'axios';
import type { Site, Link, Alert } from '../domain/entities';

/**
 * Create a dedicated axios instance for Observium API
 *
 * Uses environment variables for configuration:
 * - OBSERVIUM_BASE_URL: API base URL
 * - OBSERVIUM_USERNAME: Basic auth username
 * - OBSERVIUM_PASSWORD: Basic auth password
 */
export const observiumApi: AxiosInstance = axios.create({
  baseURL: process.env.OBSERVIUM_BASE_URL!,
  auth: {
    username: process.env.OBSERVIUM_USERNAME!,
    password: process.env.OBSERVIUM_PASSWORD!
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout (increased for multiple API calls)
  maxRedirects: 5, // Limit redirects to prevent infinite loops
  validateStatus: (status) => {
    return status >= 200 && status < 300; // Only consider 2xx responses as successful
  },
});


// ============================================================================
// TYPE DEFINITIONS FOR OBSERVIUM API RESPONSES
// ============================================================================

export interface ObserviumDevice {
  device_id: number;
  hostname: string;
  status: number;
  location: string;
  group?: string;
  purpose?: string;
  disabled?: number;
  ignore?: number;
  os?: string;
  type?: string;
  hardware?: string;
  version?: string;
  uptime?: number;
  last_polled?: string;
}

export interface ObserviumPort {
  port_id: number;
  device_id: number;
  ifIndex: number;
  ifName: string;
  ifAlias?: string;
  ifType: string;
  ifOperStatus: string;
  ifAdminStatus: string;
  ifSpeed?: number;
  ifHighSpeed?: number;
  ifMtu?: number;
  ifInOctets?: number;
  ifOutOctets?: number;
  ifInErrors?: number;
  ifOutErrors?: number;
  ifInUcastPkts?: number;
  ifOutUcastPkts?: number;
  poll_time?: string;
}

export interface ObserviumCounter {
  counter_id: number;
  device_id: number;
  port_id?: number;
  counter_name: string;
  counter_value: number;
  counter_type: string;
  timestamp: string;
  delta?: number;
  rate?: number;
}

export interface ObserviumMemPool {
  mempool_id: number;
  device_id: number;
  mempool_index: number;
  mempool_type: string;
  mempool_descr: string;
  mempool_used: number;
  mempool_total: number;
  mempool_perc: number;
  mempool_free: number;
}

export interface ObserviumProcessor {
  processor_id: number;
  device_id: number;
  processor_index: number;
  processor_type: string;
  processor_descr: string;
  processor_usage: number;
}

export interface ObserviumSensor {
  sensor_id: number;
  device_id: number;
  sensor_class: string;
  sensor_type: string;
  sensor_index: string;
  sensor_descr: string;
  sensor_value: number;
  sensor_unit?: string;
  sensor_limit_low?: number;
  sensor_limit_high?: number;
  sensor_limit_low_warn?: number;
  sensor_limit_high_warn?: number;
  entity_type?: string;
  metric?: string;
}

export interface ObserviumNeighbour {
  neighbour_id: number;
  device_id: number;
  port_id: number;
  protocol: string;
  remote_hostname: string;
  remote_port: string;
  remote_platform?: string;
  remote_version?: string;
}

export interface ObserviumAlert {
  alert_id: number;
  device_id: number;
  entity_type: string;
  entity_id: number;
  alert_test_id: number;
  alert_status: string;
  alert_message: string;
  timestamp: string;
  last_changed?: string;
  acknowledged?: number;
}

// ============================================================================
// FILTER INTERFACES
// ============================================================================

export interface DeviceFilters {
  device_id?: number | number[];
  hostname?: string;
  location?: string;
  group?: string;
  status?: number;
  type?: string;
  fields?: string;
}

export interface PortFilters {
  device_id?: number | number[];
  port_id?: number | number[];
  ifName?: string;
  ifType?: string;
  ifOperStatus?: string;
  fields?: string;
}

export interface CounterFilters {
  device_id?: number | number[];
  port_id?: number | number[];
  counter_type?: string;
  from?: string;
  to?: string;
  fields?: string;
}

export interface MemPoolFilters {
  device_id?: number | number[];
  mempool_type?: string;
  fields?: string;
}

export interface ProcessorFilters {
  device_id?: number | number[];
  processor_type?: string;
  fields?: string;
}

export interface SensorFilters {
  device_id?: number | number[];
  sensor_class?: string;
  sensor_type?: string;
  entity_type?: string;
  metric?: string;
  fields?: string;
}

export interface NeighbourFilters {
  device_id?: number | number[];
  protocol?: string;
  fields?: string;
}

export interface AlertFilters {
  device_id?: number | number[];
  entity_type?: string;
  alert_status?: string;
  acknowledged?: number;
  fields?: string;
}

// ============================================================================
// CORE API METHODS FOR HU-02 TECHNICAL MONITORING
// ============================================================================

/**
 * Fetch devices from Observium API
 * Primary method for device discovery and filtering by plaza/site
 */
export async function fetchDevices(filters: DeviceFilters = {}): Promise<ObserviumDevice[]> {
  try {
    const params: Record<string, any> = {};

    // Handle device_id filter (single or array)
    if (filters.device_id !== undefined) {
      if (Array.isArray(filters.device_id)) {
        params.device_id = filters.device_id.join(',');
      } else {
        params.device_id = filters.device_id;
      }
    }

    // Add other filters
    if (filters.hostname) params.hostname = filters.hostname;
    if (filters.location) params.location = filters.location;
    if (filters.group) params.group = filters.group;
    if (filters.status !== undefined) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    if (filters.fields) params.fields = filters.fields;

    const response = await observiumApi.get('/devices', { params });

    // Observium API returns devices in format: { count: N, status: "ok", devices: { "1": {...}, "2": {...} } }
    // Convert to array format
    if (response.data && response.data.devices) {
      return Object.values(response.data.devices) as ObserviumDevice[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching devices from Observium:', error);
    throw new Error(`Failed to fetch devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch network ports/interfaces from Observium API
 * Essential for link capacity and usage monitoring
 *
 * Based on official API documentation:
 * - Parameters: device_id, ifType, state, errors, hostname
 * - Multiple device_ids not supported - use individual calls
 */
export async function fetchPorts(filters: PortFilters = {}): Promise<ObserviumPort[]> {
  try {
    // If multiple device_ids provided, make individual calls
    if (Array.isArray(filters.device_id) && filters.device_id.length > 1) {
      console.log(`📡 Making individual port calls for ${filters.device_id.length} devices`);
      const portPromises = filters.device_id.map(deviceId =>
        fetchPorts({ ...filters, device_id: deviceId })
      );
      const portArrays = await Promise.all(portPromises);
      return portArrays.flat();
    }

    const params: Record<string, any> = {};

    // Handle single device_id (API doesn't support multiple)
    if (filters.device_id !== undefined) {
      if (Array.isArray(filters.device_id)) {
        params.device_id = filters.device_id[0]; // Take first one for individual call
      } else {
        params.device_id = filters.device_id;
      }
    }

    // Use correct parameter names based on API documentation
    if (filters.ifType) params.ifType = filters.ifType;
    if (filters.ifOperStatus) params.state = filters.ifOperStatus; // ✅ Correct parameter name

    // Remove unsupported parameters
    // Note: fields parameter not mentioned in documentation, removing for now

    console.log(`📡 Fetching ports with params:`, params);
    const response = await observiumApi.get('/ports', { params });

    // Handle multiple response formats from Observium API
    // Format 1: { count: N, status: "ok", ports: { "1": {...}, "2": {...} } }
    // Format 2: [ {...}, {...}, ... ] (direct array)
    // Format 3: { data: [ {...}, {...}, ... ] }
    if (response.data) {
      let rawPorts: any[] = [];

      if (response.data.ports && typeof response.data.ports === 'object') {
        // Format 1: Object with numbered keys
        rawPorts = Object.values(response.data.ports);
      } else if (Array.isArray(response.data)) {
        // Format 2: Direct array response
        rawPorts = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Format 3: Wrapped array
        rawPorts = response.data.data;
      } else if (typeof response.data === 'object' && !response.data.ports) {
        // Format 4: Single object response, convert to array
        rawPorts = [response.data];
      }

      // Map raw ports to standardized ObserviumPort interface
      const ports: ObserviumPort[] = rawPorts.map(rawPort => ({
        port_id: Number(rawPort.port_id || 0),
        device_id: Number(rawPort.device_id || 0),
        ifIndex: Number(rawPort.ifIndex || 0),
        ifName: String(rawPort.ifName || ''),
        ifAlias: rawPort.ifAlias ? String(rawPort.ifAlias) : undefined,
        ifType: String(rawPort.ifType || ''),
        ifOperStatus: String(rawPort.ifOperStatus || ''),
        ifAdminStatus: String(rawPort.ifAdminStatus || ''),
        ifSpeed: rawPort.ifSpeed ? Number(rawPort.ifSpeed) : undefined,
        ifHighSpeed: rawPort.ifHighSpeed ? Number(rawPort.ifHighSpeed) : undefined,
        ifMtu: rawPort.ifMtu ? Number(rawPort.ifMtu) : undefined,
        ifInOctets: rawPort.ifInOctets ? Number(rawPort.ifInOctets) : undefined,
        ifOutOctets: rawPort.ifOutOctets ? Number(rawPort.ifOutOctets) : undefined,
        ifInErrors: rawPort.ifInErrors ? Number(rawPort.ifInErrors) : undefined,
        ifOutErrors: rawPort.ifOutErrors ? Number(rawPort.ifOutErrors) : undefined,
        ifInUcastPkts: rawPort.ifInUcastPkts ? Number(rawPort.ifInUcastPkts) : undefined,
        ifOutUcastPkts: rawPort.ifOutUcastPkts ? Number(rawPort.ifOutUcastPkts) : undefined,
        poll_time: rawPort.poll_time ? String(rawPort.poll_time) : undefined
      }));

      console.log(`✅ Successfully fetched ${ports.length} ports`);
      return ports;
    }

    console.log(`⚠️ No ports data in response:`, response.data);
    return [];
  } catch (error) {
    console.error('Error fetching ports from Observium:', error);
    // Return empty array instead of throwing to allow graceful degradation
    console.warn('Falling back to empty ports array due to API error');
    return [];
  }
}

/**
 * Fetch performance counters from Observium API
 * Main source for time-series performance data and historical usage trends
 *
 * Based on official API documentation:
 * - Parameters: device_id, entity_id, entity_type, counter_descr
 * - NO support for date filtering (from/to parameters don't exist)
 * - Multiple device_ids not supported - use individual calls
 */
export async function fetchCounters(filters: CounterFilters = {}): Promise<ObserviumCounter[]> {
  try {
    // If multiple device_ids provided, make individual calls
    if (Array.isArray(filters.device_id) && filters.device_id.length > 1) {
      console.log(`📊 Making individual counter calls for ${filters.device_id.length} devices`);
      const counterPromises = filters.device_id.map(deviceId =>
        fetchCounters({ ...filters, device_id: deviceId })
      );
      const counterArrays = await Promise.all(counterPromises);
      return counterArrays.flat();
    }

    const params: Record<string, any> = {};

    // Handle single device_id (API doesn't support multiple)
    if (filters.device_id !== undefined) {
      if (Array.isArray(filters.device_id)) {
        params.device_id = filters.device_id[0]; // Take first one for individual call
      } else {
        params.device_id = filters.device_id;
      }
    }

    // Use correct parameter names based on API documentation
    // Note: Only device_id is available in current CounterFilters interface
    // Additional parameters would need to be added to the interface if needed

    // Remove unsupported parameters
    // Note: from/to date parameters NOT supported by Observium API
    // Note: fields parameter not mentioned in documentation
    // Note: counter_type parameter not mentioned in documentation

    if (filters.from || filters.to) {
      console.warn('⚠️ Date filtering (from/to) not supported by Observium /counters/ endpoint');
    }

    console.log(`📊 Fetching counters with params:`, params);
    const response = await observiumApi.get('/counters', { params });

    // Handle different response formats from Observium API
    if (response.data && response.data.counters) {
      // Format: { count: N, status: "ok", counters: { "1": {...}, "2": {...} } }
      const counters = Object.values(response.data.counters) as ObserviumCounter[];
      console.log(`✅ Successfully fetched ${counters.length} counters`);
      return counters;
    } else if (Array.isArray(response.data)) {
      // Format: [ {...}, {...}, ... ]
      console.log(`✅ Successfully fetched ${response.data.length} counters`);
      return response.data as ObserviumCounter[];
    }

    console.log(`⚠️ No counters data in response:`, response.data);
    return [];
  } catch (error) {
    console.error('Error fetching counters from Observium:', error);
    // Return empty array instead of throwing to allow graceful degradation
    console.warn('Falling back to empty counters array due to API error');
    return [];
  }
}

/**
 * Fetch memory pools from Observium API
 * For system monitoring and resource utilization
 */
export async function fetchMemPools(filters: MemPoolFilters = {}): Promise<ObserviumMemPool[]> {
  try {
    const params: Record<string, any> = {};

    // Handle device_id filter (single or array)
    if (filters.device_id !== undefined) {
      if (Array.isArray(filters.device_id)) {
        params.device_id = filters.device_id.join(',');
      } else {
        params.device_id = filters.device_id;
      }
    }

    // Add other filters
    if (filters.mempool_type) params.mempool_type = filters.mempool_type;
    if (filters.fields) params.fields = filters.fields;

    const response = await observiumApi.get('/mempools', { params });

    // Handle different response formats from Observium API
    if (response.data && response.data.mempools) {
      return Object.values(response.data.mempools) as ObserviumMemPool[];
    } else if (Array.isArray(response.data)) {
      return response.data as ObserviumMemPool[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching memory pools from Observium:', error);
    throw new Error(`Failed to fetch memory pools: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch processors from Observium API
 * For CPU utilization monitoring
 */
export async function fetchProcessors(filters: ProcessorFilters = {}): Promise<ObserviumProcessor[]> {
  try {
    const params: Record<string, any> = {};

    // Handle device_id filter (single or array)
    if (filters.device_id !== undefined) {
      if (Array.isArray(filters.device_id)) {
        params.device_id = filters.device_id.join(',');
      } else {
        params.device_id = filters.device_id;
      }
    }

    // Add other filters
    if (filters.processor_type) params.processor_type = filters.processor_type;
    if (filters.fields) params.fields = filters.fields;

    const response = await observiumApi.get('/processors', { params });

    // Handle different response formats from Observium API
    if (response.data && response.data.processors) {
      return Object.values(response.data.processors) as ObserviumProcessor[];
    } else if (Array.isArray(response.data)) {
      return response.data as ObserviumProcessor[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching processors from Observium:', error);
    throw new Error(`Failed to fetch processors: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch sensors from Observium API
 * For environmental monitoring (temperature, voltage, fan speed, etc.)
 */
export async function fetchSensors(filters: SensorFilters = {}): Promise<ObserviumSensor[]> {
  try {
    const params: Record<string, any> = {};

    // Handle device_id filter (single or array)
    if (filters.device_id !== undefined) {
      if (Array.isArray(filters.device_id)) {
        params.device_id = filters.device_id.join(',');
      } else {
        params.device_id = filters.device_id;
      }
    }

    // Add other filters
    if (filters.sensor_class) params.sensor_class = filters.sensor_class;
    if (filters.sensor_type) params.sensor_type = filters.sensor_type;
    if (filters.entity_type) params.entity_type = filters.entity_type;
    if (filters.metric) params.metric = filters.metric;
    if (filters.fields) params.fields = filters.fields;

    const response = await observiumApi.get('/sensors', { params });

    // Handle different response formats from Observium API
    if (response.data && response.data.sensors) {
      return Object.values(response.data.sensors) as ObserviumSensor[];
    } else if (Array.isArray(response.data)) {
      return response.data as ObserviumSensor[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching sensors from Observium:', error);
    throw new Error(`Failed to fetch sensors: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch neighbours from Observium API
 * For network discovery (CDP/LLDP)
 */
export async function fetchNeighbours(filters: NeighbourFilters = {}): Promise<ObserviumNeighbour[]> {
  try {
    const params: Record<string, any> = {};

    // Handle device_id filter (single or array)
    if (filters.device_id !== undefined) {
      if (Array.isArray(filters.device_id)) {
        params.device_id = filters.device_id.join(',');
      } else {
        params.device_id = filters.device_id;
      }
    }

    // Add other filters
    if (filters.protocol) params.protocol = filters.protocol;
    if (filters.fields) params.fields = filters.fields;

    const response = await observiumApi.get('/neighbours', { params });

    // Handle different response formats from Observium API
    if (response.data && response.data.neighbours) {
      return Object.values(response.data.neighbours) as ObserviumNeighbour[];
    } else if (Array.isArray(response.data)) {
      return response.data as ObserviumNeighbour[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching neighbours from Observium:', error);
    throw new Error(`Failed to fetch neighbours: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch alerts from Observium API
 * For system alerts and monitoring notifications
 *
 * Based on official API documentation:
 * - Parameters: device_id, status, entity_type, alert_test_id
 * - Status values: failed, failed_suppressed, delayed
 * - Multiple device_ids not supported - use individual calls
 */
export async function fetchObserviumAlerts(filters: AlertFilters = {}): Promise<ObserviumAlert[]> {
  try {
    // If multiple device_ids provided, make individual calls
    if (Array.isArray(filters.device_id) && filters.device_id.length > 1) {
      console.log(`🚨 Making individual alert calls for ${filters.device_id.length} devices`);
      const alertPromises = filters.device_id.map(deviceId =>
        fetchObserviumAlerts({ ...filters, device_id: deviceId })
      );
      const alertArrays = await Promise.all(alertPromises);
      return alertArrays.flat();
    }

    const params: Record<string, any> = {};

    // Handle single device_id (API doesn't support multiple)
    if (filters.device_id !== undefined) {
      if (Array.isArray(filters.device_id)) {
        params.device_id = filters.device_id[0]; // Take first one for individual call
      } else {
        params.device_id = filters.device_id;
      }
    }

    // Use correct parameter names based on API documentation
    if (filters.alert_status) params.status = filters.alert_status; // ✅ Correct parameter name
    if (filters.entity_type) params.entity_type = filters.entity_type;

    // Remove unsupported parameters
    // Note: acknowledged parameter not mentioned in documentation
    // Note: fields parameter not mentioned in documentation

    console.log(`🚨 Fetching alerts with params:`, params);
    const response = await observiumApi.get('/alerts', { params });

    // Handle multiple response formats from Observium API
    // Format 1: { count: N, status: "ok", alerts: { "1": {...}, "2": {...} } }
    // Format 2: [ {...}, {...}, ... ] (direct array)
    // Format 3: { data: [ {...}, {...}, ... ] }
    if (response.data) {
      let rawAlerts: any[] = [];

      if (response.data.alerts && typeof response.data.alerts === 'object') {
        // Format 1: Object with numbered keys
        rawAlerts = Object.values(response.data.alerts);
      } else if (Array.isArray(response.data)) {
        // Format 2: Direct array response
        rawAlerts = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Format 3: Wrapped array
        rawAlerts = response.data.data;
      } else if (typeof response.data === 'object' && !response.data.alerts) {
        // Format 4: Single object response, convert to array
        rawAlerts = [response.data];
      }

      // Map raw alerts to standardized ObserviumAlert interface
      const alerts: ObserviumAlert[] = rawAlerts.map(rawAlert => ({
        alert_id: Number(rawAlert.alert_table_id || rawAlert.alert_id || 0),
        device_id: Number(rawAlert.device_id || 0),
        entity_type: String(rawAlert.entity_type || ''),
        entity_id: Number(rawAlert.entity_id || 0),
        alert_test_id: Number(rawAlert.alert_test_id || 0),
        alert_status: String(rawAlert.alert_status || ''),
        alert_message: String(rawAlert.alert_message || ''),
        timestamp: String(rawAlert.last_changed || rawAlert.timestamp || ''),
        last_changed: String(rawAlert.last_changed || ''),
        acknowledged: Number(rawAlert.acknowledged || 0)
      }));

      console.log(`✅ Successfully fetched ${alerts.length} alerts`);
      return alerts;
    }

    console.log(`⚠️ No alerts data in response:`, response.data);
    return [];
  } catch (error) {
    console.error('Error fetching alerts from Observium:', error);
    // Return empty array instead of throwing to allow graceful degradation
    console.warn('Falling back to empty alerts array due to API error');
    return [];
  }
}

// ============================================================================
// CONVENIENCE METHODS FOR SPECIFIC USE CASES
// ============================================================================

/**
 * Get devices by plaza/location
 * Convenience method for HU-02 plaza filtering
 */
export async function fetchDevicesByPlaza(plaza: string): Promise<ObserviumDevice[]> {
  try {
    console.log(`🔍 Fetching devices for plaza: ${plaza}`);

    // First try to get all devices and filter by location since group field is null
    const allDevices = await fetchDevices({
      // Remove fields filter to get all data
    });

    console.log(`📊 Total devices fetched from API: ${allDevices.length}`);

    // Filter devices by location containing the plaza name
    const filteredDevices = allDevices.filter(device => {
      if (!device.location) return false;

      // Map plaza names to location patterns
      const locationPatterns: Record<string, string[]> = {
        'Saltillo': ['Saltillo'],
        'Monterrey': ['Monterrey', 'Garcia', 'Guadalupe', 'Kristales', 'Hualahuises'],
        'CDMX': ['Ciudad de Mexico', 'CDMX', 'Mexico City'],
        'Laredo': ['Laredo', 'Piedras Negras']
      };

      const patterns = locationPatterns[plaza] || [plaza];
      const matches = patterns.some(pattern =>
        device.location.toLowerCase().includes(pattern.toLowerCase())
      );

      if (matches) {
        console.log(`✅ Device ${device.hostname} matches plaza ${plaza} (location: ${device.location})`);
      }

      return matches;
    });

    console.log(`✅ Found ${filteredDevices.length} devices for plaza ${plaza}`);

    if (filteredDevices.length === 0) {
      console.log(`⚠️ No devices found for plaza ${plaza}. Sample locations from API:`,
        allDevices.slice(0, 5).map(d => ({ hostname: d.hostname, location: d.location }))
      );
    }

    return filteredDevices;
  } catch (error) {
    console.error(`❌ Error fetching devices for plaza ${plaza}:`, error);
    console.error(`❌ Error details:`, error instanceof Error ? error.message : 'Unknown error');
    // Return empty array on error instead of throwing
    return [];
  }
}

/**
 * Get devices by location (alternative to group)
 * Some Observium installations use location field for plaza/site grouping
 */
export async function fetchDevicesByLocation(location: string): Promise<ObserviumDevice[]> {
  return fetchDevices({
    location: location,
    fields: 'device_id,hostname,status,location,group,type,os'
  });
}

/**
 * Get all active devices
 * Filters out disabled and ignored devices
 */
export async function fetchActiveDevices(): Promise<ObserviumDevice[]> {
  return fetchDevices({
    status: 1, // Active status
    fields: 'device_id,hostname,status,location,group,type,os,uptime'
  });
}

/**
 * Get network interfaces for capacity monitoring
 * Focuses on operational interfaces with traffic data
 *
 * ✅ Updated to use correct API parameters
 */
export async function fetchNetworkInterfaces(deviceIds?: number[]): Promise<ObserviumPort[]> {
  return fetchPorts({
    device_id: deviceIds,
    ifOperStatus: 'up'
    // Note: fields parameter removed as it's not supported by API
  });
}

/**
 * Get traffic counters for historical analysis
 * Main method for time-series data used in HU-02 trends
 *
 * ⚠️ Note: Date filtering not supported by Observium API
 */
export async function fetchTrafficCounters(deviceIds?: number[], fromDate?: string, toDate?: string): Promise<ObserviumCounter[]> {
  if (fromDate || toDate) {
    console.warn('⚠️ Date filtering not supported by Observium /counters/ endpoint. Returning all available counters.');
  }

  return fetchCounters({
    device_id: deviceIds
    // Note: counter_type, from, to, fields parameters removed as they're not supported by API
  });
}

/**
 * Get critical alerts for monitoring
 * Focuses on unacknowledged critical alerts
 *
 * ✅ Updated to use correct API parameters
 */
export async function fetchCriticalAlerts(deviceIds?: number[]): Promise<ObserviumAlert[]> {
  return fetchObserviumAlerts({
    device_id: deviceIds,
    alert_status: 'failed'
    // Note: acknowledged and fields parameters removed as they're not supported by API
  });
}

// ============================================================================
// LEGACY METHODS FOR EXISTING JOBS COMPATIBILITY
// ============================================================================

/**
 * Fetch sites from Observium (legacy method for job compatibility)
 * Maps Observium devices to Site entities for the domain layer
 */
export async function fetchSites(): Promise<Site[]> {
  try {
    const devices = await fetchActiveDevices();

    // Transform Observium devices to Site entities
    const sites: Site[] = devices.map(device => ({
      id: device.device_id.toString(),
      name: device.hostname,
      plaza: extractPlazaFromLocation(device.location) || 'Unknown',
      address: device.location,
      // Note: Observium doesn't typically provide coordinates
      // This would need to be enriched from another source
    }));

    return sites;
  } catch (error) {
    console.error('Error fetching sites from Observium:', error);
    throw new Error(`Failed to fetch sites: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch links from Observium (legacy method for job compatibility)
 * Maps Observium ports to Link entities for the domain layer
 */
export async function fetchLinks(): Promise<Link[]> {
  try {
    const ports = await fetchNetworkInterfaces();

    // Transform Observium ports to Link entities
    const links: Link[] = ports.map(port => {
      const capacity = port.ifHighSpeed ? port.ifHighSpeed : (port.ifSpeed ? port.ifSpeed / 1000000 : 0); // Convert to Mbps
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

    return links;
  } catch (error) {
    console.error('Error fetching links from Observium:', error);
    throw new Error(`Failed to fetch links: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch alerts from Observium (legacy method for job compatibility)
 * Maps Observium alerts to Alert entities for the domain layer
 */
export async function fetchAlerts(): Promise<Alert[]> {
  try {
    const observiumAlerts = await fetchCriticalAlerts();

    // Transform Observium alerts to Alert entities
    const alerts: Alert[] = observiumAlerts.map(alert => ({
      id: alert.alert_id.toString(),
      siteId: alert.device_id.toString(),
      linkId: alert.entity_type === 'port' ? alert.entity_id.toString() : undefined,
      type: mapAlertType(alert.entity_type),
      severity: mapAlertSeverity(alert.alert_status),
      message: alert.alert_message,
      timestamp: new Date(alert.timestamp),
      acknowledged: Boolean(alert.acknowledged),
    }));

    return alerts;
  } catch (error) {
    console.error('Error fetching alerts from Observium:', error);
    throw new Error(`Failed to fetch alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR DATA TRANSFORMATION
// ============================================================================

/**
 * Calculate current usage from port statistics
 * Uses the higher of input or output octets per second
 */
function calculateCurrentUsage(port: ObserviumPort): number {
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

/**
 * Map Observium entity types to domain alert types
 */
function mapAlertType(entityType: string): 'capacity' | 'latency' | 'packet_loss' | 'downtime' {
  switch (entityType.toLowerCase()) {
    case 'port':
    case 'interface':
      return 'capacity';
    case 'device':
      return 'downtime';
    case 'sensor':
      return 'capacity'; // Could be temperature, power, etc.
    default:
      return 'capacity';
  }
}

/**
 * Map Observium alert status to domain alert severity
 */
function mapAlertSeverity(alertStatus: string): 'info' | 'warning' | 'critical' {
  switch (alertStatus.toLowerCase()) {
    case 'failed':
    case 'critical':
      return 'critical';
    case 'warning':
    case 'warn':
      return 'warning';
    case 'ok':
    case 'info':
    default:
      return 'info';
  }
}

/**
 * Extract plaza name from Observium location string
 * Maps location patterns to standardized plaza names
 */
function extractPlazaFromLocation(location?: string): string | null {
  if (!location) return null;

  const locationLower = location.toLowerCase();

  // Map location patterns to plaza names
  if (locationLower.includes('saltillo')) return 'Saltillo';
  if (locationLower.includes('monterrey') || locationLower.includes('garcia') ||
      locationLower.includes('guadalupe') || locationLower.includes('kristales') ||
      locationLower.includes('hualahuises')) return 'Monterrey';
  if (locationLower.includes('ciudad de mexico') || locationLower.includes('cdmx') ||
      locationLower.includes('mexico city')) return 'CDMX';
  if (locationLower.includes('laredo') || locationLower.includes('piedras negras')) return 'Laredo';

  return null;
}

// ============================================================================
// SPECIALIZED METHODS FOR HU-02 TECHNICAL MONITORING
// ============================================================================

/**
 * Get comprehensive device monitoring data
 * Combines device info, ports, and system metrics for detailed technical view
 */
export async function fetchDeviceMonitoringData(deviceId: number) {
  try {
    const [device, ports, memPools, processors, sensors, alerts] = await Promise.all([
      fetchDevices({ device_id: deviceId }),
      fetchPorts({ device_id: deviceId }),
      fetchMemPools({ device_id: deviceId }),
      fetchProcessors({ device_id: deviceId }),
      fetchSensors({ device_id: deviceId }),
      fetchObserviumAlerts({ device_id: deviceId, alert_status: 'failed' })
    ]);

    return {
      device: device[0] || null,
      ports: ports || [],
      memPools: memPools || [],
      processors: processors || [],
      sensors: sensors || [],
      alerts: alerts || []
    };
  } catch (error) {
    console.error(`Error fetching monitoring data for device ${deviceId}:`, error);
    throw new Error(`Failed to fetch device monitoring data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get plaza/site overview with aggregated metrics
 * Useful for HU-02 plaza filtering and overview
 */
export async function fetchPlazaOverview(plaza: string) {
  try {
    const devices = await fetchDevicesByPlaza(plaza);

    // Ensure devices is always an array
    const safeDevices = Array.isArray(devices) ? devices : [];
    const deviceIds = safeDevices.map(d => d.device_id);

    if (deviceIds.length === 0) {
      return {
        plaza,
        devices: [],
        totalDevices: 0,
        activeDevices: 0,
        totalPorts: 0,
        activePorts: 0,
        alerts: []
      };
    }

    const [ports, alerts] = await Promise.all([
      fetchPorts({ device_id: deviceIds }),
      fetchObserviumAlerts({ device_id: deviceIds, alert_status: 'failed' })
    ]);

    // Ensure arrays are safe
    const safePorts = Array.isArray(ports) ? ports : [];
    const safeAlerts = Array.isArray(alerts) ? alerts : [];

    const activeDevices = safeDevices.filter(d => d.status === 1).length;
    const activePorts = safePorts.filter(p => p.ifOperStatus === 'up').length;

    return {
      plaza,
      devices: safeDevices,
      totalDevices: safeDevices.length,
      activeDevices,
      totalPorts: safePorts.length,
      activePorts,
      alerts: safeAlerts
    };
  } catch (error) {
    console.error(`Error fetching plaza overview for ${plaza}:`, error);
    throw new Error(`Failed to fetch plaza overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get historical performance data for capacity planning
 * Essential for HU-02 historical usage trends
 */
export async function fetchHistoricalPerformance(
  deviceIds: number[],
  fromDate: string,
  toDate: string,
  interval: 'hour' | 'day' | 'week' = 'hour'
) {
  try {
    // ⚠️ Note: Date filtering not supported by Observium API
    console.warn('⚠️ Historical performance: Date filtering not supported by Observium API. Returning all available counters.');

    const counters = await fetchCounters({
      device_id: deviceIds
      // Note: from, to, fields parameters removed as they're not supported by API
    });

    // Ensure counters is an array before processing
    if (!Array.isArray(counters)) {
      console.warn('Counters data is not an array, returning empty historical data');
      return {
        interval,
        fromDate,
        toDate,
        data: {},
        summary: {
          totalDataPoints: 0,
          devicesCount: 0,
          portsCount: 0
        }
      };
    }

    // Group counters by device and port for easier processing
    const groupedData = counters.reduce((acc, counter) => {
      const key = `${counter.device_id}-${counter.port_id || 'device'}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(counter);
      return acc;
    }, {} as Record<string, ObserviumCounter[]>);

    return {
      interval,
      fromDate,
      toDate,
      data: groupedData,
      summary: {
        totalDataPoints: counters.length,
        devicesCount: new Set(counters.map(c => c.device_id)).size,
        portsCount: new Set(counters.map(c => c.port_id).filter(Boolean)).size
      }
    };
  } catch (error) {
    console.error('Error fetching historical performance data:', error);
    throw new Error(`Failed to fetch historical performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get saturation analysis for capacity planning
 * Identifies links approaching capacity thresholds
 */
export async function fetchSaturationAnalysis(plazas?: string[]) {
  try {
    let devices: ObserviumDevice[] = [];

    if (plazas && plazas.length > 0) {
      // Fetch devices for specific plazas
      const devicePromises = plazas.map(plaza => fetchDevicesByPlaza(plaza));
      const deviceArrays = await Promise.all(devicePromises);
      devices = deviceArrays.flat();
    } else {
      // Fetch all active devices
      devices = await fetchActiveDevices();
    }

    const deviceIds = devices.map(d => d.device_id);
    const ports = await fetchNetworkInterfaces(deviceIds);

    // Analyze saturation levels
    const saturationAnalysis = ports.map(port => {
      const capacity = port.ifHighSpeed || (port.ifSpeed ? port.ifSpeed / 1000000 : 0);
      const currentUsage = calculateCurrentUsage(port);
      const utilizationPercentage = capacity > 0 ? (currentUsage / capacity) * 100 : 0;

      let saturationLevel: 'normal' | 'warning' | 'critical' = 'normal';
      if (utilizationPercentage >= 90) {
        saturationLevel = 'critical';
      } else if (utilizationPercentage >= 75) {
        saturationLevel = 'warning';
      }

      return {
        deviceId: port.device_id,
        portId: port.port_id,
        portName: port.ifAlias || port.ifName,
        capacity,
        currentUsage,
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        saturationLevel,
        operationalStatus: port.ifOperStatus
      };
    });

    // Sort by utilization percentage (highest first)
    saturationAnalysis.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);

    return {
      totalPorts: saturationAnalysis.length,
      critical: saturationAnalysis.filter(p => p.saturationLevel === 'critical').length,
      warning: saturationAnalysis.filter(p => p.saturationLevel === 'warning').length,
      normal: saturationAnalysis.filter(p => p.saturationLevel === 'normal').length,
      ports: saturationAnalysis
    };
  } catch (error) {
    console.error('Error performing saturation analysis:', error);
    throw new Error(`Failed to perform saturation analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

