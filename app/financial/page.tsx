'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCachedFetch, clearCache } from '@/lib/hooks/useCachedFetch';
import CacheIndicator from '@/components/CacheIndicator';
import CacheSettings from '@/components/CacheSettings';
import { FinancialExecutiveSummary } from '@/components/FinancialExecutiveSummary';
import { XCIENOperationalDashboard } from '@/components/XCIENOperationalDashboard';

interface FinancialData {
  summary: {
    totalMonthlyCost: number;
    averageUtilization: number;
    potentialSavings: number;
    optimizableContracts: number;
    costPerMbps: number;
    currency: string;
    period?: string;
    periodLabel?: string;
  };
  carrierAnalysis: Array<{
    carrier: string;
    monthlyCost: number;
    contractedMbps: number;
    utilizedMbps: number;
    utilizationPercentage: number;
    costPerMbps: number;
    status: 'efficient' | 'attention' | 'critical';
    potentialSaving: number;
  }>;
  plazaBreakdown: Array<{
    plaza: string;
    monthlyCost: number;
    carriers: number;
    totalMbps: number;
    utilizedMbps: number;
    efficiency: number;
    optimizationOpportunities: number;
  }>;
  optimizationOpportunities: Array<{
    id: string;
    type: 'cancellation' | 'renegotiation' | 'upgrade';
    carrier: string;
    plaza: string;
    description: string;
    currentCost: number;
    potentialSaving: number;
    priority: 'high' | 'medium' | 'low';
    utilizationRate: number;
  }>;
  timestamp: string;
}

// Enhanced Period selector component with granular time ranges
const PeriodSelector: React.FC<{
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  loading: boolean;
}> = ({ selectedPeriod, onPeriodChange, loading }) => {
  const periods = [
    {
      value: '1d',
      label: '1 día',
      icon: '📅',
      description: 'Últimas 24 horas',
      category: 'recent'
    },
    {
      value: '3d',
      label: '3 días',
      icon: '📊',
      description: 'Últimos 3 días',
      category: 'recent'
    },
    {
      value: '1w',
      label: '1 semana',
      icon: '📈',
      description: 'Últimos 7 días',
      category: 'recent'
    },
    {
      value: '1m',
      label: '1 mes',
      icon: '📋',
      description: 'Últimos 30 días',
      category: 'standard'
    },
    {
      value: '3m',
      label: '3 meses',
      icon: '📊',
      description: 'Último trimestre',
      category: 'standard'
    },
    {
      value: '6m',
      label: '6 meses',
      icon: '📈',
      description: 'Último semestre',
      category: 'extended'
    },
    {
      value: '1y',
      label: '1 año',
      icon: '📆',
      description: 'Últimos 12 meses',
      category: 'extended'
    }
  ];

  const selectedPeriodData = periods.find(p => p.value === selectedPeriod);

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-semibold text-gray-700">Período de Análisis:</label>
      <div className="relative">
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 pr-12 text-base font-medium text-gray-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed sm:text-lg"
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.icon} {period.label} - {period.description}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Period description */}
      {selectedPeriodData && (
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{selectedPeriodData.icon}</span>
            <span className="font-medium">{selectedPeriodData.description}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
              selectedPeriodData.category === 'recent' ? 'bg-green-100 text-green-700' :
              selectedPeriodData.category === 'standard' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {selectedPeriodData.category === 'recent' ? 'Tiempo Real' :
               selectedPeriodData.category === 'standard' ? 'Estándar' : 'Histórico'}
            </span>
            <span className="text-xs text-gray-500">
              Cache: {selectedPeriodData.category === 'recent' ? '5-15min' :
                     selectedPeriodData.category === 'standard' ? '30-60min' : '1-2h'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function FinancialDashboard() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes default
  const [showCacheSettings, setShowCacheSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'financial' | 'operational'>('financial');

  // Navigation cleanup effect
  useEffect(() => {
    // Ensure no blocking elements on mount
    const clearBlockingElements = () => {
      // Remove any stuck modal overlays
      const stuckModals = document.querySelectorAll('.fixed.inset-0.bg-black.bg-opacity-50:not([data-component="cache-settings"])');
      stuckModals.forEach(modal => modal.remove());

      // Clear any stuck loading states
      const stuckLoaders = document.querySelectorAll('[data-loading="true"]');
      stuckLoaders.forEach(loader => loader.removeAttribute('data-loading'));
    };

    clearBlockingElements();

    // Cleanup on unmount
    return () => {
      clearBlockingElements();
    };
  }, []);

  // Dynamic cache TTL based on selected period
  const getCacheTTL = (period: string): number => {
    switch (period) {
      case '1d':
      case '3d':
        return 5 * 60 * 1000; // 5 minutes for recent data
      case '1w':
        return 15 * 60 * 1000; // 15 minutes for weekly data
      case '1m':
        return 30 * 60 * 1000; // 30 minutes for monthly data
      case '3m':
      case '6m':
        return 60 * 60 * 1000; // 1 hour for quarterly/semi-annual data
      case '1y':
        return 2 * 60 * 60 * 1000; // 2 hours for yearly data
      default:
        return 60 * 60 * 1000; // 1 hour default
    }
  };

  // Use cached fetch hook for financial data with dynamic cache based on period
  // Temporarily using demo endpoint while Observium API is unavailable
  const {
    data: financialData,
    loading,
    error,
    refetch,
    lastUpdated,
    isCached,
    cacheTimeRemaining
  } = useCachedFetch<FinancialData>(
    `/api/financial/demo?period=${selectedPeriod}`, // Using demo data directly
    {
      ttl: getCacheTTL(selectedPeriod),
      refreshInterval: autoRefresh ? refreshInterval * 1000 : undefined,
      enabled: true,
      onSuccess: (data) => {
        console.log(`✅ Financial data loaded for period ${selectedPeriod}:`, data);
      },
      onError: (err) => {
        console.error(`❌ Error loading financial data for period ${selectedPeriod}:`, err);
      }
    }
  );

  const handleClearCache = useCallback(() => {
    clearCache();
    refetch();
  }, [refetch]);

  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period);
  }, []);



  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'efficient': return 'text-green-600 bg-green-100';
      case 'attention': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col space-y-6">
          {/* Title and Description */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Financiero - XCIEN</h1>
              <p className="text-gray-600">Análisis financiero de contratos de carriers y optimización de costos</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <CacheIndicator
                isCached={isCached}
                cacheTimeRemaining={cacheTimeRemaining}
                lastUpdated={lastUpdated}
                onClearCache={handleClearCache}
              />

              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors shadow-sm"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Actualizar</span>
              </button>

              <button
                className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors shadow-sm"
                onClick={() => {
                  // TODO: Implement Excel export
                  console.log('Export to Excel clicked');
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span>Exportar a Excel</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('financial')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'financial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💰 Dashboard Financiero
              </button>
              <button
                onClick={() => setActiveTab('operational')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'operational'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏢 Dashboard Operativo XCIEN
              </button>
            </div>

            {/* Period Selector - Only for Financial Tab */}
            {activeTab === 'financial' && (
              <div className="max-w-lg">
                <PeriodSelector
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={handlePeriodChange}
                  loading={loading}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-refresh Controls */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
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
            <span className="ml-2 text-sm text-gray-700">Auto-actualización</span>
          </label>

          {/* Refresh Interval */}
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
            >
              <option value={300}>5m</option>
              <option value={600}>10m</option>
              <option value={1800}>30m</option>
              <option value={3600}>1h</option>
            </select>
          )}

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

      {/* Executive Summary */}
      <div className="mb-6">
        <FinancialExecutiveSummary
          financialData={financialData}
          loading={loading}
          onRefresh={refetch}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-red-700">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !financialData && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span className="text-gray-600">Cargando datos financieros...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeTab === 'financial' && financialData && (
        <>
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">
                Gasto Total {financialData.summary.periodLabel || 'mensual'}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.summary.totalMonthlyCost, financialData.summary.currency)}
              </div>
              {financialData.summary.period && (
                <div className="text-xs text-gray-400 mt-1">
                  Período: {financialData.summary.period}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Eficiencia Promedio</div>
              <div className="text-2xl font-bold text-blue-600">
                {financialData.summary.averageUtilization.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Ahorro Potencial</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(financialData.summary.potentialSavings, financialData.summary.currency)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Contratos Optimizables</div>
              <div className="text-2xl font-bold text-orange-600">
                {financialData.summary.optimizableContracts}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Costo por Mbps</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(financialData.summary.costPerMbps, financialData.summary.currency)}
              </div>
            </div>
          </div>

          {/* Carrier Analysis Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Carrier</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gasto Mensual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ancho Banda Contratado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilización Real</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo por Mbps Utilizado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ahorro Potencial</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialData.carrierAnalysis.map((carrier, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {carrier.carrier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(carrier.monthlyCost, financialData.summary.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {carrier.contractedMbps} Gbps
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {carrier.utilizationPercentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(carrier.costPerMbps, financialData.summary.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(carrier.status)}`}>
                          {carrier.status === 'efficient' ? 'Eficiente' :
                           carrier.status === 'attention' ? 'Atención' : 'Crítico'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {carrier.potentialSaving > 0 ? formatCurrency(carrier.potentialSaving, financialData.summary.currency) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plaza Breakdown and Optimization Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Plaza Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vista por Plaza</h2>
              <div className="space-y-4">
                {financialData.plazaBreakdown.map((plaza, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{plaza.plaza}</h3>
                      <span className="text-sm text-gray-500">{plaza.carriers} carriers</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Gasto Mensual:</span>
                        <div className="font-medium">{formatCurrency(plaza.monthlyCost, financialData.summary.currency)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Eficiencia:</span>
                        <div className="font-medium">{plaza.efficiency.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(plaza.efficiency, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    {plaza.optimizationOpportunities > 0 && (
                      <div className="mt-2 text-xs text-orange-600">
                        {plaza.optimizationOpportunities} oportunidades de optimización
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Opportunities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Oportunidades de Optimización</h2>
              <div className="space-y-3">
                {financialData.optimizationOpportunities.slice(0, 6).map((opportunity, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(opportunity.priority)}`}>
                            {opportunity.priority === 'high' ? 'Alto' :
                             opportunity.priority === 'medium' ? 'Medio' : 'Bajo'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {opportunity.type === 'cancellation' ? 'Cancelar contrato' :
                             opportunity.type === 'renegotiation' ? 'Renegociar capacidad' : 'Actualizar'}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {opportunity.carrier} - {opportunity.plaza}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {opportunity.description}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(opportunity.potentialSaving, financialData.summary.currency)}/mes
                        </div>
                        <div className="text-xs text-gray-500">
                          {opportunity.utilizationRate.toFixed(1)}% uso
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Operational Dashboard Tab */}
      {activeTab === 'operational' && (
        <XCIENOperationalDashboard
          period={selectedPeriod}
          autoRefresh={autoRefresh}
          refreshInterval={refreshInterval * 1000}
        />
      )}

      {/* Cache Settings Modal */}
      <CacheSettings
        isOpen={showCacheSettings}
        onClose={() => setShowCacheSettings(false)}
      />


    </div>
  );
}
