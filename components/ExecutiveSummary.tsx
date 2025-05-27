import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface PlazaData {
  plaza: string;
  overview: {
    devices: any[];
    totalDevices: number;
    activeDevices: number;
    totalPorts: number;
    activePorts: number;
    alerts: any[];
  };
  capacitySummary: {
    totalCapacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
    linksCount: number;
    criticalLinks: number;
    warningLinks: number;
  };
  topDevices: any[];
  healthScore: {
    score: number;
    grade: string;
    factors: {
      deviceAvailability: number;
      portAvailability: number;
      alertScore: number;
    };
  };
}

interface ExecutiveSummaryProps {
  plaza?: string;
  refreshInterval?: number; // en minutos
  plazaData?: PlazaData | null; // Datos del dashboard
  loading?: boolean; // Estado de carga del dashboard
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  plaza,
  refreshInterval = 30,
  plazaData,
  loading: dashboardLoading = false
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
    if (!plazaData && !skipCache && !summary) {
      setError('Esperando datos del dashboard...');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/monitoring/executive-summary', window.location.origin);
      if (plaza) {
        url.searchParams.append('plaza', plaza);
      }
      if (skipCache) {
        url.searchParams.append('skipCache', 'true');
      }

      // Validar datos del dashboard de manera más robusta
      const hasValidDashboardData = plazaData &&
                                   plazaData.overview &&
                                   plazaData.overview.devices &&
                                   Array.isArray(plazaData.overview.devices) &&
                                   plazaData.overview.devices.length > 0;

      const requestOptions: RequestInit = {
        method: hasValidDashboardData && !skipCache ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (hasValidDashboardData && !skipCache) {
        console.log('🤖 ExecutiveSummary: Enviando datos del dashboard al endpoint');
        console.log('📊 Datos del dashboard a enviar:', {
          plaza: plazaData.plaza,
          devices: plazaData.overview.devices.length,
          alerts: plazaData.overview.alerts?.length || 0,
          totalDevices: plazaData.overview.totalDevices,
          activeDevices: plazaData.overview.activeDevices,
          hasOverview: !!plazaData.overview,
          devicesIsArray: Array.isArray(plazaData.overview.devices)
        });

        // Log de los primeros dispositivos para verificar estructura y fuente de datos
        if (plazaData.overview.devices.length > 0) {
          console.log('📊 Primeros 2 dispositivos (verificar que son datos reales):',
            plazaData.overview.devices.slice(0, 2).map(d => ({
              hostname: d.hostname,
              location: d.location,
              status: d.status,
              device_id: d.device_id
            }))
          );
        }

        requestOptions.body = JSON.stringify({
          dashboardData: plazaData
        });
      } else {
        console.log('🤖 ExecutiveSummary: Usando endpoint GET (sin datos del dashboard)');
        console.log('❌ Razón:', {
          hasValidDashboardData,
          skipCache,
          plazaData: !!plazaData,
          overview: plazaData?.overview ? 'exists' : 'missing',
          devices: plazaData?.overview?.devices?.length || 0,
          devicesIsArray: Array.isArray(plazaData?.overview?.devices),
          hasDevicesProperty: plazaData?.overview ? 'devices' in plazaData.overview : false
        });
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
  }, [plaza, isOpenAIEnabled, checkingConfig]);

  const checkForCachedSummary = async () => {
    try {
      const url = new URL('/api/monitoring/executive-summary', window.location.origin);
      if (plaza) {
        url.searchParams.append('plaza', plaza);
      }

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
            <span className="text-blue-700">Esperando datos del dashboard...</span>
          </div>
        </div>
      </Card>
    );
  }

  // Si no hay resumen pero hay datos del dashboard, mostrar botón para generar
  if (!summary && plazaData) {
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
  if (!summary && !plazaData) {
    return (
      <Card className="executive-summary-card bg-gray-50 border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo</h2>
          <p className="text-gray-600">Seleccione una plaza para generar un resumen ejecutivo.</p>
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