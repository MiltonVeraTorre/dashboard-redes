/**
 * PRTG API Client Adapter
 * 
 * This file sets up a specialized API client for PRTG with authentication
 * for making network requests to the PRTG service.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_PRTG_API_BASE_URL || 'http://172.30.99.146/';
const API_USERNAME = process.env.NEXT_PUBLIC_API_USERNAME || 'equipo2';
const API_PASSWORD = process.env.NEXT_PUBLIC_API_PASSWORD || '91Rert@mU';

// Create a base64 encoded string for Basic Authentication
const basicAuthToken = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString('base64');

// Create axios instance with default configuration
const prtgClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${basicAuthToken}`,
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for handling requests
prtgClient.interceptors.request.use(
  (config) => {
    // You can add additional logic here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses
prtgClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API errors here
    console.error('PRTG API Error:', error);
    return Promise.reject(error);
  }
);

// Helper functions for API requests
export const prtgApi = {
  /**
   * Make a GET request to PRTG API
   * @param url - The endpoint URL
   * @param params - Query parameters
   * @param config - Additional axios config
   */
  get: <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return prtgClient.get<T>(url, { params, ...config });
  },

  /**
   * Make a POST request to PRTG API
   * @param url - The endpoint URL
   * @param data - Request body data
   * @param config - Additional axios config
   */
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return prtgClient.post<T>(url, data, config);
  },

  /**
   * Make a PUT request to PRTG API
   * @param url - The endpoint URL
   * @param data - Request body data
   * @param config - Additional axios config
   */
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return prtgClient.put<T>(url, data, config);
  },

  /**
   * Make a DELETE request to PRTG API
   * @param url - The endpoint URL
   * @param config - Additional axios config
   */
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return prtgClient.delete<T>(url, config);
  },
};

// Export the configured axios instance for direct use if needed
export default prtgClient;
