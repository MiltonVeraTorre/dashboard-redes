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

interface TendenciasUtilizacionProps {
  plazaData: PlazaData | null;
  loading: boolean;
  selectedPlaza: string;
}

const TendenciasUtilizacion: React.FC<TendenciasUtilizacionProps> = ({
  plazaData,
  loading,
  selectedPlaza
}) => {
  const [trendsData, setTrendsData] = useState<Array<{ date: string; utilizacion: number }>>([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  // Fetch trends data when plaza changes
  useEffect(() => {
    if (!selectedPlaza) {
      setTrendsData([]);
      return;
    }

    const fetchTrends = async () => {
      setTrendsLoading(true);
      setTrendsError(null);

      try {
        const response = await fetch(`/api/monitoring/plaza/${encodeURIComponent(selectedPlaza)}/trends?period=7d`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform data for chart (use date as name for x-axis)
        const chartData = data.trends.map((trend: any, index: number) => ({
          name: new Date(trend.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          utilizacion: trend.utilizacion
        }));

        setTrendsData(chartData);
        console.log(`✅ Loaded trends for ${selectedPlaza}:`, chartData);
      } catch (error) {
        console.error(`❌ Error loading trends for ${selectedPlaza}:`, error);
        setTrendsError(error instanceof Error ? error.message : 'Error desconocido');

        // Fallback to generated data
        const fallbackData = generateFallbackData(selectedPlaza);
        setTrendsData(fallbackData);
      } finally {
        setTrendsLoading(false);
      }
    };

    fetchTrends();
  }, [selectedPlaza]);

  // Generate fallback data if API fails
  const generateFallbackData = (plaza: string) => {
    const plazaSeeds: Record<string, number> = {
      'Laredo': 1,
      'Saltillo': 2,
      'CDMX': 3,
      'Monterrey': 4
    };

    const seed = plazaSeeds[plaza] || 1;
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const name = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

      // Generate different patterns for each plaza
      const variation = Math.sin((i + seed) * 0.8) * 20 + (seed * 5);
      const baseUtilization = 50 + (seed * 10);
      const utilizacion = Math.max(20, Math.min(90, baseUtilization + variation));

      data.push({
        name,
        utilizacion: Math.round(utilizacion)
      });
    }

    return data;
  };

  if (loading || trendsLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!selectedPlaza) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tendencias de Utilización</h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">Seleccione una plaza para ver las tendencias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Tendencias de Utilización - {selectedPlaza}
        </h2>
        {trendsError && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Datos simulados
          </span>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendsData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value: any) => [`${value}%`, 'Utilización']} />
            <Line
              type="monotone"
              dataKey="utilizacion"
              stroke="#3b82f6"
              activeDot={{ r: 8 }}
              name="Utilización"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TendenciasUtilizacion;
