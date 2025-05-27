import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openai-service';
import { MonitoringDataService } from '@/lib/services/monitoring-data-service';
import { cacheManager } from '@/lib/services/cache-manager';

/**
 * GET /api/monitoring/executive-summary
 *
 * Genera un resumen ejecutivo del estado de la red utilizando OpenAI
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Iniciando generación de resumen ejecutivo...');
    console.log('🔑 OPENAI_API_KEY presente:', !!process.env.OPENAI_API_KEY);
    console.log('🔑 OPENAI_API_KEY longitud:', process.env.OPENAI_API_KEY?.length || 0);

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
    const plaza = url.searchParams.get('plaza');
    const skipCache = url.searchParams.get('skipCache') === 'true';
    const cacheKey = `executive-summary:${plaza || 'all'}`;

    // Verificar caché de resumen ejecutivo si no se solicita omitirla
    if (!skipCache) {
      const cachedSummary = cacheManager.get<{ summary: string; timestamp: string; dataSource: string }>(cacheKey);
      if (cachedSummary) {
        console.log(`🚀 Resumen ejecutivo desde caché para plaza: ${plaza || 'todas'}`);
        return NextResponse.json({
          summary: cachedSummary.summary,
          lastUpdated: cachedSummary.timestamp,
          cached: true,
          dataSource: cachedSummary.dataSource,
          cacheTimeRemaining: undefined
        });
      }
    }

    // Obtener datos de monitoreo usando el servicio inteligente
    console.log('📊 Obteniendo datos de monitoreo...');
    const monitoringData = await MonitoringDataService.getMonitoringData(plaza || undefined);

    console.log(`📊 Datos obtenidos: ${monitoringData.devices.length} dispositivos, ${monitoringData.ports.length} puertos, ${monitoringData.alerts.length} alertas`);
    console.log(`📊 Fuente de datos: ${monitoringData.dataSource}`);

    // Mostrar datos que se enviarán a OpenAI
    console.log(`🤖 Enviando a OpenAI: ${monitoringData.devices.length} dispositivos, ${monitoringData.ports.length} puertos, ${monitoringData.alerts.length} alertas para plaza: ${plaza || 'todas'}`);

    // Generar resumen ejecutivo con OpenAI
    const summary = await OpenAIService.generateExecutiveSummary(
      monitoringData.devices,
      monitoringData.ports,
      monitoringData.alerts
    );

    // Preparar nota sobre la fuente de datos
    let dataSourceNote = '';
    switch (monitoringData.dataSource) {
      case 'dashboard':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado usando datos actuales del dashboard técnico.*';
        break;
      case 'cache':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado usando datos en caché del sistema de monitoreo.*';
        break;
      case 'api':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado con datos actuales del sistema de monitoreo.*';
        break;
      case 'api-partial':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado con datos parciales del sistema de monitoreo.*';
        break;
      case 'mock':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado con datos de prueba debido a problemas de conectividad con el sistema de monitoreo.*';
        break;
    }

    const finalSummary = summary + dataSourceNote;

    // Guardar resumen en caché
    const summaryData = {
      summary: finalSummary,
      timestamp: new Date().toISOString(),
      dataSource: monitoringData.dataSource
    };

    cacheManager.set(cacheKey, summaryData);
    console.log(`💾 Resumen ejecutivo guardado en caché: ${cacheKey}`);

    return NextResponse.json({
      summary: finalSummary,
      lastUpdated: summaryData.timestamp,
      cached: false,
      dataSource: monitoringData.dataSource,
      cacheTimeRemaining: monitoringData.cacheTimeRemaining
    });
  } catch (error) {
    console.error('Error generando resumen ejecutivo:', error);
    return NextResponse.json(
      { error: 'Failed to generate executive summary' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monitoring/executive-summary
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
    const plaza = url.searchParams.get('plaza');
    const skipCache = url.searchParams.get('skipCache') === 'true';

    let dashboardData = null;

    // Intentar parsear el body JSON de manera segura
    try {
      const body = await request.json();
      dashboardData = body.dashboardData;
      console.log(`📊 Datos del dashboard recibidos:`, {
        hasData: !!dashboardData,
        hasOverview: !!dashboardData?.overview,
        devicesCount: dashboardData?.overview?.devices?.length || 0,
        alertsCount: dashboardData?.overview?.alerts?.length || 0,
        plaza: dashboardData?.plaza,
        totalDevices: dashboardData?.overview?.totalDevices,
        activeDevices: dashboardData?.overview?.activeDevices
      });

      // Log detallado de los datos recibidos para debugging
      if (dashboardData?.overview?.devices) {
        console.log(`📊 Primeros 3 dispositivos del dashboard:`,
          dashboardData.overview.devices.slice(0, 3).map((d: any) => ({
            device_id: d.device_id,
            hostname: d.hostname,
            status: d.status,
            location: d.location
          }))
        );
      }
    } catch (jsonError) {
      console.log('⚠️ No se pudo parsear JSON del body, continuando sin datos del dashboard');
      console.error('JSON Parse Error:', jsonError);
    }

    console.log(`📊 Solicitando resumen ejecutivo con datos del dashboard para plaza: ${plaza || 'todas'}`);

    // Verificar caché primero (solo si no se está saltando el caché)
    if (!skipCache) {
      const cacheKey = `executive-summary:${plaza || 'all'}`;
      const cachedSummary = cacheManager.get<{ summary: string; timestamp: string; dataSource: string }>(cacheKey);
      if (cachedSummary) {
        console.log(`🚀 Resumen ejecutivo desde caché para plaza: ${plaza || 'todas'}`);
        return NextResponse.json({
          summary: cachedSummary.summary,
          lastUpdated: cachedSummary.timestamp,
          cached: true,
          dataSource: cachedSummary.dataSource,
          cacheTimeRemaining: undefined
        });
      }
    }

    // Estrategia mejorada para obtener datos de monitoreo
    let monitoringData;

    // Validar y usar datos del dashboard si están disponibles y no se solicita saltar caché
    const hasValidDashboardData = dashboardData &&
                                  dashboardData.overview &&
                                  dashboardData.overview.devices &&
                                  Array.isArray(dashboardData.overview.devices) &&
                                  dashboardData.overview.devices.length > 0;

    if (hasValidDashboardData && !skipCache) {
      console.log(`✅ Usando datos del dashboard: ${dashboardData.overview.devices.length} dispositivos, ${dashboardData.overview.alerts?.length || 0} alertas`);
      console.log(`📊 Plaza del dashboard: ${dashboardData.plaza}, Plaza solicitada: ${plaza}`);

      // Guardar datos del dashboard en caché para futuras consultas
      await MonitoringDataService.saveDashboardDataToCache(dashboardData, plaza || undefined);

      // Transformar PlazaData al formato MonitoringData
      monitoringData = {
        devices: dashboardData.overview.devices,
        ports: [], // Los puertos no están disponibles en el dashboard, usar array vacío
        alerts: dashboardData.overview.alerts || [],
        plaza: dashboardData.plaza,
        dataSource: 'dashboard',
        timestamp: new Date().toISOString()
      };

      console.log(`🎯 Datos transformados para OpenAI: ${monitoringData.devices.length} dispositivos, ${monitoringData.alerts.length} alertas`);
      console.log(`🎯 Fuente de datos: ${monitoringData.dataSource}`);
    } else {
      console.log(`🔄 Obteniendo datos desde servicio de monitoreo...`);
      if (!hasValidDashboardData) {
        console.log(`❌ Datos del dashboard no válidos:`, {
          hasData: !!dashboardData,
          hasOverview: !!dashboardData?.overview,
          hasDevices: !!dashboardData?.overview?.devices,
          isArray: Array.isArray(dashboardData?.overview?.devices),
          devicesLength: dashboardData?.overview?.devices?.length || 0
        });
      }
      if (skipCache) {
        console.log(`🔄 skipCache=${skipCache} - Forzando obtención de datos frescos`);
      }

      // Obtener datos del servicio de monitoreo
      if (skipCache) {
        // Si se solicita saltar caché, obtener datos frescos
        console.log(`🔄 Obteniendo datos frescos (invalidando caché)...`);
        monitoringData = await MonitoringDataService.getFreshMonitoringData(plaza || undefined);
      } else {
        // Usar estrategia normal (caché -> API -> fallback)
        monitoringData = await MonitoringDataService.getMonitoringData(plaza || undefined);
      }

      // Verificar la calidad de los datos obtenidos
      if (monitoringData.dataSource === 'mock') {
        console.log(`⚠️ ADVERTENCIA: Se están usando datos de prueba para el resumen ejecutivo`);
        console.log(`⚠️ Esto puede indicar problemas de conectividad con la API de Observium`);
      } else {
        console.log(`✅ Datos reales obtenidos del servicio de monitoreo: fuente=${monitoringData.dataSource}`);
      }
    }

    console.log(`🤖 Enviando a OpenAI: ${monitoringData.devices.length} dispositivos, ${monitoringData.ports.length} puertos, ${monitoringData.alerts.length} alertas para plaza: ${plaza || 'todas'}`);

    // Generar resumen ejecutivo con OpenAI
    const summary = await OpenAIService.generateExecutiveSummary(
      monitoringData.devices,
      monitoringData.ports,
      monitoringData.alerts
    );

    // Preparar nota sobre la fuente de datos
    let dataSourceNote = '';
    switch (monitoringData.dataSource) {
      case 'dashboard':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado usando datos actuales del dashboard técnico.*';
        break;
      case 'cache':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado usando datos en caché del sistema de monitoreo.*';
        break;
      case 'api':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado con datos actuales del sistema de monitoreo.*';
        break;
      case 'api-partial':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado con datos parciales del sistema de monitoreo.*';
        break;
      case 'mock':
        dataSourceNote = '\n\n*Nota: Este resumen fue generado con datos de prueba debido a problemas de conectividad con el sistema de monitoreo.*';
        break;
    }

    const finalSummary = summary + dataSourceNote;

    // Guardar resumen en caché
    const cacheKey = `executive-summary:${plaza || 'all'}`;
    const summaryData = {
      summary: finalSummary,
      timestamp: new Date().toISOString(),
      dataSource: monitoringData.dataSource
    };

    cacheManager.set(cacheKey, summaryData);
    console.log(`💾 Resumen ejecutivo guardado en caché: ${cacheKey}`);

    return NextResponse.json({
      summary: finalSummary,
      lastUpdated: summaryData.timestamp,
      cached: false,
      dataSource: monitoringData.dataSource,
      cacheTimeRemaining: monitoringData.cacheTimeRemaining
    });

  } catch (error) {
    console.error('Error generando resumen ejecutivo:', error);
    return NextResponse.json(
      { error: 'Failed to generate executive summary' },
      { status: 500 }
    );
  }
}