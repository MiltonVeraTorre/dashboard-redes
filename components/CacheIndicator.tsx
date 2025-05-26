'use client';
import React from 'react';

interface CacheIndicatorProps {
  isCached: boolean;
  cacheTimeRemaining: number;
  lastUpdated?: Date | null;
  onClearCache?: () => void;
  className?: string;
}

export default function CacheIndicator({
  isCached,
  cacheTimeRemaining,
  lastUpdated,
  onClearCache,
  className = ''
}: CacheIndicatorProps) {
  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!isCached && !lastUpdated) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {lastUpdated && (
        <span className="text-gray-500">
          {lastUpdated.toLocaleTimeString()}
        </span>
      )}
      
      {isCached && cacheTimeRemaining > 0 && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 font-medium">
            Cache: {formatTimeRemaining(cacheTimeRemaining)}
          </span>
          {onClearCache && (
            <button
              onClick={onClearCache}
              className="text-xs text-gray-400 hover:text-gray-600 ml-1"
              title="Limpiar caché"
            >
              ✕
            </button>
          )}
        </div>
      )}
      
      {!isCached && lastUpdated && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-orange-600 text-xs">
            En vivo
          </span>
        </div>
      )}
    </div>
  );
}
