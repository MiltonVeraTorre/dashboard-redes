import { NextRequest, NextResponse } from 'next/server';
import * as ObserviumAdapter from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/monitoring/health
 * 
 * Health check endpoint to verify connectivity with Observium API.
 * This endpoint is useful for debugging and monitoring the integration status.
 * 
 * Query Parameters:
 * - detailed: Include detailed connectivity tests (default: false)
 * 
 * Response:
 * {
 *   "status": "healthy" | "degraded" | "unhealthy",
 *   "observium": { ... },
 *   "timestamp": "...",
 *   "tests": [ ... ]
 * }
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const detailed = searchParams.get('detailed') === 'true';
  
  const startTime = Date.now();
  const tests: Array<{
    name: string;
    status: 'pass' | 'fail' | 'skip';
    duration?: number;
    error?: string;
    data?: any;
  }> = [];
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  console.log('🏥 Starting health check for Observium integration...');
  
  // Test 1: Basic connectivity - Fetch devices
  try {
    const testStart = Date.now();
    const devices = await ObserviumAdapter.fetchDevices({ limit: 1 });
    const duration = Date.now() - testStart;
    
    tests.push({
      name: 'Basic Connectivity (fetchDevices)',
      status: 'pass',
      duration,
      data: detailed ? { devicesCount: devices.length, firstDevice: devices[0] || null } : { devicesCount: devices.length }
    });
    
    console.log(`✅ Basic connectivity test passed (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - testStart;
    tests.push({
      name: 'Basic Connectivity (fetchDevices)',
      status: 'fail',
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    overallStatus = 'unhealthy';
    console.log(`❌ Basic connectivity test failed: ${error}`);
  }
  
  // Test 2: Plaza filtering - Only if basic connectivity works
  if (tests[0].status === 'pass') {
    try {
      const testStart = Date.now();
      const laredoDevices = await ObserviumAdapter.fetchDevicesByPlaza('Laredo');
      const duration = Date.now() - testStart;
      
      tests.push({
        name: 'Plaza Filtering (Laredo)',
        status: 'pass',
        duration,
        data: { devicesCount: laredoDevices.length }
      });
      
      console.log(`✅ Plaza filtering test passed (${duration}ms) - Found ${laredoDevices.length} devices in Laredo`);
    } catch (error) {
      const duration = Date.now() - testStart;
      tests.push({
        name: 'Plaza Filtering (Laredo)',
        status: 'fail',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (overallStatus === 'healthy') overallStatus = 'degraded';
      console.log(`⚠️ Plaza filtering test failed: ${error}`);
    }
  } else {
    tests.push({
      name: 'Plaza Filtering (Laredo)',
      status: 'skip'
    });
  }
  
  // Test 3: Detailed monitoring - Only if detailed flag is set and basic connectivity works
  if (detailed && tests[0].status === 'pass') {
    try {
      const testStart = Date.now();
      
      // Get first device for testing
      const devices = await ObserviumAdapter.fetchDevices({ limit: 1 });
      if (devices.length > 0) {
        const deviceId = devices[0].device_id;
        const monitoringData = await ObserviumAdapter.fetchDeviceMonitoringData(deviceId);
        const duration = Date.now() - testStart;
        
        tests.push({
          name: 'Detailed Monitoring',
          status: 'pass',
          duration,
          data: {
            deviceId,
            portsCount: monitoringData.ports.length,
            memPoolsCount: monitoringData.memPools.length,
            processorsCount: monitoringData.processors.length,
            sensorsCount: monitoringData.sensors.length,
            alertsCount: monitoringData.alerts.length
          }
        });
        
        console.log(`✅ Detailed monitoring test passed (${duration}ms)`);
      } else {
        tests.push({
          name: 'Detailed Monitoring',
          status: 'fail',
          error: 'No devices available for testing'
        });
        
        if (overallStatus === 'healthy') overallStatus = 'degraded';
      }
    } catch (error) {
      const duration = Date.now() - testStart;
      tests.push({
        name: 'Detailed Monitoring',
        status: 'fail',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (overallStatus === 'healthy') overallStatus = 'degraded';
      console.log(`⚠️ Detailed monitoring test failed: ${error}`);
    }
  } else if (detailed) {
    tests.push({
      name: 'Detailed Monitoring',
      status: 'skip'
    });
  }
  
  const totalDuration = Date.now() - startTime;
  
  const response = {
    status: overallStatus,
    observium: {
      baseURL: 'http://201.150.5.213/api/v0',
      connected: tests[0].status === 'pass',
      responseTime: tests[0].duration || null
    },
    tests,
    summary: {
      totalTests: tests.length,
      passed: tests.filter(t => t.status === 'pass').length,
      failed: tests.filter(t => t.status === 'fail').length,
      skipped: tests.filter(t => t.status === 'skip').length,
      totalDuration
    },
    timestamp: new Date().toISOString()
  };
  
  console.log(`🏥 Health check completed: ${overallStatus} (${totalDuration}ms)`);
  
  // Return appropriate HTTP status based on health
  const httpStatus = overallStatus === 'healthy' ? 200 : 
                    overallStatus === 'degraded' ? 207 : 503;
  
  return NextResponse.json(response, { status: httpStatus });
}
