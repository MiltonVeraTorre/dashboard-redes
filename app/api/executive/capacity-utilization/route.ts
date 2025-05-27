import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/executive/capacity-utilization
 *
 * Returns real capacity utilization data by plaza from Observium API.
 * Uses actual port utilization percentages and capacity data.
 *
 * Query Parameters:
 * - includeDetails: Include detailed breakdown (default: false)
 * - plazas: Comma-separated list of plazas to include (optional)
 *
 * Response:
 * {
 *   "data": [
 *     {
 *       "plaza": "Saltillo",
 *       "utilization": 14.2,
 *       "totalCapacity": 21000,
 *       "usedCapacity": 2982,
 *       "deviceCount": 3,
 *       "portCount": 15,
 *       "operationalPorts": 12,
 *       "status": "normal"
 *     }
 *   ],
 *   "summary": {
 *     "totalPlazas": 3,
 *     "averageUtilization": 8.5,
 *     "totalDevices": 6,
 *     "totalPorts": 45,
 *     "totalCapacity": 50000,
 *     "totalUsedCapacity": 4250
 *   },
 *   "source": "observium_data",
 *   "timestamp": "2025-05-27T16:30:00.000Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeDetails = searchParams.get('includeDetails') === 'true';
    const plazasParam = searchParams.get('plazas');
    const requestedPlazas = plazasParam ? plazasParam.split(',') : null;

    console.log(`🔍 [CAPACITY] Fetching real capacity utilization data`);
    console.log(`🔍 [CAPACITY] Parameters: includeDetails=${includeDetails}, plazas=${requestedPlazas?.join(',') || 'all'}`);

    // Step 1: Get all devices (without field filtering to avoid empty responses)
    console.log(`📡 [CAPACITY] Fetching devices from Observium...`);
    const devicesResponse = await observiumApi.get('/devices', {
      params: {
        pagesize: 100 // Increased page size based on investigation
      }
    });

    console.log(`📊 [CAPACITY] Devices Response:`, {
      status: devicesResponse.status,
      deviceCount: devicesResponse.data?.devices ? Object.keys(devicesResponse.data.devices).length : 0,
      totalCount: devicesResponse.data?.count
    });

    if (!devicesResponse.data || !devicesResponse.data.devices ||
        (Array.isArray(devicesResponse.data.devices) && devicesResponse.data.devices.length === 0) ||
        (typeof devicesResponse.data.devices === 'object' && Object.keys(devicesResponse.data.devices).length === 0)) {
      console.warn('⚠️ [CAPACITY] No devices found in Observium response');

      return NextResponse.json({
        data: [],
        summary: {
          totalPlazas: 0,
          averageUtilization: 0,
          totalDevices: 0,
          totalPorts: 0,
          totalOperationalPorts: 0,
          totalCapacity: 0,
          totalUsedCapacity: 0
        },
        timestamp: new Date().toISOString(),
        demo: false,
        source: 'observium_api_empty',
        error: 'No devices found in Observium monitoring system'
      });
    }

    // Step 2: Extract and map plaza names from device locations
    const devices = Object.values(devicesResponse.data.devices) as any[];
    const devicesByPlaza: Record<string, any[]> = {};

    // Map location strings to standardized plaza names
    const extractPlazaFromLocation = (location: string): string => {
      if (!location) return 'Unknown';

      const locationLower = location.toLowerCase();
      if (locationLower.includes('saltillo')) return 'Saltillo';
      if (locationLower.includes('monterrey') || locationLower.includes('podi')) return 'Monterrey';
      if (locationLower.includes('guadalajara')) return 'Guadalajara';
      if (locationLower.includes('laredo')) return 'Laredo';

      return location; // Return original if no match
    };

    devices.forEach((device: any) => {
      const plaza = extractPlazaFromLocation(device.location || '');
      if (!devicesByPlaza[plaza]) {
        devicesByPlaza[plaza] = [];
      }
      devicesByPlaza[plaza].push(device);
    });

    // Filter plazas if requested
    const plazasToProcess = requestedPlazas
      ? Object.keys(devicesByPlaza).filter(plaza => requestedPlazas.includes(plaza))
      : Object.keys(devicesByPlaza);

    console.log(`📊 [CAPACITY] Processing ${plazasToProcess.length} plazas:`, plazasToProcess);

    // Step 3: Get real capacity utilization data for each plaza
    const capacityData: any[] = [];

    for (const plaza of plazasToProcess) {
      const plazaDevices = devicesByPlaza[plaza];
      const deviceIds = plazaDevices.map(d => d.device_id);

      console.log(`🔍 [CAPACITY] Processing plaza ${plaza} with ${deviceIds.length} devices`);

      // Get ports with real utilization data
      let allPorts: any[] = [];

      // Process devices in batches to avoid API overload
      const deviceBatches = [];
      for (let i = 0; i < deviceIds.length; i += 3) { // Process 3 devices at a time
        deviceBatches.push(deviceIds.slice(i, i + 3));
      }

      for (const deviceBatch of deviceBatches.slice(0, 2)) { // Limit to first 2 batches (6 devices max)
        for (const deviceId of deviceBatch) {
          try {
            console.log(`📡 [CAPACITY] Fetching ports for device ${deviceId}...`);
            const portsResponse = await observiumApi.get('/ports', {
              params: {
                device_id: deviceId,
                fields: 'port_id,device_id,ifDescr,ifAlias,ifHighSpeed,ifInOctets_perc,ifOutOctets_perc,ifOperStatus',
                pagesize: 50
              }
            });

            if (portsResponse.data && portsResponse.data.ports) {
              const devicePorts = Object.values(portsResponse.data.ports) as any[];
              allPorts = allPorts.concat(devicePorts);
              console.log(`📊 [CAPACITY] Found ${devicePorts.length} ports for device ${deviceId}`);
            }
          } catch (portError) {
            console.warn(`⚠️ [CAPACITY] Failed to fetch ports for device ${deviceId}:`, portError);
          }
        }
      }

      // Calculate real utilization from port data
      let totalCapacity = 0;
      let totalUsedCapacity = 0;
      let operationalPorts = 0;

      allPorts.forEach(port => {
        // Only process operational ports
        if (port.ifOperStatus === 'up' && port.ifHighSpeed && parseInt(port.ifHighSpeed) > 0) {
          operationalPorts++;

          const portCapacity = parseInt(port.ifHighSpeed); // Mbps
          totalCapacity += portCapacity;

          // Use the higher of input or output utilization percentage
          const inUtilization = parseFloat(port.ifInOctets_perc) || 0;
          const outUtilization = parseFloat(port.ifOutOctets_perc) || 0;
          const maxUtilization = Math.max(inUtilization, outUtilization);

          // Calculate used capacity based on utilization percentage
          const portUsedCapacity = (portCapacity * maxUtilization) / 100;
          totalUsedCapacity += portUsedCapacity;
        }
      });

      // Calculate overall utilization percentage
      const utilizationPercentage = totalCapacity > 0
        ? (totalUsedCapacity / totalCapacity) * 100
        : 0;

      // Determine status based on utilization
      const getStatus = (utilization: number) => {
        if (utilization >= 80) return 'critical';
        if (utilization >= 60) return 'warning';
        return 'normal';
      };

      const plazaData: any = {
        plaza,
        utilization: Math.round(utilizationPercentage * 10) / 10,
        totalCapacity: Math.round(totalCapacity),
        usedCapacity: Math.round(totalUsedCapacity),
        deviceCount: plazaDevices.length,
        portCount: allPorts.length,
        operationalPorts,
        status: getStatus(utilizationPercentage)
      };

      if (includeDetails) {
        plazaData.deviceBreakdown = plazaDevices.map(device => ({
          device_id: device.device_id,
          hostname: device.hostname,
          type: device.type,
          os: device.os
        }));

        plazaData.topPorts = allPorts
          .filter(port => port.ifOperStatus === 'up')
          .map(port => ({
            port_id: port.port_id,
            ifDescr: port.ifDescr,
            ifAlias: port.ifAlias,
            capacity: parseInt(port.ifHighSpeed) || 0,
            utilization: Math.max(
              parseFloat(port.ifInOctets_perc) || 0,
              parseFloat(port.ifOutOctets_perc) || 0
            )
          }))
          .sort((a, b) => b.utilization - a.utilization)
          .slice(0, 10); // Top 10 most utilized ports
      }

      capacityData.push(plazaData);

      console.log(`✅ [CAPACITY] Plaza ${plaza}: ${utilizationPercentage.toFixed(1)}% utilization (${Math.round(totalUsedCapacity)}/${Math.round(totalCapacity)} Mbps, ${operationalPorts} operational ports)`);
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

    console.log(`✅ [CAPACITY] Successfully generated real capacity utilization data for ${capacityData.length} plazas`);
    console.log(`📊 [CAPACITY] Summary: ${summary.averageUtilization}% avg utilization, ${summary.totalCapacity} Mbps total capacity`);

    return NextResponse.json({
      data: capacityData,
      summary,
      timestamp: new Date().toISOString(),
      demo: false,
      source: 'observium_data'
    });

  } catch (error) {
    console.error('❌ [CAPACITY] Error fetching capacity utilization data:', error);

    // Return fallback data with clear error indication
    return NextResponse.json({
      data: [],
      summary: {
        totalPlazas: 0,
        averageUtilization: 0,
        totalDevices: 0,
        totalPorts: 0,
        totalOperationalPorts: 0,
        totalCapacity: 0,
        totalUsedCapacity: 0
      },
      timestamp: new Date().toISOString(),
      demo: false,
      source: 'observium_api_error',
      error: 'Failed to fetch capacity utilization data from Observium API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
