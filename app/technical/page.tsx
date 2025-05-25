'use client';
import React, { useState, useEffect } from 'react';
import EnlacesTable from '@/components/EnlacesTable';
import PlazaCapacityOverview from '@/components/PlazaCapacityOverview';
import PlazaCapacityDashboard from '@/components/PlazaCapacityDashboard';
import CriticalAlertsPanel from '@/components/CriticalAlertsPanel';
import TendenciasUtilizacion from '@/components/TendenciasUtilizacion';
import AnalisisLatencia from '@/components/AnalisisLatencia';

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
            onChange={(e) => onPlazaChange(e.target.value)}
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
  const [loading, setLoading] = useState<boolean>(false);
  const [plazaData, setPlazaData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  // Fetch plaza data function
  const fetchPlazaData = async (showLoading = true) => {
    if (!selectedPlaza) return;

    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/monitoring/plaza/${selectedPlaza}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPlazaData(data);
      setLastUpdated(new Date());
      console.log(`✅ Datos cargados para plaza ${selectedPlaza}:`, data);
    } catch (err) {
      console.error(`❌ Error cargando datos para plaza ${selectedPlaza}:`, err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch plaza data when plaza is selected
  useEffect(() => {
    if (!selectedPlaza) {
      setPlazaData(null);
      setLastUpdated(null);
      return;
    }

    fetchPlazaData();
  }, [selectedPlaza]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !selectedPlaza) return;

    const interval = setInterval(() => {
      fetchPlazaData(false); // Don't show loading spinner for auto-refresh
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedPlaza]);

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
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}

            {/* Auto-refresh Toggle */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
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
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
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
              onClick={() => fetchPlazaData()}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

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
                onChange={(e) => setDeviceFilter(e.target.value)}
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
    </div>

  );
}
