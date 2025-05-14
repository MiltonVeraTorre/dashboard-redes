'use client';

import React, { useState } from 'react';

interface Enlace {
  id: number;
  plaza: string;
  nodo: string;
  tipo: string;
  capacidad: string;
  utilizacion: number;
  latencia: string;
  estado: 'Crítico' | 'Mayor' | 'Menor' | 'Normal';
}

const EnlacesTable: React.FC = () => {
  // Mock data for the table
  const enlaces: Enlace[] = [
    { id: 1, plaza: 'CDMX-Norte', nodo: 'Nodo', tipo: 'Backbone', capacidad: '80%', utilizacion: 80, latencia: 'Crítico', estado: 'Crítico' },
    { id: 2, plaza: 'MTY-Centro', nodo: 'Centro-0', tipo: 'Acceso', capacidad: '10 ms', utilizacion: 60, latencia: 'Mayor', estado: 'Mayor' },
    { id: 3, plaza: 'MTY-Cer-0', nodo: 'Vil-Esc-0', tipo: 'Acceso', capacidad: '16 ms', utilizacion: 75, latencia: 'Crítico', estado: 'Menor' },
    { id: 4, plaza: 'MTY-Oeste', nodo: 'Acceso', tipo: 'Backbone', capacidad: '200 Mbps', utilizacion: 95, latencia: 'Crítico', estado: 'Crítico' },
    { id: 5, plaza: 'MTY-Oeste', nodo: 'Acceso', tipo: 'Crítico', capacidad: '95%', utilizacion: 95, latencia: 'Mayor', estado: 'Crítico' },
    { id: 6, plaza: 'GDL-Sur-01', nodo: 'Mayor', tipo: 'Menor', capacidad: '2 ms', utilizacion: 40, latencia: 'Menor', estado: 'Normal' },
    { id: 7, plaza: 'CDMX-Oeste', nodo: 'Crítico', tipo: 'Normal', capacidad: '3 ms', utilizacion: 30, latencia: 'Normal', estado: 'Normal' },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(enlaces.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = enlaces.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Crítico':
        return 'text-red-600 bg-red-100';
      case 'Mayor':
        return 'text-yellow-600 bg-yellow-100';
      case 'Menor':
        return 'text-orange-600 bg-orange-100';
      case 'Normal':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUtilizationBar = (utilizacion: number) => {
    let color = 'bg-gray-500';
    
    if (utilizacion >= 90) {
      color = 'bg-red-500';
    } else if (utilizacion >= 70) {
      color = 'bg-yellow-500';
    } else if (utilizacion >= 50) {
      color = 'bg-orange-500';
    } else {
      color = 'bg-green-500';
    }
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${utilizacion}%` }}></div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Detalles Técnicos de Enlaces</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plaza
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nodo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacidad
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilización
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latencia
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((enlace) => (
              <tr key={enlace.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enlace.plaza}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enlace.nodo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enlace.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enlace.capacidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getUtilizationBar(enlace.utilizacion)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enlace.latencia}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(enlace.estado)}`}>
                    {enlace.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando {startIndex + 1} a {Math.min(endIndex, enlaces.length)} de {enlaces.length} enlaces
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnlacesTable;
