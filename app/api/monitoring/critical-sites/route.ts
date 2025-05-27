import { NextRequest, NextResponse } from 'next/server';
import { fetchCriticalSites } from '@/lib/services/network-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const sortBy = searchParams.get('sortBy') || 'utilization'; // utilization, alerts, trend

    const data = await fetchCriticalSites(limit);

    // Sort the data based on the sortBy parameter
    let sortedData = [...data];
    switch (sortBy) {
      case 'alerts':
        sortedData.sort((a, b) => (b.criticalLinks || 0) - (a.criticalLinks || 0));
        break;
      case 'trend':
        // For trend, we'll prioritize sites with increasing utilization
        sortedData.sort((a, b) => {
          const aTrend = a.utilizationPercentage > 70 ? 1 : 0;
          const bTrend = b.utilizationPercentage > 70 ? 1 : 0;
          return bTrend - aTrend || b.utilizationPercentage - a.utilizationPercentage;
        });
        break;
      case 'utilization':
      default:
        sortedData.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);
        break;
    }

    return NextResponse.json({
      status: 'ok',
      count: sortedData.length,
      sites: sortedData.slice(0, limit),
      metadata: {
        sortBy,
        limit,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error fetching critical sites:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Failed to fetch critical sites',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}