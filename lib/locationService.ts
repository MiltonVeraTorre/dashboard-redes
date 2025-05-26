/**
 * Location Service
 *
 * This file provides service functions for fetching location data from both
 * Observium and PRTG APIs.
 */

import { observiumApi } from "./data/adapters/observiumApi";
import { prtgApi } from "./data/adapters/prtgApi";



// Define types for the API responses
export interface Location {
  id: string;
  name: string;
  siteCount: number;
  source: 'Observium' | 'PRTG';
}

/**
 * Location Service with methods for fetching location data from both Observium and PRTG
 */
export const LocationService = {
  /**
   * Get all locations from both Observium and PRTG
   */
  getAllLocations: async (): Promise<Location[]> => {
    try {
      // Fetch locations from both sources in parallel
      const [observiumLocations, prtgLocations] = await Promise.all([
        LocationService.Observium.getLocations(),
        LocationService.PRTG.getLocations()
      ]);

      // Combine and return the results
      return [...observiumLocations, ...prtgLocations];
    } catch (error) {
      console.error('Error fetching locations from both sources:', error);
      return [];
    }
  },

  /**
   * Observium API Methods
   */
  Observium: {
    /**
     * Get all locations from Observium
     */
    getLocations: async (): Promise<Location[]> => {
      try {
        const response = await observiumApi.get<any[]>('/locations');

        // Transform the response to match our Location interface
        return response.data.map(item => ({
          id: item.id.toString(),
          name: item.name,
          siteCount: item.site_count || 0,
          source: 'Observium' as const
        }));
      } catch (error) {
        console.error('Error fetching locations from Observium:', error);
        return [];
      }
    },

    /**
     * Get a specific location by ID from Observium
     */
    getLocation: async (locationId: string): Promise<Location | null> => {
      try {
        const response = await observiumApi.get<any>(`/locations/${locationId}`);

        // Transform the response to match our Location interface
        return {
          id: response.data.id.toString(),
          name: response.data.name,
          siteCount: response.data.site_count || 0,
          source: 'Observium' as const
        };
      } catch (error) {
        console.error(`Error fetching location ${locationId} from Observium:`, error);
        return null;
      }
    }
  },

  /**
   * PRTG API Methods
   */
  PRTG: {
    /**
     * Get all locations from PRTG
     */
    getLocations: async (): Promise<Location[]> => {
      try {
        const response = await prtgApi.get<any[]>('/locations');

        // Transform the response to match our Location interface
        return response.data.map(item => ({
          id: item.id.toString(),
          name: item.name,
          siteCount: item.site_count || 0,
          source: 'PRTG' as const
        }));
      } catch (error) {
        console.error('Error fetching locations from PRTG:', error);
        return [];
      }
    },

    /**
     * Get a specific location by ID from PRTG
     */
    getLocation: async (locationId: string): Promise<Location | null> => {
      try {
        const response = await prtgApi.get<any>(`/locations/${locationId}`);

        // Transform the response to match our Location interface
        return {
          id: response.data.id.toString(),
          name: response.data.name,
          siteCount: response.data.site_count || 0,
          source: 'PRTG' as const
        };
      } catch (error) {
        console.error(`Error fetching location ${locationId} from PRTG:`, error);
        return null;
      }
    }
  }
};

export default LocationService;
