'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Site, Link } from '@/lib/domain/entities';
import { TechnicalDashboard } from '@/app/_components/TechnicalDashboard';
import { fetchAllSites, fetchSiteDetails } from '@/lib/services/technical-service';
import { useSearchParams } from 'next/navigation';

/**
 * Technical Dashboard Page
 *
 * This page displays detailed technical information about network sites and links.
 */
export default function TechnicalPage() {
  const searchParams = useSearchParams();
  const siteParam = searchParams.get('site');

  const [selectedSite, setSelectedSite] = useState<string | null>(siteParam);

  // Fetch all sites using SWR
  const {
    data: sites = [],
    error: sitesError,
    isLoading: sitesLoading
  } = useSWR<Site[]>(
    'allSites',
    fetchAllSites,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  // Set default selected site if none is selected
  useEffect(() => {
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0].id);
    }
  }, [sites, selectedSite]);

  // Fetch details for the selected site using SWR
  const {
    data: siteDetails,
    error: detailsError,
    isLoading: detailsLoading
  } = useSWR<{ site: Site; links: Link[] }>(
    selectedSite ? `siteDetails-${selectedSite}` : null,
    () => selectedSite ? fetchSiteDetails(selectedSite) : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  const handleSiteChange = (siteId: string) => {
    setSelectedSite(siteId);
  };

  // Combine loading states
  const isLoading = sitesLoading || (detailsLoading && selectedSite);

  // Combine error states
  const error = sitesError || detailsError;

  if (sitesLoading && sites.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading technical dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && sites.length === 0) {
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
          <p className="text-gray-600">{error.message || 'An error occurred while loading the dashboard.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <TechnicalDashboard
      sites={sites}
      selectedSite={selectedSite}
      siteDetails={siteDetails}
      onSiteChange={handleSiteChange}
      loading={isLoading}
      error={error ? error.message : null}
    />
  );
}
