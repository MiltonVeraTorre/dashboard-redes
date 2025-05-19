'use client';

import React, { useEffect, useState } from 'react';
import { generateHistoricalData } from '@/lib/repositories/mocks/data';

interface LinkUtilizationChartProps {
  linkId: string;
}

interface DataPoint {
  date: string;
  utilization: number;
}

export function LinkUtilizationChart({ linkId }: LinkUtilizationChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  
  useEffect(() => {
    // In a real implementation, this would fetch data from an API
    // For now, we'll use the mock data generator
    const historicalData = generateHistoricalData(linkId);
    setData(historicalData);
  }, [linkId]);
  
  // In a real implementation, this would use a charting library like Recharts
  // For now, we'll just display a simple representation
  
  // Get status color
  const getUtilizationBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div>
      <div className="grid grid-cols-7 gap-4">
        {data.map((point, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="h-40 w-full bg-gray-100 rounded relative">
              <div
                className={`absolute bottom-0 w-full ${getUtilizationBarColor(point.utilization)}`}
                style={{ height: `${point.utilization}%` }}
              ></div>
            </div>
            <span className="mt-2 text-xs text-gray-500">{point.date}</span>
            <span className="text-sm font-medium">{point.utilization}%</span>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>
          Note: In a production environment, this would be implemented with a proper charting library
          like Recharts to display a more interactive and visually appealing chart.
        </p>
      </div>
    </div>
  );
}
