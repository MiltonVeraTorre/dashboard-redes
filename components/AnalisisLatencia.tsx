'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface AnalisisLatenciaProps {
  plazaData: PlazaData | null;
  loading: boolean;
  selectedPlaza: string;
}

const AnalisisLatencia: React.FC<AnalisisLatenciaProps> = ({
  plazaData,
  loading,
  selectedPlaza
}) => {
  const [latencyData, setLatencyData] = useState<{
    backbone: Array<{ name: string; latencia: number }>;
    distribucion: Array<{ name: string; latencia: number }>;
    acceso: Array<{ name: string; latencia: number }>;
  }>({
    backbone: [],
    distribucion: [],
    acceso: []
  });
  const [latencyLoading, setLatencyLoading] = useState(false);
  const [latencyError, setLatencyError] = useState<string | null>(null);

  // Fetch latency data when plaza changes
  useEffect(() => {
    if (!selectedPlaza) {
      setLatencyData({ backbone: [], distribucion: [], acceso: [] });
      return;
    }

    const fetchLatency = async () => {
      setLatencyLoading(true);
      setLatencyError(null);

      try {
        const response = await fetch(`/api/monitoring/plaza/${encodeURIComponent(selectedPlaza)}/latency?period=7d`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform data for charts
        const transformedData = {
          backbone: data.latencyData.backbone?.map((item: any, index: number) => ({
            name: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            latencia: item.latencia
          })) || [],
          distribucion: data.latencyData.distribucion?.map((item: any, index: number) => ({
            name: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            latencia: item.latencia
          })) || [],
          acceso: data.latencyData.acceso?.map((item: any, index: number) => ({
            name: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            latencia: item.latencia
          })) || []
        };

        setLatencyData(transformedData);
        console.log(`✅ Loaded latency data for ${selectedPlaza}:`, transformedData);
      } catch (error) {
        console.error(`❌ Error loading latency data for ${selectedPlaza}:`, error);
        setLatencyError(error instanceof Error ? error.message : 'Error desconocido');

        // Fallback to generated data
        const fallbackData = generateFallbackLatencyData(selectedPlaza);
        setLatencyData(fallbackData);
      } finally {
        setLatencyLoading(false);
      }
    };

    fetchLatency();
  }, [selectedPlaza]);

  // Generate fallback data if API fails
  const generateFallbackLatencyData = (plaza: string) => {
    const plazaSeeds: Record<string, number> = {
      'Laredo': 1,
      'Saltillo': 2,
      'CDMX': 3,
      'Monterrey': 4
    };

    const baseLatencies = {
      backbone: 5,
      distribucion: 15,
      acceso: 25
    };

    const seed = plazaSeeds[plaza] || 1;
    const result: any = {};

    ['backbone', 'distribucion', 'acceso'].forEach(networkType => {
      const baseLatency = baseLatencies[networkType as keyof typeof baseLatencies];
      const data = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const name = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

        // Generate different patterns for each plaza and network type
        const variation = Math.sin((i + seed + networkType.length) * 0.6) * 3 + (seed * 0.5);
        const latencia = Math.max(1, baseLatency + variation);

        data.push({
          name,
          latencia: Math.round(latencia * 10) / 10
        });
      }

      result[networkType] = data;
    });

    return result;
  };

  if (loading || latencyLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPlaza) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Latencia</h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">Seleccione una plaza para ver el análisis de latencia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Análisis de Latencia - {selectedPlaza}
        </h2>
        {latencyError && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Datos simulados
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Backbone</h3>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={latencyData.backbone}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} />
                <YAxis domain={[0, 10]} hide />
                <Line
                  type="monotone"
                  dataKey="latencia"
                  stroke="#3b82f6"
                  dot={false}
                  name="Latencia"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Distribución</h3>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={latencyData.distribucion}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} />
                <YAxis domain={[10, 20]} hide />
                <Line
                  type="monotone"
                  dataKey="latencia"
                  stroke="#8b5cf6"
                  dot={false}
                  name="Latencia"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Acceso</h3>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={latencyData.acceso}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} />
                <YAxis domain={[20, 30]} hide />
                <Line
                  type="monotone"
                  dataKey="latencia"
                  stroke="#ef4444"
                  dot={false}
                  name="Latencia"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalisisLatencia;
