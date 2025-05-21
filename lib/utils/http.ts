/**
 * HTTP client utility
 * 
 * This module provides a simple HTTP client for making API requests.
 */

import { logger } from './logger';

interface RequestOptions extends RequestInit {
  baseUrl?: string;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

class HttpError extends Error {
  status: number;
  statusText: string;
  
  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.name = 'HttpError';
  }
}

/**
 * Build a URL with query parameters
 */
function buildUrl(url: string, baseUrl?: string, params?: Record<string, string | number | boolean | undefined>): string {
  const fullUrl = baseUrl ? `${baseUrl}${url}` : url;
  
  if (!params) {
    return fullUrl;
  }
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  
  if (!queryString) {
    return fullUrl;
  }
  
  return `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
}

/**
 * Make an HTTP request
 */
async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { baseUrl, params, timeout, ...fetchOptions } = options;
  
  const fullUrl = buildUrl(url, baseUrl, params);
  
  logger.debug(`HTTP ${options.method || 'GET'} ${fullUrl}`);
  
  // Set up timeout if specified
  let timeoutId: NodeJS.Timeout | undefined;
  let timeoutPromise: Promise<Response> | undefined;
  
  if (timeout) {
    timeoutPromise = new Promise<Response>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }
  
  try {
    // Make the request with timeout if specified
    const response = await (timeoutPromise
      ? Promise.race([fetch(fullUrl, fetchOptions), timeoutPromise])
      : fetch(fullUrl, fetchOptions));
    
    // Clear timeout if set
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Check if response is OK
    if (!response.ok) {
      throw new HttpError(
        response.status,
        response.statusText,
        `HTTP error ${response.status}: ${response.statusText}`
      );
    }
    
    // Parse response based on content type
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return response.json();
    } else if (contentType.includes('text/')) {
      return response.text() as unknown as T;
    } else {
      return response.blob() as unknown as T;
    }
  } catch (error) {
    logger.error(`HTTP error: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * HTTP client with convenience methods for common HTTP methods
 */
export const http = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, data?: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'POST', body: JSON.stringify(data), headers: { ...options?.headers, 'Content-Type': 'application/json' } }),
  put: <T>(url: string, data?: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(data), headers: { ...options?.headers, 'Content-Type': 'application/json' } }),
  patch: <T>(url: string, data?: any, options?: RequestOptions) => request<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(data), headers: { ...options?.headers, 'Content-Type': 'application/json' } }),
  delete: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'DELETE' }),
};
