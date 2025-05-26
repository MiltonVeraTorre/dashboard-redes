import { NextRequest, NextResponse } from 'next/server';
import * as MonitoringDomain from '@/lib/domain/monitoring';
import { cacheService } from '@/lib/services/cache-service';

/**
 * GET /api/monitoring/plaza/[plaza]
 *
 * Returns comprehensive monitoring data for a specific plaza.
 * This endpoint supports HU-02 plaza filtering and detailed technical monitoring.
 *
 * Path Parameters:
 * - plaza: The name of the plaza (e.g., "Laredo", "Saltillo")
 *
 * Query Parameters:
 * - includeCapacity: Include capacity summary (default: true)
 * - includeTopDevices: Include top devices by utilization (default: true)
 * - topDevicesLimit: Number of top devices to return (default: 5)
 *
 * Response:
 * {
 *   "plaza": "Laredo",
 *   "overview": { ... },
 *   "capacitySummary": { ... },
 *   "topDevices": [ ... ],
 *   "healthScore": { ... }
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
    const includeCapacity = searchParams.get('includeCapacity') !== 'false';
    const includeTopDevices = searchParams.get('includeTopDevices') !== 'false';
    const topDevicesLimit = parseInt(searchParams.get('topDevicesLimit') || '5', 10);

    // Create cache key based on parameters
    const cacheKey = `plaza-monitoring:${plaza}:${includeCapacity}:${includeTopDevices}:${topDevicesLimit}`;

    // Check cache first
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`🚀 Cache hit for plaza: ${plaza}`);
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheTimeRemaining: cacheService.getTimeRemaining(cacheKey)
      });
    }

    console.log(`🔍 Fetching monitoring data for plaza: ${plaza}`);
    console.log(`📊 Options: capacity=${includeCapacity}, topDevices=${includeTopDevices}, limit=${topDevicesLimit}`);

    // Fetch plaza overview (always included)
    const overview = await MonitoringDomain.getPlazaOverview(plaza);

    // Build response object
    const response: any = {
      plaza,
      overview,
      timestamp: new Date().toISOString()
    };

    // Fetch capacity summary if requested
    if (includeCapacity) {
      console.log(`📈 Fetching capacity summary for ${plaza}...`);
      try {
        const capacitySummary = await MonitoringDomain.getPlazaCapacitySummary(plaza);
        response.capacitySummary = capacitySummary;
        console.log(`✅ Capacity summary: ${capacitySummary.utilizationPercentage}% utilization`);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch capacity summary for ${plaza}:`, error);
        response.capacitySummary = null;
        response.warnings = response.warnings || [];
        response.warnings.push('Failed to fetch capacity summary');
      }
    }

    // Fetch top devices if requested
    if (includeTopDevices) {
      console.log(`🏆 Fetching top ${topDevicesLimit} devices for ${plaza}...`);
      try {
        const topDevices = await MonitoringDomain.getTopDevicesByUtilization(plaza, topDevicesLimit);
        response.topDevices = topDevices;
        console.log(`✅ Found ${topDevices.length} devices with utilization data`);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch top devices for ${plaza}:`, error);
        response.topDevices = [];
        response.warnings = response.warnings || [];
        response.warnings.push('Failed to fetch top devices');
      }
    }

    // Calculate health score
    try {
      const healthScore = MonitoringDomain.calculatePlazaHealthScore(overview);
      response.healthScore = healthScore;
      console.log(`💚 Plaza health score: ${healthScore.score}/100 (Grade: ${healthScore.grade})`);
    } catch (error) {
      console.warn(`⚠️ Failed to calculate health score for ${plaza}:`, error);
      response.healthScore = null;
      response.warnings = response.warnings || [];
      response.warnings.push('Failed to calculate health score');
    }

    console.log(`✅ Successfully fetched monitoring data for plaza: ${plaza}`);

    // Cache the response for 2 minutes (monitoring data changes frequently)
    cacheService.set(cacheKey, response, 2 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error) {
    console.error(`❌ Error fetching monitoring data for plaza ${params.plaza}:`, error);

    return NextResponse.json(
      {
        error: 'Failed to fetch plaza monitoring data',
        plaza: plazaParam,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
