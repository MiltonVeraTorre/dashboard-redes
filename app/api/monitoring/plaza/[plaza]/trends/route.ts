import { NextRequest, NextResponse } from 'next/server';
import * as MonitoringDomain from '@/lib/domain/monitoring';
import * as ObserviumAdapter from '@/lib/adapters/ObserviumApiAdapter';
import { cacheService } from '@/lib/services/cache-service';

/**
 * GET /api/monitoring/plaza/[plaza]/trends
 *
 * Returns historical utilization trends for a specific plaza.
 * This endpoint provides data for the "Tendencias de Utilización" chart.
 *
 * Path Parameters:
 * - plaza: The name of the plaza (e.g., "Laredo", "Saltillo")
 *
 * Query Parameters:
 * - period: Time period for trends ('7d', '30d', '90d', default: '7d')
 * - interval: Data aggregation interval ('hour', 'day', 'week', default: 'day')
 *
 * Response:
 * {
 *   "plaza": "Laredo",
 *   "period": "7d",
 *   "interval": "day",
 *   "trends": [
 *     { "date": "2024-01-01", "utilizacion": 65 },
 *     { "date": "2024-01-02", "utilizacion": 72 },
 *     ...
 *   ],
 *   "summary": {
 *     "avgUtilization": 68.5,
 *     "maxUtilization": 85.2,
 *     "minUtilization": 45.1
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
    const period = searchParams.get('period') || '7d';
    const interval = searchParams.get('interval') as 'hour' | 'day' | 'week' || 'day';

    // Create cache key
    const cacheKey = `plaza-trends:${plaza}:${period}:${interval}`;

    // Check cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`🚀 Cache hit for trends: ${plaza}`);
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheTimeRemaining: cacheService.getTimeRemaining(cacheKey)
      });
    }

    console.log(`🔍 Fetching utilization trends for plaza: ${plaza}`);
    console.log(`📊 Period: ${period}, Interval: ${interval}`);

    // Calculate date range based on period
    const toDate = new Date();
    const fromDate = new Date();

    switch (period) {
      case '7d':
        fromDate.setDate(toDate.getDate() - 7);
        break;
      case '30d':
        fromDate.setDate(toDate.getDate() - 30);
        break;
      case '90d':
        fromDate.setDate(toDate.getDate() - 90);
        break;
      default:
        fromDate.setDate(toDate.getDate() - 7);
    }

    try {
      // Get devices for the plaza
      const devices = await ObserviumAdapter.fetchDevicesByPlaza(plaza);

      if (devices.length === 0) {
        console.log(`⚠️ No devices found for plaza: ${plaza}`);
        return NextResponse.json({
          plaza,
          period,
          interval,
          trends: [],
          summary: {
            avgUtilization: 0,
            maxUtilization: 0,
            minUtilization: 0
          },
          warning: 'No devices found for this plaza'
        });
      }

      const deviceIds = devices.map(d => d.device_id);
      console.log(`📱 Found ${devices.length} devices for plaza ${plaza}`);

      // Fetch historical performance data
      const historicalData = await ObserviumAdapter.fetchHistoricalPerformance(
        deviceIds,
        fromDate.toISOString(),
        toDate.toISOString(),
        interval
      );

      // Process and aggregate the data
      const trends = processHistoricalDataForTrends(historicalData, interval);
      const summary = calculateTrendsSummary(trends);

      console.log(`✅ Successfully fetched trends for plaza: ${plaza}`);
      console.log(`📈 Generated ${trends.length} data points`);

      const response = {
        plaza,
        period,
        interval,
        trends,
        summary,
        timestamp: new Date().toISOString()
      };

      // Cache the response for 1 hour (trends data for executive context)
      cacheService.set(cacheKey, response, 60 * 60 * 1000);

      return NextResponse.json(response);

    } catch (error) {
      console.warn(`⚠️ Failed to fetch real data for plaza ${plaza}, using fallback:`, error);

      // Fallback to generated data if real data fails
      const fallbackTrends = generateFallbackTrends(plaza, period);
      const summary = calculateTrendsSummary(fallbackTrends);

      const fallbackResponse = {
        plaza,
        period,
        interval,
        trends: fallbackTrends,
        summary,
        fallback: true,
        warning: 'Using generated data due to API unavailability',
        timestamp: new Date().toISOString()
      };

      // Cache fallback data for shorter time (1 minute)
      cacheService.set(cacheKey, fallbackResponse, 1 * 60 * 1000);

      return NextResponse.json(fallbackResponse);
    }

  } catch (error) {
    console.error(`❌ Error fetching trends for plaza ${plazaParam}:`, error);

    return NextResponse.json(
      {
        error: 'Failed to fetch utilization trends',
        plaza: plazaParam,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Process historical data into trend format
 */
function processHistoricalDataForTrends(historicalData: any, interval: string) {
  // This would process the real Observium data
  // For now, return empty array as placeholder
  return [];
}

/**
 * Calculate summary statistics for trends
 */
function calculateTrendsSummary(trends: Array<{ date: string; utilizacion: number }>) {
  if (trends.length === 0) {
    return {
      avgUtilization: 0,
      maxUtilization: 0,
      minUtilization: 0
    };
  }

  const utilizations = trends.map(t => t.utilizacion);
  return {
    avgUtilization: Math.round((utilizations.reduce((sum, u) => sum + u, 0) / utilizations.length) * 100) / 100,
    maxUtilization: Math.round(Math.max(...utilizations) * 100) / 100,
    minUtilization: Math.round(Math.min(...utilizations) * 100) / 100
  };
}

/**
 * Generate fallback trends data when real data is unavailable
 */
function generateFallbackTrends(plaza: string, period: string) {
  const plazaSeeds: Record<string, number> = {
    'Laredo': 1,
    'Saltillo': 2,
    'CDMX': 3,
    'Monterrey': 4
  };

  const seed = plazaSeeds[plaza] || 1;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const trends = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Generate different patterns for each plaza
    const variation = Math.sin((i + seed) * 0.8) * 20 + (seed * 5);
    const baseUtilization = 50 + (seed * 10);
    const utilizacion = Math.max(20, Math.min(90, baseUtilization + variation));

    trends.push({
      date: date.toISOString().split('T')[0],
      utilizacion: Math.round(utilizacion)
    });
  }

  return trends;
}
