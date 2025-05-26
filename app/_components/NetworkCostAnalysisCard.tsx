'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface CostData {
  totalMonthlyCost: number;
  costPerMbps: number;
  utilizationEfficiency: number;
  potentialSavings: number;
  overProvisionedLinks: number;
  underUtilizedCapacity: number;
  currency: string;
}

interface LocationBreakdown {
  location: string;
  monthlyCost: number;
  contractedMbps: number;
  actualUsageMbps: number;
  efficiency: number;
  costPerMbps: number;
  potentialSaving: number;
}

interface TrendData {
  month: string;
  cost: number;
  usage: number;
  efficiency: number;
}

interface NetworkCostAnalysisResponse {
  data: CostData;
  breakdown: LocationBreakdown[];
  trends: TrendData[];
  projections?: any;
  demo?: boolean;
  source?: string;
  timestamp?: string;
}

interface NetworkCostAnalysisCardProps {
  height?: number;
  includeProjections?: boolean;
}

const EFFICIENCY_COLORS = {
  excellent: '#10B981',  // Green (>80%)
  good: '#84CC16',       // Light Green (60-80%)
  fair: '#F59E0B',       // Amber (40-60%)
  poor: '#EF4444'        // Red (<40%)
};

export function NetworkCostAnalysisCard({ height = 300, includeProjections = false }: NetworkCostAnalysisCardProps) {
  const [data, setData] = useState<CostData | null>(null);
  const [breakdown, setBreakdown] = useState<LocationBreakdown[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchNetworkCostAnalysis();
  }, [includeProjections]);

  const fetchNetworkCostAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (includeProjections) params.append('includeProjections', 'true');

      const response = await fetch(`/api/executive/network-cost-analysis?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: NetworkCostAnalysisResponse = await response.json();

      setData(result.data);
      setBreakdown(result.breakdown);
      setTrends(result.trends);
      setIsDemo(result.demo || false);
      setDataSource(result.source || 'unknown');
      setLastUpdated(result.timestamp || new Date().toISOString());
    } catch (err) {
      console.error('Error fetching network cost analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return EFFICIENCY_COLORS.excellent;
    if (efficiency >= 60) return EFFICIENCY_COLORS.good;
    if (efficiency >= 40) return EFFICIENCY_COLORS.fair;
    return EFFICIENCY_COLORS.poor;
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompactCurrency = (value: number, currency: string = 'USD') => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${currency}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${currency}`;
    }
    return formatCurrency(value, currency);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando análisis de costos...</p>
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
            onClick={fetchNetworkCostAnalysis}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No hay datos de costos disponibles</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const efficiencyChartData = breakdown.slice(0, 5).map(item => ({
    name: item.location,
    efficiency: item.efficiency,
    cost: item.monthlyCost,
    color: getEfficiencyColor(item.efficiency)
  }));

  return (
    <div className="h-full">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatCompactCurrency(data.totalMonthlyCost, data.currency)}
          </div>
          <div className="text-sm text-gray-500">Costo Mensual</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: getEfficiencyColor(data.utilizationEfficiency) }}>
            {data.utilizationEfficiency.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Eficiencia</div>
        </div>
      </div>

      {/* Savings Opportunity */}
      {data.potentialSavings > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-800">Oportunidad de Ahorro</div>
              <div className="text-xs text-green-600">
                {data.overProvisionedLinks} enlaces sobredimensionados
              </div>
            </div>
            <div className="text-lg font-bold text-green-700">
              {formatCompactCurrency(data.potentialSavings, data.currency)}
            </div>
          </div>
        </div>
      )}

      {/* Efficiency by Location Chart */}
      {efficiencyChartData.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Eficiencia por Ubicación</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'efficiency' ? `${value}%` : formatCurrency(value as number, data.currency),
                    name === 'efficiency' ? 'Eficiencia' : 'Costo Mensual'
                  ]}
                />
                <Bar dataKey="efficiency" radius={[2, 2, 0, 0]}>
                  {efficiencyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cost Trend */}
      {trends.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tendencia de Costos</h4>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => [formatCompactCurrency(value as number, data.currency), 'Costo']}
                  labelFormatter={(label: any) => `Mes: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
        <div className="text-center">
          <div className="font-medium text-gray-900">
            {formatCurrency(data.costPerMbps, data.currency)}
          </div>
          <div className="text-gray-500">Costo/Mbps</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{data.overProvisionedLinks}</div>
          <div className="text-gray-500">Sobredimensionados</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{data.underUtilizedCapacity}</div>
          <div className="text-gray-500">Mbps Sin Usar</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">{breakdown.length}</div>
          <div className="text-gray-500">Ubicaciones</div>
        </div>
      </div>

      {/* Top Locations by Cost */}
      {breakdown.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Ubicaciones por Costo</h4>
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {breakdown.slice(0, 3).map((location, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getEfficiencyColor(location.efficiency) }}
                  ></div>
                  <span className="font-medium">{location.location}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCompactCurrency(location.monthlyCost, data.currency)}</div>
                  <div className="text-gray-500">{location.efficiency.toFixed(1)}% eficiencia</div>
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
            Esta tarjeta muestra datos simulados. Conecte a la fuente de datos real para análisis de costos actuales.
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
