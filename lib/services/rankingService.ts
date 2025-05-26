/**
 * Ranking Service
 * 
 * This service provides methods for fetching ranking data for sites
 * using the specialized API clients for Observium and PRTG.
 */

import { observiumApi } from '../data/adapters/observiumApi';
import { prtgApi } from '../data/adapters/prtgApi';

interface RankedSite {
  id: string;
  name: string;
  plaza: string;
  utilizationPercentage: number;
  criticalLinks: number;
  totalLinks: number;
}

/**
 * Ranking Service with methods for fetching ranking data
 */
export const RankingService = {
  /**
   * Get critical sites ranking from both Observium and PRTG
   */
  getCriticalSites: async (limit: number = 5): Promise<RankedSite[]> => {
    try {
      // Fetch critical sites from both sources in parallel
      const [observiumSites, prtgSites] = await Promise.all([
        RankingService.Observium.getCriticalSites(limit),
        RankingService.PRTG.getCriticalSites(limit)
      ]);

      // Combine, sort by utilization percentage (descending), and limit the results
      return [...observiumSites, ...prtgSites]
        .sort((a, b) => b.utilizationPercentage - a.utilizationPercentage)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching critical sites from both sources:', error);
      return [];
    }
  },

  /**
   * Observium API Methods
   */
  Observium: {
    /**
     * Get critical sites from Observium
     */
    getCriticalSites: async (limit: number = 5): Promise<RankedSite[]> => {
      try {
        const response = await observiumApi.get<RankedSite[]>(`/api/ranking?by=critical&limit=${limit}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching critical sites from Observium:', error);
        return [];
      }
    }
  },

  /**
   * PRTG API Methods
   */
  PRTG: {
    /**
     * Get critical sites from PRTG
     */
    getCriticalSites: async (limit: number = 5): Promise<RankedSite[]> => {
      try {
        const response = await prtgApi.get<RankedSite[]>(`/api/ranking?by=critical&limit=${limit}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching critical sites from PRTG:', error);
        return [];
      }
    }
  }
};

export default RankingService;
