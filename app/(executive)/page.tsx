'use client';

import React from 'react';
import useSWR from 'swr';
import { NetworkOverview } from '@/lib/domain/entities';
import { ExecutiveDashboard } from '@/app/_components/ExecutiveDashboard';
import { fetchNetworkOverview } from '@/lib/services/network-service';

/**
 * Executive Dashboard Page
 *
 * This page displays an overview of the network status for executives.
 */
export default function ExecutivePage() {
  // Use SWR for data fetching with automatic revalidation
  const { data: overview, error, isLoading, isValidating, mutate } = useSWR<NetworkOverview>(
    'networkOverview',
    fetchNetworkOverview,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3, // Retry 3 times on error
      errorRetryInterval: 5000, // Wait 5 seconds between retries
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
      focusThrottleInterval: 10000, // Throttle revalidation on focus
    }
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-lg">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error.message || 'Failed to load network overview data.'}</p>
          <button
            onClick={() => mutate()} // Use SWR's mutate to retry
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show a subtle loading indicator when revalidating in the background
  const revalidatingIndicator = isValidating && !isLoading && (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg">
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
        <span>Refreshing data...</span>
      </div>
    </div>
  );

  // Render the dashboard with the data
  return (
    <>
      {overview && <ExecutiveDashboard overview={overview} />}
      {revalidatingIndicator}
    </>
  );
}
