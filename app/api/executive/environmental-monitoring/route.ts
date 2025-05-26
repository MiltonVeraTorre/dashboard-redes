import { NextRequest, NextResponse } from 'next/server';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';

/**
 * GET /api/executive/environmental-monitoring
 *
 * Returns environmental monitoring data for the executive dashboard.
 * This endpoint aggregates sensor data (temperature, humidity, voltage, etc.) from Observium.
 *
 * Query Parameters:
 * - location: Filter by specific location (optional)
 * - sensorType: Filter by sensor type (default: 'all') - 'temperature', 'humidity', 'voltage', 'all'
 * - alertThreshold: Temperature threshold for alerts (default: 35°C)
 *
 * Response:
 * {
 *   "data": {
 *     "averageTemperature": 28.5,
 *     "maxTemperature": 35.2,
 *     "minTemperature": 22.1,
 *     "temperatureAlerts": 2,
 *     "humidityLevel": 45.8,
 *     "voltageStability": 98.5,
 *     "environmentalHealth": 85.2,
 *     "sensorsOnline": 45,
 *     "sensorsOffline": 3
 *   },
 *   "breakdown": [
 *     {
 *       "location": "CDMX",
 *       "avgTemperature": 29.2,
 *       "maxTemperature": 32.1,
 *       "humidity": 48.5,
 *       "sensorCount": 12,
 *       "alertCount": 1,
 *       "status": "normal"
 *     }
 *   ],
 *   "alerts": [
 *     {
 *       "location": "Queretaro",
 *       "device": "QRO-SW-01",
 *       "sensorType": "temperature",
 *       "value": 38.5,
 *       "threshold": 35.0,
 *       "severity": "warning"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location');
    const sensorType = searchParams.get('sensorType') || 'all';
    const alertThreshold = parseFloat(searchParams.get('alertThreshold') || '35');

    console.log(`🔍 Fetching environmental monitoring data (location: ${location || 'all'}, type: ${sensorType})`);

    // Step 1: Get devices data for location mapping
    let devicesResponse;
    try {
      devicesResponse = await observiumApi.get('/devices', {
        params: {
          pagesize: 100,
          ...(location && { location })
        }
      });
    } catch (deviceError) {
      console.warn('⚠️ Failed to fetch devices from Observium API:', deviceError);
      devicesResponse = { data: null };
    }

    if (!devicesResponse.data || !devicesResponse.data.devices ||
        (Array.isArray(devicesResponse.data.devices) && devicesResponse.data.devices.length === 0) ||
        (typeof devicesResponse.data.devices === 'object' && Object.keys(devicesResponse.data.devices).length === 0)) {
      console.warn('⚠️ No devices found in Observium response, generating demo data');

      return NextResponse.json({
        data: {
          averageTemperature: 28.5,
          maxTemperature: 35.2,
          minTemperature: 22.1,
          temperatureAlerts: 2,
          humidityLevel: 45.8,
          voltageStability: 98.5,
          environmentalHealth: 85.2,
          sensorsOnline: 45,
          sensorsOffline: 3
        },
        breakdown: [
          {
            location: 'CDMX',
            avgTemperature: 29.2,
            maxTemperature: 32.1,
            humidity: 48.5,
            sensorCount: 12,
            alertCount: 1,
            status: 'normal'
          },
          {
            location: 'Monterrey',
            avgTemperature: 26.8,
            maxTemperature: 30.5,
            humidity: 42.3,
            sensorCount: 10,
            alertCount: 0,
            status: 'normal'
          },
          {
            location: 'Queretaro',
            avgTemperature: 31.5,
            maxTemperature: 38.5,
            humidity: 52.1,
            sensorCount: 8,
            alertCount: 2,
            status: 'warning'
          }
        ],
        alerts: [
          {
            location: 'Queretaro',
            device: 'QRO-SW-01',
            sensorType: 'temperature',
            value: 38.5,
            threshold: 35.0,
            severity: 'warning'
          },
          {
            location: 'CDMX',
            device: 'CDMX-RTR-02',
            sensorType: 'temperature',
            value: 36.2,
            threshold: 35.0,
            severity: 'warning'
          }
        ],
        timestamp: new Date().toISOString(),
        demo: true,
        source: 'demo_data'
      });
    }

    // Step 2: Get devices and their IDs
    const devices = Object.values(devicesResponse.data.devices) as any[];
    const deviceIds = devices.map(d => d.device_id).slice(0, 20); // Limit to prevent large responses

    console.log(`📊 Processing ${devices.length} devices for environmental monitoring`);

    // Step 3: Fetch sensor data based on type
    const sensorParams: any = {
      device_id: deviceIds,
      pagesize: 100
    };

    // Add sensor type filter if specified
    if (sensorType !== 'all') {
      sensorParams.sensor_class = sensorType;
    }

    const sensorsResponse = await observiumApi.get('/sensors', {
      params: sensorParams
    });

    // Step 4: Process environmental data
    const environmentalData = await processEnvironmentalData(
      devices,
      sensorsResponse.data,
      alertThreshold,
      sensorType
    );

    console.log(`✅ Successfully generated environmental monitoring data`);

    return NextResponse.json({
      ...environmentalData,
      timestamp: new Date().toISOString(),
      demo: false,
      source: 'observium_data'
    });

  } catch (error) {
    console.error('❌ Error fetching environmental monitoring data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch environmental monitoring data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Process environmental monitoring data from sensors
 */
async function processEnvironmentalData(
  devices: any[],
  sensorsData: any,
  alertThreshold: number,
  sensorType: string
) {
  const locationStats: Record<string, {
    temperatures: number[];
    humidities: number[];
    voltages: number[];
    sensorCount: number;
    alertCount: number;
  }> = {};

  const alerts: any[] = [];
  let totalSensorsOnline = 0;
  let totalSensorsOffline = 0;

  // Initialize location stats
  devices.forEach(device => {
    const location = device.location || 'Unknown';
    if (!locationStats[location]) {
      locationStats[location] = {
        temperatures: [],
        humidities: [],
        voltages: [],
        sensorCount: 0,
        alertCount: 0
      };
    }
  });

  // Process sensor data if available
  if (sensorsData && sensorsData.sensors) {
    const sensors = Object.values(sensorsData.sensors) as any[];

    sensors.forEach((sensor: any) => {
      const device = devices.find(d => d.device_id === sensor.device_id);
      if (!device) return;

      const location = device.location || 'Unknown';
      const sensorValue = parseFloat(sensor.sensor_value) || 0;
      const sensorClass = sensor.sensor_class || '';
      const sensorDescr = sensor.sensor_descr || '';

      locationStats[location].sensorCount++;

      // Check if sensor is online
      if (sensor.sensor_event === 'ok') {
        totalSensorsOnline++;
      } else {
        totalSensorsOffline++;
      }

      // Process different sensor types
      switch (sensorClass.toLowerCase()) {
        case 'temperature':
          locationStats[location].temperatures.push(sensorValue);

          // Check for temperature alerts
          if (sensorValue > alertThreshold) {
            locationStats[location].alertCount++;
            alerts.push({
              location,
              device: device.hostname,
              sensorType: 'temperature',
              value: sensorValue,
              threshold: alertThreshold,
              severity: sensorValue > alertThreshold + 5 ? 'critical' : 'warning'
            });
          }
          break;

        case 'humidity':
          locationStats[location].humidities.push(sensorValue);
          break;

        case 'voltage':
          locationStats[location].voltages.push(sensorValue);
          break;

        default:
          // Handle other sensor types or generic sensors
          if (sensorDescr.toLowerCase().includes('temp')) {
            locationStats[location].temperatures.push(sensorValue);
          }
          break;
      }
    });
  }

  // Calculate overall metrics
  let allTemperatures: number[] = [];
  let allHumidities: number[] = [];
  let allVoltages: number[] = [];
  let totalAlerts = 0;

  const breakdown = Object.entries(locationStats).map(([location, stats]) => {
    const avgTemp = stats.temperatures.length > 0
      ? stats.temperatures.reduce((sum, val) => sum + val, 0) / stats.temperatures.length
      : 0;
    const maxTemp = stats.temperatures.length > 0
      ? Math.max(...stats.temperatures)
      : 0;
    const avgHumidity = stats.humidities.length > 0
      ? stats.humidities.reduce((sum, val) => sum + val, 0) / stats.humidities.length
      : 0;

    allTemperatures.push(...stats.temperatures);
    allHumidities.push(...stats.humidities);
    allVoltages.push(...stats.voltages);
    totalAlerts += stats.alertCount;

    const status = stats.alertCount > 0 ? 'warning' : 'normal';

    return {
      location,
      avgTemperature: Math.round(avgTemp * 10) / 10,
      maxTemperature: Math.round(maxTemp * 10) / 10,
      humidity: Math.round(avgHumidity * 10) / 10,
      sensorCount: stats.sensorCount,
      alertCount: stats.alertCount,
      status
    };
  }).filter(item => item.sensorCount > 0);

  // Calculate overall environmental metrics
  const averageTemperature = allTemperatures.length > 0
    ? allTemperatures.reduce((sum, val) => sum + val, 0) / allTemperatures.length
    : 0;
  const maxTemperature = allTemperatures.length > 0
    ? Math.max(...allTemperatures)
    : 0;
  const minTemperature = allTemperatures.length > 0
    ? Math.min(...allTemperatures)
    : 0;
  const humidityLevel = allHumidities.length > 0
    ? allHumidities.reduce((sum, val) => sum + val, 0) / allHumidities.length
    : 0;
  const voltageStability = allVoltages.length > 0
    ? 100 - (Math.abs(allVoltages.reduce((sum, val) => sum + val, 0) / allVoltages.length - 12) * 5) // Assume 12V nominal
    : 100;

  // Calculate environmental health score
  const tempHealth = averageTemperature > 0 ? Math.max(0, 100 - ((averageTemperature - 20) * 2)) : 100;
  const humidityHealth = humidityLevel > 0 ? Math.max(0, 100 - Math.abs(humidityLevel - 50)) : 100;
  const alertHealth = totalAlerts > 0 ? Math.max(0, 100 - (totalAlerts * 10)) : 100;
  const environmentalHealth = (tempHealth + humidityHealth + alertHealth) / 3;

  return {
    data: {
      averageTemperature: Math.round(averageTemperature * 10) / 10,
      maxTemperature: Math.round(maxTemperature * 10) / 10,
      minTemperature: Math.round(minTemperature * 10) / 10,
      temperatureAlerts: totalAlerts,
      humidityLevel: Math.round(humidityLevel * 10) / 10,
      voltageStability: Math.round(voltageStability * 10) / 10,
      environmentalHealth: Math.round(environmentalHealth * 10) / 10,
      sensorsOnline: totalSensorsOnline,
      sensorsOffline: totalSensorsOffline
    },
    breakdown: breakdown.slice(0, 10), // Top 10 locations
    alerts: alerts.slice(0, 10) // Top 10 alerts
  };
}
