/**
 * Backend for Frontend (BFF) layer for network overview
 * 
 * This module acts as a facade between the UI and the domain layer,
 * providing a simplified API for the UI to consume.
 */

import { NetworkOverview } from '../domain/entities';
import * as OverviewDomain from '../domain/overview';

/**
 * Get a comprehensive overview of the network status
 */
export async function getNetworkOverview(): Promise<NetworkOverview> {
  return OverviewDomain.getNetworkOverview();
}

/**
 * Get a summary of the network status for the executive dashboard
 */
export async function getExecutiveSummary() {
  const overview = await OverviewDomain.getNetworkOverview();
  
  // Extract only the data needed for the executive dashboard
  return {
    totalSites: overview.totalSites,
    criticalSites: overview.criticalSites,
    averageUtilization: overview.averageUtilization,
    utilizationByPlaza: overview.utilizationByPlaza,
    recentAlerts: overview.recentAlerts.slice(0, 3), // Only the 3 most recent alerts
  };
}
