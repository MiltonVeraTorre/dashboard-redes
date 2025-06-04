import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/financial/demo
 * 
 * Returns demo financial data for the XCIEN financial dashboard when real API is not available.
 * This endpoint provides realistic sample data for development and testing purposes.
 * 
 * Query Parameters:
 * - period: Analysis period (default: '1m') - '1d', '3d', '1w', '1m', '3m', '6m', '1y'
 * 
 * Response: Same structure as /api/financial/overview but with demo data
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '1m';
    
    console.log(`🎭 Generating demo financial data for period: ${period}`);
    
    const demoData = generateDemoFinancialData(period);
    
    console.log(`✅ Generated demo financial data: $${demoData.summary.totalMonthlyCost.toLocaleString()}`);
    
    return NextResponse.json({
      ...demoData,
      timestamp: new Date().toISOString(),
      source: 'demo_data'
    });
    
  } catch (error) {
    console.error('❌ Error generating demo financial data:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Generate demo financial data
function generateDemoFinancialData(period: string = '1m') {
  // Apply period-based multipliers for cost calculations
  const periodMultipliers = {
    '1d': { cost: 0.033, label: 'diario' },
    '3d': { cost: 0.1, label: '3 días' },
    '1w': { cost: 0.25, label: 'semanal' },
    '1m': { cost: 1, label: 'mensual' },
    '3m': { cost: 3, label: 'trimestral' },
    '6m': { cost: 6, label: 'semestral' },
    '1y': { cost: 12, label: 'anual' }
  };

  const multiplier = periodMultipliers[period as keyof typeof periodMultipliers] || periodMultipliers['1m'];
  
  // Demo carrier analysis with realistic XCIEN data - matching expected interface
  const carrierAnalysis = [
    {
      carrier: 'Neutral Networks',
      monthlyCost: Math.round(45000 * multiplier.cost),
      contractedMbps: 10,
      utilizedMbps: 7.2,
      utilizationPercentage: 72.0,
      costPerMbps: 37.5,
      status: 'efficient' as const,
      potentialSaving: 0
    },
    {
      carrier: 'Cogent',
      monthlyCost: Math.round(32000 * multiplier.cost),
      contractedMbps: 8,
      utilizedMbps: 5.44,
      utilizationPercentage: 68.0,
      costPerMbps: 40.0,
      status: 'efficient' as const,
      potentialSaving: 0
    },
    {
      carrier: 'TI-Sparkle',
      monthlyCost: Math.round(28000 * multiplier.cost),
      contractedMbps: 6,
      utilizedMbps: 3.9,
      utilizationPercentage: 65.0,
      costPerMbps: 46.7,
      status: 'attention' as const,
      potentialSaving: Math.round(3200 * multiplier.cost)
    },
    {
      carrier: 'F16',
      monthlyCost: Math.round(20000 * multiplier.cost),
      contractedMbps: 4,
      utilizedMbps: 2.32,
      utilizationPercentage: 58.0,
      costPerMbps: 50.0,
      status: 'critical' as const,
      potentialSaving: Math.round(2400 * multiplier.cost)
    }
  ];

  // Demo plaza breakdown - matching expected interface
  const plazaBreakdown = [
    {
      plaza: 'Monterrey',
      monthlyCost: Math.round(52000 * multiplier.cost),
      carriers: 2,
      totalMbps: 14,
      utilizedMbps: 10.5,
      efficiency: 75.0,
      optimizationOpportunities: 0
    },
    {
      plaza: 'Guadalajara',
      monthlyCost: Math.round(38000 * multiplier.cost),
      carriers: 2,
      totalMbps: 10,
      utilizedMbps: 6.8,
      efficiency: 68.0,
      optimizationOpportunities: 1
    },
    {
      plaza: 'CDMX',
      monthlyCost: Math.round(25000 * multiplier.cost),
      carriers: 1,
      totalMbps: 6,
      utilizedMbps: 3.72,
      efficiency: 62.0,
      optimizationOpportunities: 0
    },
    {
      plaza: 'Querétaro',
      monthlyCost: Math.round(18000 * multiplier.cost),
      carriers: 1,
      totalMbps: 4,
      utilizedMbps: 2.2,
      efficiency: 55.0,
      optimizationOpportunities: 1
    },
    {
      plaza: 'Tijuana',
      monthlyCost: Math.round(12000 * multiplier.cost),
      carriers: 1,
      totalMbps: 2,
      utilizedMbps: 0.96,
      efficiency: 48.0,
      optimizationOpportunities: 1
    }
  ];

  // Demo optimization opportunities - matching expected interface
  const optimizationOpportunities = [
    {
      id: 'opp-1',
      type: 'renegotiation' as const,
      carrier: 'TI-Sparkle',
      plaza: 'Tijuana',
      description: 'TI-Sparkle tiene un costo por Mbps de $46.7, superior al benchmark de $38',
      currentCost: Math.round(28000 * multiplier.cost),
      potentialSaving: Math.round(3200 * multiplier.cost),
      priority: 'high' as const,
      utilizationRate: 65
    },
    {
      id: 'opp-2',
      type: 'cancellation' as const,
      carrier: 'F16',
      plaza: 'Guadalajara',
      description: 'F16 tiene baja utilización (58%) y alto costo por Mbps',
      currentCost: Math.round(20000 * multiplier.cost),
      potentialSaving: Math.round(2400 * multiplier.cost),
      priority: 'medium' as const,
      utilizationRate: 58
    },
    {
      id: 'opp-3',
      type: 'upgrade' as const,
      carrier: 'Neutral Networks',
      plaza: 'Monterrey',
      description: 'Monterrey está al 75% de utilización, considerar upgrade',
      currentCost: Math.round(45000 * multiplier.cost),
      potentialSaving: 0, // No saving, but prevents future issues
      priority: 'low' as const,
      utilizationRate: 75
    }
  ];

  // Calculate summary metrics - matching expected interface
  const totalMonthlyCost = carrierAnalysis.reduce((sum, carrier) => sum + carrier.monthlyCost, 0);
  const totalCapacity = carrierAnalysis.reduce((sum, carrier) => sum + carrier.contractedMbps, 0);
  const totalUtilized = carrierAnalysis.reduce((sum, carrier) => sum + carrier.utilizedMbps, 0);
  const weightedUtilization = (totalUtilized / totalCapacity) * 100;
  const averageCostPerMbps = totalMonthlyCost / totalCapacity;

  const summary = {
    totalMonthlyCost,
    averageUtilization: weightedUtilization,
    potentialSavings: optimizationOpportunities
      .filter(opp => opp.potentialSaving > 0)
      .reduce((sum, opp) => sum + opp.potentialSaving, 0),
    optimizableContracts: optimizationOpportunities.length,
    costPerMbps: averageCostPerMbps,
    currency: 'USD',
    period: period,
    periodLabel: multiplier.label
  };

  return {
    summary,
    carrierAnalysis,
    plazaBreakdown,
    optimizationOpportunities
  };
}
