'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GrowthDataPoint {
  period: string;
  value: number;
  growth: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface GrowthTrendsResponse {
  timeRange: string;
  metric: string;
  data: GrowthDataPoint[];
  summary: {
    currentValue: number;
    previousValue: number;
    totalGrowth: number;
    averageMonthlyGrowth: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    projection: {
      nextMonth: number;
      nextQuarter: number;
    };
  };
  source?: string;
  demo?: boolean;
  timestamp?: string;
}

interface GrowthTrendsChartProps {
  timeRange?: string;
  metric?: string;
  height?: number;
}

const METRIC_CONFIG = {
  utilization: {
    label: 'Utilización',
    unit: '%',
    color: '#3B82F6'
  },
  devices: {
    label: 'Dispositivos',
    unit: '',
    color: '#10B981'
  },
  ports: {
    label: 'Puertos',
    unit: '',
    color: '#8B5CF6'
  }
};

export function GrowthTrendsChart({
  timeRange = '3m',
  metric = 'utilization',
  height = 300
}: GrowthTrendsChartProps) {
  const [data, setData] = useState<GrowthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [isDemo, setIsDemo] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchGrowthTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      params.append('metric', metric);

      const response = await fetch(`/api/executive/growth-trends?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GrowthTrendsResponse = await response.json();

      setData(result.data);
      setSummary(result.summary);
      setDataSource(result.source || 'unknown');
      setIsDemo(result.demo || result.source === 'demo_data');
      setLastUpdated(result.timestamp || new Date().toISOString());
    } catch (err) {
      console.error('Error fetching growth trends data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [timeRange, metric]);

  useEffect(() => {
    fetchGrowthTrends();
  }, [fetchGrowthTrends]);

  const formatPeriod = (period: string): string => {
    if (period.includes('W')) {
      return period.replace(/(\d{4})-W(\d+)/, 'Sem $2');
    }
    const [year, month] = period.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return monthNames[parseInt(month) - 1] || period;
  };

  const formatTooltipValue = (value: number, name: string) => {
    const config = METRIC_CONFIG[metric as keyof typeof METRIC_CONFIG];
    return [`${value.toFixed(1)}${config.unit}`, config.label];
  };

  const formatTooltipLabel = (label: string) => {
    return `Período: ${formatPeriod(label)}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'decreasing':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando tendencias...</p>
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
            onClick={fetchGrowthTrends}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No hay datos de tendencias disponibles</p>
        </div>
      </div>
    );
  }

  const config = METRIC_CONFIG[metric as keyof typeof METRIC_CONFIG];
  const chartData = data.map(point => ({
    ...point,
    formattedPeriod: formatPeriod(point.period)
  }));

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={config.color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="formattedPeriod"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: config.label, angle: -90, position: 'insideLeft' }}
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

          <Area
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorGrowth)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Information */}
      {summary && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {summary.currentValue.toFixed(1)}{config.unit}
            </div>
            <div className="text-gray-500">Actual</div>
          </div>
          <div className="text-center">
            <div className={`font-medium flex items-center justify-center space-x-1 ${
              summary.totalGrowth > 0 ? 'text-green-600' :
              summary.totalGrowth < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {getTrendIcon(summary.trend)}
              <span>{summary.totalGrowth > 0 ? '+' : ''}{summary.totalGrowth.toFixed(1)}%</span>
            </div>
            <div className="text-gray-500">Crecimiento</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {summary.averageMonthlyGrowth.toFixed(1)}%
            </div>
            <div className="text-gray-500">Promedio mensual</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {summary.projection.nextMonth.toFixed(1)}{config.unit}
            </div>
            <div className="text-gray-500">Proyección</div>
          </div>
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
          Fuente: {dataSource === 'observium_data' ? 'Observium API' :
                   dataSource === 'demo_data' ? 'Datos Demo' :
                   'Desconocida'}
        </span>
        <span>Actualizado: {new Date(lastUpdated).toLocaleString('es-ES')}</span>
      </div>
    </div>
  );
}
