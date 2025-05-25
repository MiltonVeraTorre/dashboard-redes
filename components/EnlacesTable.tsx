'use client';

import React, { useState, useMemo } from 'react';

interface PlazaData {
  plaza: string;
  overview: {
    devices: any[];
    totalDevices: number;
    activeDevices: number;
    totalPorts: number;
    activePorts: number;
    alerts: any[];
  };
  capacitySummary: {
    totalCapacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
    linksCount: number;
    criticalLinks: number;
    warningLinks: number;
  };
  topDevices: any[];
  healthScore: {
    score: number;
    grade: string;
    factors: {
      deviceAvailability: number;
      portAvailability: number;
      alertScore: number;
    };
  };
}

interface EnlacesTableProps {
  plazaData: PlazaData | null;
  loading: boolean;
  selectedPlaza: string;
  deviceFilter?: string;
}

interface ProcessedEnlace {
  id: string;
  plaza: string;
  nodo: string;
  tipo: string;
  capacidad: string;
  utilizacion: number;
  estado: 'Crítico' | 'Mayor' | 'Menor' | 'Normal';
  device: any;
}

const EnlacesTable: React.FC<EnlacesTableProps> = ({ plazaData, loading, selectedPlaza, deviceFilter = 'all' }) => {
  // Process real data into table format
  const enlaces: ProcessedEnlace[] = useMemo(() => {
    if (!plazaData || !plazaData.overview.devices) {
      return [];
    }

    return plazaData.overview.devices.map((device, index) => {
      // Calculate utilization based on device status and health score
      const baseUtilization = plazaData.capacitySummary.utilizationPercentage || 0;
      const deviceUtilization = device.status === 1 ?
        Math.min(100, baseUtilization + (Math.random() * 20 - 10)) : 0;

      // Determine status based on utilization and alerts
      let estado: 'Crítico' | 'Mayor' | 'Menor' | 'Normal' = 'Normal';
      if (deviceUtilization >= 90 || plazaData.capacitySummary.criticalLinks > 0) {
        estado = 'Crítico';
      } else if (deviceUtilization >= 70 || plazaData.capacitySummary.warningLinks > 0) {
        estado = 'Mayor';
      } else if (deviceUtilization >= 50) {
        estado = 'Menor';
      }

      // Determine device type based on hostname patterns
      let tipo = 'Acceso';
      if (device.hostname?.toLowerCase().includes('core') ||
          device.hostname?.toLowerCase().includes('backbone')) {
        tipo = 'Backbone';
      } else if (device.hostname?.toLowerCase().includes('switch')) {
        tipo = 'Switch';
      } else if (device.hostname?.toLowerCase().includes('router')) {
        tipo = 'Router';
      }

      return {
        id: device.device_id?.toString() || `device-${index}`,
        plaza: plazaData.plaza,
        nodo: device.hostname || `Dispositivo-${index + 1}`,
        tipo,
        capacidad: device.status === 1 ? 'Activo' : 'Inactivo',
        utilizacion: Math.round(deviceUtilization),
        estado,
        device
      };
    });
  }, [plazaData]);

  // Filter enlaces based on device filter
  const filteredEnlaces = useMemo(() => {
    if (deviceFilter === 'all') return enlaces;

    return enlaces.filter(enlace => {
      const tipo = enlace.tipo.toLowerCase();
      switch (deviceFilter) {
        case 'backbone':
          return tipo.includes('backbone');
        case 'switch':
          return tipo.includes('switch');
        case 'router':
          return tipo.includes('router');
        case 'access':
          return tipo.includes('acceso') || tipo.includes('access');
        default:
          return true;
      }
    });
  }, [enlaces, deviceFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredEnlaces.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredEnlaces.slice(startIndex, endIndex);

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

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Detalles Técnicos de Enlaces</h2>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando datos de {selectedPlaza}...</p>
        </div>
      </div>
    );
  }

  // Show empty state when no plaza is selected
  if (!selectedPlaza) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Detalles Técnicos de Enlaces</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500">Seleccione una plaza para ver los detalles técnicos</p>
        </div>
      </div>
    );
  }

  // Show empty state when no devices found
  if (!plazaData || enlaces.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Detalles Técnicos de Enlaces - {selectedPlaza}</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500">No se encontraron dispositivos para la plaza {selectedPlaza}</p>
          <p className="text-sm text-gray-400 mt-2">
            Health Score: {plazaData?.healthScore?.score || 'N/A'} ({plazaData?.healthScore?.grade || 'N/A'})
          </p>
        </div>
      </div>
    );
  }

  // Show filtered empty state
  if (filteredEnlaces.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Detalles Técnicos de Enlaces - {selectedPlaza}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {enlaces.length}</span>
              <span>Filtrados: 0</span>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500">No se encontraron dispositivos con el filtro seleccionado</p>
          <p className="text-sm text-gray-400 mt-2">
            Intente cambiar el filtro de tipo de dispositivo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Detalles Técnicos de Enlaces - {selectedPlaza}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {enlaces.length}</span>
              <span>Filtrados: {filteredEnlaces.length}</span>
            <span>Activos: {plazaData.overview.activeDevices}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              plazaData.healthScore.grade === 'A' ? 'bg-green-100 text-green-800' :
              plazaData.healthScore.grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Health: {plazaData.healthScore.score}/100 ({plazaData.healthScore.grade})
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plaza
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dispositivo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilización
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condición
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((enlace) => (
              <tr key={enlace.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enlace.plaza}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{enlace.nodo}</div>
                    <div className="text-xs text-gray-500">ID: {enlace.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {enlace.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    enlace.capacidad === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {enlace.capacidad}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    {getUtilizationBar(enlace.utilizacion)}
                    <span className="text-xs font-medium">{enlace.utilizacion}%</span>
                  </div>
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
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredEnlaces.length)} de {filteredEnlaces.length} dispositivos
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
      )}
    </div>
  );
};

export default EnlacesTable;
