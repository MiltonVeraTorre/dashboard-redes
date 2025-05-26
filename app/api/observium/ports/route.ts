import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/observium/ports
 * 
 * Proxy endpoint for Observium ports API
 * Provides access to network port/interface data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract query parameters
    const params: Record<string, any> = {};
    
    // Add supported parameters
    if (searchParams.get('device_id')) params.device_id = searchParams.get('device_id');
    if (searchParams.get('state')) params.state = searchParams.get('state');
    if (searchParams.get('ifType')) params.ifType = searchParams.get('ifType');
    if (searchParams.get('fields')) params.fields = searchParams.get('fields');
    if (searchParams.get('pagesize')) params.pagesize = searchParams.get('pagesize');
    if (searchParams.get('pageno')) params.pageno = searchParams.get('pageno');

    console.log('🔍 Fetching ports from Observium with params:', params);

    const response = await observiumApi.get('/ports', { params });
    
    console.log('✅ Ports response received:', {
      status: response.status,
      dataKeys: Object.keys(response.data || {}),
      count: response.data?.count || 'unknown'
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching ports from Observium:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch ports from Observium',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
