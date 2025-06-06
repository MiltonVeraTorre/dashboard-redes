'use client';

import React, { useState, useEffect } from 'react';
import { SiteStatusChart } from '@/app/_components/site-status-chart';
import { SiteTrendChart } from '@/app/_components/site-trend-chart';

interface SaturatedSite {
  id: string;
  name: string;
  location: string;
  saturation: number;
  trend: string;
  outages: number;
  deviceCount: number;
  criticalPorts: number;
  maxPortUtilization: number;
  avgPortUtilization: number;
  operationalPorts: number;
}

interface SaturatedSitesResponse {
  sites: SaturatedSite[];
  timestamp: string;
  totalSites: number;
  cached?: boolean;
  error?: string;
}

export default function ClassificationPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("status");
  const [mostSaturatedSites, setMostSaturatedSites] = useState<SaturatedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch most saturated sites data
  useEffect(() => {
    const fetchSaturatedSites = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching most saturated sites...');
        const response = await fetch('/api/classification/most-saturated-sites');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SaturatedSitesResponse = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        console.log('✅ Successfully fetched saturated sites:', data.sites.length);
        setMostSaturatedSites(data.sites);
        setLastUpdated(data.timestamp);

      } catch (err) {
        console.error('❌ Error fetching saturated sites:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        // Don't set fallback data - show error instead
      } finally {
        setLoading(false);
      }
    };

    fetchSaturatedSites();
  }, []);

  const sitesWithMostOutages = [
    { id: 6, name: "PUE-Industrial-02", outages: 7, lastOutage: "2025-05-21", saturation: 65 },
    { id: 7, name: "VER-Puerto-01", outages: 5, lastOutage: "2025-05-20", saturation: 62 },
    { id: 1, name: "CDMX-Norte-01", outages: 3, lastOutage: "2025-05-22", saturation: 95 },
    { id: 8, name: "LEO-Centro-03", outages: 3, lastOutage: "2025-05-19", saturation: 58 },
    { id: 4, name: "GDL-Sur-02", outages: 2, lastOutage: "2025-05-18", saturation: 72 },
  ];

  const sitesWithIncreasingTrend = [
    { id: 1, name: "CDMX-Norte-01", saturation: 95, trend: 18, previousSaturation: 77 },
    { id: 2, name: "MTY-Centro-03", saturation: 86, trend: 12, previousSaturation: 74 },
    { id: 4, name: "GDL-Sur-02", saturation: 72, trend: 9, previousSaturation: 63 },
    { id: 9, name: "QRO-Terras-04", saturation: 78, trend: 8, previousSaturation: 70 },
    { id: 10, name: "MER-Centro-01", saturation: 65, trend: 7, previousSaturation: 58 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white">
        <div className="flex h-14 items-center px-4">

          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                placeholder="Buscar..."
                className="h-9 w-64 rounded-md border border-gray-300 bg-white pl-8 text-sm outline-none focus:border-gray-500"
              />
            </div>
            <button className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50">
              <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
                <path
                  d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1.5 7C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H1.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-normal">Clasificación de Sitios Críticos</h2>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
                Últimos 7 días
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Most Saturated Sites */}
            <div className="rounded-md border border-gray-300 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-normal">Sitios Más Saturados</h3>
                {lastUpdated && (
                  <span className="text-xs text-gray-500">
                    Actualizado: {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                      </div>
                      <div className="h-2 w-full animate-pulse rounded-full bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : mostSaturatedSites.length === 0 ? (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Sin datos disponibles</h3>
                      <p className="mt-1 text-sm text-yellow-700">No se encontraron sitios con datos de saturación.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {mostSaturatedSites.map((site) => (
                    <div key={site.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-normal">{site.name}</span>
                          <div className="text-xs text-gray-500">{site.location}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-normal">{site.saturation}%</span>
                          <div className="text-xs text-gray-500">
                            {site.deviceCount} dispositivos
                          </div>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${
                            site.saturation >= 85 ? "bg-red-600" :
                            site.saturation >= 70 ? "bg-orange-500" :
                            site.saturation >= 50 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(Math.max(site.saturation, 0), 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Puertos críticos: {site.criticalPorts}</span>
                        <span className={`inline-flex items-center ${
                          site.trend === 'up' ? 'text-red-600' :
                          site.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {site.trend === 'up' && '↗'}
                          {site.trend === 'down' && '↘'}
                          {site.trend === 'stable' && '→'}
                          {site.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sites with Most Outages */}
            <div className="rounded-md border border-gray-300 bg-white p-4">
              <h3 className="mb-4 text-lg font-normal">Sitios con Más Caídas</h3>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div>
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                        <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                      </div>
                      <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {mostSaturatedSites
                    .filter(site => site.outages > 0)
                    .sort((a, b) => b.outages - a.outages)
                    .slice(0, 5)
                    .map((site) => (
                      <div key={site.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div>
                          <div className="font-normal">{site.name}</div>
                          <div className="text-sm text-gray-500">
                            Saturación: {site.saturation}% | {site.criticalPorts} puertos críticos
                          </div>
                        </div>
                        <div className={`rounded-md px-2 py-1 text-sm ${
                          site.outages >= 3 ? 'bg-red-200 text-red-800' :
                          site.outages >= 1 ? 'bg-orange-200 text-orange-800' : 'bg-gray-200'
                        }`}>
                          {site.outages} caídas
                        </div>
                      </div>
                    ))}
                  {mostSaturatedSites.filter(site => site.outages > 0).length === 0 && (
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Sin caídas reportadas</h3>
                          <p className="mt-1 text-sm text-green-700">Todos los sitios están operando normalmente.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sites with Increasing Trend */}
          <div className="mt-6 rounded-md border border-gray-300 bg-white p-4">
            <h3 className="mb-4 text-lg font-normal">Sitios con Tendencia Creciente</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sitesWithIncreasingTrend.map((site) => (
                <div key={site.id} className="rounded-md border border-gray-300 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-normal">{site.name}</span>
                    <span className="text-sm">+{site.trend}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${
                        site.saturation >= 85 ? "bg-gray-800" : site.saturation >= 70 ? "bg-gray-600" : "bg-gray-400"
                      }`}
                      style={{ width: `${site.saturation}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>Anterior: {site.previousSaturation}%</span>
                    <span>Actual: {site.saturation}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}