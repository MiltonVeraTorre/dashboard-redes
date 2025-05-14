'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TendenciasUtilizacion: React.FC = () => {
  // Mock data for the chart
  const data = [
    { name: 'Ene', utilizacion: 65 },
    { name: 'Feb', utilizacion: 59 },
    { name: 'Mar', utilizacion: 80 },
    { name: 'Abr', utilizacion: 81 },
    { name: 'May', utilizacion: 56 },
    { name: 'Jun', utilizacion: 55 },
    { name: 'Jul', utilizacion: 40 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Tendencias de Utilización</h2>
      
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
            <Line 
              type="monotone" 
              dataKey="utilizacion" 
              stroke="#3b82f6" 
              activeDot={{ r: 8 }} 
              name="Utilización"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TendenciasUtilizacion;
