'use client';

import React from 'react';
import { Site } from '@/lib/domain/entities';

interface SiteSelectorProps {
  sites: Site[];
  selectedSite: string | null;
  onSiteChange: (siteId: string) => void;
}

export function SiteSelector({ sites, selectedSite, onSiteChange }: SiteSelectorProps) {
  // Group sites by plaza
  const sitesByPlaza: Record<string, Site[]> = {};
  
  sites.forEach(site => {
    if (!sitesByPlaza[site.plaza]) {
      sitesByPlaza[site.plaza] = [];
    }
    
    sitesByPlaza[site.plaza].push(site);
  });
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Select Site</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(sitesByPlaza).map(([plaza, plazaSites]) => (
          <div key={plaza} className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">{plaza}</h3>
            <div className="space-y-2">
              {plazaSites.map(site => (
                <button
                  key={site.id}
                  className={`w-full text-left px-4 py-2 rounded ${
                    selectedSite === site.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                  onClick={() => onSiteChange(site.id)}
                >
                  {site.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
