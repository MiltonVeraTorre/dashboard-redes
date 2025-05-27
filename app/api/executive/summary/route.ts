import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openai-service';
import { cacheManager } from '@/lib/services/cache-manager';

/**
 * GET /api/executive/summary
 *
 * Genera un resumen ejecutivo del estado general de la red utilizando OpenAI
 * basado en los datos del dashboard ejecutivo
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Iniciando generación de resumen ejecutivo del dashboard...');
    console.log('🔑 OPENAI_API_KEY presente:', !!process.env.OPENAI_API_KEY);

    // Verificar si OpenAI está configurado
    if (!OpenAIService.isConfigured()) {
      console.log('❌ OpenAI no está configurado');
      return NextResponse.json(
        { error: 'OpenAI API no está configurada. Configure OPENAI_API_KEY en las variables de entorno.' },
        { status: 500 }
      );
    }

    console.log('✅ OpenAI está configurado correctamente');

    const url = new URL(request.url);
    const skipCache = url.searchParams.get('skipCache') === 'true';
    const cacheKey = 'executive-dashboard-summary';

    // Verificar caché de resumen ejecutivo si no se solicita omitirla
    if (!skipCache) {
      const cachedSummary = cacheManager.get<{ summary: string; timestamp: string; dataSource: string }>(cacheKey);
      if (cachedSummary) {
        console.log('🚀 Resumen ejecutivo desde caché');
        return NextResponse.json({
          summary: cachedSummary.summary,
          lastUpdated: cachedSummary.timestamp,
          cached: true,
          dataSource: cachedSummary.dataSource
        });
      }
    }

    // Obtener datos de todos los endpoints del dashboard ejecutivo
    console.log('📊 Obteniendo datos del dashboard ejecutivo...');
    
    const [
      networkConsumptionResponse,
      capacityUtilizationResponse,
      criticalSitesResponse,
      growthTrendsResponse
    ] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/executive/network-consumption?timeRange=7d`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/executive/capacity-utilization`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/executive/critical-sites?limit=8&threshold=75`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/executive/growth-trends?timeRange=3m&metric=utilization`)
    ]);

    const [
      networkConsumption,
      capacityUtilization,
      criticalSites,
      growthTrends
    ] = await Promise.all([
      networkConsumptionResponse.json(),
      capacityUtilizationResponse.json(),
      criticalSitesResponse.json(),
      growthTrendsResponse.json()
    ]);

    const dashboardData = {
      networkConsumption,
      capacityUtilization,
      criticalSites,
      growthTrends
    };

    console.log(`📊 Datos obtenidos del dashboard ejecutivo:`, {
      plazas: networkConsumption.plazas?.length || 0,
      capacityData: capacityUtilization.data?.length || 0,
      criticalSites: criticalSites.data?.length || 0,
      averageUtilization: capacityUtilization.summary?.averageUtilization,
      totalCriticalSites: criticalSites.summary?.totalCriticalSites
    });

    // Generar resumen ejecutivo con OpenAI
    const summary = await OpenAIService.generateExecutiveDashboardSummary(dashboardData);

    // Preparar nota sobre la fuente de datos
    const dataSourceNote = '\n\n*Nota: Este resumen fue generado con datos actuales del dashboard ejecutivo.*';
    const finalSummary = summary + dataSourceNote;

    // Guardar resumen en caché
    const summaryData = {
      summary: finalSummary,
      timestamp: new Date().toISOString(),
      dataSource: 'executive-dashboard'
    };

    cacheManager.set(cacheKey, summaryData);
    console.log(`💾 Resumen ejecutivo guardado en caché: ${cacheKey}`);

    return NextResponse.json({
      summary: finalSummary,
      lastUpdated: summaryData.timestamp,
      cached: false,
      dataSource: 'executive-dashboard'
    });
  } catch (error) {
    console.error('Error generando resumen ejecutivo del dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to generate executive dashboard summary' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/executive/summary
 *
 * Genera un resumen ejecutivo usando datos del dashboard para evitar llamadas duplicadas
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando generación de resumen ejecutivo con datos del dashboard...');

    // Verificar si OpenAI está configurado
    if (!OpenAIService.isConfigured()) {
      console.log('❌ OpenAI no está configurado');
      return NextResponse.json(
        { error: 'OpenAI API no está configurada. Configure OPENAI_API_KEY en las variables de entorno.' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const skipCache = url.searchParams.get('skipCache') === 'true';
    const cacheKey = 'executive-dashboard-summary';

    let dashboardData = null;

    // Intentar parsear el body JSON de manera segura
    try {
      const body = await request.json();
      dashboardData = body.dashboardData;
      console.log(`📊 Datos del dashboard recibidos:`, {
        hasData: !!dashboardData,
        hasNetworkConsumption: !!dashboardData?.networkConsumption,
        hasCapacityUtilization: !!dashboardData?.capacityUtilization,
        hasCriticalSites: !!dashboardData?.criticalSites,
        plazas: dashboardData?.networkConsumption?.plazas?.length || 0,
        capacityData: dashboardData?.capacityUtilization?.data?.length || 0,
        criticalSitesCount: dashboardData?.criticalSites?.data?.length || 0
      });
    } catch (jsonError) {
      console.log('⚠️ No se pudo parsear JSON del body, continuando sin datos del dashboard');
      console.error('JSON Parse Error:', jsonError);
    }

    // Verificar caché primero (solo si no se está saltando el caché)
    if (!skipCache) {
      const cachedSummary = cacheManager.get<{ summary: string; timestamp: string; dataSource: string }>(cacheKey);
      if (cachedSummary) {
        console.log('🚀 Resumen ejecutivo desde caché');
        return NextResponse.json({
          summary: cachedSummary.summary,
          lastUpdated: cachedSummary.timestamp,
          cached: true,
          dataSource: cachedSummary.dataSource
        });
      }
    }

    // Validar datos del dashboard
    const hasValidDashboardData = dashboardData &&
                                  dashboardData.networkConsumption &&
                                  dashboardData.capacityUtilization &&
                                  dashboardData.criticalSites;

    if (!hasValidDashboardData) {
      console.log('❌ Datos del dashboard no válidos, obteniendo datos frescos...');
      
      // Obtener datos frescos si no se proporcionaron datos válidos
      const [
        networkConsumptionResponse,
        capacityUtilizationResponse,
        criticalSitesResponse,
        growthTrendsResponse
      ] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/executive/network-consumption?timeRange=7d`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/executive/capacity-utilization`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/executive/critical-sites?limit=8&threshold=75`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/executive/growth-trends?timeRange=3m&metric=utilization`)
      ]);

      const [
        networkConsumption,
        capacityUtilization,
        criticalSites,
        growthTrends
      ] = await Promise.all([
        networkConsumptionResponse.json(),
        capacityUtilizationResponse.json(),
        criticalSitesResponse.json(),
        growthTrendsResponse.json()
      ]);

      dashboardData = {
        networkConsumption,
        capacityUtilization,
        criticalSites,
        growthTrends
      };
    }

    console.log(`🤖 Enviando datos del dashboard ejecutivo a OpenAI`);

    // Generar resumen ejecutivo con OpenAI
    const summary = await OpenAIService.generateExecutiveDashboardSummary(dashboardData);

    // Preparar nota sobre la fuente de datos
    const dataSourceNote = '\n\n*Nota: Este resumen fue generado con datos actuales del dashboard ejecutivo.*';
    const finalSummary = summary + dataSourceNote;

    // Guardar resumen en caché
    const summaryData = {
      summary: finalSummary,
      timestamp: new Date().toISOString(),
      dataSource: 'executive-dashboard'
    };

    cacheManager.set(cacheKey, summaryData);
    console.log(`💾 Resumen ejecutivo guardado en caché: ${cacheKey}`);

    return NextResponse.json({
      summary: finalSummary,
      lastUpdated: summaryData.timestamp,
      cached: false,
      dataSource: 'executive-dashboard'
    });
  } catch (error) {
    console.error('Error generando resumen ejecutivo del dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to generate executive dashboard summary' },
      { status: 500 }
    );
  }
}
