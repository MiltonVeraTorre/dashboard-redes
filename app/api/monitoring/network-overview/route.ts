import { NextResponse } from 'next/server';
import { fetchNetworkOverview } from '@/lib/services/network-service';

export async function GET() {
  try {
    const data = await fetchNetworkOverview();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching network overview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch network overview' },
      { status: 500 }
    );
  }
} 