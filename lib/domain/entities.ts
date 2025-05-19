/**
 * Core domain entities for the network monitoring application
 */

// Plaza type (locations)
export type Plaza = string;

// Site entity
export interface Site {
  id: string;
  name: string;
  plaza: Plaza;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Link status type
export type LinkStatus = 'normal' | 'warning' | 'critical';

// Network link entity
export interface Link {
  id: string;
  siteId: string;
  name: string;
  capacity: number; // in Mbps
  currentUsage: number; // in Mbps
  utilizationPercentage: number; // 0-100
  status: LinkStatus;
  lastUpdated: Date;
}

// Alert severity type
export type AlertSeverity = 'info' | 'warning' | 'critical';

// Alert type
export type AlertType = 'capacity' | 'latency' | 'packet_loss' | 'downtime';

// Alert entity
export interface Alert {
  id: string;
  siteId: string;
  linkId?: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

// Network overview entity
export interface NetworkOverview {
  totalSites: number;
  sitesPerPlaza: Record<Plaza, number>;
  criticalSites: number;
  averageUtilization: number;
  utilizationByPlaza: Record<Plaza, number>;
  recentAlerts: Alert[];
}
