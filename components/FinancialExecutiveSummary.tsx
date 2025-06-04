'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface FinancialData {
  summary: {
    totalMonthlyCost: number;
    averageUtilization: number;
    potentialSavings: number;
    optimizableContracts: number;
    costPerMbps: number;
    currency: string;
  };
  carrierAnalysis: Array<{
    carrier: string;
    monthlyCost: number;
    contractedMbps: number;
    utilizedMbps: number;
    utilizationPercentage: number;
    costPerMbps: number;
    status: 'efficient' | 'attention' | 'critical';
    potentialSaving: number;
  }>;
  plazaBreakdown: Array<{
    plaza: string;
    monthlyCost: number;
    carriers: number;
    totalMbps: number;
    utilizedMbps: number;
    efficiency: number;
    optimizationOpportunities: number;
  }>;
  optimizationOpportunities: Array<{
    id: string;
    type: 'cancellation' | 'renegotiation' | 'upgrade';
    carrier: string;
    plaza: string;
    description: string;
    currentCost: number;
    potentialSaving: number;
    priority: 'high' | 'medium' | 'low';
    utilizationRate: number;
  }>;
  timestamp: string;
}

interface FinancialExecutiveSummaryProps {
  financialData?: FinancialData | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function FinancialExecutiveSummary({ 
  financialData, 
  loading = false, 
  onRefresh 
}: FinancialExecutiveSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Check if we have valid financial data
  const hasValidFinancialData = financialData && 
    financialData.summary && 
    financialData.carrierAnalysis && 
    financialData.plazaBreakdown && 
    financialData.optimizationOpportunities;

  const fetchSummary = async (forceRefresh = false) => {
    if (!hasValidFinancialData && !forceRefresh) {
      console.log('🤖 FinancialExecutiveSummary: No hay datos financieros válidos para generar resumen');
      return;
    }

    try {
      setSummaryLoading(true);
      setSummaryError(null);

      console.log('🤖 FinancialExecutiveSummary: Generando resumen ejecutivo financiero...');

      const requestOptions: RequestInit = {
        method: hasValidFinancialData && !forceRefresh ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // If we have valid financial data and not forcing refresh, send it in the request
      if (hasValidFinancialData && !forceRefresh) {
        console.log('🤖 FinancialExecutiveSummary: Enviando datos financieros al endpoint');
        console.log('📊 Datos financieros a enviar:', {
          totalCost: financialData.summary.totalMonthlyCost,
          carriers: financialData.carrierAnalysis.length,
          plazas: financialData.plazaBreakdown.length,
          opportunities: financialData.optimizationOpportunities.length,
          potentialSavings: financialData.summary.potentialSavings
        });

        requestOptions.body = JSON.stringify({
          financialData: financialData
        });
      } else {
        console.log('🤖 FinancialExecutiveSummary: Usando endpoint GET (sin datos financieros)');
      }

      const response = await fetch('/api/financial/executive-summary', requestOptions);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.summary) {
        setSummary(data.summary);
        setLastUpdated(new Date());
        console.log('✅ FinancialExecutiveSummary: Resumen generado exitosamente');
      } else {
        throw new Error('No se recibió resumen en la respuesta');
      }

    } catch (error) {
      console.error('❌ FinancialExecutiveSummary: Error generando resumen:', error);
      setSummaryError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Auto-fetch summary when financial data becomes available
  useEffect(() => {
    if (hasValidFinancialData && !summary && !summaryLoading) {
      console.log('🤖 FinancialExecutiveSummary: Datos financieros disponibles, generando resumen automáticamente');
      // Don't auto-generate, wait for manual trigger as per user preference
    }
  }, [hasValidFinancialData, summary, summaryLoading]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state when no data is available yet
  if (loading && !financialData) {
    return (
      <Card className="financial-executive-summary-card bg-blue-50 border-blue-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo Financiero</h2>
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2">
              <Spinner size="sm" />
              <span className="text-blue-700">Cargando datos financieros...</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (summaryError) {
    return (
      <Card className="financial-executive-summary-card bg-red-50 border-red-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo Financiero</h2>
          <div className="text-red-700 mb-4">
            Error al generar resumen: {summaryError}
          </div>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            onClick={() => fetchSummary(true)}
          >
            Reintentar
          </button>
        </div>
      </Card>
    );
  }

  // If no summary but have financial data, show button to generate
  if (!summary && financialData) {
    return (
      <Card className="financial-executive-summary-card bg-green-50 border-green-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo Financiero</h2>
          <div className="text-center">
            <p className="text-green-700 mb-4">
              Datos financieros listos. Genere un resumen ejecutivo con IA.
            </p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
              onClick={() => fetchSummary(false)}
              disabled={summaryLoading}
            >
              {summaryLoading ? (
                <>
                  <Spinner size="sm" />
                  Generando...
                </>
              ) : (
                <>
                  🤖 Generar Resumen Ejecutivo Financiero
                </>
              )}
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // No data available
  if (!financialData) {
    return (
      <Card className="financial-executive-summary-card bg-gray-50 border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Resumen Ejecutivo Financiero</h2>
          <div className="text-gray-600 text-center py-4">
            No hay datos financieros disponibles para generar un resumen.
          </div>
        </div>
      </Card>
    );
  }

  // Show summary
  return (
    <Card className="financial-executive-summary-card">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Resumen Ejecutivo Financiero</h2>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Actualizado: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => fetchSummary(true)}
              disabled={summaryLoading}
            >
              {summaryLoading ? <Spinner size="sm" /> : 'Actualizar'}
            </button>
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {summary}
          </div>
        </div>

        {/* Quick Stats */}
        {financialData && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(financialData.summary.totalMonthlyCost, financialData.summary.currency)}
                </div>
                <div className="text-gray-500">Gasto Total</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">
                  {financialData.summary.averageUtilization.toFixed(1)}%
                </div>
                <div className="text-gray-500">Eficiencia</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  {formatCurrency(financialData.summary.potentialSavings, financialData.summary.currency)}
                </div>
                <div className="text-gray-500">Ahorro Potencial</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">
                  {financialData.summary.optimizableContracts}
                </div>
                <div className="text-gray-500">Contratos Optimizables</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
