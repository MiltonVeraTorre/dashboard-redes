// Realistic XCIEN ISP mock datasets for fallback data
// Dataset 1: Network Link Utilization Data
// Dataset 2: City Revenue and Infrastructure Data

// Dataset 1 - Network Link Utilization Data
export const networkLinkUtilizationData = [
  {
    id: 1,
    plaza: "Monterrey",
    rb: "Purísima",
    carrier: "Cogent",
    ancho_band: "4GB",
    may_1_15_mb: 1800,
    may_1_15_pct: 36,
    may_16_31_mb: 1800,
    may_16_31_pct: 36
  },
  {
    id: 2,
    plaza: "Monterrey",
    rb: "Santa Rosa",
    carrier: "TI Sparkle",
    ancho_band: "10GB",
    may_1_15_mb: 4200,
    may_1_15_pct: 42,
    may_16_31_mb: 4500,
    may_16_31_pct: 45
  },
  {
    id: 3,
    plaza: "Guadalajara",
    rb: "Cardenal",
    carrier: "Cogent",
    ancho_band: "6GB",
    may_1_15_mb: 2800,
    may_1_15_pct: 47,
    may_16_31_mb: 3100,
    may_16_31_pct: 52
  },
  {
    id: 4,
    plaza: "Saltillo",
    rb: "Centro",
    carrier: "Alestra",
    ancho_band: "2GB",
    may_1_15_mb: 800,
    may_1_15_pct: 40,
    may_16_31_mb: 900,
    may_16_31_pct: 45
  },
  {
    id: 5,
    plaza: "Piedras Negras",
    rb: "Industrial",
    carrier: "Cogent",
    ancho_band: "4GB",
    may_1_15_mb: 2200,
    may_1_15_pct: 55,
    may_16_31_mb: 2400,
    may_16_31_pct: 60
  },
  {
    id: 6,
    plaza: "Monclova",
    rb: "Norte",
    carrier: "TI Sparkle",
    ancho_band: "3GB",
    may_1_15_mb: 1200,
    may_1_15_pct: 40,
    may_16_31_mb: 1350,
    may_16_31_pct: 45
  },
  {
    id: 7,
    plaza: "Monterrey",
    rb: "Capitolio",
    carrier: "Neutral Networks",
    ancho_band: "8GB",
    may_1_15_mb: 5600,
    may_1_15_pct: 70,
    may_16_31_mb: 6000,
    may_16_31_pct: 75
  },
  {
    id: 8,
    plaza: "Guadalajara",
    rb: "Sendero",
    carrier: "Alestra",
    ancho_band: "5GB",
    may_1_15_mb: 2000,
    may_1_15_pct: 40,
    may_16_31_mb: 2250,
    may_16_31_pct: 45
  },
  {
    id: 9,
    plaza: "Queretaro",
    rb: "San Pablo",
    carrier: "Cogent",
    ancho_band: "4GB",
    may_1_15_mb: 1600,
    may_1_15_pct: 40,
    may_16_31_mb: 1800,
    may_16_31_pct: 45
  },
  {
    id: 10,
    plaza: "Monterrey",
    rb: "Guadalupe",
    carrier: "F16",
    ancho_band: "6GB",
    may_1_15_mb: 3000,
    may_1_15_pct: 50,
    may_16_31_mb: 3300,
    may_16_31_pct: 55
  },
  {
    id: 11,
    plaza: "Saltillo",
    rb: "Ramos Arizpe",
    carrier: "TI Sparkle",
    ancho_band: "3GB",
    may_1_15_mb: 1050,
    may_1_15_pct: 35,
    may_16_31_mb: 1200,
    may_16_31_pct: 40
  },
  {
    id: 12,
    plaza: "Piedras Negras",
    rb: "Centro",
    carrier: "Alestra",
    ancho_band: "2GB",
    may_1_15_mb: 1000,
    may_1_15_pct: 50,
    may_16_31_mb: 1100,
    may_16_31_pct: 55
  }
];

// Dataset 2 - City Revenue and Infrastructure Data
export const cityRevenueInfrastructureData = [
  { ciudad: "Piedras Negras", ctd_rbs: 5, ctd_servicios: 140, ingreso_odoo: 410909 },
  { ciudad: "Monclova", ctd_rbs: 1, ctd_servicios: 90, ingreso_odoo: 242852 },
  { ciudad: "Saltillo", ctd_rbs: 8, ctd_servicios: 320, ingreso_odoo: 890456 },
  { ciudad: "Monterrey", ctd_rbs: 45, ctd_servicios: 1850, ingreso_odoo: 5240789 },
  { ciudad: "Guadalajara", ctd_rbs: 38, ctd_servicios: 1420, ingreso_odoo: 4180234 },
  { ciudad: "Queretaro", ctd_rbs: 12, ctd_servicios: 480, ingreso_odoo: 1350678 },
  { ciudad: "San Luis Potosi", ctd_rbs: 6, ctd_servicios: 210, ingreso_odoo: 620345 },
  { ciudad: "Torreon", ctd_rbs: 4, ctd_servicios: 160, ingreso_odoo: 445123 },
  { ciudad: "Reynosa", ctd_rbs: 7, ctd_servicios: 280, ingreso_odoo: 780234 },
  { ciudad: "Nuevo Laredo", ctd_rbs: 3, ctd_servicios: 120, ingreso_odoo: 340567 }
];

// Helper function to convert bandwidth string to Mbps
export function parseBandwidthToMbps(bandwidth: string): number {
  const value = parseFloat(bandwidth);
  if (bandwidth.includes('GB')) {
    return value * 1000; // Convert GB to MB
  }
  return value; // Assume MB if no unit specified
}

// Helper function to generate biweekly periods
export function generateBiweeklyPeriods(count: number = 6): string[] {
  const periods: string[] = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - (i * 15));
    
    const day = periodStart.getDate();
    const isFirstHalf = day <= 15;
    
    let start: Date, end: Date;
    
    if (isFirstHalf) {
      start = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
      end = new Date(periodStart.getFullYear(), periodStart.getMonth(), 15);
    } else {
      start = new Date(periodStart.getFullYear(), periodStart.getMonth(), 16);
      end = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
    }
    
    const periodId = `${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
    periods.push(periodId);
  }
  
  return periods;
}

// Helper function to format period for display
export function formatPeriodLabel(period: string): string {
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

// Carrier mapping for consistency
export const carrierMapping: { [key: string]: string } = {
  "Cogent": "Cogent",
  "TI Sparkle": "TI Sparkle", 
  "Alestra": "Alestra",
  "Neutral Networks": "Neutral Networks",
  "F16": "F16",
  "Fiber Optic": "Fiber Optic"
};

// Plaza mapping for consistency
export const plazaMapping: { [key: string]: string } = {
  "Monterrey": "Monterrey",
  "Guadalajara": "Guadalajara",
  "Saltillo": "Saltillo",
  "Piedras Negras": "Piedras Negras",
  "Monclova": "Monclova",
  "Queretaro": "Queretaro",
  "San Luis Potosi": "San Luis Potosi",
  "Torreon": "Torreon",
  "Reynosa": "Reynosa",
  "Nuevo Laredo": "Nuevo Laredo"
};

// Transform network utilization data to XCIENLinkInventory
export function transformToLinkInventory(): any[] {
  return networkLinkUtilizationData.map((link, index) => {
    const capacityMbps = parseBandwidthToMbps(link.ancho_band);
    const linkId = `${link.plaza.substring(0, 3).toUpperCase()}-${String(link.id).padStart(3, '0')}`;

    return {
      linkId,
      plaza: link.plaza,
      radioBase: link.rb,
      carrierProvider: carrierMapping[link.carrier] || link.carrier,
      contractedBandwidth: capacityMbps,
      deviceId: `${link.plaza.toLowerCase().replace(' ', '-')}-${link.rb.toLowerCase().replace(' ', '-')}-01`,
      hostname: `${link.plaza.toLowerCase().replace(' ', '-')}-${link.rb.toLowerCase().replace(' ', '-')}-01.xcien.net`,
      ifAlias: `${link.carrier} - ${link.rb} - ${link.ancho_band}`,
      ifDescr: `GigabitEthernet0/${index + 1}`,
      status: 'up' as const,
      location: link.plaza
    };
  });
}

// Transform network utilization data to BiweeklyMetrics
export function transformToBiweeklyMetrics(period: string): any[] {
  const periods = generateBiweeklyPeriods(2); // Current and previous period
  const currentPeriod = periods[periods.length - 1];
  const periodLabel = formatPeriodLabel(currentPeriod);

  return networkLinkUtilizationData.map(link => {
    const capacityMbps = parseBandwidthToMbps(link.ancho_band);
    const linkId = `${link.plaza.substring(0, 3).toUpperCase()}-${String(link.id).padStart(3, '0')}`;

    // Use the actual utilization data from the dataset
    const utilizationPercent = link.may_16_31_pct; // Use latest period
    const peakTrafficMbps = link.may_16_31_mb;

    return {
      linkId,
      period: currentPeriod,
      periodLabel,
      peakTrafficMbps,
      utilizationPercent,
      rateIn95th: peakTrafficMbps * 1000000 * 0.6, // Convert to bps, assume 60% inbound
      rateOut95th: peakTrafficMbps * 1000000 * 0.4, // Convert to bps, assume 40% outbound
      maxRate95th: peakTrafficMbps * 1000000,
      engineeringThreshold: capacityMbps >= 4000 ? 5000 : 3000,
      alertLevel: utilizationPercent >= 80 ? 'critical' : utilizationPercent >= 70 ? 'warning' : 'normal',
      timestamp: new Date().toISOString()
    };
  });
}

// Transform city revenue data to RadioBaseAnalysis
export function transformToRadioBaseAnalysis(): any[] {
  const radioBaseNames = [
    'Purísima', 'Santa Rosa', 'Cardenal', 'Centro', 'Industrial', 'Norte',
    'Capitolio', 'Sendero', 'San Pablo', 'Guadalupe', 'Ramos Arizpe',
    'Lomita', 'Garcia', 'Hualahuises', 'Montemorelos', 'Olivos',
    'Rojas', 'El Carmen', 'Vasconcelos', 'Repetec', 'Pueblo Serena',
    'Micropolis', 'Pueblo Nuevo', 'Nimiw'
  ];

  const carriers = ['Cogent', 'TI Sparkle', 'Alestra', 'Neutral Networks', 'F16'];
  const statuses = ['operational', 'degraded', 'maintenance'];

  const radioBases: any[] = [];
  let radioBaseIndex = 0;

  // Generate individual radio bases for each city
  cityRevenueInfrastructureData.forEach(city => {
    const rbCount = Math.min(city.ctd_rbs, 5); // Limit to 5 RBs per city for demo

    for (let i = 0; i < rbCount; i++) {
      const rbName = radioBaseNames[radioBaseIndex % radioBaseNames.length];
      const totalLinks = Math.floor(Math.random() * 8) + 2; // 2-10 links per RB
      const totalCapacityMbps = totalLinks * (Math.floor(Math.random() * 4) + 2) * 1000; // 2-6 GB per link
      const oversubscriptionRatio = 1.2 + (Math.random() * 0.8); // 1.2-2.0
      const rbCarriers = carriers.slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 carriers per RB
      const status = statuses[Math.floor(Math.random() * 10) > 8 ? 1 : 0]; // 80% operational

      radioBases.push({
        radioBaseId: `RB-${city.ciudad.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
        radioBaseName: `${rbName} - ${city.ciudad}`,
        plaza: city.ciudad,
        status,
        totalLinks,
        totalCapacityMbps,
        oversubscriptionRatio: Math.round(oversubscriptionRatio * 100) / 100,
        carriers: rbCarriers,
        averageClientLoad: Math.min(95, (city.ctd_servicios / city.ctd_rbs) * 2),
        peakHourUtilization: Math.min(95, (city.ctd_servicios / city.ctd_rbs) * 2.6),
        coverageAreaKm2: 18 + Math.floor(Math.random() * 12), // 18-30 km2
        clientSatisfactionScore: Math.round((4.0 + Math.random() * 0.8) * 10) / 10
      });

      radioBaseIndex++;
    }
  });

  return radioBases;
}

// Transform city revenue data to CityTierClassification
export function transformToCityTierClassification(): any[] {
  return cityRevenueInfrastructureData.map(city => {
    // Calculate total capacity based on links in that city
    const cityLinks = networkLinkUtilizationData.filter(link => link.plaza === city.ciudad);
    const totalCapacityMbps = cityLinks.reduce((sum, link) => sum + parseBandwidthToMbps(link.ancho_band), 0);
    const totalTrafficMbps = cityLinks.reduce((sum, link) => sum + link.may_16_31_mb, 0);
    const carrierDiversity = new Set(cityLinks.map(link => link.carrier)).size;

    // Classify tier based on radio bases and revenue
    const tier = (city.ctd_rbs >= 10 && city.ingreso_odoo >= 1000000) ? 'I' : 'II';
    const averageUtilization = totalCapacityMbps > 0 ? Math.round((totalTrafficMbps / totalCapacityMbps) * 100) : 0;

    return {
      cityName: city.ciudad,
      plaza: city.ciudad,
      tier: tier as 'I' | 'II',
      radioBases: city.ctd_rbs,
      totalLinks: cityLinks.length,
      totalCapacityGbps: Math.round(totalCapacityMbps / 1000 * 100) / 100,
      totalTrafficGbps: Math.round(totalTrafficMbps / 1000 * 100) / 100,
      averageUtilization,
      carrierDiversity,
      priority: tier === 'I' ? 'expansion' as const : 'optimization' as const,
      classificationReason: tier === 'I'
        ? `${city.ctd_rbs} radio-bases, ${Math.round(totalCapacityMbps/1000)}GB capacity`
        : `${city.ctd_rbs} radio-bases, focus on optimization`
    };
  });
}

// Transform to EngineeringThresholds
export function transformToEngineeringThresholds(): any[] {
  const linkInventory = transformToLinkInventory();
  const biweeklyMetrics = transformToBiweeklyMetrics('current');
  const metricsMap = new Map(biweeklyMetrics.map(m => [m.linkId, m]));

  return linkInventory.map(link => {
    const metrics = metricsMap.get(link.linkId);
    const currentUtilization = metrics?.utilizationPercent || 0;
    const thresholdMbps = link.contractedBandwidth >= 4000 ? 5000 : 3000;

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
      thresholdMbps,
      warningPercent: 70,
      criticalPercent: 80,
      currentUtilization,
      alertStatus,
      recommendedAction,
      lastUpdated: new Date().toISOString()
    };
  });
}

// Transform to CostPerMbUsed analysis
export function transformToCostAnalysis(): any[] {
  const linkInventory = transformToLinkInventory();
  const biweeklyMetrics = transformToBiweeklyMetrics('current');
  const metricsMap = new Map(biweeklyMetrics.map(m => [m.linkId, m]));

  return linkInventory.map(link => {
    const metrics = metricsMap.get(link.linkId);
    const peakUsageMbps = metrics?.peakTrafficMbps || 0;

    // Calculate realistic MRC based on carrier and capacity
    let baseCostPerMbps = 35; // Default
    if (link.carrierProvider === 'Cogent') baseCostPerMbps = 32;
    else if (link.carrierProvider === 'TI Sparkle') baseCostPerMbps = 38;
    else if (link.carrierProvider === 'Alestra') baseCostPerMbps = 42;
    else if (link.carrierProvider === 'Neutral Networks') baseCostPerMbps = 28;
    else if (link.carrierProvider === 'F16') baseCostPerMbps = 36;

    const monthlyRecurringCharge = link.contractedBandwidth * baseCostPerMbps;
    const costPerMbps = peakUsageMbps > 0 ? monthlyRecurringCharge / peakUsageMbps : baseCostPerMbps;
    const benchmarkCost = 35;
    const costVariance = costPerMbps - benchmarkCost;

    let efficiency: 'excellent' | 'good' | 'poor' | 'critical' = 'good';
    if (costPerMbps <= 30) efficiency = 'excellent';
    else if (costPerMbps <= 40) efficiency = 'good';
    else if (costPerMbps <= 50) efficiency = 'poor';
    else efficiency = 'critical';

    return {
      linkId: link.linkId,
      carrierProvider: link.carrierProvider,
      monthlyRecurringCharge: Math.round(monthlyRecurringCharge),
      peakUsageMbps: Math.round(peakUsageMbps * 100) / 100,
      costPerMbps: Math.round(costPerMbps * 100) / 100,
      efficiency,
      benchmarkCostPerMbps: benchmarkCost,
      costVariance: Math.round(costVariance * 100) / 100,
      optimizationPotential: efficiency === 'critical' ? monthlyRecurringCharge * 0.3 : 0
    };
  });
}

// Transform to AutomatedAlerts
export function transformToAutomatedAlerts(): any[] {
  const engineeringThresholds = transformToEngineeringThresholds();
  const costAnalysis = transformToCostAnalysis();
  const linkInventory = transformToLinkInventory();
  const linkMap = new Map(linkInventory.map(link => [link.linkId, link]));

  const alerts: any[] = [];

  // Utilization alerts
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

  // Cost alerts
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

// Transform city revenue data to financial plaza breakdown
export function transformToFinancialPlazaBreakdown(): any[] {
  return cityRevenueInfrastructureData.map(city => {
    // Calculate realistic financial metrics based on revenue and infrastructure
    const avgRevenuePerService = city.ingreso_odoo / city.ctd_servicios;
    const avgRevenuePerRB = city.ingreso_odoo / city.ctd_rbs;
    const utilizationRate = Math.min(95, 40 + ((city.ctd_servicios || 0) / (city.ctd_rbs || 1)) * 2);

    // Calculate cost efficiency based on revenue per radio base
    let efficiency: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    if (avgRevenuePerRB >= 300000) efficiency = 'excellent';
    else if (avgRevenuePerRB >= 200000) efficiency = 'good';
    else if (avgRevenuePerRB >= 100000) efficiency = 'fair';
    else efficiency = 'poor';

    return {
      plaza: city.ciudad,
      monthlyCost: Math.round(city.ingreso_odoo * 0.6), // Assume 60% of revenue is cost
      carriers: Math.min(3, Math.ceil(city.ctd_rbs / 5)), // Estimate carriers based on radio bases
      totalMbps: Math.ceil(city.ctd_rbs * 2.5), // Estimate total Mbps
      utilizedMbps: Math.round(city.ctd_rbs * 2.5 * (utilizationRate / 100) * 100) / 100,
      efficiency: Math.round((utilizationRate || 0) * 10) / 10, // Match expected interface
      optimizationOpportunities: efficiency === 'poor' ? 2 : efficiency === 'fair' ? 1 : 0
    };
  });
}

// Transform to carrier analysis for financial dashboard
export function transformToFinancialCarrierAnalysis(): any[] {
  const carrierMap = new Map<string, {
    links: number;
    totalCapacity: number;
    totalCost: number;
    totalRevenue: number;
    plazas: Set<string>;
  }>();

  // Group network data by carrier
  networkLinkUtilizationData.forEach(link => {
    const carrier = link.carrier;
    const capacity = parseBandwidthToMbps(link.ancho_band);
    const estimatedCost = capacity * 35; // $35 per Mbps baseline
    const estimatedRevenue = estimatedCost * 1.4; // 40% margin

    if (!carrierMap.has(carrier)) {
      carrierMap.set(carrier, {
        links: 0,
        totalCapacity: 0,
        totalCost: 0,
        totalRevenue: 0,
        plazas: new Set()
      });
    }

    const carrierData = carrierMap.get(carrier)!;
    carrierData.links += 1;
    carrierData.totalCapacity += capacity;
    carrierData.totalCost += estimatedCost;
    carrierData.totalRevenue += estimatedRevenue;
    carrierData.plazas.add(link.plaza);
  });

  return Array.from(carrierMap.entries()).map(([carrier, data]) => {
    const avgCostPerMbps = data.totalCost / data.totalCapacity;
    const utilizationRate = Math.round((45 + Math.random() * 30) * 10) / 10; // 45-75% range

    let efficiency: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
    if (avgCostPerMbps <= 30) efficiency = 'excellent';
    else if (avgCostPerMbps <= 40) efficiency = 'good';
    else if (avgCostPerMbps <= 50) efficiency = 'fair';
    else efficiency = 'poor';

    return {
      carrier,
      monthlyCost: Math.round(data.totalCost),
      contractedMbps: Math.round(data.totalCapacity / 1000), // Convert to Gbps
      utilizedMbps: Math.round((data.totalCapacity * utilizationRate / 100) / 1000 * 100) / 100,
      utilizationPercentage: Math.round((utilizationRate || 0) * 10) / 10, // Match expected interface
      costPerMbps: Math.round(avgCostPerMbps * 100) / 100,
      status: efficiency === 'excellent' ? 'efficient' :
              efficiency === 'good' ? 'efficient' :
              efficiency === 'fair' ? 'attention' : 'critical',
      potentialSaving: efficiency === 'poor' ? Math.round(data.totalCost * 0.2) : 0
    };
  });
}

// Transform to optimization opportunities
export function transformToOptimizationOpportunities(): any[] {
  const opportunities: any[] = [];
  const plazaBreakdown = transformToFinancialPlazaBreakdown();
  const carrierAnalysis = transformToFinancialCarrierAnalysis();

  // Plaza-based opportunities
  plazaBreakdown.forEach(plaza => {
    if (plaza.efficiency === 'poor' || plaza.utilizationRate < 50) {
      opportunities.push({
        id: `plaza-${plaza.plaza.toLowerCase().replace(' ', '-')}`,
        type: 'renegotiation' as const,
        carrier: 'Multiple',
        plaza: plaza.plaza,
        description: `Optimize ${plaza.plaza} operations - low utilization (${plaza.efficiency}%)`,
        currentCost: plaza.monthlyCost,
        potentialSaving: Math.round(plaza.monthlyCost * 0.15), // Match expected interface
        priority: plaza.efficiency < 60 ? 'high' as const : 'medium' as const,
        utilizationRate: plaza.efficiency // Match expected interface
      });
    }
  });

  // Carrier-based opportunities
  carrierAnalysis.forEach(carrier => {
    if (carrier.status === 'critical' || carrier.costPerMbps > 45) {
      opportunities.push({
        id: `carrier-${carrier.carrier.toLowerCase().replace(' ', '-')}`,
        type: 'renegotiation' as const,
        carrier: carrier.carrier,
        plaza: 'Multiple',
        description: `Renegotiate ${carrier.carrier} contracts - high cost per Mbps ($${carrier.costPerMbps})`,
        currentCost: carrier.monthlyCost,
        potentialSaving: Math.round(carrier.monthlyCost * 0.20), // Match expected interface
        priority: 'high' as const,
        utilizationRate: carrier.utilizationPercentage // Match expected interface
      });
    }
  });

  return opportunities.sort((a, b) => b.potentialSaving - a.potentialSaving);
}

// Wrapper functions for financial demo API compatibility
export function generateXCIENLinkInventory() {
  return transformToLinkInventory();
}

export function generateXCIENBiweeklyMetrics(linkInventory: any[], period: string) {
  return transformToBiweeklyMetrics(period);
}

export function generateXCIENCostAnalysis(linkInventory: any[], biweeklyMetrics: any[]) {
  return transformToCostAnalysis();
}

export function generateXCIENPlazaBreakdown(linkInventory: any[], biweeklyMetrics: any[], costAnalysis: any[], multiplier: any) {
  const plazaData = transformToFinancialPlazaBreakdown();

  // Apply period multiplier to costs
  return plazaData.map(plaza => ({
    ...plaza,
    monthlyCost: Math.round(plaza.monthlyCost * multiplier.cost)
  }));
}

export function generateXCIENCarrierAnalysis(linkInventory: any[], biweeklyMetrics: any[], costAnalysis: any[], multiplier: any) {
  const carrierData = transformToFinancialCarrierAnalysis();

  // Apply period multiplier to costs
  return carrierData.map(carrier => ({
    ...carrier,
    monthlyCost: Math.round(carrier.monthlyCost * multiplier.cost),
    potentialSaving: Math.round((carrier.potentialSaving || 0) * multiplier.cost)
  }));
}

export function generateXCIENOptimizationOpportunities(carrierAnalysis: any[], plazaBreakdown: any[], multiplier: any) {
  const opportunities = transformToOptimizationOpportunities();

  // Apply period multiplier to costs and savings
  return opportunities.map(opp => ({
    ...opp,
    currentCost: Math.round(opp.currentCost * multiplier.cost),
    potentialSaving: Math.round(opp.potentialSaving * multiplier.cost)
  }));
}

// Main function to generate complete XCIEN financial data
export function generateXCIENFinancialData(period: string = '1m') {
  console.log(`🏢 Generating complete XCIEN financial data for period: ${period}`);

  // Apply period-based multipliers for cost calculations
  const periodMultipliers = {
    '1d': { cost: 0.033, label: 'diario' },
    '3d': { cost: 0.1, label: '3 días' },
    '1w': { cost: 0.25, label: 'semanal' },
    '1m': { cost: 1, label: 'mensual' },
    '3m': { cost: 3, label: 'trimestral' },
    '6m': { cost: 6, label: 'semestral' },
    '1y': { cost: 12, label: 'anual' }
  };

  const multiplier = periodMultipliers[period as keyof typeof periodMultipliers] || periodMultipliers['1m'];

  // Generate XCIEN-specific data using the realistic datasets
  const linkInventory = generateXCIENLinkInventory();
  const biweeklyMetrics = generateXCIENBiweeklyMetrics(linkInventory, period);
  const costAnalysis = generateXCIENCostAnalysis(linkInventory, biweeklyMetrics);

  // Generate XCIEN carrier analysis using realistic data
  const carrierAnalysis = generateXCIENCarrierAnalysis(linkInventory, biweeklyMetrics, costAnalysis, multiplier);

  // Generate XCIEN plaza breakdown using realistic data
  const plazaBreakdown = generateXCIENPlazaBreakdown(linkInventory, biweeklyMetrics, costAnalysis, multiplier);

  // Generate XCIEN optimization opportunities using realistic data
  const optimizationOpportunities = generateXCIENOptimizationOpportunities(carrierAnalysis, plazaBreakdown, multiplier);

  // Calculate summary metrics using XCIEN data
  const totalMonthlyCost = carrierAnalysis.reduce((sum, carrier) => sum + carrier.monthlyCost, 0);
  const totalCapacity = carrierAnalysis.reduce((sum, carrier) => sum + carrier.contractedMbps, 0);
  const totalUtilized = carrierAnalysis.reduce((sum, carrier) => sum + carrier.utilizedMbps, 0);
  const weightedUtilization = totalCapacity > 0 ? (totalUtilized / totalCapacity) * 100 : 0;
  const averageCostPerMbps = totalCapacity > 0 ? totalMonthlyCost / totalCapacity : 0;

  const summary = {
    totalMonthlyCost,
    averageUtilization: Math.round(weightedUtilization * 10) / 10,
    potentialSavings: optimizationOpportunities
      .filter(opp => opp.potentialSaving > 0)
      .reduce((sum, opp) => sum + opp.potentialSaving, 0),
    optimizableContracts: optimizationOpportunities.length,
    costPerMbps: Math.round(averageCostPerMbps * 100) / 100,
    currency: 'USD',
    period: period,
    periodLabel: multiplier.label
  };

  console.log(`✅ Generated XCIEN financial summary: $${totalMonthlyCost.toLocaleString()}, ${carrierAnalysis.length} carriers, ${plazaBreakdown.length} plazas`);

  return {
    summary,
    carrierAnalysis,
    plazaBreakdown,
    optimizationOpportunities
  };
}
