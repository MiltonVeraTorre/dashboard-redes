/**
 * Executive Dashboard Service
 * 
 * This service provides methods for fetching data for the executive dashboard
 * using the specialized API clients for Observium and PRTG.
 */

import { observiumApi } from '../data/adapters/observiumApi';
import { prtgApi } from '../data/adapters/prtgApi';
import { NetworkOverview } from '../domain/entities';

/**
 * Executive Dashboard Service with methods for fetching executive dashboard data
 */
export const ExecutiveService = {
  /**
   * Get network overview data from both Observium and PRTG
   */
  getNetworkOverview: async (): Promise<NetworkOverview> => {
    try {
      // First try to get data from Observium
      try {
        const response = await observiumApi.get<NetworkOverview>('/api/overview');
        return response.data;
      } catch (observiumError) {
        console.error('Error fetching overview from Observium, falling back to PRTG:', observiumError);
        
        // If Observium fails, try PRTG
        const response = await prtgApi.get<NetworkOverview>('/api/overview');
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching network overview data:', error);
      // Return a default empty overview if both APIs fail
      return {
        totalSites: 0,
        sitesPerPlaza: {},
        criticalSites: 0,
        averageUtilization: 0,
        utilizationByPlaza: {},
        recentAlerts: []
      };
    }
  }
};

export default ExecutiveService;
