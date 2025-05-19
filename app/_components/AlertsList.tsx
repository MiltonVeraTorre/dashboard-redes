'use client';

import React from 'react';
import { Alert } from '@/lib/domain/entities';

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  // Get severity color
  const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  // Get time ago
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + ' years ago';
    }
    
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + ' months ago';
    }
    
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + ' days ago';
    }
    
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + ' hours ago';
    }
    
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + ' minutes ago';
    }
    
    return Math.floor(seconds) + ' seconds ago';
  };
  
  return (
    <div>
      {alerts.length === 0 ? (
        <p className="text-gray-500">No alerts available.</p>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
              <div className="flex justify-between">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </span>
                <span className="text-xs text-gray-500" title={formatDate(alert.timestamp)}>
                  {getTimeAgo(alert.timestamp)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{alert.message}</p>
              {!alert.acknowledged && (
                <button className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
