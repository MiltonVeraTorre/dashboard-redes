import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/classification/most-saturated-sites
 *
 * Returns the top 5 most saturated network sites based on real-time
 * network utilization data from Observium monitoring system.
 *
 * This endpoint:
 * 1. Fetches all active devices from Observium
 * 2. Groups devices by location (site/plaza)
 * 3. Gets network port utilization for each site
 * 4. Calculates site-level saturation metrics
 * 5. Returns top 5 most saturated sites
 *
 * Response format:
 * {
 *   "sites": [
 *     {
 *       "id": "saltillo",
 *       "name": "Saltillo",
 *       "location": "Coahuila, Saltillo, RB Jolla",
 *       "saturation": 85.2,
 *       "trend": "up",
 *       "outages": 0,
 *       "deviceCount": 3,
 *       "criticalPorts": 2,
 *       "maxPortUtilization": 85.2,
 *       "avgPortUtilization": 67.8
 *     }
 *   ],
 *   "timestamp": "2025-05-27T13:00:00.000Z",
 *   "totalSites": 12
 * }
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching most saturated sites from Observium...');

    // Step 1: Get all active devices with location information
    const devicesResponse = await observiumApi.get('/devices', {
      params: {
        status: 1, // Only active devices
        pagesize: 100 // Limit to prevent large responses
      }
    });

    if (!devicesResponse.data?.devices) {
      console.warn('⚠️ No devices found in Observium response');
      return NextResponse.json({
        sites: [],
        timestamp: new Date().toISOString(),
        totalSites: 0,
        error: 'No devices found in monitoring system'
      });
    }

    const devices = Object.values(devicesResponse.data.devices) as any[];
    console.log(`📊 Processing ${devices.length} devices for saturation analysis`);

    // Step 2: Group devices by location/site
    const siteGroups: Record<string, any[]> = {};
    devices.forEach(device => {
      if (device.location && device.location.trim()) {
        // Extract site name from location (e.g., "Coahuila, Saltillo, RB Jolla" -> "Saltillo")
        const locationParts = device.location.split(',').map((part: string) => part.trim());
        const siteName = locationParts.length >= 2 ? locationParts[1] : locationParts[0];

        if (!siteGroups[siteName]) {
          siteGroups[siteName] = [];
        }
        siteGroups[siteName].push(device);
      }
    });

    console.log(`🏢 Found ${Object.keys(siteGroups).length} sites:`, Object.keys(siteGroups));

    // Step 3: Calculate saturation for each site
    const siteAnalysis = [];

    for (const [siteName, siteDevices] of Object.entries(siteGroups)) {
      console.log(`🔍 Analyzing site: ${siteName} (${siteDevices.length} devices)`);

      const deviceIds = siteDevices.map(d => d.device_id);
      let totalUtilization = 0;
      let maxUtilization = 0;
      let portCount = 0;
      let criticalPorts = 0;
      let operationalPorts = 0;

      // Get ports for all devices in this site
      for (const deviceId of deviceIds.slice(0, 5)) { // Limit to 5 devices per site to prevent timeout
        try {
          const portsResponse = await observiumApi.get('/ports', {
            params: {
              device_id: deviceId,
              pagesize: 20 // Limit ports per device
            }
          });

          if (portsResponse.data?.ports) {
            const ports = Array.isArray(portsResponse.data.ports)
              ? portsResponse.data.ports
              : Object.values(portsResponse.data.ports);

            ports.forEach((port: any) => {
              if (port.ifOperStatus === 'up' && port.ifHighSpeed && port.ifHighSpeed > 0) {
                operationalPorts++;

                // Calculate utilization percentage with validation
                let inUtilization = parseFloat(port.ifInOctets_perc) || 0;
                let outUtilization = parseFloat(port.ifOutOctets_perc) || 0;

                // Validate and sanitize utilization percentages
                // Cap at 100% and ensure non-negative values
                inUtilization = Math.max(0, Math.min(100, inUtilization));
                outUtilization = Math.max(0, Math.min(100, outUtilization));

                const portUtilization = Math.max(inUtilization, outUtilization);

                // Log anomalous data for debugging
                if (parseFloat(port.ifInOctets_perc) > 100 || parseFloat(port.ifOutOctets_perc) > 100) {
                  console.warn(`⚠️ Invalid utilization data for port ${port.ifDescr} on device ${deviceId}:`, {
                    ifInOctets_perc: port.ifInOctets_perc,
                    ifOutOctets_perc: port.ifOutOctets_perc,
                    sanitized_in: inUtilization,
                    sanitized_out: outUtilization,
                    ifHighSpeed: port.ifHighSpeed
                  });
                }

                if (portUtilization > 0) {
                  totalUtilization += portUtilization;
                  maxUtilization = Math.max(maxUtilization, portUtilization);
                  portCount++;

                  // Count critical ports (>80% utilization)
                  if (portUtilization >= 80) {
                    criticalPorts++;
                  }
                }
              }
            });
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch ports for device ${deviceId}:`, error);
        }
      }

      // Calculate site-level metrics with validation
      const avgUtilization = portCount > 0 ? totalUtilization / portCount : 0;
      let siteUtilization = Math.max(maxUtilization, avgUtilization); // Use max as primary metric

      // Final validation: ensure site utilization never exceeds 100%
      siteUtilization = Math.max(0, Math.min(100, siteUtilization));

      // Validate individual metrics as well
      const validatedMaxUtilization = Math.max(0, Math.min(100, maxUtilization));
      const validatedAvgUtilization = Math.max(0, Math.min(100, avgUtilization));

      // Determine trend (simplified - in real implementation, compare with historical data)
      const trend = siteUtilization >= 75 ? 'up' : siteUtilization >= 50 ? 'stable' : 'down';

      // Estimate outages based on critical ports (simplified)
      const outages = criticalPorts >= 3 ? Math.floor(criticalPorts / 2) : 0;

      siteAnalysis.push({
        id: siteName.toLowerCase().replace(/\s+/g, '-'),
        name: siteName,
        location: siteDevices[0]?.location || siteName,
        saturation: Math.round(siteUtilization * 10) / 10, // Round to 1 decimal
        trend,
        outages,
        deviceCount: siteDevices.length,
        criticalPorts,
        maxPortUtilization: Math.round(validatedMaxUtilization * 10) / 10,
        avgPortUtilization: Math.round(validatedAvgUtilization * 10) / 10,
        operationalPorts
      });
    }

    // Step 4: Sort by saturation and return top 5
    const topSaturatedSites = siteAnalysis
      .sort((a, b) => b.saturation - a.saturation)
      .slice(0, 5);

    console.log(`✅ Successfully analyzed ${siteAnalysis.length} sites, returning top ${topSaturatedSites.length}`);

    return NextResponse.json({
      sites: topSaturatedSites,
      timestamp: new Date().toISOString(),
      totalSites: siteAnalysis.length,
      cached: false
    });

  } catch (error) {
    console.error('❌ Error fetching most saturated sites:', error);

    return NextResponse.json({
      sites: [],
      timestamp: new Date().toISOString(),
      totalSites: 0,
      error: 'Failed to fetch network saturation data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
