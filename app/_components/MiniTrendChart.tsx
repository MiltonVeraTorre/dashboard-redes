'use client';

import React from 'react';

interface MiniTrendChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function MiniTrendChart({ 
  data, 
  width = 64, 
  height = 24, 
  color = '#3b82f6',
  className = ''
}: MiniTrendChartProps) {
  if (!data || data.length < 2) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-xs text-gray-400">—</span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 4); // Leave 2px padding on each side
    const y = height - 2 - ((value - min) / range) * (height - 4); // Leave 2px padding top/bottom
    return `${x},${y}`;
  }).join(' ');

  // Determine trend direction for color
  const isIncreasing = data[data.length - 1] > data[0];
  const trendColor = isIncreasing ? '#ef4444' : '#22c55e'; // Red for increasing, green for decreasing

  return (
    <div className={`inline-block ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Background grid (optional) */}
        <defs>
          <pattern id="grid" width="8" height="4" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 4" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />
        
        {/* Trend line */}
        <polyline
          fill="none"
          stroke={color || trendColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        
        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * (width - 4) + 2;
          const y = height - 2 - ((value - min) / range) * (height - 4);
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1"
              fill={color || trendColor}
              opacity={index === 0 || index === data.length - 1 ? 1 : 0.6}
            />
          );
        })}
        
        {/* Trend arrow at the end */}
        {isIncreasing && (
          <polygon
            points={`${width - 8},${height - 8} ${width - 4},${height - 12} ${width - 4},${height - 4}`}
            fill={color || trendColor}
            opacity="0.8"
          />
        )}
      </svg>
    </div>
  );
}

// Helper component for displaying trend with percentage
interface TrendIndicatorProps {
  current: number;
  previous: number;
  showChart?: boolean;
  chartData?: number[];
}

export function TrendIndicator({ 
  current, 
  previous, 
  showChart = true, 
  chartData 
}: TrendIndicatorProps) {
  const change = current - previous;
  const changePercentage = (change / previous) * 100;
  
  const isIncreasing = change > 0;
  const severity = Math.abs(changePercentage);
  
  // Color based on severity
  let colorClass = 'text-gray-600';
  let bgColorClass = 'bg-gray-100';
  let chartColor = '#6b7280';
  
  if (severity >= 20) {
    colorClass = 'text-red-600';
    bgColorClass = 'bg-red-50';
    chartColor = '#dc2626';
  } else if (severity >= 10) {
    colorClass = 'text-orange-600';
    bgColorClass = 'bg-orange-50';
    chartColor = '#ea580c';
  } else if (severity >= 5) {
    colorClass = 'text-yellow-600';
    bgColorClass = 'bg-yellow-50';
    chartColor = '#ca8a04';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${bgColorClass}`}>
      <span className={`text-xs font-medium ${colorClass}`}>
        {isIncreasing ? '↗' : '↘'} {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </span>
      {showChart && chartData && chartData.length > 1 && (
        <MiniTrendChart 
          data={chartData} 
          width={32} 
          height={16} 
          color={chartColor}
        />
      )}
    </div>
  );
}
