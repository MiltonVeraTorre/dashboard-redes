import { NextRequest, NextResponse } from 'next/server';
import * as RankingBFF from '@/lib/bff/ranking';

/**
 * GET /api/ranking
 * 
 * Query parameters:
 * - by: Ranking criteria (utilization or critical)
 * - limit: Limit the number of sites returned
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const by = searchParams.get('by') || 'utilization';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    let rankedSites;
    
    if (by === 'critical') {
      rankedSites = await RankingBFF.getSitesRankedByCriticalLinks(limit);
    } else {
      rankedSites = await RankingBFF.getSitesRankedByUtilization(limit);
    }
    
    return NextResponse.json(rankedSites);
  } catch (error) {
    console.error('Error fetching ranked sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ranked sites' },
      { status: 500 }
    );
  }
}
