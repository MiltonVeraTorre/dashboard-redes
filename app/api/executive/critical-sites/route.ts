import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/executive/critical-sites
 *
 * Returns critical sites data for the executive dashboard.
 * This endpoint identifies sites with high utilization, alerts, or performance issues.
 *
 * Query Parameters:
 * - limit: Maximum number of critical sites to return (default: 10)
 * - threshold: Utilization threshold for critical classification (default: 75)
 * - includeAlerts: Include alert information (default: true)
 *
 * Response:
 * {
 *   "data": [
 *     {
 *       "site": "CDMX-Norte-01",
 *       "plaza": "CDMX",
 *       "healthScore": 85,
 *       "utilization": 92.5,
 *       "alertCount": 3,
 *       "deviceCount": 8,
 *       "status": "critical",
 *       "issues": [
 *         "High port utilization",
 *         "Multiple device alerts",
 *         "Memory usage warning"
 *       ],
 *       "lastUpdated": "2024-01-15T10:30:00Z"
 *     },
 *     ...
 *   ],
 *   "summary": {
 *     "totalCriticalSites": 5,
 *     "averageHealthScore": 78.2,
 *     "totalAlerts": 15,
 *     "criticalThreshold": 75
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const threshold = parseFloat(searchParams.get('threshold') || '75');
    const includeAlerts = searchParams.get('includeAlerts') !== 'false';

    console.log(`🔍 Fetching critical sites data (limit: ${limit}, threshold: ${threshold}%)`);

    // Step 1: Get all devices with location information (using pagination for safety)
    const devicesResponse = await observiumApi.get('/devices', {
      params: {
        fields: 'device_id,hostname,location,status,type,os,uptime',
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
          site: 'CDMX-Norte-01',
          plaza: 'CDMX',
          healthScore: 65,
          utilization: 85.2,
          alertCount: 3,
          deviceCount: 4,
          portCount: 48,
          status: 'critical',
          issues: ['High port utilization', 'Multiple device alerts'],
          lastUpdated: new Date().toISOString(),
          devices: [
            { device_id: '1', hostname: 'CDMX-Norte-01-SW1', type: 'switch', os: 'ios' },
            { device_id: '2', hostname: 'CDMX-Norte-01-SW2', type: 'switch', os: 'ios' },
            { device_id: '3', hostname: 'CDMX-Norte-01-RTR1', type: 'router', os: 'ios' },
            { device_id: '4', hostname: 'CDMX-Norte-01-FW1', type: 'firewall', os: 'asa' }
          ]
        },
        {
          site: 'Queretaro-Centro-02',
          plaza: 'Queretaro',
          healthScore: 72,
          utilization: 78.9,
          alertCount: 2,
          deviceCount: 3,
          portCount: 36,
          status: 'warning',
          issues: ['High port utilization', 'Device alerts present'],
          lastUpdated: new Date().toISOString(),
          devices: [
            { device_id: '5', hostname: 'QRO-Centro-02-SW1', type: 'switch', os: 'ios' },
            { device_id: '6', hostname: 'QRO-Centro-02-RTR1', type: 'router', os: 'ios' },
            { device_id: '7', hostname: 'QRO-Centro-02-AP1', type: 'wireless', os: 'ios' }
          ]
        },
        {
          site: 'Miami-South-03',
          plaza: 'Miami',
          healthScore: 78,
          utilization: 76.4,
          alertCount: 1,
          deviceCount: 2,
          portCount: 24,
          status: 'attention',
          issues: ['High port utilization'],
          lastUpdated: new Date().toISOString(),
          devices: [
            { device_id: '8', hostname: 'MIA-South-03-SW1', type: 'switch', os: 'ios' },
            { device_id: '9', hostname: 'MIA-South-03-RTR1', type: 'router', os: 'ios' }
          ]
        }
      ];

      const demoSummary = {
        totalCriticalSites: demoData.length,
        averageHealthScore: Math.round((demoData.reduce((sum, site) => sum + site.healthScore, 0) / demoData.length) * 10) / 10,
        totalAlerts: demoData.reduce((sum, site) => sum + site.alertCount, 0),
        criticalThreshold: threshold,
        statusBreakdown: {
          critical: demoData.filter(s => s.status === 'critical').length,
          warning: demoData.filter(s => s.status === 'warning').length,
          attention: demoData.filter(s => s.status === 'attention').length
        }
      };

      return NextResponse.json({
        data: demoData.slice(0, limit),
        summary: demoSummary,
        timestamp: new Date().toISOString(),
        demo: true,
        source: 'demo_data'
      });
    }

    // Step 2: Group devices by site (using hostname patterns)
    const devicesBySite: Record<string, any[]> = {};
    const devices = Object.values(devicesResponse.data.devices) as any[];

    devices.forEach((device: any) => {
      // Extract site identifier from hostname (e.g., "CDMX-Norte-01-SW1" -> "CDMX-Norte-01")
      const hostname = device.hostname || '';
      const siteParts = hostname.split('-');
      const site = siteParts.length >= 3
        ? `${siteParts[0]}-${siteParts[1]}-${siteParts[2]}`
        : hostname.split('.')[0] || device.location || 'Unknown';

      if (!devicesBySite[site]) {
        devicesBySite[site] = [];
      }
      devicesBySite[site].push(device);
    });

    console.log(`📊 Found ${Object.keys(devicesBySite).length} sites`);

    // Step 3: Get alerts data if requested
    let alertsBySite: Record<string, any[]> = {};
    if (includeAlerts) {
      try {
        const alertsResponse = await observiumApi.get('/alerts', {
          params: {
            status: 'failed', // Only active alerts
            fields: 'alert_table_id,device_id,entity_type,severity,last_message',
            pagesize: 100 // Limit alerts
          }
        });

        if (alertsResponse.data && alertsResponse.data.alerts) {
          const alerts = Object.values(alertsResponse.data.alerts) as any[];

          // Group alerts by device and then by site
          alerts.forEach((alert: any) => {
            const device = devices.find(d => d.device_id === alert.device_id);
            if (device) {
              const hostname = device.hostname || '';
              const siteParts = hostname.split('-');
              const site = siteParts.length >= 3
                ? `${siteParts[0]}-${siteParts[1]}-${siteParts[2]}`
                : hostname.split('.')[0] || device.location || 'Unknown';

              if (!alertsBySite[site]) {
                alertsBySite[site] = [];
              }
              alertsBySite[site].push(alert);
            }
          });
        }
      } catch (alertError) {
        console.warn('⚠️ Failed to fetch alerts:', alertError);
      }
    }

    // Step 4: Analyze each site for critical status
    const siteAnalysis: any[] = [];

    for (const [site, siteDevices] of Object.entries(devicesBySite)) {
      const deviceIds = siteDevices.map(d => d.device_id);
      const plaza = siteDevices[0]?.location || 'Unknown';

      console.log(`🔍 Analyzing site ${site} with ${siteDevices.length} devices`);

      // Get ports for site devices (limited to prevent large responses)
      let totalUtilization = 0;
      let portCount = 0;
      let utilizationSum = 0;

      try {
        const portsResponse = await observiumApi.get('/ports', {
          params: {
            device_id: deviceIds.slice(0, 10), // Limit to first 10 devices
            fields: 'port_id,device_id,ifOperStatus,ifSpeed,ifHighSpeed,ifInOctets_rate,ifOutOctets_rate',
            state: 'up', // Only operational ports
            pagesize: 30 // Limit ports per site
          }
        });

        if (portsResponse.data && portsResponse.data.ports) {
          const ports = Object.values(portsResponse.data.ports) as any[];
          portCount = ports.length;

          ports.forEach((port: any) => {
            const speedMbps = port.ifHighSpeed
              ? parseFloat(port.ifHighSpeed)
              : port.ifSpeed
                ? parseFloat(port.ifSpeed) / 1000000
                : 0;

            if (speedMbps > 0) {
              const inRate = parseFloat(port.ifInOctets_rate) || 0;
              const outRate = parseFloat(port.ifOutOctets_rate) || 0;
              const currentUtilizationMbps = ((inRate + outRate) * 8) / 1000000;
              const portUtilization = (currentUtilizationMbps / speedMbps) * 100;

              utilizationSum += Math.min(portUtilization, 100);
            }
          });

          totalUtilization = portCount > 0 ? utilizationSum / portCount : 0;
        }
      } catch (portError) {
        console.warn(`⚠️ Failed to fetch ports for site ${site}:`, portError);
      }

      // Get site alerts
      const siteAlerts = alertsBySite[site] || [];

      // Calculate health score (0-100, lower is worse)
      const healthScore = calculateHealthScore(totalUtilization, siteAlerts.length, siteDevices.length);

      // Determine if site is critical
      const isCritical = totalUtilization >= threshold || siteAlerts.length >= 2 || healthScore <= 70;

      if (isCritical) {
        // Identify specific issues
        const issues: string[] = [];
        if (totalUtilization >= 90) issues.push('Critical port utilization');
        else if (totalUtilization >= threshold) issues.push('High port utilization');

        if (siteAlerts.length >= 3) issues.push('Multiple device alerts');
        else if (siteAlerts.length >= 1) issues.push('Device alerts present');

        if (healthScore <= 60) issues.push('Poor health score');
        else if (healthScore <= 70) issues.push('Health score warning');

        // Determine status
        const getStatus = (util: number, alerts: number, health: number) => {
          if (util >= 90 || alerts >= 3 || health <= 60) return 'critical';
          if (util >= 80 || alerts >= 2 || health <= 70) return 'warning';
          return 'attention';
        };

        siteAnalysis.push({
          site,
          plaza,
          healthScore: Math.round(healthScore),
          utilization: Math.round(totalUtilization * 10) / 10,
          alertCount: siteAlerts.length,
          deviceCount: siteDevices.length,
          portCount,
          status: getStatus(totalUtilization, siteAlerts.length, healthScore),
          issues,
          lastUpdated: new Date().toISOString(),
          devices: siteDevices.map(d => ({
            device_id: d.device_id,
            hostname: d.hostname,
            type: d.type,
            os: d.os
          }))
        });

        console.log(`🚨 Critical site found: ${site} (${totalUtilization.toFixed(1)}% util, ${siteAlerts.length} alerts, health: ${healthScore.toFixed(1)})`);
      }
    }

    // Step 5: Sort by severity (lowest health score first, then highest utilization)
    siteAnalysis.sort((a, b) => {
      if (a.healthScore !== b.healthScore) return a.healthScore - b.healthScore;
      return b.utilization - a.utilization;
    });

    // Step 6: Limit results
    const limitedResults = siteAnalysis.slice(0, limit);

    // Step 7: Calculate summary
    const summary = {
      totalCriticalSites: siteAnalysis.length,
      averageHealthScore: siteAnalysis.length > 0
        ? Math.round((siteAnalysis.reduce((sum, site) => sum + site.healthScore, 0) / siteAnalysis.length) * 10) / 10
        : 0,
      totalAlerts: siteAnalysis.reduce((sum, site) => sum + site.alertCount, 0),
      criticalThreshold: threshold,
      statusBreakdown: {
        critical: siteAnalysis.filter(s => s.status === 'critical').length,
        warning: siteAnalysis.filter(s => s.status === 'warning').length,
        attention: siteAnalysis.filter(s => s.status === 'attention').length
      }
    };

    console.log(`✅ Found ${limitedResults.length} critical sites out of ${Object.keys(devicesBySite).length} total sites`);

    return NextResponse.json({
      data: limitedResults,
      summary,
      timestamp: new Date().toISOString(),
      demo: false,
      source: 'observium_data'
    });

  } catch (error) {
    console.error('❌ Error fetching critical sites data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch critical sites data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate health score based on utilization, alerts, and device count
 * Returns a score from 0-100 where 100 is perfect health
 */
function calculateHealthScore(utilization: number, alertCount: number, deviceCount: number): number {
  let score = 100;

  // Penalize high utilization
  if (utilization >= 90) score -= 40;
  else if (utilization >= 80) score -= 25;
  else if (utilization >= 70) score -= 15;
  else if (utilization >= 60) score -= 10;

  // Penalize alerts
  score -= Math.min(alertCount * 10, 30); // Max 30 points for alerts

  // Small penalty for sites with very few devices (might indicate issues)
  if (deviceCount === 1) score -= 5;

  return Math.max(0, score);
}
