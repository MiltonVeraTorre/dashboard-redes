'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Shield, Server, AlertTriangle, Activity, MapPin } from '@/components/ui/icons';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface HealthMetrics {
  deviceHealth: {
    score: number;
    totalDevices: number;
    activeDevices: number;
    downDevices: number;
  };
  alertHealth: {
    score: number;
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    infoAlerts: number;
  };
  performanceHealth: {
    score: number;
    avgUtilization: number;
    peakUtilization: number;
  };
}

interface LocationBreakdown {
  location: string;
  score: number;
  devices: number;
  alerts: number;
}

interface NetworkHealthData {
  overallScore: number;
  status: string;
  lastUpdated: string;
  metrics: HealthMetrics;
  locationBreakdown?: LocationBreakdown[];
  timestamp: string;
  source: string;
}

export default function NetworkHealthScore() {
  const [data, setData] = useState<NetworkHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeDetails, setIncludeDetails] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/executive/network-health?includeDetails=${includeDetails}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching network health:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [includeDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'excellent': return 'default';
      case 'good': return 'default';
      case 'fair': return 'secondary';
      case 'poor': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 80) return '#3b82f6'; // blue
    if (score >= 70) return '#f59e0b'; // yellow
    if (score >= 60) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Network Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Network Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            Error loading health data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare radial chart data
  const radialData = [
    {
      name: 'Overall Health',
      value: data.overallScore,
      fill: getScoreColor(data.overallScore)
    }
  ];

  // Prepare metrics chart data
  const metricsData = [
    {
      name: 'Device Health',
      score: data.metrics.deviceHealth.score,
      fill: getScoreColor(data.metrics.deviceHealth.score)
    },
    {
      name: 'Alert Health',
      score: data.metrics.alertHealth.score,
      fill: getScoreColor(data.metrics.alertHealth.score)
    },
    {
      name: 'Performance',
      score: data.metrics.performanceHealth.score,
      fill: getScoreColor(data.metrics.performanceHealth.score)
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Network Health Score
              </CardTitle>
              <CardDescription>
                Overall network health assessment and monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Include Details</span>
              <Switch
                checked={includeDetails}
                onCheckedChange={setIncludeDetails}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Health Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">Overall Health Score</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={getScoreColor(data.overallScore)}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <div className="text-3xl font-bold" style={{ color: getScoreColor(data.overallScore) }}>
                  {data.overallScore}
                </div>
                <Badge variant={getStatusBadgeVariant(data.status)} className="mt-2">
                  {data.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Health Metrics Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}`, 'Score']} />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Device Health */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Device Health</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-2">
                {data.metrics.deviceHealth.score.toFixed(1)}
              </div>
              <div className="space-y-1 text-sm text-blue-700">
                <div>Total: {data.metrics.deviceHealth.totalDevices}</div>
                <div>Active: {data.metrics.deviceHealth.activeDevices}</div>
                <div>Down: {data.metrics.deviceHealth.downDevices}</div>
              </div>
            </div>

            {/* Alert Health */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Alert Health</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 mb-2">
                {data.metrics.alertHealth.score.toFixed(1)}
              </div>
              <div className="space-y-1 text-sm text-orange-700">
                <div>Total: {data.metrics.alertHealth.totalAlerts}</div>
                <div>Critical: {data.metrics.alertHealth.criticalAlerts}</div>
                <div>Warning: {data.metrics.alertHealth.warningAlerts}</div>
              </div>
            </div>

            {/* Performance Health */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Performance</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mb-2">
                {data.metrics.performanceHealth.score.toFixed(1)}
              </div>
              <div className="space-y-1 text-sm text-green-700">
                <div>Avg Util: {data.metrics.performanceHealth.avgUtilization.toFixed(1)}%</div>
                <div>Peak Util: {data.metrics.performanceHealth.peakUtilization.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Location Breakdown */}
          {includeDetails && data.locationBreakdown && data.locationBreakdown.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Health Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Location</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Health Score</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Devices</th>
                      <th className="border border-gray-200 px-4 py-2 text-right">Alerts</th>
                      <th className="border border-gray-200 px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.locationBreakdown.map((location, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2 font-medium">
                          {location.location}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-right">
                          <span style={{ color: getScoreColor(location.score) }} className="font-semibold">
                            {location.score.toFixed(1)}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-right">
                          {location.devices}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-right">
                          {location.alerts}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                          <div
                            className={`w-3 h-3 rounded-full mx-auto ${getStatusColor(
                              location.score >= 90 ? 'excellent' :
                              location.score >= 80 ? 'good' :
                              location.score >= 70 ? 'fair' :
                              location.score >= 60 ? 'poor' : 'critical'
                            )}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Health Status Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Health Status Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Excellent (90-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Good (80-89)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Fair (70-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Poor (60-69)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Critical (&lt;60)</span>
              </div>
            </div>
          </div>

          {/* Mock Data Warning */}
          {data.source === 'demo_data' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-yellow-800">
                  ⚠️ DEMO DATA - This chart is displaying simulated data
                </span>
              </div>
              <div className="text-xs text-yellow-700 mt-1">
                Real Observium API data is not available. Connect to live data source for actual network health metrics.
              </div>
            </div>
          )}

          {/* Data Source */}
          <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
            <span>Data source: {data.source === 'observium_data' ? 'Observium APIs' : 'Demo Data'}</span>
            <span>Last updated: {new Date(data.timestamp).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
