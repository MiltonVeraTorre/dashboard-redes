'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CapacityUsageCard: React.FC = () => {
  // Mock data for the chart
  const capacityData = [
    { location: 'CDMX', percentage: 75 },
    { location: 'Monterrey', percentage: 68 },
    { location: 'Querétaro', percentage: 62 },
    { location: 'Miami', percentage: 55 }
  ];

  const colors = ['#3b82f6', '#4f46e5', '#8b5cf6', '#6366f1'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Capacidad Utilizada</h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={capacityData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="percentage" name="Capacidad Utilizada">
              {capacityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CapacityUsageCard;
