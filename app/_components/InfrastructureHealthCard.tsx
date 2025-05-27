'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface HealthData {
  overallHealth: number;
  cpuHealth: number;
  memoryHealth: number;
  storageHealth: number;
  environmentalHealth: number;
  criticalDevices: number;
  warningDevices: number;
  healthyDevices: number;
}

interface LocationBreakdown {
  location: string;
  deviceCount: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  avgTemperature: number;
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface InfrastructureHealthResponse {
  data: HealthData;
  breakdown: LocationBreakdown[];
  alerts: any[];
  demo?: boolean;
  source?: string;
  timestamp?: string;
}

interface InfrastructureHealthCardProps {
  height?: number;
  includeDetails?: boolean;
}

const STATUS_COLORS = {
  healthy: '#10B981',    // Green
  warning: '#F59E0B',    // Amber
  critical: '#EF4444'    // Red
};

const HEALTH_COLORS = {
  excellent: '#10B981',  // Green
  good: '#84CC16',       // Light Green
  fair: '#F59E0B',       // Amber
  poor: '#EF4444'        // Red
};

export function InfrastructureHealthCard({ height = 300, includeDetails = false }: InfrastructureHealthCardProps) {
  const [data, setData] = useState<HealthData | null>(null);
  const [breakdown, setBreakdown] = useState<LocationBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchInfrastructureHealth();
  }, [includeDetails]);

  const fetchInfrastructureHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (includeDetails) params.append('includeDetails', 'true');

      const response = await fetch(`/api/executive/infrastructure-health?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: InfrastructureHealthResponse = await response.json();

      setData(result.data);
      setBreakdown(result.breakdown);
      setIsDemo(result.demo || false);
      setDataSource(result.source || 'unknown');
      setLastUpdated(result.timestamp || new Date().toISOString());
    } catch (err) {
      console.error('Error fetching infrastructure health data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return HEALTH_COLORS.excellent;
    if (health >= 75) return HEALTH_COLORS.good;
    if (health >= 60) return HEALTH_COLORS.fair;
    return HEALTH_COLORS.poor;
  };

  const getHealthLabel = (health: number) => {
    if (health >= 90) return 'Excelente';
    if (health >= 75) return 'Bueno';
    if (health >= 60) return 'Regular';
    return 'Crítico';
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando salud de infraestructura...</p>
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
            onClick={fetchInfrastructureHealth}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No hay datos de salud disponibles</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const deviceStatusData = [
    { name: 'Saludables', value: data.healthyDevices, color: STATUS_COLORS.healthy },
    { name: 'Advertencia', value: data.warningDevices, color: STATUS_COLORS.warning },
    { name: 'Críticos', value: data.criticalDevices, color: STATUS_COLORS.critical }
  ].filter(item => item.value > 0);

  const healthMetrics = [
    { name: 'CPU', value: data.cpuHealth, color: getHealthColor(data.cpuHealth) },
    { name: 'Memoria', value: data.memoryHealth, color: getHealthColor(data.memoryHealth) },
    { name: 'Almacenamiento', value: data.storageHealth, color: getHealthColor(data.storageHealth) },
    { name: 'Ambiental', value: data.environmentalHealth, color: getHealthColor(data.environmentalHealth) }
  ];

  return (
    <div className="h-full">
      {/* Overall Health Score */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 mb-2"
             style={{ borderColor: getHealthColor(data.overallHealth) }}>
          <span className="text-2xl font-bold" style={{ color: getHealthColor(data.overallHealth) }}>
            {Math.round(data.overallHealth)}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Salud General: <span className="font-medium" style={{ color: getHealthColor(data.overallHealth) }}>
            {getHealthLabel(data.overallHealth)}
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Device Status Pie Chart */}
        <div className="h-32">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Estado de Dispositivos</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceStatusData}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={40}
                dataKey="value"
              >
                {deviceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Health Metrics Bar Chart */}
        <div className="h-32">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Métricas de Salud</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={healthMetrics} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Salud']} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {healthMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
        <div className="text-center">
          <div className="font-medium text-gray-900">{data.cpuHealth.toFixed(1)}%</div>
          <div className="text-gray-500">CPU</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{data.memoryHealth.toFixed(1)}%</div>
          <div className="text-gray-500">Memoria</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{data.environmentalHealth.toFixed(1)}%</div>
          <div className="text-gray-500">Ambiental</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">
            {data.healthyDevices + data.warningDevices + data.criticalDevices}
          </div>
          <div className="text-gray-500">Dispositivos</div>
        </div>
      </div>

      {/* Location Breakdown */}
      {breakdown.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Por Ubicación</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {breakdown.slice(0, 3).map((location, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: STATUS_COLORS[location.status] }}
                  ></div>
                  <span className="font-medium">{location.location}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{location.healthScore.toFixed(1)}%</div>
                  <div className="text-gray-500">{location.deviceCount} dispositivos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            Esta tarjeta muestra datos simulados. Conecte a la fuente de datos real para métricas actuales.
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span>
          Fuente: {dataSource === 'observium_data' ? 'Observium API' :
                   dataSource === 'demo_data' ? 'Datos Demo' :
                   dataSource ? dataSource : 'Desconocida'}
        </span>
        <span>Actualizado: {new Date(lastUpdated).toLocaleString('es-ES')}</span>
      </div>
    </div>
  );
}
