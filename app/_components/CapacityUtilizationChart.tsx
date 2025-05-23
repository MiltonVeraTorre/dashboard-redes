'use client';

import React from 'react';
import useSWR from 'swr';
import { fetchCapacityUtilizationByPlaza } from '@/lib/services/network-service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CapacityUtilizationChartProps {
  // Optional props can be added here if needed
}

export function CapacityUtilizationChart({}: CapacityUtilizationChartProps) {
  // Use SWR for data fetching with automatic revalidation
  const { data, error, isLoading } = useSWR(
    'capacityUtilizationByPlaza',
    fetchCapacityUtilizationByPlaza,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      dedupingInterval: 5000,
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error.message || 'Failed to load capacity utilization data. Please try again later.'}</p>
      </div>
    );
  }

  if (!data || data.plazas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No capacity utilization data available.</p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.plazas.map((plaza, index) => ({
    location: plaza,
    percentage: data.utilization[index]
  }));

  // Get status color
  const getUtilizationBarColor = (percentage: number) => {
    if (percentage >= 80) return '#ef4444'; // red-500
    if (percentage >= 60) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 60,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            dataKey="location"
            type="category"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Utilización']}
          />
          <Bar dataKey="percentage" name="Capacidad Utilizada">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getUtilizationBarColor(entry.percentage)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
