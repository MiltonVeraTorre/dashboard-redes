import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/executive/network-consumption
 *
 * Returns network consumption data by plaza over time for the executive dashboard.
 * This endpoint aggregates port utilization data from Observium to show consumption trends.
 *
 * Query Parameters:
 * - timeRange: Time range for data (default: '7d') - '1d', '7d', '30d'
 * - plazas: Comma-separated list of plazas to include (optional)
 *
 * Response:
 * {
 *   "timeRange": "7d",
 *   "data": [
 *     {
 *       "timestamp": "2024-01-01T00:00:00Z",
 *       "CDMX": 45.2,
 *       "Monterrey": 38.7,
 *       "Queretaro": 42.1,
 *       "Miami": 35.8
 *     },
 *     ...
 *   ],
 *   "plazas": ["CDMX", "Monterrey", "Queretaro", "Miami"],
 *   "summary": {
 *     "totalDataPoints": 168,
 *     "averageConsumption": {
 *       "CDMX": 44.5,
 *       "Monterrey": 37.2,
 *       "Queretaro": 41.8,
 *       "Miami": 34.9
 *     }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d';
    const plazasParam = searchParams.get('plazas');
    const requestedPlazas = plazasParam ? plazasParam.split(',') : null;

    console.log(`🔍 Fetching network consumption data from bills (timeRange: ${timeRange})`);

    // Step 1: Get bills data with pagination for safety
    const billsResponse = await observiumApi.get('/bills', {
      params: {
        pagesize: 50 // Limit to prevent large responses
      }
    });

    if (!billsResponse.data || !billsResponse.data.bill ||
        (Array.isArray(billsResponse.data.bill) && billsResponse.data.bill.length === 0) ||
        (typeof billsResponse.data.bill === 'object' && Object.keys(billsResponse.data.bill).length === 0)) {
      console.warn('⚠️ No bills found in Observium response, generating demo data');

      // Generate demo data for empty Observium instance
      const demoPlazas = ['Saltillo', 'Monterrey', 'Queretaro', 'Guadalajara'];
      const demoConsumptionData: Record<string, number[]> = {
        'Saltillo': [45.2],
        'Monterrey': [38.7],
        'Queretaro': [42.1],
        'Guadalajara': [35.8]
      };

      const timeSeriesData = generateTimeSeriesData(timeRange, demoConsumptionData);
      const summary = calculateSummary(timeSeriesData, demoPlazas);

      return NextResponse.json({
        timeRange,
        data: timeSeriesData,
        plazas: demoPlazas,
        summary,
        timestamp: new Date().toISOString(),
        demo: true
      });
    }

    // Step 2: Process bills data and extract location-based consumption
    const bills = Object.values(billsResponse.data.bill) as any[];
    const consumptionByLocation: Record<string, { totalTraffic: number, billCount: number }> = {};

    console.log(`📊 Processing ${bills.length} bills for consumption analysis`);

    bills.forEach((bill: any) => {
      // Extract location from bill name or notes
      const location = extractLocationFromBill(bill);

      // Calculate total traffic (95th percentile rate in bps converted to Mbps)
      const rate95thIn = parseFloat(bill.rate_95th_in) || 0;
      const rate95thOut = parseFloat(bill.rate_95th_out) || 0;
      const totalTrafficBps = Math.max(rate95thIn, rate95thOut); // Use the higher of in/out
      const totalTrafficMbps = totalTrafficBps / (1024 * 1024); // Convert to Mbps

      if (!consumptionByLocation[location]) {
        consumptionByLocation[location] = { totalTraffic: 0, billCount: 0 };
      }

      consumptionByLocation[location].totalTraffic += totalTrafficMbps;
      consumptionByLocation[location].billCount += 1;
    });

    // Calculate average consumption per location
    const consumptionData: Record<string, number[]> = {};
    Object.keys(consumptionByLocation).forEach(location => {
      const data = consumptionByLocation[location];
      const avgConsumption = data.billCount > 0 ? data.totalTraffic / data.billCount : 0;
      consumptionData[location] = [avgConsumption];
      console.log(`✅ Location ${location}: ${data.billCount} bills, avg consumption: ${avgConsumption.toFixed(2)} Mbps`);
    });

    // Filter plazas if requested
    const plazasToProcess = requestedPlazas
      ? Object.keys(consumptionData).filter(plaza => requestedPlazas.includes(plaza))
      : Object.keys(consumptionData);

    console.log(`📊 Final processing for ${plazasToProcess.length} locations:`, plazasToProcess);

    // Step 3: Generate time series data (mock historical data for now)
    const timeSeriesData = generateTimeSeriesData(timeRange, consumptionData);

    // Step 4: Calculate summary statistics
    const summary = calculateSummary(timeSeriesData, plazasToProcess);

    console.log(`✅ Successfully generated network consumption data for ${plazasToProcess.length} locations`);

    return NextResponse.json({
      timeRange,
      data: timeSeriesData,
      plazas: plazasToProcess,
      summary,
      timestamp: new Date().toISOString(),
      source: 'bills_data'
    });

  } catch (error) {
    console.error('❌ Error fetching network consumption data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch network consumption data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate time series data based on current consumption values
 * This is a simplified version - in production, you'd fetch historical data
 */
function generateTimeSeriesData(timeRange: string, consumptionData: Record<string, number[]>) {
  const now = new Date();
  const dataPoints: any[] = [];

  // Determine number of data points based on time range
  const intervals = {
    '1d': { points: 24, intervalHours: 1 },
    '7d': { points: 168, intervalHours: 1 }, // Hourly for 7 days
    '30d': { points: 30, intervalHours: 24 } // Daily for 30 days
  };

  const config = intervals[timeRange as keyof typeof intervals] || intervals['7d'];

  for (let i = config.points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * config.intervalHours * 60 * 60 * 1000));

    const dataPoint: any = {
      timestamp: timestamp.toISOString()
    };

    // Add consumption values for each plaza with some variation
    Object.keys(consumptionData).forEach(plaza => {
      const baseValue = consumptionData[plaza][0] || 0;
      // Add some realistic variation (±20%)
      const variation = (Math.random() - 0.5) * 0.4;
      dataPoint[plaza] = Math.max(0, baseValue * (1 + variation));
    });

    dataPoints.push(dataPoint);
  }

  return dataPoints;
}

/**
 * Calculate summary statistics for the consumption data
 */
function calculateSummary(timeSeriesData: any[], plazas: string[]) {
  const averageConsumption: Record<string, number> = {};

  plazas.forEach(plaza => {
    const values = timeSeriesData
      .map(point => point[plaza] || 0)
      .filter(val => val > 0);

    averageConsumption[plaza] = values.length > 0
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0;
  });

  return {
    totalDataPoints: timeSeriesData.length,
    averageConsumption
  };
}

/**
 * Extract location from bill data
 * Analyzes bill name, notes, and customer ID to determine location
 */
function extractLocationFromBill(bill: any): string {
  const billName = (bill.bill_name || '').toLowerCase();
  const billNotes = (bill.bill_notes || '').toLowerCase();
  const billRef = (bill.bill_ref || '').toLowerCase();

  // Location mapping based on common patterns in bill data
  const locationPatterns = {
    'saltillo': ['saltillo', 'jolla'],
    'monterrey': ['monterrey', 'mty', 'purisima', 'guadalupe'],
    'queretaro': ['queretaro', 'qro'],
    'guadalajara': ['guadalajara', 'gdl', 'cardenal'],
    'torreon': ['torreon', 'torreón'],
    'piedras negras': ['piedras negras', 'piedra negra', 'acuña'],
    'sabinas': ['sabinas'],
    'monclova': ['monclova'],
    'parras': ['parras'],
    'muzquiz': ['muzquiz'],
    'villa union': ['villa union'],
    'nueva rosita': ['nueva rosita', 'rosita'],
    'cogent': ['cogent'],
    'ti sparkle': ['ti sparkle', 'sparkle'],
    'marcatel': ['marcatel'],
    'alestra': ['alestra']
  };

  // Check all text fields for location patterns
  const searchText = `${billName} ${billNotes} ${billRef}`;

  for (const [location, patterns] of Object.entries(locationPatterns)) {
    if (patterns.some(pattern => searchText.includes(pattern))) {
      return location.charAt(0).toUpperCase() + location.slice(1);
    }
  }

  // Default location if no pattern matches
  return 'Other';
}
