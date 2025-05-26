'use client';

import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Server,
  AlertTriangle,
  RefreshCw,
  Settings,
  Bell
} from 'lucide-react';
import NetworkKPIs from '@/components/dashboard/NetworkKPIs';
import CriticalAlerts from '@/components/dashboard/CriticalAlerts';
import NetworkStatusCharts from '@/components/dashboard/NetworkStatusCharts';
import DeviceMonitoring from '@/components/dashboard/DeviceMonitoring';
import { useNetworkStatus } from '@/lib/observium-api-enhanced';

// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'devices', name: 'Devices', icon: Server },
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle }
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

// Network Status Indicator Component
const NetworkStatusIndicator = () => {
  const { status, isLoading } = useNetworkStatus();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-3 w-3 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!status) return null;

  const statusConfig = {
    healthy: { color: 'bg-green-500', text: 'Network Healthy', textColor: 'text-green-600' },
    degraded: { color: 'bg-yellow-500', text: 'Network Degraded', textColor: 'text-yellow-600' },
    critical: { color: 'bg-red-500', text: 'Network Critical', textColor: 'text-red-600' }
  };

  const config = statusConfig[status.overall as keyof typeof statusConfig] || statusConfig.degraded;

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className={`h-3 w-3 ${config.color} rounded-full animate-pulse`}></div>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.text}
        </span>
      </div>

      {status.criticalIssues > 0 && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{status.criticalIssues} Critical</span>
        </div>
      )}

      {status.devicesDown > 0 && (
        <div className="flex items-center space-x-1 text-gray-600">
          <Server className="h-4 w-4" />
          <span className="text-sm">{status.devicesDown} Offline</span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Updated {new Date(status.lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <NetworkKPIs />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <NetworkStatusCharts />
              </div>
              <div>
                <CriticalAlerts />
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <NetworkStatusCharts />
            <NetworkKPIs />
          </div>
        );

      case 'devices':
        return (
          <div className="space-y-8">
            <DeviceMonitoring />
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-8">
            <CriticalAlerts />
            <NetworkKPIs />
          </div>
        );

      default:
        return <NetworkKPIs />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Network Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Real-time network monitoring powered by Observium API
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <NetworkStatusIndicator />

              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>🌐 Observium Network Monitoring Dashboard</span>
              <span>•</span>
              <span>Real-time data from 6,721+ devices</span>
              <span>•</span>
              <span>584 active alerts monitored</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}