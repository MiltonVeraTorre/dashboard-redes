'use client';
import React, { useState, useCallback } from 'react';
import EnlacesTable from '@/components/EnlacesTable';
import PlazaCapacityOverview from '@/components/PlazaCapacityOverview';
import PlazaCapacityDashboard from '@/components/PlazaCapacityDashboard';
import CriticalAlertsPanel from '@/components/CriticalAlertsPanel';
import TendenciasUtilizacion from '@/components/TendenciasUtilizacion';
import AnalisisLatencia from '@/components/AnalisisLatencia';
import CacheIndicator from '@/components/CacheIndicator';
import CacheSettings from '@/components/CacheSettings';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { useCachedFetch, clearCache } from '@/lib/hooks/useCachedFetch';
import { cacheManager } from '@/lib/services/cache-manager';

// Define types for plaza data
interface Device {
  device_id: string;
  hostname: string;
  type: string;
  status: string;
  utilization?: number;
  latency?: number;
}

interface Alert {
  id: string;
  device_id: string;
  alert_message: string;
  entity_type: string;
  alert_status: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

interface PlazaData {
  plaza: string;
  overview: {
    devices: Device[];
    totalDevices: number;
    activeDevices: number;
    totalPorts: number;
    activePorts: number;
    alerts: Alert[];
  };
  capacitySummary: {
    totalCapacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
    linksCount: number;
    criticalLinks: number;
    warningLinks: number;
  };
  topDevices: Device[];
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

// Plaza selector component
const PlazaSelector: React.FC<{
  selectedPlaza: string;
  onPlazaChange: (plaza: string) => void;
  loading: boolean;
}> = ({ selectedPlaza, onPlazaChange, loading }) => {
  const plazas = ['Laredo', 'Saltillo', 'CDMX', 'Monterrey'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="space-y-2">
        <label htmlFor="plaza-select" className="block text-sm font-medium text-gray-900">
          Seleccionar Plaza
        </label>
        <div className="flex items-center space-x-3">
          <select
            id="plaza-select"
            value={selectedPlaza}
            onChange={(e: { target: { value: string } }) => onPlazaChange(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 disabled:bg-gray-50 bg-white"
          >
            <option value="" className="text-gray-500">Seleccione una plaza...</option>
            {plazas.map((plaza) => (
              <option key={plaza} value={plaza} className="text-gray-900 font-medium">
                {plaza}
              </option>
            ))}
          </select>
          {loading && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span className="font-medium">Cargando...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TechnicalPage() {
  const [selectedPlaza, setSelectedPlaza] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [showCacheSettings, setShowCacheSettings] = useState<boolean>(false);

  // Use cached fetch hook for plaza data
  const {
    data: plazaData,
    loading,
    error,
    refetch,
    lastUpdated,
    isCached,
    cacheTimeRemaining
  } = useCachedFetch<PlazaData>(
    selectedPlaza ? `/api/monitoring/plaza/${encodeURIComponent(selectedPlaza)}` : '',
    {
      ttl: 2 * 60 * 1000, // 2 minutes cache
      refreshInterval: autoRefresh ? refreshInterval * 1000 : undefined,
      enabled: !!selectedPlaza,
      onSuccess: (data) => {
        console.log(`✅ Datos cargados para plaza ${selectedPlaza}:`, data);
      },
      onError: (err) => {
        console.error(`❌ Error cargando datos para plaza ${selectedPlaza}:`, err);
      }
    }
  );

  // Manual refresh function using the cached fetch refetch
  const handleManualRefresh = useCallback(() => {
    if (selectedPlaza) {
      // Clear cache for this plaza using cache manager
      cacheManager.invalidatePlaza(selectedPlaza);
      refetch();
    }
  }, [selectedPlaza, refetch]);

  // Clear specific cache function
  const handleClearCache = useCallback(() => {
    if (selectedPlaza) {
      clearCache(`/api/monitoring/plaza/${encodeURIComponent(selectedPlaza)}`);
      refetch();
    }
  }, [selectedPlaza, refetch]);

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitoreo Técnico</h1>
            <p className="text-gray-600">Capacidad de red, utilización y salud de dispositivos</p>
          </div>

          {/* Controls */}
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <CacheIndicator
              isCached={isCached}
              cacheTimeRemaining={cacheTimeRemaining}
              lastUpdated={lastUpdated}
              onClearCache={handleClearCache}
            />

            {/* Auto-refresh Toggle */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e: { target: { checked: boolean } }) => setAutoRefresh(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-2 text-sm text-gray-700">Auto</span>
            </label>

            {/* Refresh Interval */}
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e: { target: { value: string } }) => setRefreshInterval(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Actualizar</span>
            </button>

            {/* Cache Settings Button */}
            <button
              onClick={() => setShowCacheSettings(true)}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm transition-colors"
              title="Configuración de caché"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>Caché</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {selectedPlaza && (
        <div className="mb-6">
          <ExecutiveSummary plaza={selectedPlaza} refreshInterval={30} />
        </div>
      )}

      {/* Plaza Selector with Device Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PlazaSelector
          selectedPlaza={selectedPlaza}
          onPlazaChange={setSelectedPlaza}
          loading={loading}
        />

        {/* Device Filter */}
        {selectedPlaza && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-2">
              <label htmlFor="device-filter" className="block text-sm font-medium text-gray-900">
                Filtrar por Tipo
              </label>
              <select
                id="device-filter"
                value={deviceFilter}
                onChange={(e: { target: { value: string } }) => setDeviceFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 bg-white"
              >
                <option value="all" className="text-gray-900 font-medium">Todos los Dispositivos</option>
                <option value="backbone" className="text-gray-900 font-medium">Backbone</option>
                <option value="switch" className="text-gray-900 font-medium">Switches</option>
                <option value="router" className="text-gray-900 font-medium">Routers</option>
                <option value="access" className="text-gray-900 font-medium">Access Points</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error al cargar datos:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Plaza Capacity Overview */}
      <PlazaCapacityOverview
        plazaData={plazaData}
        loading={loading}
        selectedPlaza={selectedPlaza}
      />

      {/* Plaza Capacity Dashboard */}
      <PlazaCapacityDashboard
        plazaData={plazaData}
        loading={loading}
        selectedPlaza={selectedPlaza}
      />

      {/* Critical Alerts and Enlaces Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-1">
          <CriticalAlertsPanel
            plazaData={plazaData}
            loading={loading}
            selectedPlaza={selectedPlaza}
          />
        </div>
        <div className="xl:col-span-2">
          <EnlacesTable
            plazaData={plazaData}
            loading={loading}
            selectedPlaza={selectedPlaza}
            deviceFilter={deviceFilter}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TendenciasUtilizacion
          plazaData={plazaData}
          loading={loading}
          selectedPlaza={selectedPlaza}
        />
        <AnalisisLatencia
          plazaData={plazaData}
          loading={loading}
          selectedPlaza={selectedPlaza}
        />
      </div>

      {/* Cache Settings Modal */}
      <CacheSettings
        isOpen={showCacheSettings}
        onClose={() => setShowCacheSettings(false)}
      />
    </div>

  );
}
