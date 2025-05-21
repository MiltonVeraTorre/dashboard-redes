'use client';

import { Plaza } from '@/lib/domain/entities';

interface PlazaUtilizationChartProps {
  utilizationByPlaza: Record<Plaza, number>;
}

export function PlazaUtilizationChart({ utilizationByPlaza }: PlazaUtilizationChartProps) {
  // In a real implementation, this would use a charting library like Recharts
  // For now, we'll just display a simple representation

  // Get status color
  const getUtilizationBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      {Object.entries(utilizationByPlaza).map(([plaza, utilization]) => (
        <div key={plaza} className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{plaza}</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(utilization)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getUtilizationBarColor(utilization)}`}
              style={{ width: `${utilization}%` }}
            ></div>
          </div>
        </div>
      ))}

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>
          Note: In a production environment, this would be implemented with a proper charting library
          like Recharts to display a more interactive and visually appealing chart.
        </p>
      </div>
    </div>
  );
}
