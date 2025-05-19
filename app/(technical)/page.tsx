'use client';

// Using React hooks
import { useEffect, useState } from 'react';
import { Site, Link } from '@/lib/domain/entities';
import { http } from '@/lib/utils/http';
import { TechnicalDashboard } from '@/app/_components/TechnicalDashboard';

export default function TechnicalPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [siteDetails, setSiteDetails] = useState<{ site: Site; links: Link[] } | null>(null);

  // Fetch all sites
  useEffect(() => {
    async function fetchSites() {
      try {
        setLoading(true);
        const data = await http.get<Site[]>('/api/sites');
        setSites(data);

        // Select the first site by default if none is selected
        if (data.length > 0 && !selectedSite) {
          setSelectedSite(data[0].id);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching sites:', err);
        setError('Failed to load sites. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchSites();
  }, []);

  // Fetch details for the selected site
  useEffect(() => {
    if (!selectedSite) return;

    async function fetchSiteDetails() {
      try {
        setLoading(true);
        const data = await http.get<{ site: Site; links: Link[] }>(`/api/sites/${selectedSite}`);
        setSiteDetails(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching details for site ${selectedSite}:`, err);
        setError('Failed to load site details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchSiteDetails();
  }, [selectedSite]);

  const handleSiteChange = (siteId: string) => {
    setSelectedSite(siteId);
  };

  if (loading && sites.length === 0) {
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
          <p className="text-gray-600">{error}</p>
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
      loading={loading}
      error={error}
    />
  );
}
