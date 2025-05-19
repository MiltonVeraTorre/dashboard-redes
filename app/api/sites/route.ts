import { NextRequest, NextResponse } from 'next/server';
import * as SitesBFF from '@/lib/bff/sites';

/**
 * GET /api/sites
 * 
 * Query parameters:
 * - plaza: Filter sites by plaza
 * - limit: Limit the number of sites returned
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const plaza = searchParams.get('plaza') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    
    const sites = await SitesBFF.getSites({ plaza, limit });
    
    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}
