'use client';

import React from 'react';
import { NetworkConsumptionChart } from '@/app/_components/NetworkConsumptionChart';
import { CapacityUtilizationChart } from '@/app/_components/CapacityUtilizationChart';
import { CriticalSitesPanel } from '@/app/_components/CriticalSitesPanel';
import { GrowthTrendsChart } from '@/app/_components/GrowthTrendsChart';

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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
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
