'use client';

import React from 'react';
import { 
  Activity, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wifi,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useObserviumDashboard } from '@/lib/observium-api-enhanced';
import { MetricCardProps } from '@/types/dashboard';

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'blue',
  loading = false
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  const changeColors = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        
        {change !== undefined && (
          <div className={`flex items-center text-sm ${changeColors[changeType]}`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Main NetworkKPIs Component
const NetworkKPIs: React.FC = () => {
  const { data: dashboardData, isLoading, error, isValidating } = useObserviumDashboard({
    refreshInterval: 30000 // Update every 30 seconds
  });

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-sm font-medium text-red-800">Error Loading Network KPIs</h3>
        </div>
        <p className="text-sm text-red-700 mt-1">{error.message}</p>
      </div>
    );
  }

  const kpis = dashboardData?.kpis;
  const lastUpdated = dashboardData?.lastUpdated;

  // Calculate uptime percentage and status
  const uptimePercentage = kpis?.networkUptime || 0;
  const uptimeStatus = uptimePercentage >= 99 ? 'excellent' : 
                      uptimePercentage >= 95 ? 'good' : 
                      uptimePercentage >= 90 ? 'warning' : 'critical';

  const uptimeColor = uptimeStatus === 'excellent' ? 'green' :
                      uptimeStatus === 'good' ? 'blue' :
                      uptimeStatus === 'warning' ? 'yellow' : 'red';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Network Overview</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time network infrastructure metrics
          </p>
        </div>
        
        {/* Last Updated Indicator */}
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>
            {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Loading...'}
          </span>
          {isValidating && (
            <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Devices */}
        <MetricCard
          title="Total Devices"
          value={kpis?.totalDevices || 0}
          icon={<Server className="h-5 w-5" />}
          color="blue"
          loading={isLoading}
        />

        {/* Active Devices */}
        <MetricCard
          title="Active Devices"
          value={kpis?.activeDevices || 0}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
          loading={isLoading}
        />

        {/* Network Uptime */}
        <MetricCard
          title="Network Uptime"
          value={`${uptimePercentage.toFixed(1)}%`}
          icon={<Wifi className="h-5 w-5" />}
          color={uptimeColor}
          loading={isLoading}
        />

        {/* Critical Alerts */}
        <MetricCard
          title="Critical Alerts"
          value={kpis?.criticalAlerts || 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={kpis?.criticalAlerts && kpis.criticalAlerts > 0 ? 'red' : 'green'}
          loading={isLoading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inactive Devices */}
        <MetricCard
          title="Inactive Devices"
          value={kpis?.inactiveDevices || 0}
          icon={<XCircle className="h-5 w-5" />}
          color={kpis?.inactiveDevices && kpis.inactiveDevices > 0 ? 'red' : 'green'}
          loading={isLoading}
        />

        {/* Warning Alerts */}
        <MetricCard
          title="Warning Alerts"
          value={kpis?.warningAlerts || 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={kpis?.warningAlerts && kpis.warningAlerts > 0 ? 'yellow' : 'green'}
          loading={isLoading}
        />

        {/* Network Health Score */}
        <MetricCard
          title="Health Score"
          value={`${Math.round(uptimePercentage)}%`}
          icon={<Activity className="h-5 w-5" />}
          color={uptimeColor}
          loading={isLoading}
        />
      </div>

      {/* Data Source Indicator */}
      <div className="text-xs text-gray-500 text-center">
        📊 Data from Observium API - Real-time monitoring of {kpis?.totalDevices || 0} network devices
      </div>
    </div>
  );
};

export default NetworkKPIs;
