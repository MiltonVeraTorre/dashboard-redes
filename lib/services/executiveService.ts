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
   * Get network overview data from Observium only
   * No fallback to PRTG - throws error if Observium is unavailable
   */
  getNetworkOverview: async (): Promise<NetworkOverview> => {
    try {
      const response = await observiumApi.get<NetworkOverview>('/api/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching network overview from Observium API:', error);
      throw new Error(`Unable to fetch network overview from Observium API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

export default ExecutiveService;
