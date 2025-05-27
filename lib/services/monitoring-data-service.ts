/**
 * Monitoring Data Service
 *
 * Servicio inteligente para obtener datos de monitoreo desde caché
 * y prepararlos para resúmenes ejecutivos con OpenAI
 */

import { cacheManager } from './cache-manager';
import { fetchDevices, fetchPorts, fetchAlerts } from '@/lib/repositories/observium-repository';

export interface MonitoringDataSummary {
  devices: any[];
  ports: any[];
  alerts: any[];
  plaza?: string;
  dataSource: 'cache' | 'api' | 'api-partial' | 'dashboard' | 'mock';
  timestamp: string;
  cacheTimeRemaining?: number;
}

export class MonitoringDataService {

  /**
   * Obtiene datos de monitoreo priorizando caché, luego API, luego mock
   */
  static async getMonitoringData(plaza?: string): Promise<MonitoringDataSummary> {
    console.log(`📊 MonitoringDataService: Obteniendo datos de monitoreo para plaza: ${plaza || 'todas'}`);

    // 1. Intentar obtener desde caché (incluyendo datos del dashboard)
    const cachedData = await this.getFromCache(plaza);
    if (cachedData) {
      console.log(`🚀 MonitoringDataService: Datos obtenidos desde caché para plaza: ${plaza || 'todas'}`);
      console.log(`📊 Cache Data: ${cachedData.devices.length} dispositivos, ${cachedData.alerts.length} alertas, fuente: ${cachedData.dataSource}`);
      return cachedData;
    }

    // 2. Intentar obtener desde API con mejor manejo de errores
    try {
      console.log(`📡 MonitoringDataService: Intentando obtener datos desde API...`);
      const apiData = await this.getFromAPI(plaza);

      // Verificar si tenemos datos útiles (dispositivos o alertas)
      const hasDevices = apiData && apiData.devices.length > 0;
      const hasAlerts = apiData && apiData.alerts.length > 0;
      const hasPorts = apiData && apiData.ports.length > 0;

      if (hasDevices || hasAlerts || hasPorts) {
        console.log(`✅ MonitoringDataService: Datos obtenidos desde API para plaza: ${plaza || 'todas'}`);
        console.log(`📊 API Data: ${apiData.devices.length} dispositivos, ${apiData.ports.length} puertos, ${apiData.alerts.length} alertas`);

        // Determinar el tipo de datos obtenidos
        let dataSource: 'api' | 'api-partial' = 'api';
        if (!hasDevices && (hasAlerts || hasPorts)) {
          dataSource = 'api-partial';
          console.log(`⚠️ Datos parciales de API: sin dispositivos pero con ${apiData.alerts.length} alertas y ${apiData.ports.length} puertos`);
        }

        const finalApiData = {
          ...apiData,
          dataSource
        };

        // Guardar en caché para futuras consultas
        await this.saveToCache(finalApiData, plaza);

        return finalApiData;
      } else {
        console.log(`⚠️ MonitoringDataService: API devolvió datos vacíos o insuficientes`);
        console.log(`⚠️ Detalles: ${apiData?.devices.length || 0} dispositivos, ${apiData?.ports.length || 0} puertos, ${apiData?.alerts.length || 0} alertas`);
      }
    } catch (error) {
      console.error('❌ MonitoringDataService: Error obteniendo datos desde API:', error);
      console.error('❌ Detalles del error:', error instanceof Error ? error.message : 'Error desconocido');
    }

    // 3. Intentar obtener datos de cualquier plaza si la específica falló
    if (plaza) {
      console.log(`🔄 MonitoringDataService: Intentando obtener datos generales (todas las plazas) como fallback...`);
      try {
        const generalData = await this.getFromAPI(undefined);
        if (generalData && (generalData.devices.length > 0 || generalData.alerts.length > 0)) {
          console.log(`✅ Datos generales obtenidos como fallback: ${generalData.devices.length} dispositivos, ${generalData.alerts.length} alertas`);

          const fallbackData = {
            ...generalData,
            plaza,
            dataSource: 'api-partial' as const
          };

          await this.saveToCache(fallbackData, plaza);
          return fallbackData;
        }
      } catch (error) {
        console.error('❌ Error obteniendo datos generales como fallback:', error);
      }
    }

    // 4. Usar datos mock como último recurso SOLO si no hay otra opción
    console.log(`🧪 MonitoringDataService: ÚLTIMO RECURSO - Usando datos de prueba para plaza: ${plaza || 'todas'}`);
    console.log(`⚠️ ADVERTENCIA: Se están usando datos de prueba porque no se pudieron obtener datos reales`);
    console.log(`⚠️ Esto puede indicar problemas de conectividad con la API de Observium`);
    return this.getMockData(plaza);
  }

  /**
   * Obtiene datos desde caché
   */
  private static async getFromCache(plaza?: string): Promise<MonitoringDataSummary | null> {
    const cacheKey = `monitoring-data:${plaza || 'all'}`;
    const cachedData = cacheManager.get<MonitoringDataSummary>(cacheKey);

    if (cachedData) {
      const cacheTimeRemaining = this.getCacheTimeRemaining(cacheKey);
      return {
        ...cachedData,
        cacheTimeRemaining
      };
    }

    return null;
  }

  /**
   * Obtiene datos desde API
   */
  private static async getFromAPI(plaza?: string): Promise<MonitoringDataSummary> {
    const [devices, ports, alerts] = await Promise.all([
      fetchDevices().catch(err => {
        console.error('❌ Error obteniendo dispositivos:', err.message);
        return [];
      }),
      fetchPorts().catch(err => {
        console.error('❌ Error obteniendo puertos:', err.message);
        return [];
      }),
      fetchAlerts(50).catch(err => {
        console.error('❌ Error obteniendo alertas:', err.message);
        return [];
      })
    ]);

    // Filtrar por plaza si se especifica
    let filteredDevices = devices;
    let filteredPorts = ports;
    let filteredAlerts = alerts;

    if (plaza && devices.length > 0) {
      filteredDevices = devices.filter(device =>
        device.location && device.location.toLowerCase().includes(plaza.toLowerCase())
      );

      if (filteredDevices.length > 0) {
        const deviceIds = filteredDevices.map(d => d.device_id);
        filteredPorts = ports.filter(port =>
          deviceIds.includes(port.device_id || '')
        );
        filteredAlerts = alerts.filter(alert =>
          deviceIds.includes(alert.device_id)
        );
      } else {
        // Si no hay dispositivos para la plaza específica, usar todos los datos
        filteredDevices = devices;
        filteredPorts = ports;
        filteredAlerts = alerts;
      }
    }

    return {
      devices: filteredDevices,
      ports: filteredPorts,
      alerts: filteredAlerts,
      plaza,
      dataSource: 'api',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Guarda datos en caché
   */
  private static async saveToCache(data: MonitoringDataSummary, plaza?: string): Promise<void> {
    const cacheKey = `monitoring-data:${plaza || 'all'}`;
    cacheManager.set(cacheKey, data);
    console.log(`💾 Datos guardados en caché: ${cacheKey}`);
  }

  /**
   * Genera datos mock para pruebas
   */
  private static getMockData(plaza?: string): MonitoringDataSummary {
    const mockDevices = [
      {
        device_id: '1001',
        hostname: `router-${plaza?.toLowerCase() || 'main'}-01`,
        status: 'up',
        location: plaza || 'CDMX',
        vendor: 'Cisco',
        hardware: 'ASR1000',
        uptime: '45 days, 12:30:15'
      },
      {
        device_id: '1002',
        hostname: `switch-${plaza?.toLowerCase() || 'main'}-02`,
        status: 'up',
        location: plaza || 'CDMX',
        vendor: 'Cisco',
        hardware: 'Catalyst9300',
        uptime: '32 days, 08:45:22'
      },
      {
        device_id: '1003',
        hostname: `firewall-${plaza?.toLowerCase() || 'main'}-01`,
        status: 'down',
        location: plaza || 'CDMX',
        vendor: 'Fortinet',
        hardware: 'FortiGate',
        uptime: '0 days, 00:00:00'
      }
    ];

    const mockPorts = [
      {
        port_id: '2001',
        device_id: '1001',
        ifName: 'GigabitEthernet0/0/1',
        ifOperStatus: 'up',
        ifSpeed: 1000000000,
        ifInOctets: 850000000,
        ifOutOctets: 750000000,
        utilization: 85
      },
      {
        port_id: '2002',
        device_id: '1001',
        ifName: 'GigabitEthernet0/0/2',
        ifOperStatus: 'up',
        ifSpeed: 1000000000,
        ifInOctets: 920000000,
        ifOutOctets: 880000000,
        utilization: 92
      },
      {
        port_id: '2003',
        device_id: '1002',
        ifName: 'GigabitEthernet1/0/1',
        ifOperStatus: 'down',
        ifSpeed: 1000000000,
        ifInOctets: 0,
        ifOutOctets: 0,
        utilization: 0
      }
    ];

    const mockAlerts = [
      {
        alert_id: '3001',
        device_id: '1003',
        message: 'Device Down - Firewall no responde',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        duration: '2 hours, 15 minutes'
      },
      {
        alert_id: '3002',
        device_id: '1002',
        message: 'Interface Down - Puerto crítico desconectado',
        severity: 'warning',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        duration: '30 minutes'
      }
    ];

    return {
      devices: mockDevices,
      ports: mockPorts,
      alerts: mockAlerts,
      plaza,
      dataSource: 'mock',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obtiene tiempo restante de caché
   */
  private static getCacheTimeRemaining(cacheKey: string): number {
    // Esta función necesitaría ser implementada en el cache manager
    // Por ahora retornamos un valor por defecto
    return 60 * 60 * 1000; // 1 hora
  }

  /**
   * Verifica si hay datos válidos en caché
   */
  static async hasCachedData(plaza?: string): Promise<boolean> {
    const cacheKey = `monitoring-data:${plaza || 'all'}`;
    const cachedData = cacheManager.get<MonitoringDataSummary>(cacheKey);
    return cachedData !== null;
  }

  /**
   * Invalida caché para una plaza específica
   */
  static async invalidateCache(plaza?: string): Promise<void> {
    const cacheKey = `monitoring-data:${plaza || 'all'}`;
    cacheManager.delete(cacheKey);
    console.log(`🗑️ Caché invalidado: ${cacheKey}`);
  }

  /**
   * Obtiene datos frescos de la API, invalidando caché primero
   * Útil para el botón "Actualizar" del resumen ejecutivo
   */
  static async getFreshMonitoringData(plaza?: string): Promise<MonitoringDataSummary> {
    console.log(`🔄 MonitoringDataService: Obteniendo datos frescos para plaza: ${plaza || 'todas'}`);

    // Invalidar caché existente
    await this.invalidateCache(plaza);

    // Obtener datos frescos
    return this.getMonitoringData(plaza);
  }

  /**
   * Guarda datos del dashboard directamente en caché para uso posterior
   */
  static async saveDashboardDataToCache(dashboardData: any, plaza?: string): Promise<void> {
    if (!dashboardData?.overview?.devices) {
      console.log(`⚠️ No se pueden guardar datos del dashboard: datos insuficientes`);
      return;
    }

    const monitoringData: MonitoringDataSummary = {
      devices: dashboardData.overview.devices,
      ports: [], // Dashboard no incluye puertos
      alerts: dashboardData.overview.alerts || [],
      plaza,
      dataSource: 'dashboard',
      timestamp: new Date().toISOString()
    };

    await this.saveToCache(monitoringData, plaza);
    console.log(`💾 Datos del dashboard guardados en caché para plaza: ${plaza || 'todas'}`);
  }
}

export default MonitoringDataService;
