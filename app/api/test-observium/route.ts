import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * Test endpoint to verify Observium API connectivity
 * GET /api/test-observium
 */
export async function GET(request: NextRequest) {
  console.log('🔍 Testing Observium API connectivity...');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: {
      baseURL: process.env.OBSERVIUM_BASE_URL,
      username: process.env.OBSERVIUM_USERNAME,
      passwordSet: !!process.env.OBSERVIUM_PASSWORD,
      passwordLength: process.env.OBSERVIUM_PASSWORD?.length || 0
    },
    tests: [] as any[]
  };

  // Test 1: Basic connectivity
  console.log('📡 Test 1: Basic API connectivity');
  try {
    const startTime = Date.now();
    const response = await observiumApi.get('/', { timeout: 10000 });
    const duration = Date.now() - startTime;
    
    testResults.tests.push({
      name: 'Basic Connectivity',
      status: 'success',
      duration: `${duration}ms`,
      statusCode: response.status,
      data: response.data
    });
    console.log(`✅ Basic connectivity: ${response.status} (${duration}ms)`);
  } catch (error: any) {
    testResults.tests.push({
      name: 'Basic Connectivity',
      status: 'failed',
      error: {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      }
    });
    console.log(`❌ Basic connectivity failed:`, error.message);
  }

  // Test 2: Devices endpoint
  console.log('📡 Test 2: Devices endpoint');
  try {
    const startTime = Date.now();
    const response = await observiumApi.get('/devices', { 
      params: { pagesize: 1 },
      timeout: 10000 
    });
    const duration = Date.now() - startTime;
    
    testResults.tests.push({
      name: 'Devices Endpoint',
      status: 'success',
      duration: `${duration}ms`,
      statusCode: response.status,
      dataKeys: Object.keys(response.data || {}),
      deviceCount: response.data?.count || 0
    });
    console.log(`✅ Devices endpoint: ${response.status} (${duration}ms)`);
  } catch (error: any) {
    testResults.tests.push({
      name: 'Devices Endpoint',
      status: 'failed',
      error: {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      }
    });
    console.log(`❌ Devices endpoint failed:`, error.message);
  }

  // Test 3: Ports endpoint
  console.log('📡 Test 3: Ports endpoint');
  try {
    const startTime = Date.now();
    const response = await observiumApi.get('/ports', { 
      params: { pagesize: 1 },
      timeout: 10000 
    });
    const duration = Date.now() - startTime;
    
    testResults.tests.push({
      name: 'Ports Endpoint',
      status: 'success',
      duration: `${duration}ms`,
      statusCode: response.status,
      dataKeys: Object.keys(response.data || {}),
      portCount: response.data?.count || 0
    });
    console.log(`✅ Ports endpoint: ${response.status} (${duration}ms)`);
  } catch (error: any) {
    testResults.tests.push({
      name: 'Ports Endpoint',
      status: 'failed',
      error: {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      }
    });
    console.log(`❌ Ports endpoint failed:`, error.message);
  }

  // Test 4: Bills endpoint
  console.log('📡 Test 4: Bills endpoint');
  try {
    const startTime = Date.now();
    const response = await observiumApi.get('/bills', { 
      params: { pagesize: 1 },
      timeout: 10000 
    });
    const duration = Date.now() - startTime;
    
    testResults.tests.push({
      name: 'Bills Endpoint',
      status: 'success',
      duration: `${duration}ms`,
      statusCode: response.status,
      dataKeys: Object.keys(response.data || {}),
      billCount: response.data?.count || 0
    });
    console.log(`✅ Bills endpoint: ${response.status} (${duration}ms)`);
  } catch (error: any) {
    testResults.tests.push({
      name: 'Bills Endpoint',
      status: 'failed',
      error: {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      }
    });
    console.log(`❌ Bills endpoint failed:`, error.message);
  }

  // Summary
  const successfulTests = testResults.tests.filter(test => test.status === 'success').length;
  const totalTests = testResults.tests.length;
  
  console.log(`📊 Test Summary: ${successfulTests}/${totalTests} tests passed`);

  return NextResponse.json({
    ...testResults,
    summary: {
      total: totalTests,
      successful: successfulTests,
      failed: totalTests - successfulTests,
      overallStatus: successfulTests === totalTests ? 'all_passed' : 
                    successfulTests > 0 ? 'partial_success' : 'all_failed'
    }
  });
}
