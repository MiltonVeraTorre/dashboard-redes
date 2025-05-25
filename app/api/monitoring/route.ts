import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/monitoring
 *
 * Documentation endpoint for HU-02 Technical Monitoring API.
 * Returns information about available endpoints and their usage.
 */
export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;

  const documentation = {
    title: 'HU-02 Technical Monitoring API',
    description: 'API endpoints for detailed technical monitoring and capacity analysis',
    version: '1.0.0',
    baseUrl: `${baseUrl}/api/monitoring`,
    endpoints: {
      health: {
        path: '/health',
        method: 'GET',
        description: 'Health check and connectivity test with Observium API',
        parameters: {
          detailed: 'boolean - Include detailed connectivity tests (default: false)'
        },
        example: `${baseUrl}/api/monitoring/health?detailed=true`
      },
      plazas: {
        path: '/plazas',
        method: 'GET',
        description: 'Get list of available plazas for filtering',
        parameters: {},
        example: `${baseUrl}/api/monitoring/plazas`
      },
      plazaOverview: {
        path: '/plaza/[plaza]',
        method: 'GET',
        description: 'Get comprehensive monitoring data for a specific plaza',
        parameters: {
          plaza: 'string - Plaza name (e.g., "Laredo", "Saltillo")',
          includeCapacity: 'boolean - Include capacity summary (default: true)',
          includeTopDevices: 'boolean - Include top devices by utilization (default: true)',
          topDevicesLimit: 'number - Number of top devices to return (default: 5)'
        },
        examples: [
          `${baseUrl}/api/monitoring/plaza/Laredo`,
          `${baseUrl}/api/monitoring/plaza/Saltillo?includeCapacity=true&topDevicesLimit=10`,
          `${baseUrl}/api/monitoring/plaza/CDMX`,
          `${baseUrl}/api/monitoring/plaza/Monterrey?includeCapacity=true`
        ]
      },
      deviceMonitoring: {
        path: '/device/[id]',
        method: 'GET',
        description: 'Get comprehensive technical monitoring data for a specific device',
        parameters: {
          id: 'number - Device ID',
          includeSystemHealth: 'boolean - Include CPU/memory/temperature metrics (default: true)',
          includeAttentionAnalysis: 'boolean - Include attention analysis (default: true)',
          includeRawData: 'boolean - Include raw Observium data (default: false)'
        },
        examples: [
          `${baseUrl}/api/monitoring/device/123`,
          `${baseUrl}/api/monitoring/device/123?includeSystemHealth=true&includeRawData=true`
        ]
      }
    },
    usage: {
      quickStart: [
        '1. Check API health: GET /api/monitoring/health',
        '2. Get available plazas: GET /api/monitoring/plazas',
        '3. Get plaza overview: GET /api/monitoring/plaza/Laredo',
        '4. Get device details: GET /api/monitoring/device/[id]'
      ],
      authentication: 'None required - API uses internal Observium credentials',
      rateLimit: 'No rate limiting currently implemented',
      errorHandling: 'All endpoints return structured error responses with timestamps'
    },
    dataFlow: {
      description: 'Data flows from Observium API through domain layer to these endpoints',
      architecture: 'Clean Architecture: API Routes → Domain Layer → Adapters → Observium API',
      fallback: 'Automatic fallback to mock data if Observium API is unavailable'
    },
    supportedPlazas: [
      'Laredo',
      'Saltillo',
      'CDMX',
      'Monterrey'
    ],
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(documentation, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
}
