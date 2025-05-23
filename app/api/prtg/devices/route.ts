import { NextResponse } from 'next/server';
import { prtgApi } from '@/lib/adapters/PrtgApiAdapter';

export async function GET() {
  try {
    // Make the request to PRTG API
    const response = await prtgApi.get('/table.json', {
      params: {
        content: 'devices',
        output: 'json'
      }
    });
    
    // Return the data
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error proxying request to PRTG:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data from PRTG' },
      { status: 500 }
    );
  }
}
