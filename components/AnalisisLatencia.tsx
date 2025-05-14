'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalisisLatencia: React.FC = () => {
  // Mock data for the charts
  const backboneData = [
    { name: 'Ene', latencia: 5 },
    { name: 'Feb', latencia: 4 },
    { name: 'Mar', latencia: 6 },
    { name: 'Abr', latencia: 8 },
    { name: 'May', latencia: 7 },
    { name: 'Jun', latencia: 9 },
    { name: 'Jul', latencia: 8 },
  ];

  const distribucionData = [
    { name: 'Ene', latencia: 15 },
    { name: 'Feb', latencia: 14 },
    { name: 'Mar', latencia: 16 },
    { name: 'Abr', latencia: 18 },
    { name: 'May', latencia: 17 },
    { name: 'Jun', latencia: 19 },
    { name: 'Jul', latencia: 18 },
  ];

  const accesoData = [
    { name: 'Ene', latencia: 25 },
    { name: 'Feb', latencia: 24 },
    { name: 'Mar', latencia: 26 },
    { name: 'Abr', latencia: 28 },
    { name: 'May', latencia: 27 },
    { name: 'Jun', latencia: 29 },
    { name: 'Jul', latencia: 28 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Latencia</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Backbone</h3>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={backboneData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} />
                <YAxis domain={[0, 10]} hide />
                <Line 
                  type="monotone" 
                  dataKey="latencia" 
                  stroke="#3b82f6" 
                  dot={false}
                  name="Latencia"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Distribución</h3>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={distribucionData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} />
                <YAxis domain={[10, 20]} hide />
                <Line 
                  type="monotone" 
                  dataKey="latencia" 
                  stroke="#8b5cf6" 
                  dot={false}
                  name="Latencia"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Acceso</h3>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={accesoData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} />
                <YAxis domain={[20, 30]} hide />
                <Line 
                  type="monotone" 
                  dataKey="latencia" 
                  stroke="#ef4444" 
                  dot={false}
                  name="Latencia"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalisisLatencia;
