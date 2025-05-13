'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const CriticalSitesCard: React.FC = () => {
  // Mock data for critical sites
  const criticalSites = [
    { id: 'CDMX-Norte-01', percentage: 95, status: 'critical' },
    { id: 'MTY-Centro-03', percentage: 86, status: 'warning' },
    { id: 'QRO-Terras-04', percentage: 78, status: 'warning' },
    { id: 'GDL-Sur-02', percentage: 72, status: 'warning' },
    { id: 'CDMX-Sur-06', percentage: 68, status: 'normal' }
  ];

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444'; // red-500
    if (percentage >= 70) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 mr-2" />;
    if (percentage >= 70) return <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2" />;
    return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Sitios Críticos</h2>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Más Saturados</span>
          <span>En Riesgo</span>
        </div>
        <div className="h-px bg-gray-200 w-full"></div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={criticalSites}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="id" type="category" width={100} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="percentage" name="Utilización">
              {criticalSites.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {criticalSites.map((site) => (
          <div key={site.id} className="flex items-center justify-between">
            <div className="w-1/3 flex items-center">
              {getStatusIcon(site.percentage)}
              <span className="text-sm font-medium text-gray-700">{site.id}</span>
            </div>
            <div className="w-1/6 text-right">
              <span className="text-sm font-medium text-gray-700">{site.percentage}%</span>
            </div>
            <div className="w-1/3 ml-4">
              <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${site.percentage}%`,
                    height: '100%',
                    backgroundColor: getStatusColor(site.percentage),
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
};

export default CriticalSitesCard;
