import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/observium/alerts
 * 
 * Proxy endpoint for Observium alerts API
 * Provides access to system alerts and monitoring notifications
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract query parameters
    const params: Record<string, any> = {};
    
    // Add supported parameters
    if (searchParams.get('device_id')) params.device_id = searchParams.get('device_id');
    if (searchParams.get('status')) params.status = searchParams.get('status');
    if (searchParams.get('entity_type')) params.entity_type = searchParams.get('entity_type');
    if (searchParams.get('alert_test_id')) params.alert_test_id = searchParams.get('alert_test_id');
    if (searchParams.get('fields')) params.fields = searchParams.get('fields');
    if (searchParams.get('pagesize')) params.pagesize = searchParams.get('pagesize');
    if (searchParams.get('pageno')) params.pageno = searchParams.get('pageno');

    console.log('🔍 Fetching alerts from Observium with params:', params);

    const response = await observiumApi.get('/alerts', { params });
    
    console.log('✅ Alerts response received:', {
      status: response.status,
      dataKeys: Object.keys(response.data || {}),
      count: response.data?.count || 'unknown'
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching alerts from Observium:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch alerts from Observium',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
