'use client';

import React from 'react';
import { Site } from '@/lib/domain/entities';

interface SiteDetailsProps {
  site: Site;
}

export function SiteDetails({ site }: SiteDetailsProps) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700">{site.name}</h3>
        <p className="text-gray-500">{site.plaza}</p>
      </div>
      
      {site.address && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Address</h4>
          <p className="text-gray-500">{site.address}</p>
        </div>
      )}
      
      {site.coordinates && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Coordinates</h4>
          <p className="text-gray-500">
            Lat: {site.coordinates.lat}, Lng: {site.coordinates.lng}
          </p>
        </div>
      )}
      
      <div className="mt-6">
        <a
          href={`https://maps.google.com/?q=${site.coordinates?.lat},${site.coordinates?.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          View on Map
        </a>
      </div>
    </div>
  );
}
