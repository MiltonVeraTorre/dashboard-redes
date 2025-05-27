'use client';

import React, { useState } from 'react';
import { SiteStatusChart } from '@/app/_components/site-status-chart';
import { SiteTrendChart } from '@/app/_components/site-trend-chart';
import { IncreasingSaturationTrends } from '@/app/_components/IncreasingSaturationTrends';
import { useCachedFetch } from '@/lib/hooks/useCachedFetch';
import { Plaza, Alert } from '@/lib/domain/entities';

// Define types for our data
interface SiteData {
  id: string;
  name: string;
  plaza?: string;
  saturation: number;
  trend: 'up' | 'down' | 'stable';
  outages: number;
  lastOutage?: string;
  previousSaturation?: number;
  status?: 'normal' | 'warning' | 'critical';
}

interface NetworkOverview {
  totalSites: number;
  sitesPerPlaza: Record<Plaza, number>;
  criticalSites: number;
  averageUtilization: number;
  utilizationByPlaza: Record<Plaza, number>;
  recentAlerts: Alert[];
}

export default function ClassificationPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("status");

  // Use cached fetch for network overview data
  const {
    data: networkData,
    loading: networkLoading,
    error: networkError,
    refetch: refetchNetwork
  } = useCachedFetch<NetworkOverview>(
    '/api/monitoring/network-overview',
    {
      ttl: 5 * 60 * 1000, // 5 minutes cache
      enabled: true
    }
  );

  // Use cached fetch for saturated sites data
  const {
    data: saturatedSitesData,
    loading: saturatedSitesLoading,
    error: saturatedSitesError,
    refetch: refetchSaturatedSites
  } = useCachedFetch<{
    status: string;
    count: number;
    sites: SiteData[];
    metadata: {
      limit: number;
      includeHistory: boolean;
      trendsOnly: boolean;
      timestamp: string;
      dataSource: string;
      dataAvailability?: {
        totalSitesFound: number;
        sitesWithUtilizationData: boolean;
        message?: string;
      };
    };
  }>(
    '/api/monitoring/saturated-sites?limit=5&includeHistory=true',
    {
      ttl: 2 * 60 * 1000, // 2 minutes cache
      enabled: true
    }
  );

  // Use the new saturated sites data if available, otherwise fallback to network overview data
  const mostSaturatedSites: SiteData[] = saturatedSitesData?.sites ||
    (networkData?.utilizationByPlaza
      ? Object.entries(networkData.utilizationByPlaza)
          .map(([plaza, utilization]) => {
            return {
              id: plaza,
              name: plaza,
              saturation: Math.round(utilization),
              trend: (utilization > 70 ? 'up' : utilization < 30 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
              outages: networkData.recentAlerts.filter(alert => alert.siteId === plaza).length
            };
          })
          .sort((a, b) => b.saturation - a.saturation)
          .slice(0, 5)
      : []);

  const sitesWithMostOutages: SiteData[] = networkData?.recentAlerts
    ? Object.entries(
        networkData.recentAlerts.reduce((acc, alert) => {
          acc[alert.siteId] = (acc[alert.siteId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
        .map(([siteId, outages]) => {
          const lastAlert = networkData.recentAlerts.find(alert => alert.siteId === siteId);
          return {
            id: siteId,
            name: siteId,
            saturation: Math.round(networkData.utilizationByPlaza[siteId] || 0),
            trend: 'stable' as 'up' | 'down' | 'stable',
            outages,
            lastOutage: lastAlert?.timestamp instanceof Date
              ? lastAlert.timestamp.toISOString()
              : new Date(lastAlert?.timestamp || '').toISOString()
          };
        })
        .sort((a, b) => b.outages - a.outages)
        .slice(0, 5)
    : [];

  // Handle manual refresh
  const handleRefresh = async () => {
    await Promise.all([
      refetchNetwork(),
      refetchSaturatedSites()
    ]);
  };

  // Combined loading state
  const isLoading = networkLoading || saturatedSitesLoading;

  // Combined error state
  const hasError = networkError || saturatedSitesError;
  const errorMessage = networkError || saturatedSitesError;

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
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50"
            >
              <svg
                className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
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

          {/* Error Display */}
          {hasError && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 flex items-center justify-center rounded-md bg-gray-50 p-4">
              <svg className="h-5 w-5 animate-spin text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="ml-2 text-sm text-gray-600">Cargando datos de sitios saturados...</span>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Most Saturated Sites */}
            <div className="rounded-md border border-gray-300 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-normal">Sitios Más Saturados</h3>
                {saturatedSitesData && (
                  <span className="text-xs text-gray-500">
                    Actualizado: {new Date(saturatedSitesData.metadata?.timestamp || '').toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {mostSaturatedSites.length > 0 ? (
                  mostSaturatedSites.map((site: SiteData) => (
                    <div key={site.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-normal">{site.name}</span>
                          {site.plaza && site.plaza !== site.name && (
                            <span className="text-xs text-gray-500">Plaza: {site.plaza}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {site.trend === 'up' && (
                            <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          )}
                          {site.trend === 'down' && (
                            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                          )}
                          <span className="font-normal">{site.saturation}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${
                            site.saturation >= 85 ? "bg-red-600" : site.saturation >= 70 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(site.saturation, 100)}%` }}
                        ></div>
                      </div>
                      {site.previousSaturation && (
                        <div className="text-xs text-gray-500">
                          Anterior: {site.previousSaturation}% → Cambio: {site.saturation - site.previousSaturation > 0 ? '+' : ''}{site.saturation - site.previousSaturation}%
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    {saturatedSitesData?.metadata?.dataAvailability?.message ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Datos de utilización no disponibles</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>{saturatedSitesData.metadata.dataAvailability.message}</p>
                              <p className="mt-1">Sitios encontrados: {saturatedSitesData.metadata.dataAvailability.totalSitesFound}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        No hay datos de sitios saturados disponibles
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sites with Most Outages */}
            <div className="rounded-md border border-gray-300 bg-white p-4">
              <h3 className="mb-4 text-lg font-normal">Sitios con Más Caídas</h3>
              <div className="space-y-4">
                {sitesWithMostOutages.map((site: SiteData) => (
                  <div key={site.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <div className="font-normal">{site.name}</div>
                      <div className="text-sm text-gray-500">Última: {site.lastOutage}</div>
                    </div>
                    <div className="rounded-md bg-gray-200 px-2 py-1 text-sm">{site.outages} caídas</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sites with Increasing Saturation Trends - Enhanced Component */}
          <div className="mt-6">
            <IncreasingSaturationTrends
              limit={5}
              onRefresh={handleRefresh}
            />
          </div>


        </main>
      </div>
    </div>
  );
}