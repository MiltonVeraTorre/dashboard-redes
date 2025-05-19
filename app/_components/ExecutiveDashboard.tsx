'use client';

import React from 'react';
import { NetworkOverview, Plaza } from '@/lib/domain/entities';
import { OverviewCard } from './OverviewCard';
import { PlazaUtilizationChart } from './PlazaUtilizationChart';
import { AlertsList } from './AlertsList';
import { CriticalSitesList } from './CriticalSitesList';

interface ExecutiveDashboardProps {
  overview: NetworkOverview;
}

export function ExecutiveDashboard({ overview }: ExecutiveDashboardProps) {
  const {
    totalSites,
    sitesPerPlaza,
    criticalSites,
    averageUtilization,
    utilizationByPlaza,
    recentAlerts,
  } = overview;

  // Calculate the number of plazas
  const plazaCount = Object.keys(sitesPerPlaza).length;

  // Format the average utilization as a percentage
  const formattedUtilization = `${Math.round(averageUtilization)}%`;

  // Determine the status based on the average utilization
  const getUtilizationStatus = (utilization: number) => {
    if (utilization >= 80) return 'critical';
    if (utilization >= 60) return 'warning';
    return 'normal';
  };

  const utilizationStatus = getUtilizationStatus(averageUtilization);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Executive Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <OverviewCard
          title="Total Sites"
          value={totalSites.toString()}
          icon="building"
          status="normal"
        />
        <OverviewCard
          title="Plazas"
          value={plazaCount.toString()}
          icon="map-marker"
          status="normal"
        />
        <OverviewCard
          title="Critical Sites"
          value={criticalSites.toString()}
          icon="exclamation-triangle"
          status={criticalSites > 0 ? 'critical' : 'normal'}
        />
        <OverviewCard
          title="Avg. Utilization"
          value={formattedUtilization}
          icon="chart-line"
          status={utilizationStatus}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Utilization by Plaza */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Utilization by Plaza</h2>
          <PlazaUtilizationChart utilizationByPlaza={utilizationByPlaza} />
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
          <AlertsList alerts={recentAlerts} />
        </div>

        {/* Critical Sites */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Critical Sites</h2>
          <CriticalSitesList />
        </div>
      </div>
    </div>
  );
}
