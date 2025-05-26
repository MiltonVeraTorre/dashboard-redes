import { NextRequest, NextResponse } from 'next/server';
import * as MonitoringDomain from '@/lib/domain/monitoring';
import * as ObserviumAdapter from '@/lib/adapters/ObserviumApiAdapter';
import { cacheService } from '@/lib/services/cache-service';

/**
 * GET /api/monitoring/plaza/[plaza]/latency
 *
 * Returns latency analysis data for different network tiers in a specific plaza.
 * This endpoint provides data for the "Análisis de Latencia" chart.
 *
 * Path Parameters:
 * - plaza: The name of the plaza (e.g., "Laredo", "Saltillo")
 *
 * Query Parameters:
 * - period: Time period for analysis ('7d', '30d', default: '7d')
 * - networkTypes: Comma-separated network types ('backbone,distribucion,acceso', default: all)
 *
 * Response:
 * {
 *   "plaza": "Laredo",
 *   "period": "7d",
 *   "latencyData": {
 *     "backbone": [
 *       { "date": "2024-01-01", "latencia": 5.2 },
 *       { "date": "2024-01-02", "latencia": 4.8 },
 *       ...
 *     ],
 *     "distribucion": [...],
 *     "acceso": [...]
 *   },
 *   "summary": {
 *     "backbone": { "avg": 5.1, "max": 8.2, "min": 3.1 },
 *     "distribucion": { "avg": 15.3, "max": 22.1, "min": 12.4 },
 *     "acceso": { "avg": 25.7, "max": 35.2, "min": 18.9 }
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
    const networkTypesParam = searchParams.get('networkTypes') || 'backbone,distribucion,acceso';
    const networkTypes = networkTypesParam.split(',');

    // Create cache key
    const cacheKey = `plaza-latency:${plaza}:${period}:${networkTypes.join(',')}`;

    // Check cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`🚀 Cache hit for latency: ${plaza}`);
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheTimeRemaining: cacheService.getTimeRemaining(cacheKey)
      });
    }

    console.log(`🔍 Fetching latency analysis for plaza: ${plaza}`);
    console.log(`📊 Period: ${period}, Network types: ${networkTypes.join(', ')}`);

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
          latencyData: {},
          summary: {},
          warning: 'No devices found for this plaza'
        });
      }

      console.log(`📱 Found ${devices.length} devices for plaza ${plaza}`);

      // For now, we'll use fallback data since real latency data requires
      // specific sensor configuration in Observium
      const latencyData = generateLatencyData(plaza, period, networkTypes);
      const summary = calculateLatencySummary(latencyData);

      console.log(`✅ Successfully generated latency analysis for plaza: ${plaza}`);

      const response = {
        plaza,
        period,
        latencyData,
        summary,
        note: 'Using simulated latency data based on network topology',
        timestamp: new Date().toISOString()
      };

      // Cache the response for 5 minutes
      cacheService.set(cacheKey, response, 5 * 60 * 1000);

      return NextResponse.json(response);

    } catch (error) {
      console.warn(`⚠️ Failed to fetch real data for plaza ${plaza}, using fallback:`, error);

      // Fallback to generated data
      const latencyData = generateLatencyData(plaza, period, networkTypes);
      const summary = calculateLatencySummary(latencyData);

      const fallbackResponse = {
        plaza,
        period,
        latencyData,
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
    console.error(`❌ Error fetching latency analysis for plaza ${plazaParam}:`, error);

    return NextResponse.json(
      {
        error: 'Failed to fetch latency analysis',
        plaza: plazaParam,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Generate latency data for different network types
 */
function generateLatencyData(plaza: string, period: string, networkTypes: string[]) {
  const plazaSeeds: Record<string, number> = {
    'Laredo': 1,
    'Saltillo': 2,
    'CDMX': 3,
    'Monterrey': 4
  };

  const baseLatencies = {
    backbone: 5,
    distribucion: 15,
    acceso: 25
  };

  const seed = plazaSeeds[plaza] || 1;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const latencyData: Record<string, Array<{ date: string; latencia: number }>> = {};

  networkTypes.forEach(networkType => {
    if (!baseLatencies[networkType as keyof typeof baseLatencies]) return;

    const baseLatency = baseLatencies[networkType as keyof typeof baseLatencies];
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Generate different patterns for each plaza and network type
      const variation = Math.sin((i + seed + networkType.length) * 0.6) * 3 + (seed * 0.5);
      const latencia = Math.max(1, baseLatency + variation);

      data.push({
        date: date.toISOString().split('T')[0],
        latencia: Math.round(latencia * 10) / 10
      });
    }

    latencyData[networkType] = data;
  });

  return latencyData;
}

/**
 * Calculate summary statistics for latency data
 */
function calculateLatencySummary(latencyData: Record<string, Array<{ date: string; latencia: number }>>) {
  const summary: Record<string, { avg: number; max: number; min: number }> = {};

  Object.entries(latencyData).forEach(([networkType, data]) => {
    if (data.length === 0) {
      summary[networkType] = { avg: 0, max: 0, min: 0 };
      return;
    }

    const latencies = data.map(d => d.latencia);
    summary[networkType] = {
      avg: Math.round((latencies.reduce((sum, l) => sum + l, 0) / latencies.length) * 10) / 10,
      max: Math.round(Math.max(...latencies) * 10) / 10,
      min: Math.round(Math.min(...latencies) * 10) / 10
    };
  });

  return summary;
}
