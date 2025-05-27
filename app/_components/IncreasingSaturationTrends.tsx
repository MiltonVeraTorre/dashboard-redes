'use client';

import React from 'react';
import { useCachedFetch } from '@/lib/hooks/useCachedFetch';
import { MiniTrendChart, TrendIndicator } from './MiniTrendChart';

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

interface IncreasingSaturationTrendsProps {
  limit?: number;
  onRefresh?: () => void;
}

export function IncreasingSaturationTrends({
  limit = 5,
  onRefresh
}: IncreasingSaturationTrendsProps) {
  // Fetch sites with increasing saturation trends
  const {
    data: trendsData,
    loading: trendsLoading,
    error: trendsError,
    refetch: refetchTrends
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
    `/api/monitoring/saturated-sites?limit=${limit}&includeHistory=true&trendsOnly=true`,
    {
      ttl: 2 * 60 * 1000, // 2 minutes cache
      enabled: true
    }
  );

  // Handle manual refresh
  const handleRefresh = async () => {
    await refetchTrends();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Get trend severity color based on percentage change
  const getTrendSeverityColor = (current: number, previous: number) => {
    const change = current - previous;
    if (change >= 20) return 'bg-red-600'; // Critical increase
    if (change >= 10) return 'bg-orange-500'; // High increase
    if (change >= 5) return 'bg-yellow-500'; // Moderate increase
    return 'bg-gray-400'; // Low increase
  };

  // Get trend severity indicator
  const getTrendSeverityIndicator = (current: number, previous: number) => {
    const change = current - previous;
    if (change >= 20) return '🔴'; // Critical
    if (change >= 10) return '🟠'; // High
    if (change >= 5) return '🟡'; // Moderate
    return '🟢'; // Low
  };

  // Get trend arrow based on change
  const getTrendArrow = (current: number, previous: number) => {
    const change = current - previous;
    if (change >= 15) return '↗️'; // Sharp increase
    if (change >= 5) return '↗'; // Moderate increase
    return '→'; // Slight increase
  };

  // Generate simple trend chart data (sparkline simulation)
  const generateTrendChart = (current: number, previous: number) => {
    const points = [];
    const steps = 7; // 7 data points for a week
    const totalChange = current - previous;

    for (let i = 0; i < steps; i++) {
      const progress = i / (steps - 1);
      const value = previous + (totalChange * progress);
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 3;
      points.push(Math.max(0, Math.min(100, value + variation)));
    }

    return points;
  };

  const sites = trendsData?.sites || [];

  if (trendsLoading) {
    return (
      <div className="rounded-md border border-gray-300 bg-white p-4">
        <h3 className="mb-4 text-lg font-normal">Sitios con Tendencia Creciente de Saturación</h3>
        <div className="flex items-center justify-center py-8">
          <svg className="h-5 w-5 animate-spin text-gray-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-2 text-sm text-gray-600">Cargando tendencias de saturación...</span>
        </div>
      </div>
    );
  }

  if (trendsError) {
    return (
      <div className="rounded-md border border-gray-300 bg-white p-4">
        <h3 className="mb-4 text-lg font-normal">Sitios con Tendencia Creciente de Saturación</h3>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar tendencias</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{trendsError}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-300 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-normal">Sitios con Tendencia Creciente de Saturación</h3>
        <div className="flex items-center gap-2">
          {trendsData && (
            <span className="text-xs text-gray-500">
              Actualizado: {new Date(trendsData.metadata?.timestamp || '').toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={trendsLoading}
            className="rounded-md border border-gray-300 p-1 hover:bg-gray-50"
          >
            <svg
              className={`w-4 h-4 ${trendsLoading ? 'animate-spin' : ''}`}
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

      {sites.length > 0 ? (
        <div className="space-y-4">
          {sites.map((site: SiteData) => {
            const change = site.previousSaturation ? (site.saturation - site.previousSaturation) : 0;
            const changePercentage = site.previousSaturation ?
              ((site.saturation - site.previousSaturation) / site.previousSaturation * 100) : 0;
            const trendPoints = site.previousSaturation ?
              generateTrendChart(site.saturation, site.previousSaturation) : [];

            return (
              <div key={site.id} className="rounded-md border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {site.previousSaturation ? getTrendSeverityIndicator(site.saturation, site.previousSaturation) : '📈'}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{site.name}</div>
                        {site.plaza && site.plaza !== site.name && (
                          <div className="text-xs text-gray-500">Plaza: {site.plaza}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Actual:</span>
                        <span className="font-medium">{site.saturation}%</span>
                      </div>
                      {site.previousSaturation && (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Anterior:</span>
                            <span>{site.previousSaturation}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Cambio:</span>
                            <TrendIndicator
                              current={site.saturation}
                              previous={site.previousSaturation}
                              showChart={true}
                              chartData={trendPoints}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${
                          site.saturation >= 85 ? "bg-red-600" :
                          site.saturation >= 70 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(site.saturation, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          {trendsData?.metadata?.dataAvailability?.message ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Datos de tendencias no disponibles</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{trendsData.metadata.dataAvailability.message}</p>
                    <p className="mt-1">Sitios encontrados: {trendsData.metadata.dataAvailability.totalSitesFound}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <p>No se encontraron sitios con tendencias crecientes significativas</p>
              <p className="text-sm mt-1">Los sitios mostrarán aquí cuando tengan un aumento de saturación ≥ 5%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
