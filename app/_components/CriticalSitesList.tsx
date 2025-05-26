'use client';

import React from 'react';
import useSWR from 'swr';
import { fetchCriticalSites } from '@/lib/services/network-service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RankedSite {
  id: string;
  name: string;
  plaza: string;
  utilizationPercentage: number;
  criticalLinks: number;
  totalLinks: number;
}

export function CriticalSitesList() {
  // Use SWR for data fetching with automatic revalidation
  const { data: sites, error, isLoading } = useSWR<RankedSite[]>(
    'criticalSites',
    async () => {
      const result = await fetchCriticalSites(5);
      return result as RankedSite[];
    },
    {
      refreshInterval: 60000, // Refresh every minute
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
        <p>{error.message || 'Failed to load critical sites. Please try again later.'}</p>
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No critical sites found.</p>
      </div>
    );
  }

  // Get status color based on percentage
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444'; // red-500
    if (percentage >= 70) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  // Get status icon based on percentage
  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return '🔴';
    if (percentage >= 70) return '🟡';
    return '🟢';
  };

  // Transform data for the chart
  const chartData = sites.map(site => ({
    id: site.id,
    name: site.name,
    percentage: Math.round(site.utilizationPercentage)
  }));

  return (
    <div>
      {/* Header with tabs */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Más Saturados</span>
          <span className="text-gray-400">En Riesgo</span>
        </div>
        <div className="h-px bg-gray-200 w-full"></div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{
              top: 5,
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
              dataKey="id"
              type="category"
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Utilización']}
            />
            <Bar dataKey="percentage" name="Utilización">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getStatusColor(entry.percentage)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* List of sites with progress bars */}
      <div className="space-y-4">
        {sites.map((site) => (
          <div key={site.id} className="flex items-center justify-between">
            <div className="w-1/3 flex items-center">
              <span className="mr-2">{getStatusIcon(site.utilizationPercentage)}</span>
              <span className="text-sm font-medium text-gray-700">{site.id}</span>
            </div>
            <div className="w-1/6 text-right">
              <span className="text-sm font-medium text-gray-700">{Math.round(site.utilizationPercentage)}%</span>
            </div>
            <div className="w-1/3 ml-4">
              <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${Math.round(site.utilizationPercentage)}%`,
                    height: '100%',
                    backgroundColor: getStatusColor(site.utilizationPercentage),
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
