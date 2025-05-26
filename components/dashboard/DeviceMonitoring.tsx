'use client';

import React, { useState, useMemo } from 'react';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Clock, 
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useObserviumDevices } from '@/lib/observium-api-enhanced';
import { DeviceStatus } from '@/types/dashboard';

// Device Row Component
const DeviceRow: React.FC<{ device: DeviceStatus }> = ({ device }) => {
  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatLastPolled = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      return date.toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
  };

  const statusConfig = {
    up: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: 'bg-green-100 text-green-800'
    },
    down: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      badge: 'bg-red-100 text-red-800'
    }
  };

  const config = statusConfig[device.status as keyof typeof statusConfig] || statusConfig.down;
  const StatusIcon = config.icon;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`p-1 rounded-full ${config.bgColor} mr-3`}>
            <StatusIcon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{device.hostname}</div>
            <div className="text-sm text-gray-500">ID: {device.device_id}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
          {device.status.toUpperCase()}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
          <span className="truncate max-w-32" title={device.location}>
            {device.location}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          <div className="font-medium">{device.vendor}</div>
          <div className="text-gray-500">{device.hardware}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          <div className="font-medium">{device.os}</div>
          <div className="text-gray-500">{device.version}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-gray-400 mr-1" />
          {formatUptime(device.uptime)}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatLastPolled(device.last_polled)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 flex items-center">
          <ExternalLink className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

// Main DeviceMonitoring Component
const DeviceMonitoring: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'up' | 'down'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'hostname' | 'status' | 'location' | 'uptime'>('hostname');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: devices, isLoading, error } = useObserviumDevices({
    refreshInterval: 60000 // Update every minute for device list
  });

  // Get unique locations for filter
  const locations = useMemo(() => {
    if (!devices) return [];
    const uniqueLocations = [...new Set(devices.map(d => d.location))];
    return uniqueLocations.sort();
  }, [devices]);

  // Filter and sort devices
  const filteredAndSortedDevices = useMemo(() => {
    if (!devices) return [];
    
    let filtered = devices.filter(device => {
      const matchesSearch = device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
      const matchesLocation = locationFilter === 'all' || device.location === locationFilter;
      
      return matchesSearch && matchesStatus && matchesLocation;
    });

    // Sort devices
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'uptime') {
        aValue = a.uptime;
        bValue = b.uptime;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [devices, searchTerm, statusFilter, locationFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDevices.length / itemsPerPage);
  const paginatedDevices = filteredAndSortedDevices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Device statistics
  const deviceStats = useMemo(() => {
    if (!devices) return { total: 0, online: 0, offline: 0 };
    
    return {
      total: devices.length,
      online: devices.filter(d => d.status === 'up').length,
      offline: devices.filter(d => d.status === 'down').length
    };
  }, [devices]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-sm font-medium text-red-800">Error Loading Devices</h3>
        </div>
        <p className="text-sm text-red-700 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Device Monitoring</h3>
            <p className="text-sm text-gray-600 mt-1">
              Real-time status of all network devices
            </p>
          </div>
          
          {/* Device Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{deviceStats.total}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{deviceStats.online}</div>
              <div className="text-gray-500">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{deviceStats.offline}</div>
              <div className="text-gray-500">Offline</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="up">Online</option>
            <option value="down">Offline</option>
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>
                {location.length > 20 ? location.substring(0, 20) + '...' : location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('hostname')}
                >
                  <div className="flex items-center">
                    Device
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center">
                    Location
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hardware
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OS/Version
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('uptime')}
                >
                  <div className="flex items-center">
                    Uptime
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Polled
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDevices.map((device) => (
                <DeviceRow key={device.device_id} device={device} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedDevices.length)} of {filteredAndSortedDevices.length} devices
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>📊 Real-time data from Observium API</span>
          <span>Auto-refresh every 60 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceMonitoring;
