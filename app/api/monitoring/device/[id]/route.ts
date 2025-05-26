import { NextRequest, NextResponse } from 'next/server';
import * as MonitoringDomain from '@/lib/domain/monitoring';

/**
 * GET /api/monitoring/device/[id]
 *
 * Returns comprehensive technical monitoring data for a specific device.
 * This endpoint supports HU-02 detailed technical monitoring and diagnostics.
 *
 * Path Parameters:
 * - id: The device ID (numeric)
 *
 * Query Parameters:
 * - includeSystemHealth: Include CPU/memory/temperature metrics (default: true)
 * - includeAttentionAnalysis: Include attention analysis (default: true)
 * - includeRawData: Include raw Observium data (default: false)
 *
 * Response:
 * {
 *   "deviceId": 123,
 *   "monitoringData": { ... },
 *   "systemHealth": { ... },
 *   "attentionAnalysis": { ... },
 *   "summary": { ... }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deviceId = parseInt(id, 10);

    // Validate device ID
    if (isNaN(deviceId)) {
      return NextResponse.json(
        {
          error: 'Invalid device ID',
          message: 'Device ID must be a valid number',
          providedId: id,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const includeSystemHealth = searchParams.get('includeSystemHealth') !== 'false';
    const includeAttentionAnalysis = searchParams.get('includeAttentionAnalysis') !== 'false';
    const includeRawData = searchParams.get('includeRawData') === 'true';

    console.log(`🔍 Fetching monitoring data for device: ${deviceId}`);
    console.log(`📊 Options: systemHealth=${includeSystemHealth}, attention=${includeAttentionAnalysis}, raw=${includeRawData}`);

    // Fetch comprehensive monitoring data (always included)
    const monitoringData = await MonitoringDomain.getDeviceMonitoringData(deviceId);

    if (!monitoringData) {
      return NextResponse.json(
        {
          error: 'Device not found',
          message: `No device found with ID ${deviceId}`,
          deviceId,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Build response object
    const response: any = {
      deviceId,
      device: {
        id: monitoringData.device.device_id,
        hostname: monitoringData.device.hostname,
        status: monitoringData.device.status,
        location: monitoringData.device.location,
        group: monitoringData.device.group,
        type: monitoringData.device.type,
        os: monitoringData.device.os,
        uptime: monitoringData.device.uptime,
        lastPolled: monitoringData.device.last_polled
      },
      summary: {
        portsCount: monitoringData.ports.length,
        activePortsCount: monitoringData.ports.filter(p => p.ifOperStatus === 'up').length,
        memPoolsCount: monitoringData.memPools.length,
        processorsCount: monitoringData.processors.length,
        sensorsCount: monitoringData.sensors.length,
        alertsCount: monitoringData.alerts.length,
        unacknowledgedAlertsCount: monitoringData.alerts.filter(a => !a.acknowledged).length
      },
      timestamp: new Date().toISOString()
    };

    // Include raw monitoring data if requested
    if (includeRawData) {
      response.monitoringData = monitoringData;
    } else {
      // Include simplified port data
      response.ports = monitoringData.ports.map(port => ({
        id: port.port_id,
        name: port.ifAlias || port.ifName,
        type: port.ifType,
        operStatus: port.ifOperStatus,
        adminStatus: port.ifAdminStatus,
        speed: port.ifHighSpeed || (port.ifSpeed ? port.ifSpeed / 1000000 : 0),
        inOctets: port.ifInOctets,
        outOctets: port.ifOutOctets,
        inErrors: port.ifInErrors,
        outErrors: port.ifOutErrors
      }));

      // Include simplified alerts
      response.alerts = monitoringData.alerts.map(alert => ({
        id: alert.alert_id,
        status: alert.alert_status,
        message: alert.alert_message,
        timestamp: alert.timestamp,
        acknowledged: Boolean(alert.acknowledged),
        entityType: alert.entity_type
      }));
    }

    // Fetch system health if requested
    if (includeSystemHealth) {
      console.log(`🏥 Fetching system health for device ${deviceId}...`);
      try {
        const systemHealth = await MonitoringDomain.getDeviceSystemHealth(deviceId);
        response.systemHealth = systemHealth;
        console.log(`✅ System health: ${systemHealth.overallHealth} (CPU: ${systemHealth.cpu.max}%, Memory: ${systemHealth.memory.max}%)`);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch system health for device ${deviceId}:`, error);
        response.systemHealth = null;
        response.warnings = response.warnings || [];
        response.warnings.push('Failed to fetch system health metrics');
      }
    }

    // Perform attention analysis if requested
    if (includeAttentionAnalysis) {
      console.log(`🚨 Performing attention analysis for device ${deviceId}...`);
      try {
        const attentionAnalysis = MonitoringDomain.requiresAttention(monitoringData);
        response.attentionAnalysis = attentionAnalysis;

        if (attentionAnalysis.requiresAttention) {
          console.log(`⚠️ Device requires attention (${attentionAnalysis.severity}): ${attentionAnalysis.reasons.join(', ')}`);
        } else {
          console.log(`✅ Device is operating normally`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to perform attention analysis for device ${deviceId}:`, error);
        response.attentionAnalysis = null;
        response.warnings = response.warnings || [];
        response.warnings.push('Failed to perform attention analysis');
      }
    }

    console.log(`✅ Successfully fetched monitoring data for device: ${deviceId}`);

    return NextResponse.json(response);
  } catch (error) {
    const { id } = await params;
    console.error(`❌ Error fetching monitoring data for device ${id}:`, error);

    return NextResponse.json(
      {
        error: 'Failed to fetch device monitoring data',
        deviceId: id,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
