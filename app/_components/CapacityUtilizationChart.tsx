'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CapacityData {
  plaza: string;
  utilization: number;
  totalCapacity: number;
  usedCapacity: number;
  deviceCount: number;
  portCount: number;
  status: 'normal' | 'warning' | 'critical';
}

interface CapacityUtilizationResponse {
  data: CapacityData[];
  summary: {
    totalPlazas: number;
    averageUtilization: number;
    totalDevices: number;
    totalPorts: number;
  };
  demo?: boolean;
  source?: string;
  timestamp?: string;
}

interface CapacityUtilizationChartProps {
  height?: number;
  includeDetails?: boolean;
}

const STATUS_COLORS = {
  normal: '#10B981',    // Green
  warning: '#F59E0B',   // Amber
  critical: '#EF4444'   // Red
};

export function CapacityUtilizationChart({ height = 300, includeDetails = false }: CapacityUtilizationChartProps) {
  const [data, setData] = useState<CapacityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchCapacityUtilization();
  }, [includeDetails]);

  const fetchCapacityUtilization = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (includeDetails) params.append('includeDetails', 'true');

      const response = await fetch(`/api/executive/capacity-utilization?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CapacityUtilizationResponse = await response.json();

      setData(result.data);
      setSummary(result.summary);
      setIsDemo(result.demo || false);
      setDataSource(result.source || 'unknown');
      setLastUpdated(result.timestamp || new Date().toISOString());
    } catch (err) {
      console.error('Error fetching capacity utilization data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm">
          <p className="font-medium text-gray-900 mb-2">{`Plaza: ${label}`}</p>
          <p className="text-blue-600">{`Utilización: ${data.utilization.toFixed(1)}%`}</p>
          <p className="text-gray-600">{`Capacidad: ${data.usedCapacity}/${data.totalCapacity} Mbps`}</p>
          <p className="text-gray-600">{`Dispositivos: ${data.deviceCount}`}</p>
          <p className="text-gray-600">{`Puertos: ${data.portCount}`}</p>
          <p className={`font-medium ${
            data.status === 'critical' ? 'text-red-600' :
            data.status === 'warning' ? 'text-amber-600' :
            'text-green-600'
          }`}>
            Estado: {data.status === 'critical' ? 'Crítico' : data.status === 'warning' ? 'Advertencia' : 'Normal'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Cargando datos de capacidad...</p>
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
            onClick={fetchCapacityUtilization}
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
          <p className="text-sm text-gray-500">No hay datos de capacidad disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
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
            dataKey="plaza"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: 'Utilización (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Information */}
      {summary && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <div className="font-medium text-gray-900">{summary.totalPlazas}</div>
            <div className="text-gray-500">Plazas</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">{summary.averageUtilization.toFixed(1)}%</div>
            <div className="text-gray-500">Promedio</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">{summary.totalDevices}</div>
            <div className="text-gray-500">Dispositivos</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">{summary.totalPorts}</div>
            <div className="text-gray-500">Puertos</div>
          </div>
        </div>
      )}

      {/* Status Legend */}
      <div className="mt-4 flex justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.normal }}></div>
          <span className="text-gray-600">Normal</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.warning }}></div>
          <span className="text-gray-600">Advertencia</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.critical }}></div>
          <span className="text-gray-600">Crítico</span>
        </div>
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
            Este gráfico muestra datos simulados. Conecte a la fuente de datos real para métricas actuales.
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
