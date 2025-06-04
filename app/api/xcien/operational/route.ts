// API endpoint para funcionalidades operativas XCIEN
// Implementa monitoreo quincenal, inventario, umbrales y alertas

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { 
  XCIENOperationalDashboard,
  XCIENLinkInventory,
  BiweeklyMetrics,
  RadioBaseAnalysis,
  CityTierClassification,
  EngineeringThreshold,
  CostPerMbUsed,
  AutomatedAlert
} from '@/lib/types/xcien-operational';
import {
  ObserviumDataParser,
  processLinkInventory,
  processBiweeklyMetrics,
  processRadioBaseAnalysis,
  DEFAULT_XCIEN_CONFIG
} from '@/lib/utils/xcien-data-processor';
import { biweeklyStorage, generateBiweeklyPeriods } from '@/lib/utils/biweekly-storage';

// Configuración de Observium API
const observiumApi = axios.create({
  baseURL: 'http://172.26.2.161/api/v0',
  auth: {
    username: 'equipo2',
    password: '91Rert@mU'
  },
  timeout: 30000
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'current';
  const includeHistorical = searchParams.get('historical') === 'true';
  
  console.log(`🏢 Fetching XCIEN operational data for period: ${period}`);
  
  try {
    // Obtener datos base de Observium
    const [portsData, devicesData, billsData] = await Promise.all([
      fetchObserviumPorts(),
      fetchObserviumDevices(),
      fetchObserviumBills()
    ]);
    
    console.log(`📊 Retrieved data: ${portsData.length} ports, ${devicesData.length} devices, ${billsData.length} bills`);
    
    // Procesar inventario de enlaces
    const linkInventory = processLinkInventory(portsData, devicesData);
    console.log(`🔗 Processed ${linkInventory.length} links in inventory`);
    
    // Procesar métricas quincenales
    const biweeklyMetrics = processBiweeklyMetrics(linkInventory, billsData, period);
    console.log(`📈 Processed biweekly metrics for ${biweeklyMetrics.length} links`);

    // Guardar datos históricos
    if (biweeklyMetrics.length > 0) {
      biweeklyStorage.savePeriodData(period, biweeklyMetrics);
      console.log(`💾 Saved historical data for period ${period}`);
    }
    
    // Procesar análisis por radio-base
    const radioBaseAnalysis = processRadioBaseAnalysis(linkInventory);
    console.log(`📡 Analyzed ${radioBaseAnalysis.length} radio bases`);
    
    // Procesar clasificación de ciudades
    const cityTierClassification = processCityTierClassification(linkInventory, radioBaseAnalysis);
    console.log(`🏙️ Classified ${cityTierClassification.length} cities`);
    
    // Procesar umbrales de ingeniería
    const engineeringThresholds = processEngineeringThresholds(linkInventory, biweeklyMetrics);
    console.log(`⚠️ Processed ${engineeringThresholds.length} engineering thresholds`);
    
    // Procesar análisis de costos
    const costAnalysis = processCostAnalysis(linkInventory, billsData);
    console.log(`💰 Analyzed costs for ${costAnalysis.length} links`);
    
    // Generar alertas automáticas
    const activeAlerts = generateAutomatedAlerts(engineeringThresholds, costAnalysis, linkInventory);
    console.log(`🚨 Generated ${activeAlerts.length} automated alerts`);

    // Generar tendencias históricas
    const linkIds = linkInventory.map(link => link.linkId);
    const historicalTrends = biweeklyStorage.generateHistoricalTrends(linkIds);
    console.log(`📊 Generated historical trends for ${historicalTrends.length} links`);
    
    // Construir respuesta operativa
    const operationalData: XCIENOperationalDashboard = {
      linkInventory,
      biweeklyMetrics,
      radioBaseAnalysis,
      cityTierClassification,
      engineeringThresholds,
      costAnalysis,
      historicalTrends,
      activeAlerts,
      lastUpdated: new Date().toISOString(),
      dataQuality: calculateDataQuality(linkInventory, biweeklyMetrics, billsData)
    };
    
    console.log(`✅ Successfully generated XCIEN operational dashboard`);
    
    return NextResponse.json(operationalData);
    
  } catch (error) {
    console.error('❌ Error generating XCIEN operational data:', error);
    return NextResponse.json(
      { error: 'Failed to generate operational data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Obtener puertos de tránsito de Observium
async function fetchObserviumPorts(): Promise<any[]> {
  try {
    const response = await observiumApi.get('/ports', {
      params: {
        port_descr_type: 'transit',
        pagesize: 200,
        fields: 'port_id,device_id,hostname,ifAlias,ifDescr,ifSpeed,ifOperStatus,location'
      }
    });
    
    return extractPortsData(response.data);
  } catch (error) {
    console.warn('⚠️ Error fetching ports, using fallback approach');
    // Fallback: obtener todos los puertos y filtrar localmente
    const response = await observiumApi.get('/ports', {
      params: {
        pagesize: 150,
        fields: 'port_id,device_id,hostname,ifAlias,ifDescr,ifSpeed,ifOperStatus,location'
      }
    });
    
    const allPorts = extractPortsData(response.data);
    return allPorts.filter(port => 
      port.ifAlias?.toLowerCase().includes('transit') ||
      port.ifDescr?.toLowerCase().includes('transit')
    );
  }
}

// Obtener dispositivos de Observium
async function fetchObserviumDevices(): Promise<any[]> {
  try {
    const response = await observiumApi.get('/devices', {
      params: {
        pagesize: 150,
        fields: 'device_id,hostname,sysname,location,type,purpose,status'
      }
    });
    
    return extractDevicesData(response.data);
  } catch (error) {
    console.warn('⚠️ Error fetching devices:', error);
    return [];
  }
}

// Obtener datos de facturación de Observium
async function fetchObserviumBills(): Promise<any[]> {
  try {
    const response = await observiumApi.get('/bills', {
      params: {
        pagesize: 200,
        fields: 'bill_id,bill_name,bill_quota,bill_used,bill_allowed,device_id,hostname,rate_95th_in,rate_95th_out'
      }
    });
    
    return extractBillsData(response.data);
  } catch (error) {
    console.warn('⚠️ Error fetching bills:', error);
    return [];
  }
}

// Procesar clasificación de ciudades Tier I vs II
function processCityTierClassification(
  linkInventory: XCIENLinkInventory[], 
  radioBaseAnalysis: RadioBaseAnalysis[]
): CityTierClassification[] {
  const cityMap = new Map<string, {
    links: XCIENLinkInventory[];
    radioBases: RadioBaseAnalysis[];
  }>();
  
  // Agrupar por plaza
  linkInventory.forEach(link => {
    if (!cityMap.has(link.plaza)) {
      cityMap.set(link.plaza, { links: [], radioBases: [] });
    }
    cityMap.get(link.plaza)!.links.push(link);
  });
  
  radioBaseAnalysis.forEach(rb => {
    if (cityMap.has(rb.plaza)) {
      cityMap.get(rb.plaza)!.radioBases.push(rb);
    }
  });
  
  return Array.from(cityMap.entries()).map(([plaza, data]) => {
    const totalCapacityMbps = data.links.reduce((sum, link) => sum + link.contractedBandwidth, 0);
    const totalTrafficMbps = totalCapacityMbps * 0.6; // Estimación
    const carrierDiversity = new Set(data.links.map(link => link.carrierProvider)).size;
    
    const cityData = {
      radioBases: data.radioBases.length,
      totalCapacityMbps,
      totalTrafficMbps,
      carrierDiversity
    };
    
    const tier = ObserviumDataParser.classifyCity(cityData);
    
    return {
      cityName: plaza,
      plaza: plaza,
      tier: tier,
      radioBases: data.radioBases.length,
      totalLinks: data.links.length,
      totalCapacityGbps: Math.round(totalCapacityMbps / 1000 * 100) / 100,
      totalTrafficGbps: Math.round(totalTrafficMbps / 1000 * 100) / 100,
      averageUtilization: Math.round((totalTrafficMbps / totalCapacityMbps) * 100),
      carrierDiversity: carrierDiversity,
      priority: tier === 'I' ? 'expansion' : 'optimization',
      classificationReason: tier === 'I' 
        ? `${data.radioBases.length} radio-bases, ${Math.round(totalCapacityMbps/1000)}GB capacity`
        : `${data.radioBases.length} radio-bases, focus on optimization`
    };
  });
}

// Procesar umbrales de ingeniería
function processEngineeringThresholds(
  linkInventory: XCIENLinkInventory[], 
  biweeklyMetrics: BiweeklyMetrics[]
): EngineeringThreshold[] {
  const metricsMap = new Map(biweeklyMetrics.map(m => [m.linkId, m]));
  
  return linkInventory.map(link => {
    const metrics = metricsMap.get(link.linkId);
    const thresholdMbps = ObserviumDataParser.calculateEngineeringThreshold(link.contractedBandwidth);
    const currentUtilization = metrics?.utilizationPercent || 0;
    
    let alertStatus: 'normal' | 'warning' | 'critical' | 'capacity_risk' = 'normal';
    let recommendedAction = 'Monitor normal operation';
    
    if (currentUtilization >= 80) {
      alertStatus = 'critical';
      recommendedAction = 'IMMEDIATE UPGRADE REQUIRED - Link saturated';
    } else if (currentUtilization >= 70) {
      alertStatus = 'warning';
      recommendedAction = 'Plan capacity upgrade within 30 days';
    } else if (currentUtilization >= 90) {
      alertStatus = 'capacity_risk';
      recommendedAction = 'URGENT - Risk of service degradation';
    }
    
    return {
      linkId: link.linkId,
      capacityMbps: link.contractedBandwidth,
      thresholdMbps: thresholdMbps,
      warningPercent: DEFAULT_XCIEN_CONFIG.engineeringThresholds.defaultWarning,
      criticalPercent: DEFAULT_XCIEN_CONFIG.engineeringThresholds.defaultCritical,
      currentUtilization: currentUtilization,
      alertStatus: alertStatus,
      recommendedAction: recommendedAction,
      lastUpdated: new Date().toISOString()
    };
  });
}

// Procesar análisis de costos
function processCostAnalysis(linkInventory: XCIENLinkInventory[], billsData: any[]): CostPerMbUsed[] {
  const billsMap = new Map(billsData.map(bill => [bill.hostname || bill.device_id, bill]));
  
  return linkInventory.map(link => {
    const bill = billsMap.get(link.hostname) || billsMap.get(link.deviceId);
    const monthlyRecurringCharge = parseFloat(bill?.bill_quota || '0') || (link.contractedBandwidth * 38); // Fallback $38/Mbps
    
    const rateIn95th = parseFloat(bill?.rate_95th_in || '0');
    const rateOut95th = parseFloat(bill?.rate_95th_out || '0');
    const peakUsageMbps = Math.max(rateIn95th, rateOut95th) / 1000000;
    
    const costPerMbps = peakUsageMbps > 0 ? monthlyRecurringCharge / peakUsageMbps : 0;
    const benchmarkCost = DEFAULT_XCIEN_CONFIG.costBenchmarks.targetCostPerMbps;
    const costVariance = costPerMbps - benchmarkCost;
    
    let efficiency: 'excellent' | 'good' | 'poor' | 'critical' = 'good';
    if (costPerMbps <= DEFAULT_XCIEN_CONFIG.costBenchmarks.excellentThreshold) {
      efficiency = 'excellent';
    } else if (costPerMbps <= DEFAULT_XCIEN_CONFIG.costBenchmarks.goodThreshold) {
      efficiency = 'good';
    } else if (costPerMbps <= DEFAULT_XCIEN_CONFIG.costBenchmarks.poorThreshold) {
      efficiency = 'poor';
    } else {
      efficiency = 'critical';
    }
    
    return {
      linkId: link.linkId,
      carrierProvider: link.carrierProvider,
      monthlyRecurringCharge: Math.round(monthlyRecurringCharge),
      peakUsageMbps: Math.round(peakUsageMbps * 100) / 100,
      costPerMbps: Math.round(costPerMbps * 100) / 100,
      efficiency: efficiency,
      benchmarkCostPerMbps: benchmarkCost,
      costVariance: Math.round(costVariance * 100) / 100,
      optimizationPotential: efficiency === 'critical' ? monthlyRecurringCharge * 0.5 : 0
    };
  });
}

// Generar alertas automáticas
function generateAutomatedAlerts(
  engineeringThresholds: EngineeringThreshold[],
  costAnalysis: CostPerMbUsed[],
  linkInventory: XCIENLinkInventory[]
): AutomatedAlert[] {
  const alerts: AutomatedAlert[] = [];
  const linkMap = new Map(linkInventory.map(link => [link.linkId, link]));

  // Alertas de utilización
  engineeringThresholds.forEach(threshold => {
    const link = linkMap.get(threshold.linkId);
    if (threshold.alertStatus === 'critical' || threshold.alertStatus === 'capacity_risk') {
      alerts.push({
        id: `util-${threshold.linkId}-${Date.now()}`,
        linkId: threshold.linkId,
        alertType: 'utilization',
        severity: threshold.alertStatus === 'capacity_risk' ? 'emergency' : 'critical',
        title: `High Utilization Alert - ${threshold.currentUtilization}%`,
        description: `Link utilization at ${threshold.currentUtilization}% exceeds ${threshold.criticalPercent}% threshold`,
        currentValue: threshold.currentUtilization,
        thresholdValue: threshold.criticalPercent,
        recommendedAction: threshold.recommendedAction,
        autoResolve: false,
        createdAt: new Date().toISOString(),
        plaza: link?.plaza || 'Unknown',
        carrierProvider: link?.carrierProvider || 'Unknown'
      });
    }
  });
  
  // Alertas de costo
  costAnalysis.forEach(cost => {
    const link = linkMap.get(cost.linkId);
    if (cost.efficiency === 'critical') {
      alerts.push({
        id: `cost-${cost.linkId}-${Date.now()}`,
        linkId: cost.linkId,
        alertType: 'cost',
        severity: 'warning',
        title: `High Cost per Mbps - $${cost.costPerMbps}`,
        description: `Cost per Mbps ($${cost.costPerMbps}) significantly exceeds benchmark ($${cost.benchmarkCostPerMbps})`,
        currentValue: cost.costPerMbps,
        thresholdValue: cost.benchmarkCostPerMbps,
        recommendedAction: 'Review carrier contract and negotiate better rates',
        autoResolve: false,
        createdAt: new Date().toISOString(),
        plaza: link?.plaza || 'Unknown',
        carrierProvider: cost.carrierProvider
      });
    }
  });
  
  return alerts;
}

// Funciones auxiliares para extraer datos
function extractPortsData(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.ports && Array.isArray(data.ports)) return data.ports;
  return [];
}

function extractDevicesData(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.devices && Array.isArray(data.devices)) return data.devices;
  return [];
}

function extractBillsData(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.bills && Array.isArray(data.bills)) return data.bills;
  return [];
}

function calculateDataQuality(
  linkInventory: XCIENLinkInventory[], 
  biweeklyMetrics: BiweeklyMetrics[], 
  billsData: any[]
): { completeness: number; accuracy: number; freshness: number } {
  const completeness = linkInventory.length > 0 ? 
    (biweeklyMetrics.length / linkInventory.length) * 100 : 0;
  
  const accuracy = billsData.length > 0 ? 
    (billsData.filter(bill => bill.rate_95th_in || bill.rate_95th_out).length / billsData.length) * 100 : 0;
  
  const freshness = 5; // Asumimos 5 minutos desde última actualización
  
  return {
    completeness: Math.round(completeness),
    accuracy: Math.round(accuracy),
    freshness: freshness
  };
}
