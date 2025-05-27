import { NextRequest, NextResponse } from 'next/server';
import { testObserviumConnection, fetchDevices } from '../../../lib/adapters/ObserviumApiAdapter';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting Observium API diagnostic...');

    // Test 1: Basic connection
    const connectionTest = await testObserviumConnection();
    console.log('Connection test result:', connectionTest);

    // If basic connection fails with 404, try alternative endpoints
    let alternativeTests = [];
    if (!connectionTest.success && connectionTest.details?.status === 404) {
      console.log('🔍 Testing alternative API endpoints...');

      const alternativeEndpoints = [
        '/api',
        '/api/v1',
        '/observium/api/v0',
        '/observium/api',
        ''  // Just the base URL
      ];

      for (const endpoint of alternativeEndpoints) {
        try {
          const { observiumApi } = await import('../../../lib/adapters/ObserviumApiAdapter');
          const testUrl = endpoint || '/';
          console.log(`Testing endpoint: ${testUrl}`);
          const response = await observiumApi.get(testUrl, { timeout: 5000 });
          alternativeTests.push({
            endpoint: testUrl,
            success: true,
            status: response.status,
            data: typeof response.data === 'string' ? response.data.substring(0, 200) : response.data
          });
        } catch (error) {
          const axiosError = error as any;
          alternativeTests.push({
            endpoint: endpoint || '/',
            success: false,
            status: axiosError.response?.status,
            error: axiosError.message
          });
        }
      }
    }

    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        message: 'Basic connection failed',
        tests: {
          connection: connectionTest,
          alternativeEndpoints: alternativeTests
        }
      }, { status: 500 });
    }

    // Test 2: Devices endpoint
    let devicesTest = {
      success: false,
      message: 'Not tested',
      deviceCount: 0,
      sampleDevices: []
    };

    try {
      console.log('🔍 Testing devices endpoint...');
      const devices = await fetchDevices();
      devicesTest = {
        success: true,
        message: `Successfully fetched ${devices.length} devices`,
        deviceCount: devices.length,
        sampleDevices: devices.slice(0, 5).map(d => ({
          device_id: d.device_id,
          hostname: d.hostname,
          location: d.location,
          status: d.status
        }))
      };
      console.log('Devices test result:', devicesTest);
    } catch (error) {
      devicesTest = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        deviceCount: 0,
        sampleDevices: []
      };
      console.error('Devices test failed:', error);
    }

    // Test 3: Ports endpoint with a few devices
    let portsTest = {
      success: false,
      message: 'Not tested',
      results: [] as any[]
    };

    if (devicesTest.success && devicesTest.sampleDevices.length > 0) {
      try {
        console.log('🔍 Testing ports endpoint...');
        const { fetchPorts } = await import('../../../lib/adapters/ObserviumApiAdapter');

        // Test with first 3 devices
        const testDeviceIds = devicesTest.sampleDevices.slice(0, 3).map(d => d.device_id);
        const results = [];

        for (const deviceId of testDeviceIds) {
          try {
            const ports = await fetchPorts({
              device_id: deviceId,
              ifOperStatus: 'up'
            });
            results.push({
              device_id: deviceId,
              success: true,
              port_count: ports.length,
              sample_port: ports[0] ? {
                port_id: ports[0].port_id,
                ifName: ports[0].ifName,
                ifOperStatus: ports[0].ifOperStatus,
                ifSpeed: ports[0].ifSpeed,
                ifHighSpeed: ports[0].ifHighSpeed,
                has_rate_data: !!(ports[0].ifInOctets_rate || ports[0].ifOutOctets_rate)
              } : null
            });
          } catch (error) {
            results.push({
              device_id: deviceId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        portsTest = {
          success: results.some(r => r.success),
          message: `Tested ${results.length} devices, ${results.filter(r => r.success).length} successful`,
          results
        };
        console.log('Ports test result:', portsTest);
      } catch (error) {
        portsTest = {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          results: []
        };
        console.error('Ports test failed:', error);
      }
    }

    const overallSuccess = connectionTest.success && devicesTest.success;

    return NextResponse.json({
      success: overallSuccess,
      message: overallSuccess ? 'All tests passed' : 'Some tests failed',
      timestamp: new Date().toISOString(),
      tests: {
        connection: connectionTest,
        devices: devicesTest,
        ports: portsTest
      }
    });

  } catch (error) {
    console.error('Diagnostic failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Diagnostic failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
