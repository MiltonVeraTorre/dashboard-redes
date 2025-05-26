import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/observium/sensors
 * 
 * Proxy endpoint for Observium sensors API
 * Provides access to environmental sensor data (temperature, voltage, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract query parameters
    const params: Record<string, any> = {};
    
    // Add supported parameters
    if (searchParams.get('device_id')) params.device_id = searchParams.get('device_id');
    if (searchParams.get('sensor_class')) params.sensor_class = searchParams.get('sensor_class');
    if (searchParams.get('sensor_type')) params.sensor_type = searchParams.get('sensor_type');
    if (searchParams.get('metric')) params.metric = searchParams.get('metric');
    if (searchParams.get('fields')) params.fields = searchParams.get('fields');
    if (searchParams.get('pagesize')) params.pagesize = searchParams.get('pagesize');
    if (searchParams.get('pageno')) params.pageno = searchParams.get('pageno');

    console.log('🔍 Fetching sensors from Observium with params:', params);

    const response = await observiumApi.get('/sensors', { params });
    
    console.log('✅ Sensors response received:', {
      status: response.status,
      dataKeys: Object.keys(response.data || {}),
      count: response.data?.count || 'unknown'
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching sensors from Observium:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch sensors from Observium',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
