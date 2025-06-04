import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openai-service';

/**
 * GET /api/financial/executive-summary
 * POST /api/financial/executive-summary
 * 
 * Generates an AI-powered executive summary for financial dashboard data.
 * 
 * GET: Fetches fresh financial data and generates summary
 * POST: Uses provided financial data to generate summary (preferred for performance)
 * 
 * POST Body:
 * {
 *   "financialData": {
 *     "summary": { ... },
 *     "carrierAnalysis": [ ... ],
 *     "plazaBreakdown": [ ... ],
 *     "optimizationOpportunities": [ ... ]
 *   }
 * }
 * 
 * Response:
 * {
 *   "summary": "AI-generated executive summary text",
 *   "timestamp": "2024-01-15T10:30:00Z",
 *   "source": "openai_o3"
 * }
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🤖 Financial Executive Summary: GET request - fetching fresh data');

    // Check if OpenAI is configured
    if (!OpenAIService.isConfigured()) {
      return NextResponse.json({
        summary: "OpenAI no está configurado. Configure la clave API para generar resúmenes ejecutivos.",
        timestamp: new Date().toISOString(),
        source: 'error'
      });
    }

    // Fetch fresh financial data
    console.log('📊 Fetching fresh financial data...');
    
    const financialResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/financial/overview`);
    
    if (!financialResponse.ok) {
      throw new Error(`Failed to fetch financial data: ${financialResponse.statusText}`);
    }

    const financialData = await financialResponse.json();

    console.log(`📊 Financial data fetched:`, {
      totalCost: financialData.summary?.totalMonthlyCost,
      carriers: financialData.carrierAnalysis?.length,
      plazas: financialData.plazaBreakdown?.length,
      opportunities: financialData.optimizationOpportunities?.length
    });

    // Generate summary using OpenAI
    const summary = await OpenAIService.generateFinancialExecutiveSummary(financialData);

    console.log('✅ Financial executive summary generated successfully');

    return NextResponse.json({
      summary,
      timestamp: new Date().toISOString(),
      source: 'openai_o3'
    });

  } catch (error) {
    console.error('❌ Error generating financial executive summary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate financial executive summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Financial Executive Summary: POST request - using provided data');

    // Check if OpenAI is configured
    if (!OpenAIService.isConfigured()) {
      return NextResponse.json({
        summary: "OpenAI no está configurado. Configure la clave API para generar resúmenes ejecutivos.",
        timestamp: new Date().toISOString(),
        source: 'error'
      });
    }

    const body = await request.json();
    const { financialData } = body;

    if (!financialData) {
      console.log('⚠️ No financial data provided in POST body, falling back to GET method');
      return GET(request);
    }

    console.log(`📊 Using provided financial data:`, {
      totalCost: financialData.summary?.totalMonthlyCost,
      carriers: financialData.carrierAnalysis?.length,
      plazas: financialData.plazaBreakdown?.length,
      opportunities: financialData.optimizationOpportunities?.length
    });

    // Generate summary using OpenAI with provided data
    const summary = await OpenAIService.generateFinancialExecutiveSummary(financialData);

    console.log('✅ Financial executive summary generated successfully from provided data');

    return NextResponse.json({
      summary,
      timestamp: new Date().toISOString(),
      source: 'openai_o3'
    });

  } catch (error) {
    console.error('❌ Error generating financial executive summary from POST:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate financial executive summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
