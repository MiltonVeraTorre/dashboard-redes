/**
 * PRTG API Adapter
 *
 * This module provides an adapter for the PRTG API, allowing the application
 * to fetch network data from PRTG in a standardized format.
 */

import axios, { AxiosInstance } from 'axios';

/**
 * Create a dedicated axios instance for PRTG API
 *
 * Base URL: http://172.30.99.146/welcome.htm
 * Authentication: Basic Auth
 * Username: equipo2
 * Password: 91Rert@mU
 */
export const prtgApi: AxiosInstance = axios.create({
  baseURL: 'http://172.30.99.146/api',
  auth: {
    username: 'equipo2',
    password: '91Rert@mU'
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // CORS headers
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
  timeout: 10000, // 10 seconds timeout
});
