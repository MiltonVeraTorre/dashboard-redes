'use client';

import React from 'react';

interface PlazaData {
  plaza: string;
  overview: {
    devices: any[];
    totalDevices: number;
    activeDevices: number;
    totalPorts: number;
    activePorts: number;
    alerts: any[];
  };
  capacitySummary: {
    totalCapacity: number;
    usedCapacity: number;
    utilizationPercentage: number;
    linksCount: number;
    criticalLinks: number;
    warningLinks: number;
  };
  healthScore: {
    score: number;
    grade: string;
    factors: {
      deviceAvailability: number;
      portAvailability: number;
      alertScore: number;
    };
  };
}

interface PlazaCapacityOverviewProps {
  plazaData: PlazaData | null;
  loading: boolean;
  selectedPlaza: string;
}

const PlazaCapacityOverview: React.FC<PlazaCapacityOverviewProps> = ({ 
  plazaData, 
  loading, 
  selectedPlaza 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!selectedPlaza || !plazaData) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-gray-500 text-center">
          Seleccione una plaza para ver el resumen de capacidad
        </p>
      </div>
    );
  }

  const { overview, capacitySummary, healthScore } = plazaData;

  // Calculate percentages
  const deviceAvailabilityPercentage = overview.totalDevices > 0 
    ? Math.round((overview.activeDevices / overview.totalDevices) * 100) 
    : 0;
  
  const portAvailabilityPercentage = overview.totalPorts > 0 
    ? Math.round((overview.activePorts / overview.totalPorts) * 100) 
    : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getHealthColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Dispositivos Activos */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Dispositivos Activos</p>
            <p className="text-2xl font-bold text-gray-900">
              {overview.activeDevices}/{overview.totalDevices}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deviceAvailabilityPercentage)}`}>
            {deviceAvailabilityPercentage}%
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                deviceAvailabilityPercentage >= 90 ? 'bg-green-500' :
                deviceAvailabilityPercentage >= 70 ? 'bg-yellow-500' :
                deviceAvailabilityPercentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${deviceAvailabilityPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Puertos Activos */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Puertos Activos</p>
            <p className="text-2xl font-bold text-gray-900">
              {overview.activePorts}/{overview.totalPorts}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(portAvailabilityPercentage)}`}>
            {portAvailabilityPercentage}%
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                portAvailabilityPercentage >= 90 ? 'bg-green-500' :
                portAvailabilityPercentage >= 70 ? 'bg-yellow-500' :
                portAvailabilityPercentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${portAvailabilityPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Utilización de Capacidad */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Utilización</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(capacitySummary.utilizationPercentage)}%
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            capacitySummary.criticalLinks > 0 ? 'text-red-600 bg-red-100' :
            capacitySummary.warningLinks > 0 ? 'text-yellow-600 bg-yellow-100' :
            'text-green-600 bg-green-100'
          }`}>
            {capacitySummary.criticalLinks > 0 ? 'Crítico' :
             capacitySummary.warningLinks > 0 ? 'Advertencia' : 'Normal'}
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                capacitySummary.utilizationPercentage >= 80 ? 'bg-red-500' :
                capacitySummary.utilizationPercentage >= 60 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, capacitySummary.utilizationPercentage)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Health Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {healthScore.score}/100
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(healthScore.grade)}`}>
            Grado {healthScore.grade}
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                healthScore.score >= 90 ? 'bg-green-500' :
                healthScore.score >= 70 ? 'bg-yellow-500' :
                healthScore.score >= 50 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${healthScore.score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {overview.alerts.length > 0 && (
        <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas Activas</h3>
          <div className="space-y-2">
            {overview.alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {alert.alert_message || `Alerta ${index + 1}`}
                  </p>
                  <p className="text-xs text-red-600">
                    Device ID: {alert.device_id} | Type: {alert.entity_type}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {alert.alert_status || 'Active'}
                </span>
              </div>
            ))}
            {overview.alerts.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                +{overview.alerts.length - 3} alertas más
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlazaCapacityOverview;
