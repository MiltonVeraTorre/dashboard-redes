import { NextRequest, NextResponse } from 'next/server';
import * as MonitoringDomain from '@/lib/domain/monitoring';

/**
 * GET /api/monitoring/plazas
 * 
 * Returns a list of available plazas for HU-02 filtering.
 * This endpoint supports the plaza dropdown selection in the technical monitoring interface.
 * 
 * Response:
 * {
 *   "plazas": ["Laredo", "Saltillo", "CDMX", ...],
 *   "count": 3
 * }
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching available plazas from Observium...');
    
    const plazas = await MonitoringDomain.getAvailablePlazas();
    
    console.log(`✅ Successfully fetched ${plazas.length} plazas:`, plazas);
    
    return NextResponse.json({
      plazas,
      count: plazas.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching available plazas:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch available plazas',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
