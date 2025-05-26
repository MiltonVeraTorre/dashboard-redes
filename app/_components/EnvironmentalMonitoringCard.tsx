'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface EnvironmentalData {
  averageTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  temperatureAlerts: number;
  humidityLevel: number;
  voltageStability: number;
  environmentalHealth: number;
  sensorsOnline: number;
  sensorsOffline: number;
}

interface LocationBreakdown {
  location: string;
  avgTemperature: number;
  maxTemperature: number;
  humidity: number;
  sensorCount: number;
  alertCount: number;
  status: 'normal' | 'warning' | 'critical';
}

interface EnvironmentalAlert {
  location: string;
  device: string;
  sensorType: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
}

interface EnvironmentalMonitoringResponse {
  data: EnvironmentalData;
  breakdown: LocationBreakdown[];
  alerts: EnvironmentalAlert[];
  demo?: boolean;
  source?: string;
  timestamp?: string;
}

interface EnvironmentalMonitoringCardProps {
  height?: number;
  alertThreshold?: number;
}

const STATUS_COLORS = {
  normal: '#10B981',     // Green
  warning: '#F59E0B',    // Amber
  critical: '#EF4444'    // Red
};

const HEALTH_COLORS = {
  excellent: '#10B981',  // Green (>90%)
  good: '#84CC16',       // Light Green (70-90%)
  fair: '#F59E0B',       // Amber (50-70%)
  poor: '#EF4444'        // Red (<50%)
};

export function EnvironmentalMonitoringCard({ height = 300, alertThreshold = 35 }: EnvironmentalMonitoringCardProps) {
  const [data, setData] = useState<EnvironmentalData | null>(null);
  const [breakdown, setBreakdown] = useState<LocationBreakdown[]>([]);
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchEnvironmentalData();
  }, [alertThreshold]);

  const fetchEnvironmentalData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('alertThreshold', alertThreshold.toString());

      const response = await fetch(`/api/executive/environmental-monitoring?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: EnvironmentalMonitoringResponse = await response.json();

      setData(result.data);
      setBreakdown(result.breakdown);
      setAlerts(result.alerts);
      setIsDemo(result.demo || false);
      setDataSource(result.source || 'unknown');
      setLastUpdated(result.timestamp || new Date().toISOString());
    } catch (err) {
      console.error('Error fetching environmental data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return HEALTH_COLORS.excellent;
    if (health >= 70) return HEALTH_COLORS.good;
    if (health >= 50) return HEALTH_COLORS.fair;
    return HEALTH_COLORS.poor;
  };

  const getHealthLabel = (health: number) => {
    if (health >= 90) return 'Excelente';
    if (health >= 70) return 'Bueno';
    if (health >= 50) return 'Regular';
    return 'Crítico';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 25) return '#10B981'; // Green
    if (temp <= 30) return '#84CC16'; // Light Green
    if (temp <= 35) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando monitoreo ambiental...</p>
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
            onClick={fetchEnvironmentalData}
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
          <p className="text-sm text-gray-500">No hay datos ambientales disponibles</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const temperatureData = breakdown.map(item => ({
    name: item.location,
    avgTemp: item.avgTemperature,
    maxTemp: item.maxTemperature,
    humidity: item.humidity
  }));

  return (
    <div className="h-full">
      {/* Environmental Health Score */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 mb-2"
             style={{ borderColor: getHealthColor(data.environmentalHealth) }}>
          <span className="text-lg font-bold" style={{ color: getHealthColor(data.environmentalHealth) }}>
            {Math.round(data.environmentalHealth)}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Salud Ambiental: <span className="font-medium" style={{ color: getHealthColor(data.environmentalHealth) }}>
            {getHealthLabel(data.environmentalHealth)}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: getTemperatureColor(data.averageTemperature) }}>
            {data.averageTemperature.toFixed(1)}°C
          </div>
          <div className="text-xs text-gray-500">Temp. Promedio</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">
            {data.humidityLevel.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Humedad</div>
        </div>
      </div>

      {/* Temperature Alerts */}
      {data.temperatureAlerts > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-800">Alertas de Temperatura</div>
              <div className="text-xs text-red-600">
                {data.temperatureAlerts} sensor{data.temperatureAlerts > 1 ? 'es' : ''} por encima de {alertThreshold}°C
              </div>
            </div>
            <div className="text-lg font-bold text-red-700">
              {data.temperatureAlerts}
            </div>
          </div>
        </div>
      )}

      {/* Temperature Chart */}
      {temperatureData.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Temperatura por Ubicación</h4>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={temperatureData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value}°C`,
                    name === 'avgTemp' ? 'Promedio' : 'Máxima'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="avgTemp"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="maxTemp"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
        <div className="text-center">
          <div className="font-medium text-gray-900">{data.maxTemperature.toFixed(1)}°C</div>
          <div className="text-gray-500">Máxima</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{data.voltageStability.toFixed(1)}%</div>
          <div className="text-gray-500">Voltaje</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{data.sensorsOnline}</div>
          <div className="text-gray-500">Sensores OK</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{data.sensorsOffline}</div>
          <div className="text-gray-500">Sensores Offline</div>
        </div>
      </div>

      {/* Location Breakdown */}
      {breakdown.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Por Ubicación</h4>
          <div className="space-y-2 max-h-20 overflow-y-auto">
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
                  <div className="font-medium">{location.avgTemperature.toFixed(1)}°C</div>
                  <div className="text-gray-500">{location.sensorCount} sensores</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Alertas Recientes</h4>
          <div className="space-y-1 max-h-16 overflow-y-auto">
            {alerts.slice(0, 2).map((alert, index) => (
              <div key={index} className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div className="font-medium text-yellow-800">
                  {alert.device} ({alert.location})
                </div>
                <div className="text-yellow-600">
                  {alert.sensorType}: {alert.value}°C (límite: {alert.threshold}°C)
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
            Esta tarjeta muestra datos simulados. Conecte a la fuente de datos real para monitoreo ambiental actual.
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
