import { NextRequest, NextResponse } from 'next/server';
import * as MonitoringDomain from '@/lib/domain/monitoring';
import * as ObserviumAdapter from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/monitoring/plaza/[plaza]/daily-trends
 *
 * Returns 24-hour utilization trends for a specific plaza.
 * This endpoint provides data for the "Tendencia de Utilización (24h)" chart.
 *
 * Path Parameters:
 * - plaza: The name of the plaza (e.g., "Laredo", "Saltillo")
 *
 * Query Parameters:
 * - date: Specific date for analysis (YYYY-MM-DD, default: today)
 * - interval: Data interval in minutes (15, 30, 60, default: 60)
 *
 * Response:
 * {
 *   "plaza": "Laredo",
 *   "date": "2024-01-15",
 *   "interval": 60,
 *   "trends": [
 *     { "time": "00:00", "utilization": 45 },
 *     { "time": "01:00", "utilization": 42 },
 *     ...
 *   ],
 *   "summary": {
 *     "avgUtilization": 68.5,
 *     "peakUtilization": 85.2,
 *     "peakTime": "14:00",
 *     "lowUtilization": 35.1,
 *     "lowTime": "04:00"
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ plaza: string }> }
) {
  try {
    const { plaza: plazaParam } = await params;
    const plaza = decodeURIComponent(plazaParam);
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const dateParam = searchParams.get('date');
    const intervalParam = searchParams.get('interval');
    
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const interval = intervalParam ? parseInt(intervalParam, 10) : 60;

    console.log(`🔍 Fetching daily trends for plaza: ${plaza}`);
    console.log(`📅 Date: ${targetDate.toISOString().split('T')[0]}, Interval: ${interval}min`);

    // Calculate date range for the specific day
    const fromDate = new Date(targetDate);
    fromDate.setHours(0, 0, 0, 0);
    
    const toDate = new Date(targetDate);
    toDate.setHours(23, 59, 59, 999);

    try {
      // Get devices for the plaza
      const devices = await ObserviumAdapter.fetchDevicesByPlaza(plaza);
      
      if (devices.length === 0) {
        console.log(`⚠️ No devices found for plaza: ${plaza}`);
        return NextResponse.json({
          plaza,
          date: targetDate.toISOString().split('T')[0],
          interval,
          trends: [],
          summary: {
            avgUtilization: 0,
            peakUtilization: 0,
            peakTime: '00:00',
            lowUtilization: 0,
            lowTime: '00:00'
          },
          warning: 'No devices found for this plaza'
        });
      }

      const deviceIds = devices.map(d => d.device_id);
      console.log(`📱 Found ${devices.length} devices for plaza ${plaza}`);

      // For now, generate realistic daily patterns since real-time data requires
      // specific counter configuration
      const trends = generateDailyTrends(plaza, targetDate, interval);
      const summary = calculateDailySummary(trends);

      console.log(`✅ Successfully generated daily trends for plaza: ${plaza}`);
      console.log(`📈 Generated ${trends.length} data points`);

      return NextResponse.json({
        plaza,
        date: targetDate.toISOString().split('T')[0],
        interval,
        trends,
        summary,
        note: 'Using simulated daily patterns based on typical network usage',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.warn(`⚠️ Failed to fetch real data for plaza ${plaza}, using fallback:`, error);
      
      // Fallback to generated data
      const trends = generateDailyTrends(plaza, targetDate, interval);
      const summary = calculateDailySummary(trends);

      return NextResponse.json({
        plaza,
        date: targetDate.toISOString().split('T')[0],
        interval,
        trends,
        summary,
        fallback: true,
        warning: 'Using generated data due to API unavailability',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error(`❌ Error fetching daily trends for plaza ${plazaParam}:`, error);

    return NextResponse.json(
      {
        error: 'Failed to fetch daily trends',
        plaza: plazaParam,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Generate realistic daily utilization trends
 */
function generateDailyTrends(plaza: string, targetDate: Date, intervalMinutes: number) {
  const plazaSeeds: Record<string, number> = {
    'Laredo': 1,
    'Saltillo': 2,
    'CDMX': 3,
    'Monterrey': 4
  };

  const seed = plazaSeeds[plaza] || 1;
  const trends = [];
  const pointsPerDay = Math.floor(24 * 60 / intervalMinutes);

  for (let i = 0; i < pointsPerDay; i++) {
    const hour = Math.floor((i * intervalMinutes) / 60);
    const minute = (i * intervalMinutes) % 60;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Create realistic daily pattern
    let baseUtilization = 40; // Base utilization
    
    // Business hours pattern (higher during day)
    if (hour >= 8 && hour <= 17) {
      baseUtilization += 30 + (seed * 5); // Peak business hours
    } else if (hour >= 6 && hour <= 22) {
      baseUtilization += 15 + (seed * 3); // Extended hours
    } else {
      baseUtilization += seed * 2; // Night hours
    }

    // Add some variation based on plaza characteristics
    const hourlyVariation = Math.sin((hour + seed) * 0.3) * 10;
    const randomVariation = (Math.random() - 0.5) * 8;
    
    const utilization = Math.max(20, Math.min(95, 
      baseUtilization + hourlyVariation + randomVariation
    ));

    trends.push({
      time,
      utilization: Math.round(utilization)
    });
  }

  return trends;
}

/**
 * Calculate summary statistics for daily trends
 */
function calculateDailySummary(trends: Array<{ time: string; utilization: number }>) {
  if (trends.length === 0) {
    return {
      avgUtilization: 0,
      peakUtilization: 0,
      peakTime: '00:00',
      lowUtilization: 0,
      lowTime: '00:00'
    };
  }

  const utilizations = trends.map(t => t.utilization);
  const avgUtilization = utilizations.reduce((sum, u) => sum + u, 0) / utilizations.length;
  
  const maxUtilization = Math.max(...utilizations);
  const minUtilization = Math.min(...utilizations);
  
  const peakIndex = utilizations.indexOf(maxUtilization);
  const lowIndex = utilizations.indexOf(minUtilization);

  return {
    avgUtilization: Math.round(avgUtilization * 100) / 100,
    peakUtilization: maxUtilization,
    peakTime: trends[peakIndex].time,
    lowUtilization: minUtilization,
    lowTime: trends[lowIndex].time
  };
}
