'use client';

import React from 'react';
import useSWR from 'swr';
import { fetchGrowthTrends } from '@/lib/services/network-service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GrowthTrendsChartProps {
  // Optional props can be added here if needed
}

export function GrowthTrendsChart({}: GrowthTrendsChartProps) {
  // Use SWR for data fetching with automatic revalidation
  const { data, error, isLoading } = useSWR(
    'growthTrends',
    fetchGrowthTrends,
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
        <p>{error.message || 'Failed to load growth trends data. Please try again later.'}</p>
      </div>
    );
  }

  if (!data || data.months.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No growth trends data available.</p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.months.map((month, index) => ({
    name: month,
    growth: data.values[index]
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            hide={true}
            domain={[0, 'dataMax + 10']}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Crecimiento']}
          />
          <Line
            type="monotone"
            dataKey="growth"
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth={2}
            dot={{ r: 4, fill: 'rgba(59, 130, 246, 0.8)' }}
            activeDot={{ r: 8 }}
            name="Crecimiento"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
