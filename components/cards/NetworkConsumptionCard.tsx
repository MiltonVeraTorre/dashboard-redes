'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const NetworkConsumptionCard: React.FC = () => {
  // Mock data for the chart
  const data = [
    { name: 'Ene', cdmx: 10, monterrey: 5, guadalajara: 0 },
    { name: 'Feb', cdmx: 15, monterrey: 10, guadalajara: 5 },
    { name: 'Mar', cdmx: 20, monterrey: 15, guadalajara: 10 },
    { name: 'Abr', cdmx: 25, monterrey: 20, guadalajara: 15 },
    { name: 'May', cdmx: 30, monterrey: 25, guadalajara: 20 },
    { name: 'Jun', cdmx: 35, monterrey: 30, guadalajara: 25 },
    { name: 'Jul', cdmx: 40, monterrey: 35, guadalajara: 30 },
    { name: 'Ago', cdmx: 45, monterrey: 40, guadalajara: 35 }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Consumo de Red por Plaza</h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cdmx" stroke="rgba(59, 130, 246, 0.8)" activeDot={{ r: 8 }} name="CDMX" />
            <Line type="monotone" dataKey="monterrey" stroke="rgba(16, 185, 129, 0.8)" name="Monterrey" />
            <Line type="monotone" dataKey="guadalajara" stroke="rgba(249, 115, 22, 0.8)" name="Guadalajara" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworkConsumptionCard;
