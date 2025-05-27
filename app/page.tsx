'use client';

import React, { useState, useEffect } from 'react';
import { NetworkConsumptionChart } from '@/app/_components/NetworkConsumptionChart';
import { CapacityUtilizationChart } from '@/app/_components/CapacityUtilizationChart';
import { CriticalSitesPanel } from '@/app/_components/CriticalSitesPanel';
import { GrowthTrendsChart } from '@/app/_components/GrowthTrendsChart';
import { ExecutiveDashboardSummary } from '@/app/_components/ExecutiveDashboardSummary';

/**
 * Executive Dashboard Page (Root)
 *
 * This page displays an overview of the network status for executives.
 * Redesigned to match the new executive dashboard layout with:
 * - Network consumption by plaza over time
 * - Capacity utilization by plaza
 * - Critical sites monitoring
 * - Growth trends analysis
 */
export default function Home() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Función para recopilar datos de todos los componentes del dashboard
  const collectDashboardData = async () => {
    try {
      setLoading(true);

      // Hacer llamadas paralelas a todos los endpoints del dashboard ejecutivo
      const [
        networkConsumptionResponse,
        capacityUtilizationResponse,
        criticalSitesResponse,
        growthTrendsResponse
      ] = await Promise.all([
        fetch('/api/executive/network-consumption?timeRange=7d'),
        fetch('/api/executive/capacity-utilization'),
        fetch('/api/executive/critical-sites?limit=8&threshold=75'),
        fetch('/api/executive/growth-trends?timeRange=3m&metric=utilization')
      ]);

      const [
        networkConsumption,
        capacityUtilization,
        criticalSites,
        growthTrends
      ] = await Promise.all([
        networkConsumptionResponse.json(),
        capacityUtilizationResponse.json(),
        criticalSitesResponse.json(),
        growthTrendsResponse.json()
      ]);

      const combinedData = {
        networkConsumption,
        capacityUtilization,
        criticalSites,
        growthTrends,
        timestamp: new Date().toISOString()
      };

      setDashboardData(combinedData);
      console.log('📊 Dashboard data collected:', combinedData);
    } catch (error) {
      console.error('Error collecting dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    collectDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Ejecutivo</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={collectDashboardData}
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

      {/* Main Content */}
      <div className="p-6">
        {/* Executive Summary */}
        <div className="mb-6">
          <ExecutiveDashboardSummary
            dashboardData={dashboardData}
            loading={loading}
            onRefresh={collectDashboardData}
          />
        </div>

        {/* Top Row - Network Consumption and Capacity Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Network Consumption Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Consumo de Red por Plaza</h2>
            <NetworkConsumptionChart timeRange="7d" height={240} />
          </div>

          {/* Capacity Utilization Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Capacidad Utilizada</h2>
            <CapacityUtilizationChart height={240} />
          </div>
        </div>

        {/* Bottom Row - Critical Sites and Growth Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Sites Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sitios Críticos</h2>
            <CriticalSitesPanel limit={8} threshold={75} />
          </div>

          {/* Growth Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Crecimiento</h2>
            <GrowthTrendsChart timeRange="3m" metric="utilization" height={240} />
          </div>
        </div>
      </div>
    </div>
  );
}
