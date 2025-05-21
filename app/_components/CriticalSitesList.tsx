'use client';

import React, { useEffect, useState } from 'react';
import { http } from '@/lib/utils/http';

interface RankedSite {
  id: string;
  name: string;
  plaza: string;
  utilizationPercentage: number;
  criticalLinks: number;
  totalLinks: number;
}

export function CriticalSitesList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sites, setSites] = useState<RankedSite[]>([]);
  
  useEffect(() => {
    async function fetchCriticalSites() {
      try {
        setLoading(true);
        const data = await http.get<RankedSite[]>('/api/ranking?by=critical&limit=5');
        setSites(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching critical sites:', err);
        setError('Failed to load critical sites. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCriticalSites();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }
  
  if (sites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No critical sites found.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Site
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plaza
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Critical Links
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Links
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg. Utilization
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sites.map(site => (
            <tr key={site.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {site.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {site.plaza}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">
                {site.criticalLinks}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {site.totalLinks}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {Math.round(site.utilizationPercentage)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a
                  href={`/technical?site=${site.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View Details
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
