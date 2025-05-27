/**
 * Monitoring Domain Layer
 *
 * This module contains the business logic specific to HU-02 Technical Monitoring.
 * Provides high-level monitoring functions that integrate with Observium API
 * for detailed technical analysis and capacity planning.
 */

import * as ObserviumAdapter from '../adapters/ObserviumApiAdapter';

// ============================================================================
// DOMAIN INTERFACES FOR HU-02 MONITORING
// ============================================================================

export interface DeviceMonitoringData {
  device: ObserviumAdapter.ObserviumDevice;
  ports: ObserviumAdapter.ObserviumPort[];
  memPools: ObserviumAdapter.ObserviumMemPool[];
  processors: ObserviumAdapter.ObserviumProcessor[];
  sensors: ObserviumAdapter.ObserviumSensor[];
  alerts: ObserviumAdapter.ObserviumAlert[];
}

export interface PlazaOverview {
  plaza: string;
  devices: ObserviumAdapter.ObserviumDevice[];
  totalDevices: number;
  activeDevices: number;
  totalPorts: number;
  activePorts: number;
  alerts: ObserviumAdapter.ObserviumAlert[];
}

export interface HistoricalPerformanceData {
  interval: 'hour' | 'day' | 'week';
  fromDate: string;
  toDate: string;
  data: Record<string, ObserviumAdapter.ObserviumCounter[]>;
  summary: {
    totalDataPoints: number;
    devicesCount: number;
    portsCount: number;
  };
}

export interface SaturationAnalysis {
  totalPorts: number;
  critical: number;
  warning: number;
  normal: number;
  ports: Array<{
    deviceId: number;
    portId: number;
    portName: string;
    capacity: number;
    currentUsage: number;
    utilizationPercentage: number;
    saturationLevel: 'normal' | 'warning' | 'critical';
    operationalStatus: string;
  }>;
}

export interface MonitoringFilters {
  plaza?: string;
  deviceIds?: number[];
  fromDate?: string;
  toDate?: string;
  includeInactive?: boolean;
}

// ============================================================================
// CORE MONITORING DOMAIN METHODS
// ============================================================================

/**
 * Get comprehensive monitoring data for a specific device
 * Essential for HU-02 detailed technical view
 */
export async function getDeviceMonitoringData(deviceId: number): Promise<DeviceMonitoringData | null> {
  try {
    const monitoringData = await ObserviumAdapter.fetchDeviceMonitoringData(deviceId);

    if (!monitoringData.device) {
      return null;
    }

    return monitoringData;
  } catch (error) {
    console.error(`Error fetching monitoring data for device ${deviceId}:`, error);
    throw new Error(`Failed to get device monitoring data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get plaza overview with aggregated metrics
 * Supports HU-02 plaza filtering requirement
 */
export async function getPlazaOverview(plaza: string): Promise<PlazaOverview> {
  try {
    const overview = await ObserviumAdapter.fetchPlazaOverview(plaza);
    return overview;
  } catch (error) {
    console.error(`Error fetching plaza overview for ${plaza}:`, error);

    // Return a safe default structure if the API fails
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
}

/**
 * Get historical performance data for capacity planning
 * Supports HU-02 historical usage trends requirement
 */
export async function getHistoricalPerformance(
  filters: MonitoringFilters,
  interval: 'hour' | 'day' | 'week' = 'hour'
): Promise<HistoricalPerformanceData> {
  try {
    const { deviceIds, fromDate, toDate } = filters;

    if (!deviceIds || deviceIds.length === 0) {
      throw new Error('Device IDs are required for historical performance data');
    }

    if (!fromDate || !toDate) {
      throw new Error('Date range (fromDate and toDate) is required for historical performance data');
    }

    const historicalData = await ObserviumAdapter.fetchHistoricalPerformance(
      deviceIds,
      fromDate,
      toDate,
      interval
    );

    return historicalData;
  } catch (error) {
    console.error('Error fetching historical performance data:', error);
    throw new Error(`Failed to get historical performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get saturation analysis for capacity planning
 * Supports HU-02 saturation thresholds requirement
 */
export async function getSaturationAnalysis(plazas?: string[]): Promise<SaturationAnalysis> {
  try {
    const analysis = await ObserviumAdapter.fetchSaturationAnalysis(plazas);
    return analysis;
  } catch (error) {
    console.error('Error performing saturation analysis:', error);
    throw new Error(`Failed to get saturation analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get devices by plaza for HU-02 filtering
 * Convenience method for plaza-based filtering
 */
export async function getDevicesByPlaza(plaza: string): Promise<ObserviumAdapter.ObserviumDevice[]> {
  try {
    const devices = await ObserviumAdapter.fetchDevicesByPlaza(plaza);
    return devices;
  } catch (error) {
    console.error(`Error fetching devices for plaza ${plaza}:`, error);
    throw new Error(`Failed to get devices by plaza: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get network interfaces for capacity monitoring
 * Focuses on operational interfaces with traffic data
 */
export async function getNetworkInterfaces(deviceIds?: number[]): Promise<ObserviumAdapter.ObserviumPort[]> {
  try {
    const interfaces = await ObserviumAdapter.fetchNetworkInterfaces(deviceIds);
    return interfaces;
  } catch (error) {
    console.error('Error fetching network interfaces:', error);
    throw new Error(`Failed to get network interfaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get critical alerts for monitoring dashboard
 * Supports HU-02 alert monitoring requirement
 */
export async function getCriticalAlerts(deviceIds?: number[]): Promise<ObserviumAdapter.ObserviumAlert[]> {
  try {
    const alerts = await ObserviumAdapter.fetchCriticalAlerts(deviceIds);
    return alerts;
  } catch (error) {
    console.error('Error fetching critical alerts:', error);
    throw new Error(`Failed to get critical alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// BUSINESS LOGIC METHODS FOR HU-02
// ============================================================================

/**
 * Determine if a device requires attention based on monitoring data
 * Business logic for identifying problematic devices
 */
export function requiresAttention(monitoringData: DeviceMonitoringData): {
  requiresAttention: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high';
} {
  const reasons: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';

  // Check device status
  if (monitoringData.device.status !== 1) {
    reasons.push('Device is not operational');
    severity = 'high';
  }

  // Check for critical alerts
  const criticalAlerts = monitoringData.alerts.filter(alert =>
    alert.alert_status === 'failed' && !alert.acknowledged
  );
  if (criticalAlerts.length > 0) {
    reasons.push(`${criticalAlerts.length} unacknowledged critical alerts`);
    severity = 'high';
  }

  // Check port utilization
  const highUtilizationPorts = monitoringData.ports.filter(port => {
    const capacity = port.ifHighSpeed || (port.ifSpeed ? port.ifSpeed / 1000000 : 0);
    if (capacity === 0) return false;

    // Try to use rate fields for proper utilization calculation
    let currentUsage = 0;
    const portData = port as any;

    if (portData.ifInOctets_rate !== undefined && portData.ifOutOctets_rate !== undefined) {
      // These are in octets/bytes per second according to Observium docs
      const inMbps = ((portData.ifInOctets_rate || 0) * 8) / 1000000;
      const outMbps = ((portData.ifOutOctets_rate || 0) * 8) / 1000000;
      currentUsage = Math.max(inMbps, outMbps);
    } else if (portData.in_rate !== undefined && portData.out_rate !== undefined) {
      const inMbps = ((portData.in_rate || 0) * 8) / 1000000;
      const outMbps = ((portData.out_rate || 0) * 8) / 1000000;
      currentUsage = Math.max(inMbps, outMbps);
    }

    if (currentUsage === 0) return false; // No rate data available

    const utilization = Math.min((currentUsage / capacity) * 100, 100); // Cap at 100%
    return utilization >= 75;
  });

  if (highUtilizationPorts.length > 0) {
    reasons.push(`${highUtilizationPorts.length} ports with high utilization (>75%)`);
    if (severity === 'low') severity = 'medium';
  }

  // Check memory utilization
  const highMemoryPools = monitoringData.memPools.filter(pool => pool.mempool_perc >= 85);
  if (highMemoryPools.length > 0) {
    reasons.push(`${highMemoryPools.length} memory pools with high utilization (>85%)`);
    if (severity === 'low') severity = 'medium';
  }

  // Check CPU utilization
  const highCpuProcessors = monitoringData.processors.filter(proc => proc.processor_usage >= 80);
  if (highCpuProcessors.length > 0) {
    reasons.push(`${highCpuProcessors.length} processors with high utilization (>80%)`);
    if (severity === 'low') severity = 'medium';
  }

  return {
    requiresAttention: reasons.length > 0,
    reasons,
    severity
  };
}

/**
 * Calculate plaza health score based on aggregated metrics
 * Business logic for plaza-level health assessment
 */
export function calculatePlazaHealthScore(overview: PlazaOverview): {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: Record<string, number>;
} {
  const factors: Record<string, number> = {};

  // Device availability factor (40% weight)
  const deviceAvailability = overview.totalDevices > 0 ?
    (overview.activeDevices / overview.totalDevices) * 100 : 100;
  factors.deviceAvailability = deviceAvailability * 0.4;

  // Port availability factor (30% weight)
  const portAvailability = overview.totalPorts > 0 ?
    (overview.activePorts / overview.totalPorts) * 100 : 100;
  factors.portAvailability = portAvailability * 0.3;

  // Alert factor (30% weight) - fewer alerts = better score
  const alertPenalty = Math.min(overview.alerts.length * 10, 100); // 10 points per alert, max 100
  factors.alertScore = (100 - alertPenalty) * 0.3;

  const totalScore = Math.round(
    factors.deviceAvailability + factors.portAvailability + factors.alertScore
  );

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else if (totalScore >= 60) grade = 'D';
  else grade = 'F';

  return {
    score: totalScore,
    grade,
    factors
  };
}

// ============================================================================
// ADDITIONAL DOMAIN METHODS FOR HU-02 SPECIFIC REQUIREMENTS
// ============================================================================

/**
 * Get available plazas from Observium data
 * Supports HU-02 plaza filtering dropdown
 */
export async function getAvailablePlazas(): Promise<string[]> {
  try {
    const devices = await ObserviumAdapter.fetchActiveDevices();

    // Extract unique plazas from devices
    const plazas = new Set<string>();
    devices.forEach(device => {
      const plaza = device.group || device.location;
      if (plaza && plaza !== 'Unknown') {
        plazas.add(plaza);
      }
    });

    // Add default plazas from project requirements
    plazas.add('Laredo');
    plazas.add('Saltillo');
    plazas.add('CDMX');
    plazas.add('Monterrey');

    return Array.from(plazas).sort();
  } catch (error) {
    console.error('Error fetching available plazas:', error);
    // Return default plazas if API fails
    return ['Laredo', 'Saltillo', 'CDMX', 'Monterrey'];
  }
}

/**
 * Get capacity utilization summary for a plaza
 * Supports HU-02 capacity monitoring requirement
 */
export async function getPlazaCapacitySummary(plaza: string): Promise<{
  totalCapacity: number;
  usedCapacity: number;
  utilizationPercentage: number;
  linksCount: number;
  criticalLinks: number;
  warningLinks: number;
}> {
  try {
    const devices = await ObserviumAdapter.fetchDevicesByPlaza(plaza);
    const deviceIds = devices.map(d => d.device_id);

    if (deviceIds.length === 0) {
      return {
        totalCapacity: 0,
        usedCapacity: 0,
        utilizationPercentage: 0,
        linksCount: 0,
        criticalLinks: 0,
        warningLinks: 0
      };
    }

    const ports = await ObserviumAdapter.fetchNetworkInterfaces(deviceIds);

    let totalCapacity = 0;
    let usedCapacity = 0;
    let criticalLinks = 0;
    let warningLinks = 0;

    ports.forEach(port => {
      const capacity = port.ifHighSpeed || (port.ifSpeed ? port.ifSpeed / 1000000 : 0);

      // Try to use rate fields for proper utilization calculation
      let currentUsage = 0;
      const portData = port as any;

      if (portData.ifInOctets_rate !== undefined && portData.ifOutOctets_rate !== undefined) {
        // These are in octets/bytes per second according to Observium docs
        const inMbps = ((portData.ifInOctets_rate || 0) * 8) / 1000000;
        const outMbps = ((portData.ifOutOctets_rate || 0) * 8) / 1000000;
        currentUsage = Math.max(inMbps, outMbps);
      } else if (portData.in_rate !== undefined && portData.out_rate !== undefined) {
        const inMbps = ((portData.in_rate || 0) * 8) / 1000000;
        const outMbps = ((portData.out_rate || 0) * 8) / 1000000;
        currentUsage = Math.max(inMbps, outMbps);
      }
      // If no rate data available, currentUsage remains 0

      totalCapacity += capacity;
      usedCapacity += currentUsage;

      if (capacity > 0 && currentUsage > 0) {
        const utilization = Math.min((currentUsage / capacity) * 100, 100); // Cap at 100%
        if (utilization >= 90) {
          criticalLinks++;
        } else if (utilization >= 75) {
          warningLinks++;
        }
      }
    });

    const utilizationPercentage = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

    return {
      totalCapacity: Math.round(totalCapacity),
      usedCapacity: Math.round(usedCapacity),
      utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
      linksCount: ports.length,
      criticalLinks,
      warningLinks
    };
  } catch (error) {
    console.error(`Error calculating capacity summary for plaza ${plaza}:`, error);
    throw new Error(`Failed to get plaza capacity summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get top N devices by utilization for a plaza
 * Supports HU-02 identification of problematic devices
 */
export async function getTopDevicesByUtilization(
  plaza: string,
  limit: number = 10
): Promise<Array<{
  device: ObserviumAdapter.ObserviumDevice;
  averageUtilization: number;
  maxUtilization: number;
  portsCount: number;
  alertsCount: number;
}>> {
  try {
    const devices = await ObserviumAdapter.fetchDevicesByPlaza(plaza);
    const deviceAnalysis = [];

    for (const device of devices) {
      const [ports, alerts] = await Promise.all([
        ObserviumAdapter.fetchPorts({ device_id: device.device_id }),
        ObserviumAdapter.fetchObserviumAlerts({
          device_id: device.device_id,
          acknowledged: 0
        })
      ]);

      let totalUtilization = 0;
      let maxUtilization = 0;
      let validPorts = 0;

      ports.forEach(port => {
        const capacity = port.ifHighSpeed || (port.ifSpeed ? port.ifSpeed / 1000000 : 0);
        if (capacity > 0) {
          const inMbps = ((port.ifInOctets || 0) * 8) / 1000000;
          const outMbps = ((port.ifOutOctets || 0) * 8) / 1000000;
          const utilization = (Math.max(inMbps, outMbps) / capacity) * 100;

          totalUtilization += utilization;
          maxUtilization = Math.max(maxUtilization, utilization);
          validPorts++;
        }
      });

      const averageUtilization = validPorts > 0 ? totalUtilization / validPorts : 0;

      deviceAnalysis.push({
        device,
        averageUtilization: Math.round(averageUtilization * 100) / 100,
        maxUtilization: Math.round(maxUtilization * 100) / 100,
        portsCount: ports.length,
        alertsCount: alerts.length
      });
    }

    // Sort by average utilization (highest first) and return top N
    return deviceAnalysis
      .sort((a, b) => b.averageUtilization - a.averageUtilization)
      .slice(0, limit);
  } catch (error) {
    console.error(`Error getting top devices by utilization for plaza ${plaza}:`, error);
    // Return empty array instead of throwing to allow graceful degradation
    console.warn('Falling back to empty top devices array due to API error');
    return [];
  }
}

/**
 * Get system health metrics for a device
 * Supports HU-02 detailed technical monitoring
 */
export async function getDeviceSystemHealth(deviceId: number): Promise<{
  cpu: {
    average: number;
    max: number;
    processorsCount: number;
  };
  memory: {
    average: number;
    max: number;
    poolsCount: number;
  };
  temperature: {
    average: number;
    max: number;
    sensorsCount: number;
  };
  overallHealth: 'good' | 'warning' | 'critical';
}> {
  try {
    const [processors, memPools, sensors] = await Promise.all([
      ObserviumAdapter.fetchProcessors({ device_id: deviceId }),
      ObserviumAdapter.fetchMemPools({ device_id: deviceId }),
      ObserviumAdapter.fetchSensors({
        device_id: deviceId,
        sensor_class: 'temperature'
      })
    ]);

    // CPU metrics
    const cpuUsages = processors.map(p => p.processor_usage);
    const cpuAverage = cpuUsages.length > 0 ?
      cpuUsages.reduce((sum, usage) => sum + usage, 0) / cpuUsages.length : 0;
    const cpuMax = cpuUsages.length > 0 ? Math.max(...cpuUsages) : 0;

    // Memory metrics
    const memUsages = memPools.map(p => p.mempool_perc);
    const memAverage = memUsages.length > 0 ?
      memUsages.reduce((sum, usage) => sum + usage, 0) / memUsages.length : 0;
    const memMax = memUsages.length > 0 ? Math.max(...memUsages) : 0;

    // Temperature metrics
    const tempValues = sensors.map(s => s.sensor_value);
    const tempAverage = tempValues.length > 0 ?
      tempValues.reduce((sum, temp) => sum + temp, 0) / tempValues.length : 0;
    const tempMax = tempValues.length > 0 ? Math.max(...tempValues) : 0;

    // Determine overall health
    let overallHealth: 'good' | 'warning' | 'critical' = 'good';

    if (cpuMax >= 90 || memMax >= 95 || tempMax >= 80) {
      overallHealth = 'critical';
    } else if (cpuMax >= 75 || memMax >= 85 || tempMax >= 70) {
      overallHealth = 'warning';
    }

    return {
      cpu: {
        average: Math.round(cpuAverage * 100) / 100,
        max: Math.round(cpuMax * 100) / 100,
        processorsCount: processors.length
      },
      memory: {
        average: Math.round(memAverage * 100) / 100,
        max: Math.round(memMax * 100) / 100,
        poolsCount: memPools.length
      },
      temperature: {
        average: Math.round(tempAverage * 100) / 100,
        max: Math.round(tempMax * 100) / 100,
        sensorsCount: sensors.length
      },
      overallHealth
    };
  } catch (error) {
    console.error(`Error getting system health for device ${deviceId}:`, error);
    throw new Error(`Failed to get device system health: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
