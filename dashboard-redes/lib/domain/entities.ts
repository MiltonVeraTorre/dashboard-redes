// Core domain entities

export type Plaza = 'CDMX' | 'Monterrey' | 'Guadalajara' | 'Puebla' | 'Querétaro' | string;

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

export interface Link {
  id: string;
  siteId: string;
  name: string;
  capacity: number; // Mbps
  currentUsage: number; // Mbps
  utilizationPercentage: number; // 0-100
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface Alert {
  id: string;
  siteId: string;
  linkId?: string;
  type: 'capacity' | 'latency' | 'packet_loss' | 'downtime';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface NetworkOverview {
  totalSites: number;
  sitesPerPlaza: Record<Plaza, number>;
  criticalSites: number;
  averageUtilization: number;
  utilizationByPlaza: Record<Plaza, number>;
  recentAlerts: Alert[];
}