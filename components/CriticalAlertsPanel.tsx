'use client';

import React, { useState } from 'react';

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
    alerts: Alert[];
    devices: any[];
  };
  capacitySummary: {
    criticalLinks: number;
    warningLinks: number;
  };
}

interface CriticalAlertsPanelProps {
  plazaData: PlazaData | null;
  loading: boolean;
  selectedPlaza: string;
}

const CriticalAlertsPanel: React.FC<CriticalAlertsPanelProps> = ({ 
  plazaData, 
  loading, 
  selectedPlaza 
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPlaza || !plazaData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas Críticas</h3>
        <p className="text-gray-500 text-center py-8">
          Seleccione una plaza para ver las alertas
        </p>
      </div>
    );
  }

  // Generate mock alerts based on real data
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const { overview, capacitySummary } = plazaData;

    // Add critical alerts based on critical links
    for (let i = 0; i < capacitySummary.criticalLinks; i++) {
      alerts.push({
        id: `critical-${i}`,
        device_id: overview.devices[i]?.device_id || `device-${i}`,
        alert_message: `High utilization detected (>80%) on ${overview.devices[i]?.hostname || `Device-${i}`}`,
        entity_type: 'port',
        alert_status: 'active',
        severity: 'critical',
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
      });
    }

    // Add warning alerts based on warning links
    for (let i = 0; i < capacitySummary.warningLinks; i++) {
      const deviceIndex = capacitySummary.criticalLinks + i;
      alerts.push({
        id: `warning-${i}`,
        device_id: overview.devices[deviceIndex]?.device_id || `device-${deviceIndex}`,
        alert_message: `Medium utilization detected (60-80%) on ${overview.devices[deviceIndex]?.hostname || `Device-${deviceIndex}`}`,
        entity_type: 'port',
        alert_status: 'active',
        severity: 'warning',
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString()
      });
    }

    // Add some info alerts from real alerts if available
    if (overview.alerts && overview.alerts.length > 0) {
      overview.alerts.slice(0, 2).forEach((alert, i) => {
        alerts.push({
          id: `info-${i}`,
          device_id: alert.device_id || `device-${i}`,
          alert_message: alert.alert_message || `Device status alert`,
          entity_type: alert.entity_type || 'device',
          alert_status: alert.alert_status || 'active',
          severity: 'info',
          timestamp: new Date(Date.now() - Math.random() * 10800000).toISOString()
        });
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const alerts = generateAlerts();
  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(alert => alert.severity === filter);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const alertCounts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Alertas Críticas - {selectedPlaza}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total:</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {alerts.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Todas ({alertCounts.all})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'critical'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Críticas ({alertCounts.critical})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'warning'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Advertencias ({alertCounts.warning})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500">No hay alertas {filter === 'all' ? '' : filter} activas</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-lg">{getSeverityIcon(alert.severity)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {alert.alert_message}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Device: {alert.device_id}</span>
                      <span>Type: {alert.entity_type}</span>
                      <span>{formatTimestamp(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                    alert.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {alerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                🔴 {alertCounts.critical} críticas
              </span>
              <span className="text-gray-600">
                🟡 {alertCounts.warning} advertencias
              </span>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Ver todas las alertas →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriticalAlertsPanel;
