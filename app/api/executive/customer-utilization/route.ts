import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/executive/customer-utilization
 * 
 * Returns customer utilization analysis for the executive dashboard.
 * This endpoint analyzes customer usage vs contracted capacity.
 * 
 * Query Parameters:
 * - threshold: Utilization threshold for analysis (default: 80) - percentage
 * - sortBy: Sort method (default: 'utilization') - 'utilization', 'revenue', 'traffic'
 * 
 * Response:
 * {
 *   "threshold": 80,
 *   "sortBy": "utilization",
 *   "data": [
 *     {
 *       "customerName": "Enterprise Corp",
 *       "location": "Saltillo",
 *       "contractedMbps": 1000,
 *       "currentUsageMbps": 850,
 *       "utilizationRate": 85.0,
 *       "status": "high",
 *       "monthlyRevenue": 10000,
 *       "peakUsage": 920
 *     },
 *     ...
 *   ],
 *   "summary": {
 *     "totalCustomers": 178,
 *     "highUtilization": 25,
 *     "mediumUtilization": 89,
 *     "lowUtilization": 64,
 *     "avgUtilization": 65.2,
 *     "revenueAtRisk": 125000
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const threshold = parseInt(searchParams.get('threshold') || '80');
    const sortBy = searchParams.get('sortBy') || 'utilization';

    console.log(`🔍 Fetching customer utilization data (threshold: ${threshold}%, sortBy: ${sortBy})`);

    // Step 1: Get bills data with pagination for safety
    const billsResponse = await observiumApi.get('/bills', {
      params: {
        pagesize: 100
      }
    });

    if (!billsResponse.data || !billsResponse.data.bill ||
        (Array.isArray(billsResponse.data.bill) && billsResponse.data.bill.length === 0) ||
        (typeof billsResponse.data.bill === 'object' && Object.keys(billsResponse.data.bill).length === 0)) {
      console.warn('⚠️ No bills found in Observium response, generating demo data');

      return NextResponse.json({
        threshold,
        sortBy,
        data: generateDemoUtilizationData(sortBy),
        summary: {
          totalCustomers: 25,
          highUtilization: 5,
          mediumUtilization: 12,
          lowUtilization: 8,
          avgUtilization: 65.2,
          revenueAtRisk: 125000
        },
        timestamp: new Date().toISOString(),
        source: 'demo_data'
      });
    }

    // Step 2: Process bills data for utilization analysis
    const bills = Object.values(billsResponse.data.bill) as any[];
    const utilizationData = processUtilizationData(bills, threshold, sortBy);

    // Step 3: Calculate summary statistics
    const summary = calculateUtilizationSummary(utilizationData, threshold);

    console.log(`✅ Successfully analyzed utilization for ${bills.length} customers`);

    return NextResponse.json({
      threshold,
      sortBy,
      data: utilizationData,
      summary,
      timestamp: new Date().toISOString(),
      source: 'bills_data'
    });

  } catch (error) {
    console.error('❌ Error fetching customer utilization data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch customer utilization data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Process bills data for utilization analysis
 */
function processUtilizationData(bills: any[], threshold: number, sortBy: string) {
  const utilizationData = bills.map((bill: any) => {
    // Calculate contracted capacity
    const contractedBytes = parseFloat(bill.bill_quota) || 0;
    const contractedMbps = contractedBytes / (1024 * 1024);

    // Calculate current usage (95th percentile)
    const rate95thIn = parseFloat(bill.rate_95th_in) || 0;
    const rate95thOut = parseFloat(bill.rate_95th_out) || 0;
    const currentUsageBps = Math.max(rate95thIn, rate95thOut);
    const currentUsageMbps = currentUsageBps / (1024 * 1024);

    // Calculate peak usage (total data transferred)
    const totalDataIn = parseFloat(bill.total_data_in) || 0;
    const totalDataOut = parseFloat(bill.total_data_out) || 0;
    const totalDataBytes = Math.max(totalDataIn, totalDataOut);
    const peakUsageMbps = totalDataBytes / (1024 * 1024 * 30 * 24 * 3600); // Approximate peak over month

    // Calculate utilization rate
    const utilizationRate = contractedMbps > 0 ? (currentUsageMbps / contractedMbps) * 100 : 0;

    // Determine status
    let status: string;
    if (utilizationRate >= threshold) {
      status = 'high';
    } else if (utilizationRate >= threshold * 0.6) {
      status = 'medium';
    } else {
      status = 'low';
    }

    // Estimate monthly revenue
    const monthlyRevenue = contractedMbps * 10; // $10 per Mbps estimate

    // Extract location
    const location = extractLocationFromBill(bill);

    return {
      customerName: bill.bill_name || 'Unknown Customer',
      location,
      contractedMbps: Math.round(contractedMbps * 10) / 10,
      currentUsageMbps: Math.round(currentUsageMbps * 10) / 10,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      status,
      monthlyRevenue: Math.round(monthlyRevenue),
      peakUsage: Math.round(peakUsageMbps * 10) / 10,
      billId: bill.bill_id
    };
  }).filter(customer => customer.contractedMbps > 0); // Only include customers with contracted capacity

  // Sort data based on sortBy parameter
  return sortUtilizationData(utilizationData, sortBy);
}

/**
 * Sort utilization data based on criteria
 */
function sortUtilizationData(data: any[], sortBy: string) {
  switch (sortBy) {
    case 'revenue':
      return data.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
    case 'traffic':
      return data.sort((a, b) => b.currentUsageMbps - a.currentUsageMbps);
    case 'utilization':
    default:
      return data.sort((a, b) => b.utilizationRate - a.utilizationRate);
  }
}

/**
 * Extract location from bill data
 */
function extractLocationFromBill(bill: any): string {
  const billName = (bill.bill_name || '').toLowerCase();
  const billNotes = (bill.bill_notes || '').toLowerCase();
  const billRef = (bill.bill_ref || '').toLowerCase();
  
  const locationPatterns = {
    'saltillo': ['saltillo', 'jolla'],
    'monterrey': ['monterrey', 'mty', 'purisima', 'guadalupe'],
    'queretaro': ['queretaro', 'qro'],
    'guadalajara': ['guadalajara', 'gdl', 'cardenal'],
    'torreon': ['torreon', 'torreón'],
    'cogent': ['cogent'],
    'ti sparkle': ['ti sparkle', 'sparkle'],
    'alestra': ['alestra'],
    'marcatel': ['marcatel']
  };

  const searchText = `${billName} ${billNotes} ${billRef}`;
  
  for (const [location, patterns] of Object.entries(locationPatterns)) {
    if (patterns.some(pattern => searchText.includes(pattern))) {
      return location.charAt(0).toUpperCase() + location.slice(1);
    }
  }

  return 'Other';
}

/**
 * Calculate utilization summary statistics
 */
function calculateUtilizationSummary(utilizationData: any[], threshold: number) {
  const totalCustomers = utilizationData.length;
  
  const highUtilization = utilizationData.filter(c => c.utilizationRate >= threshold).length;
  const mediumUtilization = utilizationData.filter(c => 
    c.utilizationRate >= threshold * 0.6 && c.utilizationRate < threshold
  ).length;
  const lowUtilization = utilizationData.filter(c => c.utilizationRate < threshold * 0.6).length;

  const avgUtilization = totalCustomers > 0 
    ? utilizationData.reduce((sum, c) => sum + c.utilizationRate, 0) / totalCustomers 
    : 0;

  // Calculate revenue at risk (high utilization customers)
  const revenueAtRisk = utilizationData
    .filter(c => c.utilizationRate >= threshold)
    .reduce((sum, c) => sum + c.monthlyRevenue, 0);

  return {
    totalCustomers,
    highUtilization,
    mediumUtilization,
    lowUtilization,
    avgUtilization: Math.round(avgUtilization * 10) / 10,
    revenueAtRisk: Math.round(revenueAtRisk)
  };
}

/**
 * Generate demo utilization data for fallback
 */
function generateDemoUtilizationData(sortBy: string) {
  const demoData = [
    {
      customerName: 'Enterprise Corp',
      location: 'Saltillo',
      contractedMbps: 1000,
      currentUsageMbps: 850,
      utilizationRate: 85.0,
      status: 'high',
      monthlyRevenue: 10000,
      peakUsage: 920
    },
    {
      customerName: 'Tech Solutions',
      location: 'Monterrey',
      contractedMbps: 500,
      currentUsageMbps: 380,
      utilizationRate: 76.0,
      status: 'medium',
      monthlyRevenue: 5000,
      peakUsage: 420
    },
    {
      customerName: 'Global Networks',
      location: 'Queretaro',
      contractedMbps: 750,
      currentUsageMbps: 225,
      utilizationRate: 30.0,
      status: 'low',
      monthlyRevenue: 7500,
      peakUsage: 280
    }
  ];

  return sortUtilizationData(demoData, sortBy);
}
