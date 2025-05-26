'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LocationService, Location } from '@/lib/locationService';

const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await LocationService.getAllLocations();
        setLocations(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar las ubicaciones');
        console.error('Error fetching locations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Function to get badge color based on source
  const getSourceBadgeClass = (source: 'Observium' | 'PRTG') => {
    return source === 'Observium' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Ubicaciones</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Ubicaciones</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ubicaciones</h1>
      
      {locations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">No hay ubicaciones disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Link 
              key={`${location.source}-${location.id}`}
              href={`/ubicaciones/${location.id}?source=${location.source}`}
              className="block"
            >
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">{location.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs ${getSourceBadgeClass(location.source)}`}>
                    {location.source}
                  </span>
                </div>
                <p className="text-gray-600">
                  <span className="font-medium">Sitios:</span> {location.siteCount}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationsPage;
