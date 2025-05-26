'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DashboardIcon,
  MonitoringIcon,
  AlertsIcon,
  ReportsIcon,
  LocationIcon,
  SettingsIcon,
  LogoutIcon,
  UserIcon
} from './icons';
import { LocationService, Location } from '@/lib/locationService';

const Sidebar: React.FC = () => {
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
        setError('Failed to fetch locations');
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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">NetMonitor</h1>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="py-2">
            <ul>
              <li>
                <Link href="/" className="flex items-center px-4 py-3 text-gray-800 bg-gray-100 font-medium">
                  <DashboardIcon /> Dashboard Ejecutivo
                </Link>
              </li>
              <li>
                <Link href="/monitoreo-tecnico" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <MonitoringIcon /> Monitoreo Técnico
                </Link>
              </li>
              <li>
                <Link href="/alertas" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <AlertsIcon /> Alertas
                </Link>
              </li>
              <li>
                <Link href="/reportes" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <ReportsIcon /> Reportes
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div className="py-2 border-t border-gray-200">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ubicaciones
            </div>
            {loading ? (
              <div className="px-4 py-3 text-gray-500">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                  Cargando...
                </div>
              </div>
            ) : error ? (
              <div className="px-4 py-3 text-red-500">
                Error al cargar ubicaciones
              </div>
            ) : (
              <ul>
                {locations.length === 0 ? (
                  <li className="px-4 py-3 text-gray-500">No hay ubicaciones disponibles</li>
                ) : (
                  locations.map((location) => (
                    <li key={`${location.source}-${location.id}`}>
                      <Link
                        href={`/ubicaciones/${location.id}?source=${location.source}`}
                        className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <LocationIcon /> {location.name}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getSourceBadgeClass(location.source)}`}>
                          {location.source}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Settings & Logout */}
          <div className="py-2 border-t border-gray-200">
            <ul>
              <li>
                <Link href="/configuracion" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <SettingsIcon /> Configuración
                </Link>
              </li>
              <li>
                <Link href="/logout" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <LogoutIcon /> Cerrar sesión
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Usuario</p>
              <p className="text-xs text-gray-500">Ingeniero de Red</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
