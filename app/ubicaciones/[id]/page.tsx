'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { LocationService, Location } from '@/lib/locationService';

interface LocationPageProps {}

const LocationPage: React.FC<LocationPageProps> = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const locationId = params.id as string;
  const source = searchParams.get('source') as 'Observium' | 'PRTG';
  
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!locationId || !source) {
        setError('ID de ubicación o fuente no válidos');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let locationData: Location | null = null;
        
        if (source === 'Observium') {
          locationData = await LocationService.Observium.getLocation(locationId);
        } else if (source === 'PRTG') {
          locationData = await LocationService.PRTG.getLocation(locationId);
        }
        
        if (locationData) {
          setLocation(locationData);
          setError(null);
        } else {
          setError(`No se encontró la ubicación con ID ${locationId}`);
        }
      } catch (err) {
        setError('Error al cargar los detalles de la ubicación');
        console.error(`Error fetching location ${locationId} from ${source}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationDetails();
  }, [locationId, source]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No se encontró información para esta ubicación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{location.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            location.source === 'Observium' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {location.source}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Información General</h2>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {location.id}</p>
              <p><span className="font-medium">Nombre:</span> {location.name}</p>
              <p><span className="font-medium">Cantidad de Sitios:</span> {location.siteCount}</p>
              <p><span className="font-medium">Fuente de Datos:</span> {location.source}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Estadísticas</h2>
            <p className="text-gray-500">
              Las estadísticas detalladas estarán disponibles próximamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
