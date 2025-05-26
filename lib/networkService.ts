/**
 * Network Service
 *
 * This file provides service functions for making network-related API calls.
 * It uses specialized API clients for Observium and PRTG with authentication.
 */

import { observiumApi } from './data/adapters/observiumApi';
import { prtgApi } from './data/adapters/prtgApi';

// Define types for the API responses
interface NetworkData {
  id: string;
  name: string;
  status: string;
  // Add other properties as needed
}

interface NetworkStats {
  utilization: number;
  bandwidth: number;
  // Add other properties as needed
}

/**
 * Network Service with methods for fetching network data from both Observium and PRTG
 */
export const NetworkService = {
  /**
   * Observium API Methods
   */
  Observium: {
    /**
     * Get all network devices from Observium
     */
    getNetworkDevices: async (): Promise<NetworkData[]> => {
      try {
        const response = await observiumApi.get<NetworkData[]>('/devices');
        return response.data;
      } catch (error) {
        console.error('Error fetching network devices from Observium:', error);
        return [];
      }
    },

    /**
     * Get a specific network device by ID from Observium
     */
    getNetworkDevice: async (deviceId: string): Promise<NetworkData | null> => {
      try {
        const response = await observiumApi.get<NetworkData>(`/devices/${deviceId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching network device ${deviceId} from Observium:`, error);
        return null;
      }
    },

    /**
     * Get network statistics from Observium
     */
    getNetworkStats: async (deviceId: string): Promise<NetworkStats | null> => {
      try {
        const response = await observiumApi.get<NetworkStats>(`/devices/${deviceId}/stats`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching network stats for device ${deviceId} from Observium:`, error);
        return null;
      }
    },

    /**
     * Update a network device in Observium
     */
    updateNetworkDevice: async (deviceId: string, data: Partial<NetworkData>): Promise<NetworkData | null> => {
      try {
        const response = await observiumApi.put<NetworkData>(`/devices/${deviceId}`, data);
        return response.data;
      } catch (error) {
        console.error(`Error updating network device ${deviceId} in Observium:`, error);
        return null;
      }
    },
  },

  /**
   * PRTG API Methods
   */
  PRTG: {
    /**
     * Get all network devices from PRTG
     */
    getNetworkDevices: async (): Promise<NetworkData[]> => {
      try {
        const response = await prtgApi.get<NetworkData[]>('/devices');
        return response.data;
      } catch (error) {
        console.error('Error fetching network devices from PRTG:', error);
        return [];
      }
    },

    /**
     * Get a specific network device by ID from PRTG
     */
    getNetworkDevice: async (deviceId: string): Promise<NetworkData | null> => {
      try {
        const response = await prtgApi.get<NetworkData>(`/devices/${deviceId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching network device ${deviceId} from PRTG:`, error);
        return null;
      }
    },

    /**
     * Get network statistics from PRTG
     */
    getNetworkStats: async (deviceId: string): Promise<NetworkStats | null> => {
      try {
        const response = await prtgApi.get<NetworkStats>(`/devices/${deviceId}/stats`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching network stats for device ${deviceId} from PRTG:`, error);
        return null;
      }
    },

    /**
     * Update a network device in PRTG
     */
    updateNetworkDevice: async (deviceId: string, data: Partial<NetworkData>): Promise<NetworkData | null> => {
      try {
        const response = await prtgApi.put<NetworkData>(`/devices/${deviceId}`, data);
        return response.data;
      } catch (error) {
        console.error(`Error updating network device ${deviceId} in PRTG:`, error);
        return null;
      }
    },
  },
};

export default NetworkService;
