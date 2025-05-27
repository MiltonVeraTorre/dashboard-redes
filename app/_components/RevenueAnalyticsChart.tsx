'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, DollarSign, MapPin } from '@/components/ui/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RevenueData {
  category: string;
  revenue: number;
  customers: number;
  avgRevenuePerCustomer: number;
  utilizationRate: number;
  totalTraffic: number;
  totalContracted: number;
}

interface RevenueSummary {
  totalRevenue: number;
  totalCustomers: number;
  avgRevenuePerCustomer: number;
  topCategory: string;
  growthRate: number;
}

interface RevenueAnalyticsData {
  timeRange: string;
  groupBy: string;
  data: RevenueData[];
  summary: RevenueSummary;
  timestamp: string;
  source: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function RevenueAnalyticsChart() {
  const [data, setData] = useState<RevenueAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState('location');
  const [timeRange, setTimeRange] = useState('3m');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/executive/revenue-analytics?groupBy=${groupBy}&timeRange=${timeRange}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching revenue analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupBy, timeRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Analytics
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
            <DollarSign className="h-5 w-5" />
            Revenue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            Error loading revenue data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Analytics
              </CardTitle>
              <CardDescription>
                Analyze revenue patterns and customer distribution
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">By Location</SelectItem>
                  <SelectItem value="customer">By Customer</SelectItem>
                  <SelectItem value="service_type">By Service Type</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
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
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(data.summary.totalRevenue)}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Total Customers</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatNumber(data.summary.totalCustomers)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Avg Revenue/Customer</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(data.summary.avgRevenuePerCustomer)}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Top Category</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {data.summary.topCategory}
              </div>
              <div className="text-sm text-orange-600">
                +{data.summary.growthRate}% growth
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Revenue by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.data.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="revenue" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Distribution Pie Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.data.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, customers }) => `${category}: ${customers}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="customers"
                  >
                    {data.data.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Customers']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Category</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Revenue</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Customers</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Avg/Customer</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        {item.category}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {item.customers}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {formatCurrency(item.avgRevenuePerCustomer)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        <Badge
                          variant={item.utilizationRate > 80 ? "destructive" :
                                  item.utilizationRate > 60 ? "default" : "secondary"}
                        >
                          {item.utilizationRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                Real Observium API data is not available. Connect to live data source for actual revenue analytics.
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
