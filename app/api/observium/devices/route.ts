import { NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

export async function GET(request: Request) {
  try {
    // Get query parameters from the request URL
    const url = new URL(request.url);
    const fields = url.searchParams.get('fields') || 'device_id,hostname,status,location';
    
    // Make the request to Observium API
    const response = await observiumApi.get('/devices', {
      params: {
        fields
      }
    });
    
    // Return the data
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error proxying request to Observium:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data from Observium' },
      { status: 500 }
    );
  }
}
