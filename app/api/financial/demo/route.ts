import { NextRequest, NextResponse } from 'next/server';
import {
  networkLinkUtilizationData,
  cityRevenueInfrastructureData,
  generateXCIENLinkInventory,
  generateXCIENBiweeklyMetrics,
  generateXCIENCostAnalysis,
  generateXCIENPlazaBreakdown,
  generateXCIENCarrierAnalysis,
  generateXCIENOptimizationOpportunities
} from '@/lib/mocks/xcien-datasets';

/**
 * GET /api/financial/demo
 *
 * Returns XCIEN-specific demo financial data when real API is not available.
 * Uses realistic XCIEN datasets with actual plaza names, carriers, and network topology.
 *
 * Query Parameters:
 * - period: Analysis period (default: '1m') - '1d', '3d', '1w', '1m', '3m', '6m', '1y'
 *
 * Response: Same structure as /api/financial/overview but with XCIEN demo data
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '1m';

    console.log(`🏢 Generating XCIEN-specific demo financial data for period: ${period}`);

    const demoData = generateXCIENFinancialData(period);

    console.log(`✅ Generated XCIEN demo financial data: $${demoData.summary.totalMonthlyCost.toLocaleString()}`);
    console.log(`📊 XCIEN data: ${demoData.carrierAnalysis.length} carriers, ${demoData.plazaBreakdown.length} plazas`);

    return NextResponse.json({
      ...demoData,
      timestamp: new Date().toISOString(),
      source: 'xcien_demo_data'
    });

  } catch (error) {
    console.error('❌ Error generating XCIEN demo financial data:', error);
    return NextResponse.json(
      { error: 'Failed to generate XCIEN demo data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Generate XCIEN-specific demo financial data using realistic datasets
function generateXCIENFinancialData(period: string = '1m') {
  console.log(`🏢 Generating XCIEN financial data using realistic datasets for period: ${period}`);

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

  // Generate XCIEN-specific data using the realistic datasets
  const linkInventory = generateXCIENLinkInventory();
  const biweeklyMetrics = generateXCIENBiweeklyMetrics(linkInventory, period);
  const costAnalysis = generateXCIENCostAnalysis(linkInventory, biweeklyMetrics);

  // Generate XCIEN carrier analysis using realistic data
  const carrierAnalysis = generateXCIENCarrierAnalysis(linkInventory, biweeklyMetrics, costAnalysis, multiplier);

  // Generate XCIEN plaza breakdown using realistic data
  const plazaBreakdown = generateXCIENPlazaBreakdown(linkInventory, biweeklyMetrics, costAnalysis, multiplier);

  // Generate XCIEN optimization opportunities using realistic data
  const optimizationOpportunities = generateXCIENOptimizationOpportunities(carrierAnalysis, plazaBreakdown, multiplier);

  // Calculate summary metrics using XCIEN data
  const totalMonthlyCost = carrierAnalysis.reduce((sum, carrier) => sum + carrier.monthlyCost, 0);
  const totalCapacity = carrierAnalysis.reduce((sum, carrier) => sum + carrier.contractedMbps, 0);
  const totalUtilized = carrierAnalysis.reduce((sum, carrier) => sum + carrier.utilizedMbps, 0);
  const weightedUtilization = totalCapacity > 0 ? (totalUtilized / totalCapacity) * 100 : 0;
  const averageCostPerMbps = totalCapacity > 0 ? totalMonthlyCost / totalCapacity : 0;

  const summary = {
    totalMonthlyCost,
    averageUtilization: Math.round(weightedUtilization * 10) / 10,
    potentialSavings: optimizationOpportunities
      .filter(opp => opp.potentialSaving > 0)
      .reduce((sum, opp) => sum + opp.potentialSaving, 0),
    optimizableContracts: optimizationOpportunities.length,
    costPerMbps: Math.round(averageCostPerMbps * 100) / 100,
    currency: 'USD',
    period: period,
    periodLabel: multiplier.label
  };

  console.log(`✅ Generated XCIEN financial summary: $${totalMonthlyCost.toLocaleString()}, ${carrierAnalysis.length} carriers, ${plazaBreakdown.length} plazas`);

  return {
    summary,
    carrierAnalysis,
    plazaBreakdown,
    optimizationOpportunities
  };
}
