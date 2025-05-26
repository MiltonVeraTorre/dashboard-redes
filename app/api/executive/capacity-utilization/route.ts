import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/executive/capacity-utilization
 *
 * Returns capacity utilization data by plaza for the executive dashboard.
 * This endpoint aggregates device and port capacity data from Observium.
 *
 * Query Parameters:
 * - includeDetails: Include detailed breakdown (default: false)
 * - plazas: Comma-separated list of plazas to include (optional)
 *
 * Response:
 * {
 *   "data": [
 *     {
 *       "plaza": "CDMX",
 *       "utilization": 75.2,
 *       "totalCapacity": 1000,
 *       "usedCapacity": 752,
 *       "deviceCount": 45,
 *       "portCount": 180,
 *       "status": "warning"
 *     },
 *     ...
 *   ],
 *   "summary": {
 *     "totalPlazas": 4,
 *     "averageUtilization": 65.8,
 *     "totalDevices": 156,
 *     "totalPorts": 624
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeDetails = searchParams.get('includeDetails') === 'true';
    const plazasParam = searchParams.get('plazas');
    const requestedPlazas = plazasParam ? plazasParam.split(',') : null;

    console.log(`🔍 Fetching capacity utilization data`);

    // Step 1: Get all devices with location information (using pagination for safety)
    const devicesResponse = await observiumApi.get('/devices', {
      params: {
        fields: 'device_id,hostname,location,status,type,os',
        pagesize: 100, // Limit to prevent large responses
        status: 1 // Only active devices
      }
    });

    if (!devicesResponse.data || !devicesResponse.data.devices ||
        (Array.isArray(devicesResponse.data.devices) && devicesResponse.data.devices.length === 0) ||
        (typeof devicesResponse.data.devices === 'object' && Object.keys(devicesResponse.data.devices).length === 0)) {
      console.warn('⚠️ No devices found in Observium response, generating demo data');

      // Generate demo data for empty Observium instance
      const demoData = [
        {
          plaza: 'CDMX',
          utilization: 78.5,
          totalCapacity: 12500,
          usedCapacity: 9812,
          deviceCount: 15,
          portCount: 245,
          operationalPorts: 238,
          status: 'warning'
        },
        {
          plaza: 'Monterrey',
          utilization: 65.2,
          totalCapacity: 9500,
          usedCapacity: 6194,
          deviceCount: 12,
          portCount: 189,
          operationalPorts: 185,
          status: 'normal'
        },
        {
          plaza: 'Queretaro',
          utilization: 82.1,
          totalCapacity: 7800,
          usedCapacity: 6404,
          deviceCount: 9,
          portCount: 156,
          operationalPorts: 152,
          status: 'critical'
        },
        {
          plaza: 'Miami',
          utilization: 58.7,
          totalCapacity: 6700,
          usedCapacity: 3933,
          deviceCount: 8,
          portCount: 134,
          operationalPorts: 131,
          status: 'normal'
        }
      ];

      const demoSummary = {
        totalPlazas: demoData.length,
        averageUtilization: Math.round((demoData.reduce((sum, item) => sum + item.utilization, 0) / demoData.length) * 10) / 10,
        totalDevices: demoData.reduce((sum, item) => sum + item.deviceCount, 0),
        totalPorts: demoData.reduce((sum, item) => sum + item.portCount, 0),
        totalOperationalPorts: demoData.reduce((sum, item) => sum + item.operationalPorts, 0),
        totalCapacity: demoData.reduce((sum, item) => sum + item.totalCapacity, 0),
        totalUsedCapacity: demoData.reduce((sum, item) => sum + item.usedCapacity, 0)
      };

      return NextResponse.json({
        data: demoData,
        summary: demoSummary,
        timestamp: new Date().toISOString(),
        demo: true,
        source: 'demo_data'
      });
    }

    // Step 2: Group devices by plaza (location)
    const devicesByPlaza: Record<string, any[]> = {};
    const devices = Object.values(devicesResponse.data.devices) as any[];

    devices.forEach((device: any) => {
      const plaza = device.location || 'Unknown';
      if (!devicesByPlaza[plaza]) {
        devicesByPlaza[plaza] = [];
      }
      devicesByPlaza[plaza].push(device);
    });

    // Filter plazas if requested
    const plazasToProcess = requestedPlazas
      ? Object.keys(devicesByPlaza).filter(plaza => requestedPlazas.includes(plaza))
      : Object.keys(devicesByPlaza);

    console.log(`📊 Processing ${plazasToProcess.length} plazas:`, plazasToProcess);

    // Step 3: Calculate capacity utilization for each plaza
    const capacityData: any[] = [];

    for (const plaza of plazasToProcess) {
      const plazaDevices = devicesByPlaza[plaza];
      const deviceIds = plazaDevices.map(d => d.device_id);

      console.log(`🔍 Processing plaza ${plaza} with ${deviceIds.length} devices`);

      // Get ports for devices in this plaza (with pagination)
      const portsResponse = await observiumApi.get('/ports', {
        params: {
          device_id: deviceIds.slice(0, 20), // Limit to first 20 devices to prevent large responses
          fields: 'port_id,device_id,ifName,ifOperStatus,ifSpeed,ifHighSpeed,ifInOctets_rate,ifOutOctets_rate',
          pagesize: 50 // Limit ports per request
        }
      });

      let totalCapacity = 0;
      let usedCapacity = 0;
      let portCount = 0;
      let operationalPorts = 0;

      if (portsResponse.data && portsResponse.data.ports) {
        const ports = Object.values(portsResponse.data.ports) as any[];
        portCount = ports.length;

        ports.forEach((port: any) => {
          // Calculate port capacity (prefer ifHighSpeed, fallback to ifSpeed)
          const speedMbps = port.ifHighSpeed
            ? parseFloat(port.ifHighSpeed)
            : port.ifSpeed
              ? parseFloat(port.ifSpeed) / 1000000 // Convert bps to Mbps
              : 0;

          if (speedMbps > 0) {
            totalCapacity += speedMbps;

            // Calculate current utilization if port is operational
            if (port.ifOperStatus === 'up') {
              operationalPorts++;
              const inRate = parseFloat(port.ifInOctets_rate) || 0;
              const outRate = parseFloat(port.ifOutOctets_rate) || 0;

              // Convert octets/sec to Mbps (1 octet = 8 bits)
              const currentUtilizationMbps = ((inRate + outRate) * 8) / 1000000;
              usedCapacity += Math.min(currentUtilizationMbps, speedMbps);
            }
          }
        });
      }

      // Calculate utilization percentage
      const utilizationPercentage = totalCapacity > 0
        ? (usedCapacity / totalCapacity) * 100
        : 0;

      // Determine status based on utilization
      const getStatus = (utilization: number) => {
        if (utilization >= 80) return 'critical';
        if (utilization >= 60) return 'warning';
        return 'normal';
      };

      const plazaData: any = {
        plaza,
        utilization: Math.round(utilizationPercentage * 10) / 10, // Round to 1 decimal
        totalCapacity: Math.round(totalCapacity),
        usedCapacity: Math.round(usedCapacity),
        deviceCount: plazaDevices.length,
        portCount,
        operationalPorts,
        status: getStatus(utilizationPercentage)
      };

      if (includeDetails) {
        // Add device breakdown
        plazaData.deviceBreakdown = plazaDevices.map(device => ({
          device_id: device.device_id,
          hostname: device.hostname,
          type: device.type,
          os: device.os
        }));
      }

      capacityData.push(plazaData);

      console.log(`✅ Plaza ${plaza}: ${utilizationPercentage.toFixed(1)}% utilization (${usedCapacity}/${totalCapacity} Mbps)`);
    }

    // Step 4: Sort by utilization (highest first)
    capacityData.sort((a, b) => b.utilization - a.utilization);

    // Step 5: Calculate summary statistics
    const summary = {
      totalPlazas: capacityData.length,
      averageUtilization: capacityData.length > 0
        ? Math.round((capacityData.reduce((sum, plaza) => sum + plaza.utilization, 0) / capacityData.length) * 10) / 10
        : 0,
      totalDevices: capacityData.reduce((sum, plaza) => sum + plaza.deviceCount, 0),
      totalPorts: capacityData.reduce((sum, plaza) => sum + plaza.portCount, 0),
      totalOperationalPorts: capacityData.reduce((sum, plaza) => sum + plaza.operationalPorts, 0),
      totalCapacity: capacityData.reduce((sum, plaza) => sum + plaza.totalCapacity, 0),
      totalUsedCapacity: capacityData.reduce((sum, plaza) => sum + plaza.usedCapacity, 0)
    };

    console.log(`✅ Successfully generated capacity utilization data for ${capacityData.length} plazas`);

    return NextResponse.json({
      data: capacityData,
      summary,
      timestamp: new Date().toISOString(),
      demo: false,
      source: 'observium_data'
    });

  } catch (error) {
    console.error('❌ Error fetching capacity utilization data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch capacity utilization data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
