'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock, 
  MapPin, 
  Server,
  RefreshCw,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useObserviumAlerts } from '@/lib/observium-api-enhanced';
import { AlertInfo } from '@/types/dashboard';

// Alert severity configuration
const alertConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badge: 'bg-red-100 text-red-800'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800'
  }
};

// Alert Row Component
const AlertRow: React.FC<{ alert: AlertInfo }> = ({ alert }) => {
  const config = alertConfig[alert.severity] || alertConfig.info;
  const IconComponent = config.icon;
  
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Alert Icon */}
          <div className={`p-1 rounded ${config.color}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          
          {/* Alert Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
                {alert.severity.toUpperCase()}
              </span>
              <span className="text-sm font-medium text-gray-900 truncate">
                {alert.alert_rule}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-2 line-clamp-2">
              {alert.message}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Server className="h-3 w-3 mr-1" />
                <span className="truncate max-w-32">{alert.hostname}</span>
              </div>
              
              {alert.location && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-24">{alert.location}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatTimestamp(alert.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="ml-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            alert.status === 'failed' ? 'bg-red-100 text-red-800' :
            alert.status === 'ok' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {alert.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main CriticalAlerts Component
const CriticalAlerts: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const { data: alerts, isLoading, error, isValidating, mutate } = useObserviumAlerts({
    refreshInterval: 15000 // Update every 15 seconds for alerts
  });

  // Filter alerts based on selected filter
  const filteredAlerts = alerts?.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  }) || [];

  // Sort alerts by timestamp (newest first)
  const sortedAlerts = filteredAlerts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get alert counts by severity
  const alertCounts = alerts?.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const handleRefresh = () => {
    mutate();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-sm font-medium text-red-800">Error Loading Alerts</h3>
        </div>
        <p className="text-sm text-red-700 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Network Alerts</h3>
            <p className="text-sm text-gray-600 mt-1">
              Real-time monitoring alerts from Observium
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Filter Buttons */}
            <div className="flex items-center space-x-1">
              <Filter className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({alerts?.length || 0})
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'critical' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Critical ({alertCounts.critical || 0})
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'warning' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Warning ({alertCounts.warning || 0})
              </button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh alerts"
            >
              <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedAlerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h4>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No alerts are currently active in your network.' 
                : `No ${filter} alerts found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAlerts.slice(0, 10).map((alert) => (
              <AlertRow key={alert.alert_id} alert={alert} />
            ))}
            
            {sortedAlerts.length > 10 && (
              <div className="text-center pt-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mx-auto">
                  View all {sortedAlerts.length} alerts
                  <ExternalLink className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>📊 Real-time data from Observium API</span>
          <span>Auto-refresh every 15 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default CriticalAlerts;
