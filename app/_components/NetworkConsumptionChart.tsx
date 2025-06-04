'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NetworkConsumptionData {
  timestamp: string;
  [plaza: string]: string | number;
}

interface NetworkConsumptionResponse {
  timeRange: string;
  data: NetworkConsumptionData[];
  plazas: string[];
  summary: {
    totalDataPoints: number;
    averageConsumption: Record<string, number>;
  };
  source?: string;
  demo?: boolean;
  timestamp?: string;
}

interface NetworkConsumptionChartProps {
  timeRange?: string;
  height?: number;
}

const PLAZA_COLORS = {
  'CDMX': '#3B82F6',      // Blue
  'Monterrey': '#10B981',  // Green
  'Queretaro': '#8B5CF6',  // Purple
  'Miami': '#F59E0B',      // Amber
  'Laredo': '#EF4444',     // Red
  'Saltillo': '#06B6D4'    // Cyan
};

export function NetworkConsumptionChart({ timeRange = '7d', height = 300 }: NetworkConsumptionChartProps) {
  const [data, setData] = useState<NetworkConsumptionData[]>([]);
  const [plazas, setPlazas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [isDemo, setIsDemo] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchNetworkConsumption = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/executive/network-consumption?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: NetworkConsumptionResponse = await response.json();

      // Transform data for chart display
      const chartData = result.data.map(point => ({
        ...point,
        time: formatTimestamp(point.timestamp, timeRange)
      }));

      setData(chartData);
      setPlazas(result.plazas);
      setSummary(result.summary);
      setDataSource(result.source || 'unknown');
      setIsDemo(result.demo || result.source === 'demo_data');
      setLastUpdated(result.timestamp || new Date().toISOString());
    } catch (err) {
      console.error('Error fetching network consumption data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchNetworkConsumption();
  }, [fetchNetworkConsumption]);

  const formatTimestamp = (timestamp: string, range: string): string => {
    const date = new Date(timestamp);

    switch (range) {
      case '1d':
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      case '30d':
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }
  };

  const formatTooltipValue = (value: number, name: string) => {
    return [`${value.toFixed(1)}%`, name];
  };

  const formatTooltipLabel = (label: string) => {
    return `Tiempo: ${label}`;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando datos de consumo...</p>
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
            onClick={fetchNetworkConsumption}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0 || plazas.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Consumo (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={formatTooltipValue}
            labelFormatter={formatTooltipLabel}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
          />

          {plazas.map((plaza, index) => (
            <Line
              key={plaza}
              type="monotone"
              dataKey={plaza}
              stroke={PLAZA_COLORS[plaza as keyof typeof PLAZA_COLORS] || `hsl(${index * 60}, 70%, 50%)`}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Information */}
      {summary && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {Object.entries(summary.averageConsumption).map(([plaza, avg]) => (
            <div key={plaza} className="text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: PLAZA_COLORS[plaza as keyof typeof PLAZA_COLORS] || '#6b7280' }}
              ></div>
              <div className="font-medium text-gray-900">{plaza}</div>
              <div className="text-gray-500">{(avg as number).toFixed(1)}% prom.</div>
            </div>
          ))}
        </div>
      )}

      {/* Mock Data Warning */}
      {isDemo && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-yellow-800">
              ⚠️ DATOS DE DEMOSTRACIÓN
            </span>
          </div>
          <div className="text-xs text-yellow-700 mt-1">
            Este gráfico muestra datos simulados. Conecte a la fuente de datos real para métricas actuales.
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span>
          Fuente: {dataSource === 'bills_data' ? 'Observium API' :
                   dataSource === 'demo_data' ? 'Datos Demo' :
                   'Desconocida'}
        </span>
        <span>Actualizado: {new Date(lastUpdated).toLocaleString('es-ES')}</span>
      </div>
    </div>
  );
}
