import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/executive/network-cost-analysis
 *
 * Returns network cost analysis for the executive dashboard.
 * This endpoint analyzes billing data to provide cost efficiency metrics.
 *
 * Query Parameters:
 * - period: Analysis period (default: 'monthly') - 'monthly', 'quarterly', 'yearly'
 * - includeProjections: Include cost projections (default: false)
 * - currency: Currency for display (default: 'USD')
 *
 * Response:
 * {
 *   "data": {
 *     "totalMonthlyCost": 125000,
 *     "costPerMbps": 45.50,
 *     "utilizationEfficiency": 68.5,
 *     "potentialSavings": 15000,
 *     "overProvisionedLinks": 8,
 *     "underUtilizedCapacity": 2500
 *   },
 *   "breakdown": [
 *     {
 *       "location": "CDMX",
 *       "monthlyCost": 45000,
 *       "contractedMbps": 1000,
 *       "actualUsageMbps": 750,
 *       "efficiency": 75.0,
 *       "costPerMbps": 45.00,
 *       "potentialSaving": 5000
 *     }
 *   ],
 *   "trends": [
 *     {
 *       "month": "2024-01",
 *       "cost": 120000,
 *       "usage": 65.2,
 *       "efficiency": 65.2
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'monthly';
    const includeProjections = searchParams.get('includeProjections') === 'true';
    const currency = searchParams.get('currency') || 'USD';

    console.log(`🔍 Fetching network cost analysis (period: ${period}, currency: ${currency})`);

    // Step 1: Get bills data for cost analysis
    const billsResponse = await observiumApi.get('/bills', {
      params: {
        pagesize: 100 // Get more bills for comprehensive analysis
      }
    });

    if (!billsResponse.data || !billsResponse.data.bill ||
        (Array.isArray(billsResponse.data.bill) && billsResponse.data.bill.length === 0) ||
        (typeof billsResponse.data.bill === 'object' && Object.keys(billsResponse.data.bill).length === 0)) {
      console.warn('⚠️ No bills found in Observium response, generating demo data');

      return NextResponse.json({
        data: {
          totalMonthlyCost: 125000,
          costPerMbps: 45.50,
          utilizationEfficiency: 68.5,
          potentialSavings: 15000,
          overProvisionedLinks: 8,
          underUtilizedCapacity: 2500,
          currency: 'USD'
        },
        breakdown: [
          {
            location: 'CDMX',
            monthlyCost: 45000,
            contractedMbps: 1000,
            actualUsageMbps: 750,
            efficiency: 75.0,
            costPerMbps: 45.00,
            potentialSaving: 5000
          },
          {
            location: 'Monterrey',
            monthlyCost: 35000,
            contractedMbps: 800,
            actualUsageMbps: 520,
            efficiency: 65.0,
            costPerMbps: 43.75,
            potentialSaving: 7000
          },
          {
            location: 'Queretaro',
            monthlyCost: 25000,
            contractedMbps: 600,
            actualUsageMbps: 480,
            efficiency: 80.0,
            costPerMbps: 41.67,
            potentialSaving: 2000
          },
          {
            location: 'Guadalajara',
            monthlyCost: 20000,
            contractedMbps: 400,
            actualUsageMbps: 220,
            efficiency: 55.0,
            costPerMbps: 50.00,
            potentialSaving: 4500
          }
        ],
        trends: generateDemoTrends(),
        projections: includeProjections ? {
          nextMonth: 128000,
          nextQuarter: 385000,
          yearEnd: 1540000,
          optimizedYearEnd: 1320000,
          potentialAnnualSavings: 220000
        } : null,
        timestamp: new Date().toISOString(),
        demo: true,
        source: 'demo_data'
      });
    }

    // Step 2: Process bills data for cost analysis
    const bills = Object.values(billsResponse.data.bill) as any[];
    console.log(`📊 Processing ${bills.length} bills for cost analysis`);

    const costAnalysis = await processCostAnalysis(bills, period, includeProjections, currency);

    console.log(`✅ Successfully generated network cost analysis`);

    return NextResponse.json({
      ...costAnalysis,
      timestamp: new Date().toISOString(),
      demo: false,
      source: 'observium_data'
    });

  } catch (error) {
    console.error('❌ Error fetching network cost analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch network cost analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Process cost analysis from bills data
 */
async function processCostAnalysis(bills: any[], period: string, includeProjections: boolean, currency: string) {
  const locationCosts: Record<string, {
    totalCost: number;
    contractedMbps: number;
    actualUsageMbps: number;
    billCount: number;
  }> = {};

  let totalMonthlyCost = 0;
  let totalContractedMbps = 0;
  let totalActualUsageMbps = 0;
  let overProvisionedCount = 0;
  let underUtilizedCapacity = 0;

  // Process each bill
  bills.forEach((bill: any) => {
    // Extract location from bill name or use 'Other'
    const location = extractLocationFromBill(bill) || 'Other';
    
    // Calculate monthly cost (assuming bill_quota is monthly cost in bytes, convert to currency)
    const monthlyCost = calculateMonthlyCost(bill);
    
    // Calculate contracted and actual usage
    const contractedMbps = parseFloat(bill.bill_quota) / (1024 * 1024) || 0; // Convert bytes to Mbps
    const rate95thIn = parseFloat(bill.rate_95th_in) || 0;
    const rate95thOut = parseFloat(bill.rate_95th_out) || 0;
    const actualUsageMbps = Math.max(rate95thIn, rate95thOut) / (1024 * 1024); // Convert bps to Mbps

    if (!locationCosts[location]) {
      locationCosts[location] = {
        totalCost: 0,
        contractedMbps: 0,
        actualUsageMbps: 0,
        billCount: 0
      };
    }

    locationCosts[location].totalCost += monthlyCost;
    locationCosts[location].contractedMbps += contractedMbps;
    locationCosts[location].actualUsageMbps += actualUsageMbps;
    locationCosts[location].billCount++;

    totalMonthlyCost += monthlyCost;
    totalContractedMbps += contractedMbps;
    totalActualUsageMbps += actualUsageMbps;

    // Check for over-provisioning (usage < 60% of contracted)
    if (contractedMbps > 0 && (actualUsageMbps / contractedMbps) < 0.6) {
      overProvisionedCount++;
      underUtilizedCapacity += contractedMbps - actualUsageMbps;
    }
  });

  // Calculate overall metrics
  const utilizationEfficiency = totalContractedMbps > 0 
    ? (totalActualUsageMbps / totalContractedMbps) * 100 
    : 0;
  const costPerMbps = totalActualUsageMbps > 0 
    ? totalMonthlyCost / totalActualUsageMbps 
    : 0;
  const potentialSavings = underUtilizedCapacity * (costPerMbps * 0.7); // Assume 70% of cost could be saved

  // Create breakdown by location
  const breakdown = Object.entries(locationCosts).map(([location, data]) => {
    const efficiency = data.contractedMbps > 0 
      ? (data.actualUsageMbps / data.contractedMbps) * 100 
      : 0;
    const locationCostPerMbps = data.actualUsageMbps > 0 
      ? data.totalCost / data.actualUsageMbps 
      : 0;
    const locationPotentialSaving = data.contractedMbps > 0 && efficiency < 80
      ? (data.contractedMbps - data.actualUsageMbps) * locationCostPerMbps * 0.5
      : 0;

    return {
      location,
      monthlyCost: Math.round(data.totalCost),
      contractedMbps: Math.round(data.contractedMbps),
      actualUsageMbps: Math.round(data.actualUsageMbps),
      efficiency: Math.round(efficiency * 10) / 10,
      costPerMbps: Math.round(locationCostPerMbps * 100) / 100,
      potentialSaving: Math.round(locationPotentialSaving)
    };
  }).sort((a, b) => b.monthlyCost - a.monthlyCost);

  return {
    data: {
      totalMonthlyCost: Math.round(totalMonthlyCost),
      costPerMbps: Math.round(costPerMbps * 100) / 100,
      utilizationEfficiency: Math.round(utilizationEfficiency * 10) / 10,
      potentialSavings: Math.round(potentialSavings),
      overProvisionedLinks: overProvisionedCount,
      underUtilizedCapacity: Math.round(underUtilizedCapacity),
      currency
    },
    breakdown: breakdown.slice(0, 10), // Top 10 locations
    trends: generateTrendsFromData(breakdown),
    projections: includeProjections ? calculateProjections(totalMonthlyCost, utilizationEfficiency) : null
  };
}

/**
 * Extract location from bill data
 */
function extractLocationFromBill(bill: any): string | null {
  // Try to extract location from bill_name, bill_notes, or other fields
  const billName = bill.bill_name || '';
  const billNotes = bill.bill_notes || '';
  
  const locations = ['CDMX', 'Monterrey', 'Queretaro', 'Guadalajara', 'Saltillo', 'Tijuana'];
  
  for (const location of locations) {
    if (billName.toLowerCase().includes(location.toLowerCase()) || 
        billNotes.toLowerCase().includes(location.toLowerCase())) {
      return location;
    }
  }
  
  return null;
}

/**
 * Calculate monthly cost from bill data
 */
function calculateMonthlyCost(bill: any): number {
  // This is a simplified calculation - in reality, you'd need to understand
  // the billing structure of your specific Observium setup
  const quota = parseFloat(bill.bill_quota) || 0;
  const rate = parseFloat(bill.rate_95th) || parseFloat(bill.rate_95th_in) || 0;
  
  // Assume a cost per Mbps model - this would need to be configured based on actual contracts
  const costPerMbps = 50; // $50 per Mbps per month (example)
  const usageMbps = rate / (1024 * 1024);
  
  return usageMbps * costPerMbps;
}

/**
 * Generate demo trends data
 */
function generateDemoTrends() {
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
  return months.map((month, index) => ({
    month,
    cost: 120000 + (index * 2000) + (Math.random() * 5000),
    usage: 65 + (index * 1.5) + (Math.random() * 5),
    efficiency: 65 + (index * 0.8) + (Math.random() * 3)
  }));
}

/**
 * Generate trends from actual data
 */
function generateTrendsFromData(breakdown: any[]) {
  // In a real implementation, this would use historical data
  // For now, generate simulated trends based on current data
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
  const currentCost = breakdown.reduce((sum, item) => sum + item.monthlyCost, 0);
  const currentEfficiency = breakdown.reduce((sum, item) => sum + item.efficiency, 0) / breakdown.length;
  
  return months.map((month, index) => ({
    month,
    cost: currentCost * (0.9 + (index * 0.02)),
    usage: currentEfficiency * (0.95 + (index * 0.01)),
    efficiency: currentEfficiency * (0.98 + (index * 0.005))
  }));
}

/**
 * Calculate cost projections
 */
function calculateProjections(currentMonthlyCost: number, currentEfficiency: number) {
  const growthRate = 0.02; // 2% monthly growth
  const efficiencyImprovement = 0.05; // 5% efficiency improvement potential
  
  return {
    nextMonth: Math.round(currentMonthlyCost * (1 + growthRate)),
    nextQuarter: Math.round(currentMonthlyCost * 3 * (1 + growthRate * 1.5)),
    yearEnd: Math.round(currentMonthlyCost * 12 * (1 + growthRate * 6)),
    optimizedYearEnd: Math.round(currentMonthlyCost * 12 * (1 + growthRate * 6) * (1 - efficiencyImprovement)),
    potentialAnnualSavings: Math.round(currentMonthlyCost * 12 * efficiencyImprovement)
  };
}
