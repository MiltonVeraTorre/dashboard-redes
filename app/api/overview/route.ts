import { NextRequest, NextResponse } from 'next/server';
import * as OverviewBFF from '@/lib/bff/overview';

/**
 * GET /api/overview
 * 
 * Returns a comprehensive overview of the network status
 */
export async function GET(request: NextRequest) {
  try {
    const overview = await OverviewBFF.getNetworkOverview();
    
    return NextResponse.json(overview);
  } catch (error) {
    console.error('Error fetching network overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network overview' },
      { status: 500 }
    );
  }
}
