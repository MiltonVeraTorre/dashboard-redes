'use client';

import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Activity, 
  Server, 
  MapPin, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useObserviumDevices, useObserviumAlerts } from '@/lib/observium-api-enhanced';

// Color palette for charts
const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#6366F1',
  gray: '#6B7280'
};

// Device Status Chart Component
const DeviceStatusChart: React.FC = () => {
  const { data: devices, isLoading } = useObserviumDevices();

  const statusData = useMemo(() => {
    if (!devices) return [];
    
    const statusCounts = devices.reduce((acc, device) => {
      const status = device.status === 'up' ? 'Online' : 'Offline';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Online', value: statusCounts.Online || 0, color: COLORS.success },
      { name: 'Offline', value: statusCounts.Offline || 0, color: COLORS.danger }
    ];
  }, [devices]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Server className="h-5 w-5 mr-2 text-blue-600" />
          Device Status
        </h3>
        <div className="text-sm text-gray-500">
          {devices?.length || 0} total devices
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value, 'Devices']}
              labelStyle={{ color: '#374151' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Location Distribution Chart Component
const LocationChart: React.FC = () => {
  const { data: devices, isLoading } = useObserviumDevices();

  const locationData = useMemo(() => {
    if (!devices) return [];
    
    const locationCounts = devices.reduce((acc, device) => {
      const location = device.location || 'Unknown';
      // Simplify location names for better display
      const simplifiedLocation = location.split(',')[0] || location;
      acc[simplifiedLocation] = (acc[simplifiedLocation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCounts)
      .map(([location, count]) => ({
        location: location.length > 15 ? location.substring(0, 15) + '...' : location,
        devices: count,
        fullLocation: location
      }))
      .sort((a, b) => b.devices - a.devices)
      .slice(0, 8); // Top 8 locations
  }, [devices]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
          Devices by Location
        </h3>
        <div className="text-sm text-gray-500">
          Top locations
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={locationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="location" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: number) => [value, 'Devices']}
              labelFormatter={(label) => {
                const item = locationData.find(d => d.location === label);
                return item?.fullLocation || label;
              }}
            />
            <Bar dataKey="devices" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Alert Severity Chart Component
const AlertSeverityChart: React.FC = () => {
  const { data: alerts, isLoading } = useObserviumAlerts();

  const severityData = useMemo(() => {
    if (!alerts) return [];
    
    const severityCounts = alerts.reduce((acc, alert) => {
      const severity = alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1);
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Critical', value: severityCounts.Critical || 0, color: COLORS.danger },
      { name: 'Warning', value: severityCounts.Warning || 0, color: COLORS.warning },
      { name: 'Info', value: severityCounts.Info || 0, color: COLORS.info }
    ].filter(item => item.value > 0);
  }, [alerts]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
          Alert Severity
        </h3>
        <div className="text-sm text-gray-500">
          {alerts?.length || 0} total alerts
        </div>
      </div>
      
      {severityData.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">No active alerts</p>
          </div>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'Alerts']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// Network Health Summary Component
const NetworkHealthSummary: React.FC = () => {
  const { data: devices } = useObserviumDevices();
  const { data: alerts } = useObserviumAlerts();

  const healthMetrics = useMemo(() => {
    if (!devices) return null;
    
    const totalDevices = devices.length;
    const activeDevices = devices.filter(d => d.status === 'up').length;
    const uptime = totalDevices > 0 ? (activeDevices / totalDevices) * 100 : 0;
    const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0;
    
    const healthScore = Math.max(0, uptime - (criticalAlerts * 5)); // Reduce score for critical alerts
    
    return {
      uptime: uptime.toFixed(1),
      healthScore: Math.min(100, healthScore).toFixed(1),
      activeDevices,
      totalDevices,
      criticalAlerts
    };
  }, [devices, alerts]);

  if (!healthMetrics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const healthColor = parseFloat(healthMetrics.healthScore) >= 95 ? 'text-green-600' :
                      parseFloat(healthMetrics.healthScore) >= 80 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <Activity className="h-5 w-5 mr-2 text-blue-600" />
        Network Health
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Overall Health Score</span>
          <span className={`text-2xl font-bold ${healthColor}`}>
            {healthMetrics.healthScore}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Network Uptime</span>
          <span className="text-lg font-semibold text-gray-900">
            {healthMetrics.uptime}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active Devices</span>
          <span className="text-lg font-semibold text-gray-900">
            {healthMetrics.activeDevices}/{healthMetrics.totalDevices}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Critical Issues</span>
          <span className={`text-lg font-semibold ${healthMetrics.criticalAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {healthMetrics.criticalAlerts}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main NetworkStatusCharts Component
const NetworkStatusCharts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Network Analytics</h2>
        <div className="text-sm text-gray-500">
          Real-time network status visualization
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceStatusChart />
        <AlertSeverityChart />
        <LocationChart />
        <NetworkHealthSummary />
      </div>
    </div>
  );
};

export default NetworkStatusCharts;
