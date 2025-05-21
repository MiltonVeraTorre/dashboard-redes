import { NextRequest, NextResponse } from 'next/server';
import * as AlertsBFF from '@/lib/bff/alerts';

/**
 * GET /api/alerts
 * 
 * Query parameters:
 * - siteId: Filter alerts by site ID
 * - severity: Filter alerts by severity (info, warning, critical)
 * - acknowledged: Filter alerts by acknowledgement status
 * - limit: Limit the number of alerts returned
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId') || undefined;
    const severity = searchParams.get('severity') as 'info' | 'warning' | 'critical' | undefined;
    const acknowledgedParam = searchParams.get('acknowledged');
    const acknowledged = acknowledgedParam ? acknowledgedParam === 'true' : undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    
    const alerts = await AlertsBFF.getAlerts({
      siteId,
      severity,
      acknowledged,
      limit,
    });
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts/acknowledge
 * 
 * Request body:
 * - alertId: The ID of the alert to acknowledge
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId } = body;
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }
    
    const success = await AlertsBFF.acknowledgeAlert(alertId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to acknowledge alert' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    );
  }
}
