'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCachedFetch, clearCache } from '@/lib/hooks/useCachedFetch';
import { cacheManager } from '@/lib/services/cache-manager';
import CacheIndicator from '@/components/CacheIndicator';

interface PortAlert {
  alert_id: string;
  entity_id: string;
  device_id: string;
  hostname: string;
  alert_message: string;
  alert_status: string;
  severity: string;
  timestamp: string;
}

const ITEMS_PER_PAGE = 10;

const CapacityAlertsTable: React.FC<{ alerts: PortAlert[]; currentPage: number; onPageChange: (page: number) => void }> = ({ alerts, currentPage, onPageChange }) => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAlerts = alerts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(alerts.length / ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Alertas Activas de Capacidad</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Puerto</th>
              <th className="px-4 py-3">Mensaje</th>
              <th className="px-4 py-3">Severidad</th>
            </tr>
          </thead>
          <tbody>
            {currentAlerts.map((alert) => (
              <tr key={alert.alert_id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{alert.entity_id}</td>
                <td className="px-4 py-2">{alert.alert_message}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold
                      ${alert.severity.toLowerCase() === 'crit' ? 'bg-red-100 text-red-700' : ''}
                      ${alert.severity.toLowerCase() === 'warn' ? 'bg-yellow-100 text-yellow-800' : ''}`}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 overflow-x-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                className={`px-3 py-1 border rounded-md text-sm ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CapacityAlertsPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
    isCached,
    cacheTimeRemaining,
  } = useCachedFetch<{ alerts: PortAlert[] }>('/api/monitoring/port-alerts', {
    ttl: 2 * 60 * 1000,
    enabled: true,
  });

  const handleManualRefresh = useCallback(() => {
    clearCache('/api/monitoring/port-alerts');
    refetch();
  }, [refetch]);

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas por Umbral de Capacidad</h1>
          <p className="text-gray-600">Monitoreo de saturación en puertos observados por SNMP</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <CacheIndicator
            isCached={isCached}
            cacheTimeRemaining={cacheTimeRemaining}
            lastUpdated={lastUpdated}
            onClearCache={handleManualRefresh}
          />
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-center">Error al cargar datos: {String(error)}</p>}

      <CapacityAlertsTable
        alerts={data?.alerts || []}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}