'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GrowthTrendsCard: React.FC = () => {
  // Mock data for the chart
  const data = [
    { name: 'Mar', growth: 20 },
    { name: 'Abr', growth: 35 },
    { name: 'May', growth: 55 },
    { name: 'Jun', growth: 75 }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Tendencias de Crecimiento</h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `${value}%`} />
            <Area
              type="monotone"
              dataKey="growth"
              stroke="rgba(59, 130, 246, 0.8)"
              fill="rgba(59, 130, 246, 0.2)"
              name="Crecimiento"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GrowthTrendsCard;
