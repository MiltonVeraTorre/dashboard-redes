import { NextRequest, NextResponse } from 'next/server';
import * as OverviewBFF from '@/lib/bff/overview';

/**
 * GET /api/overview/executive
 *
 * Returns a summary of the network status for the executive dashboard
 */
export async function GET(_request: NextRequest) {
  try {
    const summary = await OverviewBFF.getExecutiveSummary();

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching executive summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executive summary' },
      { status: 500 }
    );
  }
}
