'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, AlertTriangle, Users, DollarSign } from '@/components/ui/icons';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface CustomerData {
  customerName: string;
  location: string;
  contractedMbps: number;
  currentUsageMbps: number;
  utilizationRate: number;
  status: 'high' | 'medium' | 'low';
  monthlyRevenue: number;
  peakUsage: number;
  billId: string;
}

interface UtilizationSummary {
  totalCustomers: number;
  highUtilization: number;
  mediumUtilization: number;
  lowUtilization: number;
  avgUtilization: number;
  revenueAtRisk: number;
}

interface CustomerUtilizationData {
  threshold: number;
  sortBy: string;
  data: CustomerData[];
  summary: UtilizationSummary;
  timestamp: string;
  source: string;
}

export default function CustomerUtilizationChart() {
  const [data, setData] = useState<CustomerUtilizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState('80');
  const [sortBy, setSortBy] = useState('utilization');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/executive/customer-utilization?threshold=${threshold}&sortBy=${sortBy}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching customer utilization:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [threshold, sortBy]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMbps = (value: number) => {
    return `${value.toFixed(1)} Mbps`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Activity className="h-4 w-4" />;
      case 'low': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Customer Utilization Analysis
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
            <Activity className="h-5 w-5" />
            Customer Utilization Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            Error loading utilization data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare scatter plot data
  const scatterData = data.data.map(customer => ({
    x: customer.contractedMbps,
    y: customer.currentUsageMbps,
    utilizationRate: customer.utilizationRate,
    customerName: customer.customerName,
    status: customer.status,
    revenue: customer.monthlyRevenue
  }));

  // Prepare utilization distribution data
  const distributionData = [
    { name: 'High (≥80%)', count: data.summary.highUtilization, color: '#ef4444' },
    { name: 'Medium (48-79%)', count: data.summary.mediumUtilization, color: '#f59e0b' },
    { name: 'Low (<48%)', count: data.summary.lowUtilization, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Customer Utilization Analysis
              </CardTitle>
              <CardDescription>
                Monitor customer usage vs contracted capacity
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={threshold} onValueChange={setThreshold}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="70">70% Threshold</SelectItem>
                  <SelectItem value="80">80% Threshold</SelectItem>
                  <SelectItem value="90">90% Threshold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utilization">By Utilization</SelectItem>
                  <SelectItem value="revenue">By Revenue</SelectItem>
                  <SelectItem value="traffic">By Traffic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Customers</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {data.summary.totalCustomers}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">High Utilization</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {data.summary.highUtilization}
              </div>
              <div className="text-sm text-red-600">
                ≥{threshold}% threshold
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Avg Utilization</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {data.summary.avgUtilization.toFixed(1)}%
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Revenue at Risk</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {formatCurrency(data.summary.revenueAtRisk)}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Utilization Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Utilization Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Usage vs Capacity Scatter Plot */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Usage vs Contracted Capacity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    name="Contracted Mbps"
                    tickFormatter={(value) => `${value} Mbps`}
                    fontSize={12}
                  />
                  <YAxis
                    dataKey="y"
                    name="Current Usage Mbps"
                    tickFormatter={(value) => `${value} Mbps`}
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'x' ? formatMbps(value) : formatMbps(value),
                      name === 'x' ? 'Contracted' : 'Current Usage'
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload;
                        return `${data.customerName} (${data.utilizationRate.toFixed(1)}%)`;
                      }
                      return '';
                    }}
                  />
                  <Scatter dataKey="y" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Customer</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Location</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Contracted</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Current Usage</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Utilization</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Revenue</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.slice(0, 10).map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        <div className="max-w-48 truncate" title={customer.customerName}>
                          {customer.customerName}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {customer.location}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {formatMbps(customer.contractedMbps)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {formatMbps(customer.currentUsageMbps)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        <Badge variant={getStatusColor(customer.status)}>
                          {customer.utilizationRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {formatCurrency(customer.monthlyRevenue)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(customer.status)}
                          <span className="capitalize text-sm">{customer.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.data.length > 10 && (
              <div className="mt-2 text-sm text-gray-500 text-center">
                Showing top 10 of {data.data.length} customers
              </div>
            )}
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
                Real Observium API data is not available. Connect to live data source for actual customer utilization metrics.
              </div>
            </div>
          )}

          {/* Data Source */}
          <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
            <span>Data source: {data.source === 'bills_data' ? 'Observium Bills API' : 'Demo Data'}</span>
            <span>Last updated: {new Date(data.timestamp).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
