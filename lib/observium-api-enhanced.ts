// Enhanced Observium API Client with Real-time Data Support
import useSWR from 'swr';
import { 
  NetworkKPI, 
  AlertInfo, 
  DeviceStatus, 
  PortStatus, 
  DashboardData,
  ObserviumDeviceResponse,
  ObserviumAlertResponse,
  ObserviumPortResponse,
  UseObserviumDataOptions,
  ApiResponse 
} from '@/types/dashboard';

// API Configuration
const API_BASE_URL = '/api/observium';
const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds
const DEFAULT_CACHE_TIME = 60000; // 1 minute

// Enhanced fetcher with error handling
const fetcher = async (url: string): Promise<any> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Utility functions for data transformation
export const transformDeviceData = (devices: Record<string, any>): DeviceStatus[] => {
  return Object.values(devices).map((device: any) => ({
    device_id: device.device_id,
    hostname: device.hostname || device.sysName,
    status: device.status === '1' ? 'up' : 'down',
    status_type: device.status === '1' ? 'ok' : 'critical',
    location: device.location || 'Unknown',
    uptime: parseInt(device.uptime) || 0,
    last_polled: device.last_polled,
    vendor: device.vendor || 'Unknown',
    hardware: device.hardware || 'Unknown',
    os: device.os || 'Unknown',
    version: device.version || 'Unknown',
    purpose: device.purpose,
    type: device.type || 'network'
  }));
};

export const transformAlertData = (alerts: Record<string, any>): AlertInfo[] => {
  return Object.values(alerts).map((alert: any) => ({
    alert_id: alert.alert_id,
    device_id: alert.device_id,
    hostname: alert.hostname,
    alert_rule: alert.alert_rule,
    severity: alert.severity === 'critical' ? 'critical' : 
              alert.severity === 'warning' ? 'warning' : 'info',
    status: alert.alert_status,
    timestamp: alert.alert_timestamp,
    message: alert.alert_message || alert.alert_rule,
    location: alert.location,
    entity_type: alert.entity_type,
    entity_name: alert.entity_name
  }));
};

export const calculateNetworkKPIs = (
  devices: DeviceStatus[], 
  alerts: AlertInfo[]
): NetworkKPI => {
  const activeDevices = devices.filter(d => d.status === 'up').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
  
  return {
    totalDevices: devices.length,
    activeDevices,
    inactiveDevices: devices.length - activeDevices,
    criticalAlerts,
    warningAlerts,
    networkUptime: devices.length > 0 ? (activeDevices / devices.length) * 100 : 0,
    averageResponseTime: 0, // Would need additional API call for this
    totalPorts: 0, // Would need ports data
    activePorts: 0 // Would need ports data
  };
};

// Enhanced API Hooks
export const useObserviumDevices = (
  options: UseObserviumDataOptions = {}
): ApiResponse<DeviceStatus[]> => {
  const { 
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    enabled = true,
    retryCount = 3 
  } = options;

  const { data, error, isLoading, isValidating, mutate } = useSWR<ObserviumDeviceResponse>(
    enabled ? `${API_BASE_URL}/devices` : null,
    fetcher,
    {
      refreshInterval,
      errorRetryCount: retryCount,
      revalidateOnFocus: false,
      dedupingInterval: 10000
    }
  );

  const transformedData = data?.devices ? transformDeviceData(data.devices) : null;

  return {
    data: transformedData,
    error: error ? { message: error.message } : null,
    isLoading,
    isValidating,
    mutate
  };
};

export const useObserviumAlerts = (
  options: UseObserviumDataOptions = {}
): ApiResponse<AlertInfo[]> => {
  const { 
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    enabled = true,
    retryCount = 3 
  } = options;

  const { data, error, isLoading, isValidating, mutate } = useSWR<ObserviumAlertResponse>(
    enabled ? `${API_BASE_URL}/alerts` : null,
    fetcher,
    {
      refreshInterval,
      errorRetryCount: retryCount,
      revalidateOnFocus: false,
      dedupingInterval: 10000
    }
  );

  const transformedData = data?.alerts ? transformAlertData(data.alerts) : null;

  return {
    data: transformedData,
    error: error ? { message: error.message } : null,
    isLoading,
    isValidating,
    mutate
  };
};

export const useObserviumPorts = (
  deviceId?: string,
  options: UseObserviumDataOptions = {}
): ApiResponse<PortStatus[]> => {
  const { 
    refreshInterval = DEFAULT_REFRESH_INTERVAL * 2, // Ports update less frequently
    enabled = true,
    retryCount = 2 
  } = options;

  const url = deviceId 
    ? `${API_BASE_URL}/ports?device_id=${deviceId}`
    : `${API_BASE_URL}/ports`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<ObserviumPortResponse>(
    enabled && deviceId ? url : null, // Only fetch if deviceId is provided
    fetcher,
    {
      refreshInterval,
      errorRetryCount: retryCount,
      revalidateOnFocus: false,
      dedupingInterval: 15000
    }
  );

  const transformedData = data?.ports ? Object.values(data.ports).map((port: any) => ({
    port_id: port.port_id,
    device_id: port.device_id,
    hostname: port.hostname,
    port_label: port.port_label || port.ifDescr,
    ifOperStatus: port.ifOperStatus,
    ifAdminStatus: port.ifAdminStatus,
    ifSpeed: port.ifSpeed,
    ifType: port.ifType,
    in_rate: port.in_rate || 0,
    out_rate: port.out_rate || 0,
    utilization: 0, // Calculate based on speed and rate
    errors: (port.ifInErrors || 0) + (port.ifOutErrors || 0)
  })) : null;

  return {
    data: transformedData,
    error: error ? { message: error.message } : null,
    isLoading,
    isValidating,
    mutate
  };
};

// Combined dashboard data hook
export const useObserviumDashboard = (
  options: UseObserviumDataOptions = {}
): ApiResponse<DashboardData> => {
  const devicesResult = useObserviumDevices(options);
  const alertsResult = useObserviumAlerts(options);

  const isLoading = devicesResult.isLoading || alertsResult.isLoading;
  const error = devicesResult.error || alertsResult.error;

  const dashboardData: DashboardData | null = 
    devicesResult.data && alertsResult.data ? {
      kpis: calculateNetworkKPIs(devicesResult.data, alertsResult.data),
      recentAlerts: alertsResult.data.slice(0, 10), // Latest 10 alerts
      deviceStatuses: devicesResult.data,
      topPorts: [], // Would need additional port data
      networkMetrics: [], // Would need historical data
      locationStats: [], // Would need to aggregate by location
      lastUpdated: new Date().toISOString()
    } : null;

  return {
    data: dashboardData,
    error,
    isLoading,
    isValidating: devicesResult.isValidating || alertsResult.isValidating,
    mutate: () => {
      devicesResult.mutate?.();
      alertsResult.mutate?.();
    }
  };
};

// Utility hook for real-time status
export const useNetworkStatus = () => {
  const { data: devices, isLoading: devicesLoading } = useObserviumDevices({
    refreshInterval: 15000 // More frequent updates for status
  });
  
  const { data: alerts, isLoading: alertsLoading } = useObserviumAlerts({
    refreshInterval: 15000
  });

  const isLoading = devicesLoading || alertsLoading;
  
  const status = devices && alerts ? {
    overall: devices.filter(d => d.status === 'up').length / devices.length > 0.95 ? 'healthy' : 'degraded',
    criticalIssues: alerts.filter(a => a.severity === 'critical').length,
    devicesDown: devices.filter(d => d.status === 'down').length,
    lastUpdate: new Date().toISOString()
  } : null;

  return { status, isLoading };
};
