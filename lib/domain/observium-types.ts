/**
 * TypeScript interfaces for Observium API responses
 */

// Common response structure
export interface ObserviumResponse<T> {
  status: string;
  count: number | string;
  [key: string]: any;
}

// Device response
export interface ObserviumDevicesResponse extends ObserviumResponse<ObserviumDevice> {
  devices: Record<string, ObserviumDevice>;
}

export interface ObserviumDevice {
  device_id: string;
  hostname: string;
  sysName?: string;
  label?: string | null;
  ip?: string;
  version?: string;
  hardware?: string;
  vendor?: string;
  features?: string;
  location?: string;
  os?: string;
  status: string;
  status_type?: string;
  ignore?: string;
  ignore_until?: string | null;
  asset_tag?: string;
  disabled?: string;
  uptime?: string;
  last_rebooted?: string;
  last_polled?: string;
  last_discovered?: string;
  purpose?: string;
  type?: string;
  serial?: string;
  distro?: string;
  distro_ver?: string;
  kernel?: string;
  arch?: string;
  location_id?: string;
  location_lat?: string;
  location_lon?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Ports response
export interface ObserviumPortsResponse extends ObserviumResponse<ObserviumPort> {
  ports: Record<string, ObserviumPort>;
}

export interface ObserviumPortResponse extends ObserviumResponse<ObserviumPort> {
  port: ObserviumPort;
}

export interface ObserviumPort {
  port_id: string;
  device_id?: string;
  port_label?: string;
  port_label_short?: string;
  ifDescr?: string;
  ifName?: string;
  ifIndex?: string;
  ifSpeed?: string;
  ifHighSpeed?: string;
  ifOperStatus?: string;
  ifAdminStatus?: string;
  ifMtu?: string;
  ifType?: string;
  ifAlias?: string;
  ifPhysAddress?: string;
  ifLastChange?: string;
  ifInOctets?: string;
  ifInOctets_rate?: string;
  ifOutOctets?: string;
  ifOutOctets_rate?: string;
  ifInUcastPkts?: string;
  ifInUcastPkts_rate?: string;
  ifOutUcastPkts?: string;
  ifOutUcastPkts_rate?: string;
  ifInErrors?: string;
  ifInErrors_rate?: string;
  ifOutErrors?: string;
  ifOutErrors_rate?: string;
  human_speed?: string;
  human_type?: string;
  admin_status?: string;
  oper_class?: string;
  in_rate?: number;
  out_rate?: number;
  [key: string]: string | number | boolean | null | undefined;
}

// Alerts response
export interface ObserviumAlertsResponse extends ObserviumResponse<ObserviumAlert> {
  alerts: Record<string, ObserviumAlert>;
}

export interface ObserviumAlert {
  alert_table_id: string;
  alert_test_id: string;
  device_id: string;
  entity_type: string;
  entity_id: string;
  delay?: string;
  ignore_until?: string | null;
  last_checked?: string;
  last_changed?: string;
  last_recovered?: string;
  last_ok?: string;
  last_failed?: string;
  has_alerted?: string;
  last_message?: string;
  alert_status: string;
  last_alerted?: string;
  state?: string;
  count?: string;
  severity: string;
  class?: string;
  html_row_class?: string;
  status?: string;
  checked?: string;
  changed?: string;
  alerted?: string;
  recovered?: string;
  [key: string]: string | number | boolean | null | undefined;
}
