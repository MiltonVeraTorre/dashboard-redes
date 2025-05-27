import { NextRequest, NextResponse } from 'next/server';
import { fetchCriticalSites } from '@/lib/services/network-service';

interface SaturatedSiteData {
  id: string;
  name: string;
  plaza: string;
  saturation: number;
  trend: 'up' | 'down' | 'stable';
  outages: number;
  lastOutage?: string;
  previousSaturation?: number;
  status: 'normal' | 'warning' | 'critical';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const trendsOnly = searchParams.get('trendsOnly') === 'true';

    console.log(`🔍 Fetching top ${limit} saturated sites${trendsOnly ? ' (trends only)' : ''}`);

    // Fetch critical sites data
    const criticalSitesData = await fetchCriticalSites(limit * 2); // Get more data to ensure we have enough after filtering

    // Transform the data to match the expected format for the classification page
    // Only use real utilization data - no artificial boosting or simulation
    const saturatedSites: SaturatedSiteData[] = criticalSitesData.map(site => {
      const realUtilization = site.utilizationPercentage;

      // Determine status based on real utilization
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (realUtilization >= 85) {
        status = 'critical';
      } else if (realUtilization >= 70) {
        status = 'warning';
      }

      return {
        id: site.id,
        name: site.name,
        plaza: site.plaza,
        saturation: Math.round(realUtilization),
        trend: 'stable', // TODO: Implement real trend calculation from historical data
        outages: site.criticalLinks || 0,
        lastOutage: undefined, // TODO: Implement from real alerts data
        previousSaturation: undefined, // TODO: Implement from real historical data
        status
      };
    })
    .filter(site => {
      // Filter based on request type
      if (trendsOnly) {
        // TODO: Implement real trend filtering when historical data is available
        return false; // No trend data available without historical data
      }
      return site.saturation > 0; // Only include sites with actual utilization data
    })
    .sort((a, b) => {
      return b.saturation - a.saturation; // Sort by saturation descending
    })
    .slice(0, limit); // Limit results

    console.log(`✅ Returning ${saturatedSites.length} saturated sites`);

    return NextResponse.json({
      status: 'ok',
      count: saturatedSites.length,
      sites: saturatedSites,
      metadata: {
        limit,
        includeHistory,
        trendsOnly,
        timestamp: new Date().toISOString(),
        dataSource: 'observium'
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching saturated sites:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Failed to fetch saturated sites',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
