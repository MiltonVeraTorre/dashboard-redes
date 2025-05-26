// Enhanced Dashboard Types for Observium Network Monitoring
export interface NetworkKPI {
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
  criticalAlerts: number;
  warningAlerts: number;
  networkUptime: number;
  averageResponseTime: number;
  totalPorts: number;
  activePorts: number;
}

export interface DeviceStatus {
  device_id: string;
  hostname: string;
  status: string;
  status_type: 'ok' | 'warning' | 'critical';
  location: string;
  uptime: number;
  last_polled: string;
  vendor: string;
  hardware: string;
  os: string;
  version: string;
  purpose?: string;
  type: string;
}

export interface AlertInfo {
  alert_id: string;
  device_id: string;
  hostname: string;
  alert_rule: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'failed' | 'ok' | 'delayed';
  timestamp: string;
  message: string;
  location?: string;
  entity_type: string;
  entity_name: string;
}

export interface PortStatus {
  port_id: string;
  device_id: string;
  hostname: string;
  port_label: string;
  ifOperStatus: 'up' | 'down' | 'testing';
  ifAdminStatus: 'up' | 'down' | 'testing';
  ifSpeed: string;
  ifType: string;
  in_rate: number;
  out_rate: number;
  utilization: number;
  errors: number;
}

export interface NetworkMetrics {
  timestamp: string;
  totalBandwidth: number;
  usedBandwidth: number;
  packetLoss: number;
  latency: number;
  deviceCount: number;
  alertCount: number;
}

export interface LocationStats {
  location: string;
  deviceCount: number;
  activeDevices: number;
  criticalAlerts: number;
  warningAlerts: number;
  uptime: number;
}

export interface DashboardData {
  kpis: NetworkKPI;
  recentAlerts: AlertInfo[];
  deviceStatuses: DeviceStatus[];
  topPorts: PortStatus[];
  networkMetrics: NetworkMetrics[];
  locationStats: LocationStats[];
  lastUpdated: string;
}

// API Response Types
export interface ObserviumDeviceResponse {
  count: number;
  status: string;
  devices: Record<string, any>;
}

export interface ObserviumAlertResponse {
  count: number;
  status: string;
  alerts: Record<string, any>;
}

export interface ObserviumPortResponse {
  count: number;
  status: string;
  ports: Record<string, any>;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

// Filter and Search Types
export interface DashboardFilters {
  location?: string;
  deviceType?: string;
  status?: string;
  severity?: string;
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
}

export interface SearchParams {
  query?: string;
  filters?: DashboardFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Component Props Types
export interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  loading?: boolean;
}

// API Hook Types
export interface UseObserviumDataOptions {
  refreshInterval?: number;
  enabled?: boolean;
  retryCount?: number;
  cacheTime?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isValidating?: boolean;
  mutate?: () => void;
}
