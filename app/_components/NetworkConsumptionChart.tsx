'use client';

import React from 'react';
import useSWR from 'swr';
import { Plaza } from '@/lib/domain/entities';
import { fetchNetworkConsumptionByPlaza } from '@/lib/services/network-service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface NetworkConsumptionChartProps {
  // Optional props can be added here if needed
}

export function NetworkConsumptionChart({}: NetworkConsumptionChartProps) {
  // Use SWR for data fetching with automatic revalidation
  const { data, error, isLoading } = useSWR(
    'networkConsumptionByPlaza',
    fetchNetworkConsumptionByPlaza,
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
        <p>{error.message || 'Failed to load network consumption data. Please try again later.'}</p>
      </div>
    );
  }

  if (!data || data.plazas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No consumption data available.</p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.data[0].timestamps.map((timestamp, index) => {
    const dataPoint: any = { name: timestamp };

    // Add values for each plaza
    data.data.forEach(plazaData => {
      dataPoint[plazaData.plaza] = plazaData.values[index];
    });

    return dataPoint;
  });

  // Generate colors for each plaza
  const colors = [
    'rgba(59, 130, 246, 0.8)', // blue
    'rgba(16, 185, 129, 0.8)', // green
    'rgba(249, 115, 22, 0.8)', // orange
    'rgba(139, 92, 246, 0.8)', // purple
    'rgba(236, 72, 153, 0.8)'  // pink
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              // Format date to show only month and day
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis hide={true} />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Consumo']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString();
            }}
          />
          <Legend />
          {data.data.map((plazaData, index) => (
            <Line
              key={plazaData.plaza}
              type="monotone"
              dataKey={plazaData.plaza}
              stroke={colors[index % colors.length]}
              activeDot={{ r: 8 }}
              dot={{ r: 4 }}
              name={plazaData.plaza}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
