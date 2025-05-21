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
 * No authentication is required for this API
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
});
