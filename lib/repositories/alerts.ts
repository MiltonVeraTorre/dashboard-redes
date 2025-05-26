import { Alert } from '../domain/entities';
import { mockAlerts } from './mocks/data';

// In a real application, this would fetch from a database or API
// For now, we'll use mock data

interface GetAlertsOptions {
  siteId?: string;
  severity?: 'info' | 'warning' | 'critical';
  acknowledged?: boolean;
  limit?: number;
}

export async function getAlerts(options: GetAlertsOptions = {}): Promise<Alert[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));

  const { siteId, severity, acknowledged, limit } = options;

  // Filter alerts based on options
  let filteredAlerts = [...mockAlerts];

  if (siteId) {
    filteredAlerts = filteredAlerts.filter(alert => alert.siteId === siteId);
  }

  if (severity) {
    filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
  }

  if (acknowledged !== undefined) {
    filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === acknowledged);
  }

  // Sort by timestamp (newest first)
  filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply limit if specified
  if (limit && limit > 0) {
    filteredAlerts = filteredAlerts.slice(0, limit);
  }

  return filteredAlerts;
}

export async function getRecentAlerts(options: { limit?: number } = {}): Promise<Alert[]> {
  return getAlerts({ acknowledged: false, limit: options.limit || 10 });
}

export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // In a real app, this would update the database
  // For now, we'll just return success
  console.log(`Acknowledging alert ${alertId}`);
  return true;
}
