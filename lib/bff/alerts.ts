/**
 * Backend for Frontend (BFF) layer for alerts
 * 
 * This module acts as a facade between the UI and the domain layer,
 * providing a simplified API for the UI to consume.
 */

import { Alert } from '../domain/entities';
import * as AlertsRepo from '../repositories/alerts';

export interface GetAlertsOptions {
  siteId?: string;
  severity?: 'info' | 'warning' | 'critical';
  acknowledged?: boolean;
  limit?: number;
}

/**
 * Get alerts with optional filtering
 */
export async function getAlerts(options: GetAlertsOptions = {}): Promise<Alert[]> {
  return AlertsRepo.getAlerts(options);
}

/**
 * Get recent unacknowledged alerts
 */
export async function getRecentAlerts(limit: number = 10): Promise<Alert[]> {
  return AlertsRepo.getRecentAlerts({ limit });
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  return AlertsRepo.acknowledgeAlert(alertId);
}

/**
 * Get alerts grouped by site
 */
export async function getAlertsBySite(): Promise<Record<string, Alert[]>> {
  const alerts = await AlertsRepo.getAlerts();
  
  // Group alerts by siteId
  const alertsBySite: Record<string, Alert[]> = {};
  
  alerts.forEach(alert => {
    if (!alertsBySite[alert.siteId]) {
      alertsBySite[alert.siteId] = [];
    }
    
    alertsBySite[alert.siteId].push(alert);
  });
  
  return alertsBySite;
}
