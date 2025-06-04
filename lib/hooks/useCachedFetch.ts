'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface UseCachedFetchOptions {
  ttl?: number; // Time to live in milliseconds
  refreshInterval?: number; // Auto-refresh interval in milliseconds
  enabled?: boolean; // Whether to fetch data
  fallbackUrl?: string; // Fallback URL if primary fails
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseCachedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
  isCached: boolean;
  cacheTimeRemaining: number;
}

// Client-side cache
const clientCache = new Map<string, CacheItem<any>>();

export function useCachedFetch<T>(
  url: string,
  options: UseCachedFetchOptions = {}
): UseCachedFetchResult<T> {
  const {
    ttl = 2 * 60 * 1000, // 2 minutes default
    refreshInterval,
    enabled = true,
    fallbackUrl,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [cacheTimeRemaining, setCacheTimeRemaining] = useState<number>(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cacheUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Get data from cache
  const getCachedData = useCallback((key: string): T | null => {
    const item = clientCache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the item has expired
    if (Date.now() > item.expiresAt) {
      clientCache.delete(key);
      return null;
    }
    
    return item.data as T;
  }, []);

  // Set data in cache
  const setCachedData = useCallback((key: string, data: T): void => {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;
    
    clientCache.set(key, {
      data,
      timestamp,
      expiresAt
    });
  }, [ttl]);

  // Get cache time remaining
  const getCacheTimeRemaining = useCallback((key: string): number => {
    const item = clientCache.get(key);
    
    if (!item) {
      return 0;
    }
    
    const remaining = item.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }, []);

  // Memoize callbacks to prevent infinite re-renders
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Fetch data function
  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled || !url) return;

    const cacheKey = url;

    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setIsCached(true);
      setCacheTimeRemaining(getCacheTimeRemaining(cacheKey));
      if (onSuccessRef.current) onSuccessRef.current(cachedData);
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);
    setIsCached(false);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Cache the data
      setCachedData(cacheKey, result);

      setData(result);
      setLastUpdated(new Date());
      setCacheTimeRemaining(ttl);

      if (onSuccessRef.current) onSuccessRef.current(result);
    } catch (err) {
      // Try fallback URL if primary fails
      if (fallbackUrl) {
        try {
          console.log(`⚠️ Primary URL failed, trying fallback: ${fallbackUrl}`);
          const fallbackResponse = await fetch(fallbackUrl);
          if (!fallbackResponse.ok) {
            throw new Error(`Fallback error ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
          }

          const fallbackResult = await fallbackResponse.json();

          // Cache the fallback data with a shorter TTL
          setCachedData(cacheKey, fallbackResult);

          setData(fallbackResult);
          setLastUpdated(new Date());
          setCacheTimeRemaining(ttl);

          console.log(`✅ Fallback data loaded successfully`);
          if (onSuccessRef.current) onSuccessRef.current(fallbackResult);
          return;
        } catch (fallbackErr) {
          console.error(`❌ Fallback also failed:`, fallbackErr);
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      if (onErrorRef.current) onErrorRef.current(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [url, enabled, getCachedData, setCachedData, getCacheTimeRemaining, ttl]);

  // Update cache time remaining periodically
  useEffect(() => {
    if (!url || !data) return;

    cacheUpdateRef.current = setInterval(() => {
      const remaining = getCacheTimeRemaining(url);
      setCacheTimeRemaining(remaining);
      
      // If cache expired, mark as not cached
      if (remaining <= 0) {
        setIsCached(false);
      }
    }, 1000);

    return () => {
      if (cacheUpdateRef.current) {
        clearInterval(cacheUpdateRef.current);
      }
    };
  }, [url, data, getCacheTimeRemaining]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    intervalRef.current = setInterval(() => {
      fetchData(false); // Don't show loading spinner for auto-refresh
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, enabled, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (cacheUpdateRef.current) {
        clearInterval(cacheUpdateRef.current);
      }
    };
  }, []);

  const refetch = useCallback(async () => {
    // Clear cache for this URL and refetch
    if (url) {
      clientCache.delete(url);
      await fetchData();
    }
  }, [url, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
    isCached,
    cacheTimeRemaining
  };
}

// Utility function to clear all cache
export const clearAllCache = () => {
  clientCache.clear();
};

// Utility function to clear specific cache entry
export const clearCache = (url: string) => {
  clientCache.delete(url);
};
