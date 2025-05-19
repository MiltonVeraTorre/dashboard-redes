import { Site, Link, Alert, Plaza } from '../../domain/entities';

// Sample plazas
export const plazas: Plaza[] = ['CDMX', 'Monterrey', 'Guadalajara', 'Puebla', 'Querétaro'];

// Sample sites
export const mockSites: Site[] = [
  {
    id: 'site1',
    name: 'Centro de Datos Principal',
    plaza: 'CDMX',
    address: 'Av. Reforma 123, CDMX',
    coordinates: { lat: 19.4326, lng: -99.1332 },
  },
  {
    id: 'site2',
    name: 'Oficina Regional Norte',
    plaza: 'Monterrey',
    address: 'Av. Constitución 456, Monterrey',
    coordinates: { lat: 25.6866, lng: -100.3161 },
  },
  {
    id: 'site3',
    name: 'Centro de Operaciones Occidente',
    plaza: 'Guadalajara',
    address: 'Av. Vallarta 789, Guadalajara',
    coordinates: { lat: 20.6597, lng: -103.3496 },
  },
  {
    id: 'site4',
    name: 'Sucursal Angelópolis',
    plaza: 'Puebla',
    address: 'Blvd. Atlixcáyotl 1234, Puebla',
    coordinates: { lat: 19.0414, lng: -98.2063 },
  },
  {
    id: 'site5',
    name: 'Centro Corporativo',
    plaza: 'CDMX',
    address: 'Paseo de la Reforma 222, CDMX',
    coordinates: { lat: 19.4284, lng: -99.1673 },
  },
  {
    id: 'site6',
    name: 'Oficina Juriquilla',
    plaza: 'Querétaro',
    address: 'Blvd. Juriquilla 567, Querétaro',
    coordinates: { lat: 20.7231, lng: -100.4488 },
  },
];

// Sample links
export const mockLinks: Link[] = [
  {
    id: 'link1',
    siteId: 'site1',
    name: 'WAN Principal',
    capacity: 1000,
    currentUsage: 850,
    utilizationPercentage: 85,
    status: 'critical',
    lastUpdated: new Date(),
  },
  {
    id: 'link2',
    siteId: 'site1',
    name: 'WAN Respaldo',
    capacity: 500,
    currentUsage: 100,
    utilizationPercentage: 20,
    status: 'normal',
    lastUpdated: new Date(),
  },
  {
    id: 'link3',
    siteId: 'site2',
    name: 'Enlace Principal',
    capacity: 500,
    currentUsage: 375,
    utilizationPercentage: 75,
    status: 'warning',
    lastUpdated: new Date(),
  },
  {
    id: 'link4',
    siteId: 'site3',
    name: 'Enlace Principal',
    capacity: 200,
    currentUsage: 180,
    utilizationPercentage: 90,
    status: 'critical',
    lastUpdated: new Date(),
  },
  {
    id: 'link5',
    siteId: 'site4',
    name: 'Enlace Principal',
    capacity: 100,
    currentUsage: 65,
    utilizationPercentage: 65,
    status: 'warning',
    lastUpdated: new Date(),
  },
  {
    id: 'link6',
    siteId: 'site5',
    name: 'Enlace Principal',
    capacity: 1000,
    currentUsage: 300,
    utilizationPercentage: 30,
    status: 'normal',
    lastUpdated: new Date(),
  },
  {
    id: 'link7',
    siteId: 'site6',
    name: 'Enlace Principal',
    capacity: 200,
    currentUsage: 40,
    utilizationPercentage: 20,
    status: 'normal',
    lastUpdated: new Date(),
  },
];

// Sample alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert1',
    siteId: 'site1',
    linkId: 'link1',
    type: 'capacity',
    severity: 'critical',
    message: 'Capacidad del enlace excedida (85%)',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    acknowledged: false,
  },
  {
    id: 'alert2',
    siteId: 'site3',
    linkId: 'link4',
    type: 'capacity',
    severity: 'critical',
    message: 'Capacidad del enlace excedida (90%)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    acknowledged: false,
  },
  {
    id: 'alert3',
    siteId: 'site2',
    linkId: 'link3',
    type: 'capacity',
    severity: 'warning',
    message: 'Capacidad del enlace al 75%',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    acknowledged: true,
  },
  {
    id: 'alert4',
    siteId: 'site4',
    linkId: 'link5',
    type: 'latency',
    severity: 'warning',
    message: 'Latencia elevada (75ms)',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    acknowledged: false,
  },
  {
    id: 'alert5',
    siteId: 'site1',
    type: 'packet_loss',
    severity: 'warning',
    message: 'Pérdida de paquetes detectada (2.5%)',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    acknowledged: true,
  },
];

// Historical data for charts (last 7 days)
export function generateHistoricalData(linkId: string, days: number = 7) {
  const data = [];
  const now = new Date();
  const link = mockLinks.find(l => l.id === linkId);
  
  if (!link) return [];
  
  // Base utilization (current value)
  const baseUtilization = link.utilizationPercentage;
  
  // Generate data points for each day
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some random variation to the utilization
    const variation = Math.random() * 20 - 10; // -10 to +10
    const utilization = Math.max(0, Math.min(100, baseUtilization + variation));
    
    data.push({
      date: date.toISOString().split('T')[0],
      utilization: Math.round(utilization),
    });
  }
  
  return data;
}
