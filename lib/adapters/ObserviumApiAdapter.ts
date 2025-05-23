/**
 * Observium API Adapter
 *
 * This module provides an adapter for the Observium API, allowing the application
 * to fetch network data from Observium in a standardized format.
 */

import axios, { AxiosInstance } from 'axios';

/**
 * Create a dedicated axios instance for Observium API
 *
 * Base URL: http://172.26.2.161/
 * Authentication: Basic Auth
 * Username: equipo2
 * Password: 91Rert@mU
 */
export const observiumApi: AxiosInstance = axios.create({
  baseURL: 'http://172.26.2.161/api/v0',
  auth: {
    username: 'equipo2',
    password: '91Rert@mU'
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  maxRedirects: 5, // Limit redirects to prevent infinite loops
  validateStatus: (status) => {
    return status >= 200 && status < 300; // Only consider 2xx responses as successful
  },
});

// Add request interceptor for logging
observiumApi.interceptors.request.use(
  (config) => {
    console.log(`Making request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
observiumApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }

    // Add more specific error handling for common issues
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Check network connection or server availability.');
    } else if (error.message.includes('Network Error')) {
      console.error('Network error. Check internet connection.');
    } else if (error.response && error.response.status === 429) {
      console.error('Too many requests. Rate limit exceeded.');
    } else if (error.message.includes('maxRedirects')) {
      console.error('Too many redirects. Check server configuration.');
    }

    return Promise.reject(error);
  }
);
