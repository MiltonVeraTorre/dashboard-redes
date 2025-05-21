'use client';

import React from 'react';
import { Site, Link } from '@/lib/domain/entities';
import { SiteSelector } from './SiteSelector';
import { LinksList } from './LinksList';
import { LinkUtilizationChart } from './LinkUtilizationChart';
import { SiteDetails } from './SiteDetails';

interface TechnicalDashboardProps {
  sites: Site[];
  selectedSite: string | null;
  siteDetails: { site: Site; links: Link[] } | null;
  onSiteChange: (siteId: string) => void;
  loading: boolean;
  error: string | null;
}

export function TechnicalDashboard({
  sites,
  selectedSite,
  siteDetails,
  onSiteChange,
  loading,
  error,
}: TechnicalDashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Technical Dashboard</h1>

      {/* Site Selector */}
      <div className="mb-8">
        <SiteSelector
          sites={sites}
          selectedSite={selectedSite}
          onSiteChange={onSiteChange}
        />
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {siteDetails && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Site Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Site Information</h2>
            <SiteDetails site={siteDetails.site} />
          </div>

          {/* Links List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Network Links</h2>
            <LinksList links={siteDetails.links} />
          </div>

          {/* Link Utilization Chart */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Link Utilization History</h2>
            {siteDetails.links.length > 0 ? (
              <LinkUtilizationChart linkId={siteDetails.links[0].id} />
            ) : (
              <p className="text-gray-500">No links available for this site.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
