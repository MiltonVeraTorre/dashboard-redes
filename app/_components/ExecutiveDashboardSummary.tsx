'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface ExecutiveDashboardData {
  networkConsumption: {
    timeRange: string;
    data: any[];
    plazas: string[];
    summary: {
      totalDataPoints: number;
      averageConsumption: Record<string, number>;
    };
  };
  capacityUtilization: {
    data: Array<{
      plaza: string;
      utilization: number;
      totalCapacity: number;
      usedCapacity: number;
      deviceCount: number;
      portCount: number;
      status: 'normal' | 'warning' | 'critical';
    }>;
    summary: {
      totalPlazas: number;
      averageUtilization: number;
      totalDevices: number;
      totalPorts: number;
    };
  };
  criticalSites: {
    data: Array<{
      site: string;
      plaza: string;
      healthScore: number;
      utilization: number;
      alertCount: number;
      deviceCount: number;
      status: 'critical' | 'warning' | 'attention';
      issues: string[];
    }>;
    summary: {
      totalCriticalSites: number;
      averageHealthScore: number;
      totalAlerts: number;
      criticalThreshold: number;
    };
  };
  growthTrends: any;
  timestamp: string;
}

interface ExecutiveDashboardSummaryProps {
  dashboardData?: ExecutiveDashboardData | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export const ExecutiveDashboardSummary: React.FC<ExecutiveDashboardSummaryProps> = ({
  dashboardData,
  loading: dashboardLoading = false,
  onRefresh
}) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOpenAIEnabled, setIsOpenAIEnabled] = useState<boolean>(false);
  const [checkingConfig, setCheckingConfig] = useState<boolean>(true);

  // Función para verificar si OpenAI está configurado
  const checkOpenAIConfig = async () => {
    try {
      const response = await fetch('/api/openai/status');
      const data = await response.json();
      setIsOpenAIEnabled(data.enabled);
    } catch (error) {
      console.error('Error checking OpenAI config:', error);
      setIsOpenAIEnabled(false);
    } finally {
      setCheckingConfig(false);
    }
  };

  const fetchSummary = async (skipCache: boolean = false) => {
    if (!isOpenAIEnabled) {
      setError('La integración con OpenAI no está habilitada. Configure OPENAI_API_KEY en las variables de entorno.');
      setLoading(false);
      return;
    }

    // Solo requerir datos del dashboard si no estamos saltando caché y no hay resumen previo
    if (!dashboardData && !skipCache && !summary) {
      setError('Esperando datos del dashboard...');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/executive/summary', window.location.origin);
      if (skipCache) {
        url.searchParams.append('skipCache', 'true');
      }

      // Validar datos del dashboard
      const hasValidDashboardData = dashboardData &&
                                   dashboardData.networkConsumption &&
                                   dashboardData.capacityUtilization &&
                                   dashboardData.criticalSites;

      const requestOptions: RequestInit = {
        method: hasValidDashboardData && !skipCache ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (hasValidDashboardData && !skipCache) {
        console.log('🤖 ExecutiveDashboardSummary: Enviando datos del dashboard al endpoint');
        console.log('📊 Datos del dashboard a enviar:', {
          plazas: dashboardData.networkConsumption.plazas?.length || 0,
          capacityData: dashboardData.capacityUtilization.data?.length || 0,
          criticalSites: dashboardData.criticalSites.data?.length || 0,
          averageUtilization: dashboardData.capacityUtilization.summary?.averageUtilization,
          totalCriticalSites: dashboardData.criticalSites.summary?.totalCriticalSites
        });

        requestOptions.body = JSON.stringify({
          dashboardData: dashboardData
        });
      } else {
        console.log('🤖 ExecutiveDashboardSummary: Usando endpoint GET (sin datos del dashboard)');
      }

      const response = await fetch(url.toString(), requestOptions);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching executive summary:', err);
      setError('No se pudo cargar el resumen ejecutivo. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para verificar la configuración de OpenAI al montar el componente
  useEffect(() => {
    checkOpenAIConfig();
  }, []);

  // Efecto para verificar si hay caché disponible cuando OpenAI esté habilitado
  useEffect(() => {
    if (isOpenAIEnabled && !checkingConfig) {
      // Solo verificar caché, no generar automáticamente
      checkForCachedSummary();
    }
  }, [isOpenAIEnabled, checkingConfig]);

  const checkForCachedSummary = async () => {
    try {
      const url = new URL('/api/executive/summary', window.location.origin);
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (data.cached) {
          setSummary(data.summary);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      // Silently fail - just means no cache available
      console.log('No cached summary available');
    }
  };

  // Mostrar estado de carga mientras se verifica la configuración
  if (checkingConfig) {
    return (
      <Card className="executive-summary-card">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo</h2>
          <div className="flex justify-center items-center h-32">
            <Spinner />
            <span className="ml-2">Verificando configuración...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (!isOpenAIEnabled) {
    return (
      <Card className="executive-summary-card bg-amber-50 border-amber-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo</h2>
          <p className="text-amber-700">
            La integración con OpenAI no está habilitada. Configure OPENAI_API_KEY en las variables de entorno.
          </p>
        </div>
      </Card>
    );
  }

  // Mostrar estado de espera si el dashboard está cargando
  if (dashboardLoading) {
    return (
      <Card className="executive-summary-card bg-blue-50 border-blue-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo</h2>
          <div className="flex items-center space-x-2">
            <Spinner size="sm" />
            <span className="text-blue-700">Cargando datos del dashboard...</span>
          </div>
        </div>
      </Card>
    );
  }

  // Si no hay resumen pero hay datos del dashboard, mostrar botón para generar
  if (!summary && dashboardData) {
    return (
      <Card className="executive-summary-card bg-green-50 border-green-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo</h2>
          <div className="text-center">
            <p className="text-green-700 mb-4">
              Datos del dashboard listos. Genere un resumen ejecutivo con IA.
            </p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
              onClick={() => fetchSummary(false)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Generando...
                </>
              ) : (
                <>
                  🤖 Generar Resumen Ejecutivo
                </>
              )}
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Si no hay resumen ni datos del dashboard
  if (!summary && !dashboardData) {
    return (
      <Card className="executive-summary-card bg-gray-50 border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo</h2>
          <p className="text-gray-600">Cargando datos del dashboard para generar resumen ejecutivo...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="executive-summary-card">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Resumen Ejecutivo</h2>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Actualizado: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => fetchSummary(true)}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Actualizar'}
            </button>
          </div>
        </div>

        <div className="executive-summary-content">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <div className="executive-summary-text prose">
              {summary.split('\n\n').map((paragraph, index) => (
                <p key={index} className={index === 0 ? 'font-medium' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
