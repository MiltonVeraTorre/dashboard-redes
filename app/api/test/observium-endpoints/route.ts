import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/test/observium-endpoints
 * 
 * Endpoint de prueba para experimentar con diferentes endpoints de Observium
 * y confirmar cuáles funcionan y con qué parámetros.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || 'devices';
  const pagesize = parseInt(searchParams.get('pagesize') || '5');
  const fields = searchParams.get('fields');
  const testType = searchParams.get('test') || 'basic';

  console.log(`🧪 Testing Observium endpoint: /${endpoint} (test: ${testType})`);

  try {
    let result;
    let params: any = { pagesize };

    switch (testType) {
      case 'basic':
        // Prueba básica sin campos específicos
        result = await observiumApi.get(`/${endpoint}`, { params });
        break;

      case 'single-field':
        // Prueba con un solo campo
        if (fields) {
          params.fields = fields;
        }
        result = await observiumApi.get(`/${endpoint}`, { params });
        break;

      case 'pagination':
        // Prueba de paginación
        params.start = parseInt(searchParams.get('start') || '0');
        result = await observiumApi.get(`/${endpoint}`, { params });
        break;

      case 'filtered':
        // Prueba con filtros específicos
        const deviceId = searchParams.get('device_id');
        const location = searchParams.get('location');
        const status = searchParams.get('status');
        
        if (deviceId) params.device_id = deviceId;
        if (location) params.location = location;
        if (status) params.status = status;
        
        result = await observiumApi.get(`/${endpoint}`, { params });
        break;

      default:
        throw new Error(`Unknown test type: ${testType}`);
    }

    // Analizar la respuesta
    const analysis = analyzeResponse(result.data, endpoint);

    return NextResponse.json({
      success: true,
      endpoint: `/${endpoint}`,
      testType,
      params,
      analysis,
      sampleData: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(`❌ Error testing /${endpoint}:`, error.message);
    
    return NextResponse.json({
      success: false,
      endpoint: `/${endpoint}`,
      testType,
      params,
      error: error.message,
      errorCode: error.code || 'UNKNOWN',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Analiza la respuesta de la API para extraer información útil
 */
function analyzeResponse(data: any, endpoint: string) {
  const analysis: any = {
    hasData: false,
    dataType: typeof data,
    structure: {},
    recordCount: 0,
    sampleFields: [],
    recommendations: []
  };

  if (!data) {
    analysis.recommendations.push('No data returned - endpoint may not exist or require authentication');
    return analysis;
  }

  analysis.hasData = true;

  // Analizar estructura según el endpoint
  switch (endpoint) {
    case 'devices':
      if (data.devices) {
        analysis.structure.devices = true;
        analysis.recordCount = Array.isArray(data.devices) 
          ? data.devices.length 
          : Object.keys(data.devices).length;
        
        // Obtener campos de muestra del primer dispositivo
        const firstDevice = Array.isArray(data.devices) 
          ? data.devices[0] 
          : Object.values(data.devices)[0];
        
        if (firstDevice) {
          analysis.sampleFields = Object.keys(firstDevice);
          analysis.recommendations.push('✅ Devices endpoint working');
          analysis.recommendations.push(`Found ${analysis.recordCount} devices`);
          analysis.recommendations.push(`Available fields: ${analysis.sampleFields.slice(0, 10).join(', ')}`);
        }
      }
      break;

    case 'ports':
      if (data.ports) {
        analysis.structure.ports = true;
        analysis.recordCount = Array.isArray(data.ports) 
          ? data.ports.length 
          : Object.keys(data.ports).length;
        
        const firstPort = Array.isArray(data.ports) 
          ? data.ports[0] 
          : Object.values(data.ports)[0];
        
        if (firstPort) {
          analysis.sampleFields = Object.keys(firstPort);
          analysis.recommendations.push('✅ Ports endpoint working');
          analysis.recommendations.push(`Found ${analysis.recordCount} ports`);
          analysis.recommendations.push(`Available fields: ${analysis.sampleFields.slice(0, 10).join(', ')}`);
        }
      }
      break;

    case 'sensors':
      if (data.sensors) {
        analysis.structure.sensors = true;
        analysis.recordCount = Array.isArray(data.sensors) 
          ? data.sensors.length 
          : Object.keys(data.sensors).length;
        
        const firstSensor = Array.isArray(data.sensors) 
          ? data.sensors[0] 
          : Object.values(data.sensors)[0];
        
        if (firstSensor) {
          analysis.sampleFields = Object.keys(firstSensor);
          analysis.recommendations.push('✅ Sensors endpoint working');
          analysis.recommendations.push(`Found ${analysis.recordCount} sensors`);
          analysis.recommendations.push(`Available fields: ${analysis.sampleFields.slice(0, 10).join(', ')}`);
        }
      }
      break;

    case 'processors':
      if (data.processors) {
        analysis.structure.processors = true;
        analysis.recordCount = Array.isArray(data.processors) 
          ? data.processors.length 
          : Object.keys(data.processors).length;
        
        const firstProcessor = Array.isArray(data.processors) 
          ? data.processors[0] 
          : Object.values(data.processors)[0];
        
        if (firstProcessor) {
          analysis.sampleFields = Object.keys(firstProcessor);
          analysis.recommendations.push('✅ Processors endpoint working');
          analysis.recommendations.push(`Found ${analysis.recordCount} processors`);
          analysis.recommendations.push(`Available fields: ${analysis.sampleFields.slice(0, 10).join(', ')}`);
        }
      }
      break;

    case 'mempools':
      if (data.mempools) {
        analysis.structure.mempools = true;
        analysis.recordCount = Array.isArray(data.mempools) 
          ? data.mempools.length 
          : Object.keys(data.mempools).length;
        
        const firstMempool = Array.isArray(data.mempools) 
          ? data.mempools[0] 
          : Object.values(data.mempools)[0];
        
        if (firstMempool) {
          analysis.sampleFields = Object.keys(firstMempool);
          analysis.recommendations.push('✅ Mempools endpoint working');
          analysis.recommendations.push(`Found ${analysis.recordCount} mempools`);
          analysis.recommendations.push(`Available fields: ${analysis.sampleFields.slice(0, 10).join(', ')}`);
        }
      }
      break;

    case 'alerts':
      if (data.alerts) {
        analysis.structure.alerts = true;
        analysis.recordCount = Array.isArray(data.alerts) 
          ? data.alerts.length 
          : Object.keys(data.alerts).length;
        
        const firstAlert = Array.isArray(data.alerts) 
          ? data.alerts[0] 
          : Object.values(data.alerts)[0];
        
        if (firstAlert) {
          analysis.sampleFields = Object.keys(firstAlert);
          analysis.recommendations.push('✅ Alerts endpoint working');
          analysis.recommendations.push(`Found ${analysis.recordCount} alerts`);
          analysis.recommendations.push(`Available fields: ${analysis.sampleFields.slice(0, 10).join(', ')}`);
        }
      }
      break;

    default:
      analysis.structure.unknown = true;
      analysis.recommendations.push(`Unknown endpoint structure for: ${endpoint}`);
      if (typeof data === 'object') {
        analysis.sampleFields = Object.keys(data);
        analysis.recommendations.push(`Top-level fields: ${analysis.sampleFields.slice(0, 10).join(', ')}`);
      }
  }

  // Recomendaciones generales
  if (analysis.recordCount === 0) {
    analysis.recommendations.push('⚠️ No records found - may need different parameters');
  }

  if (analysis.recordCount > 100) {
    analysis.recommendations.push('⚠️ Large dataset - consider using pagination');
  }

  return analysis;
}
