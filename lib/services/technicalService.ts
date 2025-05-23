/**
 * Technical Dashboard Service
 * 
 * This service provides methods for fetching data for the technical dashboard
 * using the specialized API clients for Observium and PRTG.
 */

import { observiumApi } from '../data/adapters/observiumApi';
import { prtgApi } from '../data/adapters/prtgApi';
import { Site, Link } from '../domain/entities';

/**
 * Technical Dashboard Service with methods for fetching technical dashboard data
 */
export const TechnicalService = {
  /**
   * Get all sites from both Observium and PRTG
   */
  getAllSites: async (): Promise<Site[]> => {
    try {
      // Fetch sites from both sources in parallel
      const [observiumSites, prtgSites] = await Promise.all([
        TechnicalService.Observium.getSites(),
        TechnicalService.PRTG.getSites()
      ]);

      // Combine and return the results
      return [...observiumSites, ...prtgSites];
    } catch (error) {
      console.error('Error fetching sites from both sources:', error);
      return [];
    }
  },

  /**
   * Get site details by ID
   */
  getSiteDetails: async (siteId: string): Promise<{ site: Site; links: Link[] } | null> => {
    try {
      // Try to get site details from Observium first
      try {
        const response = await observiumApi.get<{ site: Site; links: Link[] }>(`/api/sites/${siteId}`);
        return response.data;
      } catch (observiumError) {
        console.error(`Error fetching site ${siteId} from Observium, trying PRTG:`, observiumError);
        
        // If Observium fails, try PRTG
        const response = await prtgApi.get<{ site: Site; links: Link[] }>(`/api/sites/${siteId}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching site details for ${siteId}:`, error);
      return null;
    }
  },

  /**
   * Observium API Methods
   */
  Observium: {
    /**
     * Get all sites from Observium
     */
    getSites: async (): Promise<Site[]> => {
      try {
        const response = await observiumApi.get<Site[]>('/api/sites');
        return response.data;
      } catch (error) {
        console.error('Error fetching sites from Observium:', error);
        return [];
      }
    },

    /**
     * Get site details by ID from Observium
     */
    getSiteDetails: async (siteId: string): Promise<{ site: Site; links: Link[] } | null> => {
      try {
        const response = await observiumApi.get<{ site: Site; links: Link[] }>(`/api/sites/${siteId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching site details for ${siteId} from Observium:`, error);
        return null;
      }
    }
  },

  /**
   * PRTG API Methods
   */
  PRTG: {
    /**
     * Get all sites from PRTG
     */
    getSites: async (): Promise<Site[]> => {
      try {
        const response = await prtgApi.get<Site[]>('/api/sites');
        return response.data;
      } catch (error) {
        console.error('Error fetching sites from PRTG:', error);
        return [];
      }
    },

    /**
     * Get site details by ID from PRTG
     */
    getSiteDetails: async (siteId: string): Promise<{ site: Site; links: Link[] } | null> => {
      try {
        const response = await prtgApi.get<{ site: Site; links: Link[] }>(`/api/sites/${siteId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching site details for ${siteId} from PRTG:`, error);
        return null;
      }
    }
  }
};

export default TechnicalService;
