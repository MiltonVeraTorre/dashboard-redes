'use client';

import React, { useState, useEffect } from 'react';

interface CriticalSite {
  site: string;
  plaza: string;
  healthScore: number;
  utilization: number;
  alertCount: number;
  deviceCount: number;
  status: 'critical' | 'warning' | 'attention';
  issues: string[];
  lastUpdated: string;
}

interface CriticalSitesResponse {
  data: CriticalSite[];
  summary: {
    totalCriticalSites: number;
    averageHealthScore: number;
    totalAlerts: number;
    criticalThreshold: number;
  };
  demo?: boolean;
  source?: string;
  timestamp?: string;
}

interface CriticalSitesPanelProps {
  limit?: number;
  threshold?: number;
}

const STATUS_CONFIG = {
  critical: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Crítico'
  },
  warning: {
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    label: 'Advertencia'
  },
  attention: {
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Atención'
  }
};

export function CriticalSitesPanel({ limit = 10, threshold = 75 }: CriticalSitesPanelProps) {
  const [sites, setSites] = useState<CriticalSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchCriticalSites();
  }, [limit, threshold]);

  const fetchCriticalSites = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('threshold', threshold.toString());
      params.append('includeAlerts', 'true');

      const response = await fetch(`/api/executive/critical-sites?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CriticalSitesResponse = await response.json();

      setSites(result.data);
      setSummary(result.summary);
      setIsDemo(result.demo || false);
      setDataSource(result.source || 'unknown');
      setLastUpdated(result.timestamp || new Date().toISOString());
    } catch (err) {
      console.error('Error fetching critical sites data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdated = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffMinutes < 1440) return `Hace ${Math.floor(diffMinutes / 60)} h`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando sitios críticos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 mb-2">Error al cargar datos</p>
          <button
            onClick={fetchCriticalSites}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No hay sitios críticos</p>
          <p className="text-xs text-gray-400 mt-1">Todos los sitios están funcionando normalmente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Data Source Indicator */}
      <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isDemo ? 'bg-orange-400' : 'bg-green-400'}`}></div>
          <span>
            {dataSource === 'observium_data' ? 'Datos en tiempo real de Observium' :
             dataSource === 'observium_api_empty' ? 'Sin datos en Observium' :
             dataSource === 'demo_data' ? 'Datos de demostración' :
             'Fuente desconocida'}
          </span>
        </div>
        <span>Actualizado: {new Date(lastUpdated).toLocaleTimeString('es-ES')}</span>
      </div>

      {/* Header with summary */}
      {summary && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-medium text-gray-900">{summary.totalCriticalSites}</div>
              <div className="text-gray-500">Sitios críticos</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{summary.averageHealthScore.toFixed(1)}</div>
              <div className="text-gray-500">Salud promedio</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{summary.totalAlerts}</div>
              <div className="text-gray-500">Alertas activas</div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Sites List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sites.map((site, index) => {
          const statusConfig = STATUS_CONFIG[site.status];

          return (
            <div
              key={`${site.site}-${index}`}
              className={`p-3 rounded-lg border ${statusConfig.bgColor} border-gray-200 hover:shadow-sm transition-shadow`}
            >
              {/* Site Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${statusConfig.color}`}></div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{site.site}</div>
                    <div className="text-xs text-gray-500">{site.plaza}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${statusConfig.textColor}`}>
                    {site.utilization.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Salud: {site.healthScore}
                  </div>
                </div>
              </div>

              {/* Issues */}
              {site.issues.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-gray-600 mb-1">Problemas:</div>
                  <div className="space-y-1">
                    {site.issues.slice(0, 2).map((issue, issueIndex) => (
                      <div key={issueIndex} className="text-xs text-gray-700 flex items-center">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {issue}
                      </div>
                    ))}
                    {site.issues.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{site.issues.length - 2} más...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span>{site.deviceCount} dispositivos</span>
                  {site.alertCount > 0 && (
                    <span className="text-red-600">{site.alertCount} alertas</span>
                  )}
                </div>
                <div>{formatLastUpdated(site.lastUpdated)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Data Warning */}
      {isDemo && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-yellow-800">
              ⚠️ DATOS DE DEMOSTRACIÓN
            </span>
          </div>
          <div className="text-xs text-yellow-700 mt-1">
            Esta lista muestra datos simulados. Conecte a la fuente de datos real para información actual.
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>Mostrando {sites.length} de {summary?.totalCriticalSites || sites.length} sitios</div>
          <button
            onClick={fetchCriticalSites}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Actualizar
          </button>
        </div>

        {/* Data Source Info */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            Fuente: {dataSource === 'observium_data' ? 'Observium API' :
                     dataSource === 'demo_data' ? 'Datos Demo' :
                     dataSource ? dataSource : 'Desconocida'}
          </span>
          <span>Actualizado: {new Date(lastUpdated).toLocaleString('es-ES')}</span>
        </div>
      </div>
    </div>
  );
}
