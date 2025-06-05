// API endpoint DEMO para funcionalidades operativas XCIEN
// Usa datos realistas de XCIEN para demostrar las funcionalidades implementadas

import { NextRequest, NextResponse } from 'next/server';
import {
  XCIENOperationalDashboard,
  XCIENLinkInventory,
  BiweeklyMetrics,
  RadioBaseAnalysis,
  CityTierClassification,
  EngineeringThreshold,
  CostPerMbUsed,
  AutomatedAlert,
  HistoricalTrend
} from '@/lib/types/xcien-operational';
import {
  transformToLinkInventory,
  transformToBiweeklyMetrics,
  transformToRadioBaseAnalysis,
  transformToCityTierClassification,
  transformToEngineeringThresholds,
  transformToCostAnalysis,
  transformToAutomatedAlerts,
  generateBiweeklyPeriods,
  formatPeriodLabel as formatXCIENPeriodLabel
} from '@/lib/mocks/xcien-datasets';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'current';
  
  console.log(`🏢 Generating XCIEN operational DEMO data for period: ${period}`);
  
  try {
    // Generar datos de demostración usando datasets reales de XCIEN
    const linkInventory = transformToLinkInventory();
    const biweeklyMetrics = transformToBiweeklyMetrics(period);
    const radioBaseAnalysis = transformToRadioBaseAnalysis();
    const cityTierClassification = transformToCityTierClassification();
    const engineeringThresholds = transformToEngineeringThresholds();
    const costAnalysis = transformToCostAnalysis();
    const historicalTrends = generateDemoHistoricalTrends(linkInventory); // Keep existing for now
    const activeAlerts = transformToAutomatedAlerts();
    
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
      dataQuality: {
        completeness: 95,
        accuracy: 90,
        freshness: 2
      }
    };
    
    console.log(`✅ Successfully generated XCIEN operational DEMO dashboard`);
    console.log(`📊 Demo data: ${linkInventory.length} links, ${radioBaseAnalysis.length} radio-bases, ${activeAlerts.length} alerts`);
    
    return NextResponse.json(operationalData);
    
  } catch (error) {
    console.error('❌ Error generating XCIEN operational demo data:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Generar inventario de enlaces de demostración
function generateDemoLinkInventory(): XCIENLinkInventory[] {
  const links: XCIENLinkInventory[] = [];
  
  const plazas = ['MTY', 'GDL', 'QRO', 'CDMX', 'TIJ'];
  const carriers = ['Neutral Networks', 'Cogent', 'TI Sparkle', 'F16', 'Fiber Optic', 'Other Carriers'];
  const radioBasePatterns = ['RB01', 'RB02', 'RB03', 'CORE01', 'CORE02'];
  
  let linkId = 100000;
  
  plazas.forEach(plaza => {
    const linksPerPlaza = plaza === 'MTY' ? 25 : plaza === 'GDL' ? 15 : 8;
    
    for (let i = 0; i < linksPerPlaza; i++) {
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      const radioBase = `${plaza}-${radioBasePatterns[Math.floor(Math.random() * radioBasePatterns.length)]}`;
      const capacity = [1000, 2000, 4000, 10000][Math.floor(Math.random() * 4)]; // 1G, 2G, 4G, 10G
      
      links.push({
        linkId: `${linkId++}`,
        plaza: plaza,
        radioBase: radioBase,
        carrierProvider: carrier,
        contractedBandwidth: capacity,
        deviceId: `device_${linkId}`,
        hostname: `${plaza.toLowerCase()}-${radioBase.toLowerCase()}-sw01`,
        ifAlias: `Transit:${carrier} [${capacity}MB] {ID:XCI-ETH-${plaza}-${String(i).padStart(4, '0')}}`,
        ifDescr: `GigabitEthernet0/${i + 1}`,
        status: Math.random() > 0.1 ? 'up' : 'down', // 90% up
        location: plaza
      });
    }
  });
  
  return links;
}

// Generar métricas quincenales de demostración
function generateDemoBiweeklyMetrics(linkInventory: XCIENLinkInventory[], period: string): BiweeklyMetrics[] {
  return linkInventory.map(link => {
    // Simular utilización realista basada en carrier y capacidad
    let baseUtilization = 0;
    if (link.carrierProvider.includes('Neutral')) {
      baseUtilization = 60 + Math.random() * 30; // 60-90%
    } else if (link.carrierProvider.includes('Cogent')) {
      baseUtilization = 20 + Math.random() * 40; // 20-60%
    } else if (link.carrierProvider.includes('TI Sparkle')) {
      baseUtilization = 70 + Math.random() * 25; // 70-95%
    } else {
      baseUtilization = 40 + Math.random() * 40; // 40-80%
    }
    
    const utilizationPercent = Math.min(baseUtilization, 100);
    const peakTrafficMbps = (link.contractedBandwidth * utilizationPercent) / 100;
    const engineeringThreshold = link.contractedBandwidth >= 4000 ? 5000 : link.contractedBandwidth * 0.8;
    
    let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
    if (utilizationPercent >= 80) {
      alertLevel = 'critical';
    } else if (utilizationPercent >= 70) {
      alertLevel = 'warning';
    }
    
    return {
      linkId: link.linkId,
      period: period,
      periodLabel: formatPeriodLabel(period),
      peakTrafficMbps: Math.round(peakTrafficMbps * 100) / 100,
      utilizationPercent: Math.round(utilizationPercent * 10) / 10,
      rateIn95th: peakTrafficMbps * 1000000 * 0.6, // 60% inbound
      rateOut95th: peakTrafficMbps * 1000000 * 0.4, // 40% outbound
      maxRate95th: peakTrafficMbps * 1000000,
      engineeringThreshold: engineeringThreshold,
      alertLevel: alertLevel,
      timestamp: new Date().toISOString()
    };
  });
}

// Generar análisis de radio-bases de demostración
function generateDemoRadioBaseAnalysis(): RadioBaseAnalysis[] {
  const radioBaseData = [
    { plaza: 'MTY', name: 'MTY-RB01', links: 8, capacity: 32000 },
    { plaza: 'MTY', name: 'MTY-RB02', links: 6, capacity: 24000 },
    { plaza: 'MTY', name: 'MTY-CORE01', links: 11, capacity: 44000 },
    { plaza: 'GDL', name: 'GDL-RB01', links: 5, capacity: 20000 },
    { plaza: 'GDL', name: 'GDL-RB02', links: 4, capacity: 16000 },
    { plaza: 'GDL', name: 'GDL-CORE01', links: 6, capacity: 24000 },
    { plaza: 'QRO', name: 'QRO-RB01', links: 4, capacity: 16000 },
    { plaza: 'QRO', name: 'QRO-RB02', links: 4, capacity: 16000 },
    { plaza: 'CDMX', name: 'CDMX-RB01', links: 4, capacity: 16000 },
    { plaza: 'CDMX', name: 'CDMX-RB02', links: 4, capacity: 16000 },
    { plaza: 'TIJ', name: 'TIJ-RB01', links: 4, capacity: 16000 },
    { plaza: 'TIJ', name: 'TIJ-RB02', links: 4, capacity: 16000 }
  ];
  
  return radioBaseData.map(rb => {
    const utilization = rb.capacity * (0.4 + Math.random() * 0.4); // 40-80% utilization
    const oversubscriptionRatio = utilization / rb.capacity;
    
    let status: 'operational' | 'degraded' | 'critical' = 'operational';
    if (oversubscriptionRatio > 0.9) {
      status = 'critical';
    } else if (oversubscriptionRatio > 0.8) {
      status = 'degraded';
    }
    
    return {
      radioBaseId: `${rb.plaza}-${rb.name}`,
      radioBaseName: rb.name,
      plaza: rb.plaza,
      deviceCount: Math.ceil(rb.links / 4), // ~4 links per device
      totalLinks: rb.links,
      totalCapacityMbps: rb.capacity,
      totalUtilizationMbps: Math.round(utilization),
      oversubscriptionRatio: Math.round(oversubscriptionRatio * 100) / 100,
      carriers: ['Neutral Networks', 'Cogent', 'TI Sparkle'].slice(0, Math.ceil(Math.random() * 3)),
      status: status
    };
  });
}

// Generar clasificación de ciudades de demostración
function generateDemoCityTierClassification(): CityTierClassification[] {
  return [
    {
      cityName: 'Monterrey',
      plaza: 'MTY',
      tier: 'I',
      radioBases: 3,
      totalLinks: 25,
      totalCapacityGbps: 100,
      totalTrafficGbps: 65,
      averageUtilization: 65,
      carrierDiversity: 5,
      priority: 'expansion',
      classificationReason: '3 radio-bases, 100GB capacity, high traffic volume'
    },
    {
      cityName: 'Guadalajara',
      plaza: 'GDL',
      tier: 'I',
      radioBases: 3,
      totalLinks: 15,
      totalCapacityGbps: 60,
      totalTrafficGbps: 36,
      averageUtilization: 60,
      carrierDiversity: 4,
      priority: 'expansion',
      classificationReason: '3 radio-bases, 60GB capacity, strategic location'
    },
    {
      cityName: 'Querétaro',
      plaza: 'QRO',
      tier: 'II',
      radioBases: 2,
      totalLinks: 8,
      totalCapacityGbps: 32,
      totalTrafficGbps: 19,
      averageUtilization: 59,
      carrierDiversity: 3,
      priority: 'optimization',
      classificationReason: '2 radio-bases, moderate capacity'
    },
    {
      cityName: 'CDMX',
      plaza: 'CDMX',
      tier: 'II',
      radioBases: 2,
      totalLinks: 8,
      totalCapacityGbps: 32,
      totalTrafficGbps: 16,
      averageUtilization: 50,
      carrierDiversity: 3,
      priority: 'optimization',
      classificationReason: '2 radio-bases, focus on cost optimization'
    },
    {
      cityName: 'Tijuana',
      plaza: 'TIJ',
      tier: 'II',
      radioBases: 2,
      totalLinks: 8,
      totalCapacityGbps: 32,
      totalTrafficGbps: 14,
      averageUtilization: 44,
      carrierDiversity: 2,
      priority: 'maintenance',
      classificationReason: '2 radio-bases, border location'
    }
  ];
}

// Generar umbrales de ingeniería de demostración
function generateDemoEngineeringThresholds(
  linkInventory: XCIENLinkInventory[], 
  biweeklyMetrics: BiweeklyMetrics[]
): EngineeringThreshold[] {
  const metricsMap = new Map(biweeklyMetrics.map(m => [m.linkId, m]));
  
  return linkInventory.map(link => {
    const metrics = metricsMap.get(link.linkId);
    const thresholdMbps = link.contractedBandwidth >= 4000 ? 5000 : link.contractedBandwidth * 0.8;
    const currentUtilization = metrics?.utilizationPercent || 0;
    
    let alertStatus: 'normal' | 'warning' | 'critical' | 'capacity_risk' = 'normal';
    let recommendedAction = 'Monitor normal operation';
    
    if (currentUtilization >= 90) {
      alertStatus = 'capacity_risk';
      recommendedAction = 'URGENT - Risk of service degradation';
    } else if (currentUtilization >= 80) {
      alertStatus = 'critical';
      recommendedAction = 'IMMEDIATE UPGRADE REQUIRED - Link saturated';
    } else if (currentUtilization >= 70) {
      alertStatus = 'warning';
      recommendedAction = 'Plan capacity upgrade within 30 days';
    }
    
    return {
      linkId: link.linkId,
      capacityMbps: link.contractedBandwidth,
      thresholdMbps: thresholdMbps,
      warningPercent: 70,
      criticalPercent: 80,
      currentUtilization: currentUtilization,
      alertStatus: alertStatus,
      recommendedAction: recommendedAction,
      lastUpdated: new Date().toISOString()
    };
  });
}

// Generar análisis de costos de demostración
function generateDemoCostAnalysis(linkInventory: XCIENLinkInventory[]): CostPerMbUsed[] {
  return linkInventory.map(link => {
    // Simular costos realistas por carrier
    let baseCostPerMbps = 38; // Benchmark
    if (link.carrierProvider.includes('Neutral')) {
      baseCostPerMbps = 25 + Math.random() * 15; // $25-40
    } else if (link.carrierProvider.includes('Cogent')) {
      baseCostPerMbps = 45 + Math.random() * 20; // $45-65
    } else if (link.carrierProvider.includes('TI Sparkle')) {
      baseCostPerMbps = 30 + Math.random() * 15; // $30-45
    }
    
    const monthlyRecurringCharge = link.contractedBandwidth * baseCostPerMbps;
    const peakUsageMbps = link.contractedBandwidth * (0.4 + Math.random() * 0.4); // 40-80% usage
    const costPerMbps = peakUsageMbps > 0 ? monthlyRecurringCharge / peakUsageMbps : 0;
    
    let efficiency: 'excellent' | 'good' | 'poor' | 'critical' = 'good';
    if (costPerMbps <= 25) {
      efficiency = 'excellent';
    } else if (costPerMbps <= 40) {
      efficiency = 'good';
    } else if (costPerMbps <= 60) {
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
      benchmarkCostPerMbps: 38,
      costVariance: Math.round((costPerMbps - 38) * 100) / 100,
      optimizationPotential: efficiency === 'critical' ? monthlyRecurringCharge * 0.5 : 0
    };
  });
}

// Generar tendencias históricas de demostración
function generateDemoHistoricalTrends(linkInventory: XCIENLinkInventory[]): HistoricalTrend[] {
  return linkInventory.slice(0, 10).map(link => { // Solo primeros 10 para demo
    const periods: BiweeklyMetrics[] = [];
    const baseUtilization = 40 + Math.random() * 30;
    
    // Generar 6 períodos históricos
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 15));
      const period = `${date.toISOString().split('T')[0]}_${new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`;
      
      const utilization = baseUtilization + (Math.random() - 0.5) * 20 + (i * 2); // Tendencia creciente
      
      periods.push({
        linkId: link.linkId,
        period: period,
        periodLabel: formatPeriodLabel(period),
        peakTrafficMbps: (link.contractedBandwidth * utilization) / 100,
        utilizationPercent: Math.max(0, Math.min(100, utilization)),
        rateIn95th: 0,
        rateOut95th: 0,
        maxRate95th: 0,
        engineeringThreshold: 5000,
        alertLevel: 'normal',
        timestamp: date.toISOString()
      });
    }
    
    const growthRate = ((periods[periods.length - 1].utilizationPercent - periods[0].utilizationPercent) / periods[0].utilizationPercent) * 100;
    
    return {
      linkId: link.linkId,
      periods: periods,
      trendDirection: growthRate > 5 ? 'increasing' : growthRate < -5 ? 'decreasing' : 'stable',
      growthRate: Math.round(growthRate * 100) / 100,
      seasonality: Math.random() > 0.7, // 30% chance of seasonality
      forecastNext: Math.max(0, Math.min(100, periods[periods.length - 1].utilizationPercent + (growthRate / 6))),
      capacityExhaustionDate: growthRate > 10 ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
    };
  });
}

// Generar alertas de demostración
function generateDemoAlerts(
  engineeringThresholds: EngineeringThreshold[], 
  costAnalysis: CostPerMbUsed[],
  linkInventory: XCIENLinkInventory[]
): AutomatedAlert[] {
  const alerts: AutomatedAlert[] = [];
  const linkMap = new Map(linkInventory.map(link => [link.linkId, link]));
  
  // Alertas de utilización crítica
  engineeringThresholds
    .filter(t => t.alertStatus === 'critical' || t.alertStatus === 'capacity_risk')
    .slice(0, 5) // Máximo 5 alertas críticas
    .forEach(threshold => {
      const link = linkMap.get(threshold.linkId);
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
    });
  
  // Alertas de costo
  costAnalysis
    .filter(c => c.efficiency === 'critical')
    .slice(0, 3) // Máximo 3 alertas de costo
    .forEach(cost => {
      const link = linkMap.get(cost.linkId);
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
    });
  
  return alerts;
}

// Función auxiliar para formatear período
function formatPeriodLabel(period: string): string {
  if (period === 'current') {
    const now = new Date();
    const day = now.getDate();
    const isFirstHalf = day <= 15;
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = monthNames[now.getMonth()];
    
    return isFirstHalf ? `${month} 1-15` : `${month} 16-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;
  }
  
  const [startDate, endDate] = period.split('_');
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const startMonth = monthNames[start.getMonth()];
  const endMonth = monthNames[end.getMonth()];
  
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`;
  } else {
    return `${startMonth} ${start.getDate()}-${endMonth} ${end.getDate()}`;
  }
}
