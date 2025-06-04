// Procesador de datos XCIEN para funcionalidades operativas
// Convierte datos de Observium en estructuras operativas XCIEN

import { 
  XCIENLinkInventory, 
  BiweeklyMetrics, 
  RadioBaseAnalysis, 
  CityTierClassification,
  EngineeringThreshold,
  CostPerMbUsed,
  AutomatedAlert,
  XCIENConfig
} from '@/lib/types/xcien-operational';

// Configuración por defecto XCIEN
export const DEFAULT_XCIEN_CONFIG: XCIENConfig = {
  engineeringThresholds: {
    defaultWarning: 70,
    defaultCritical: 80,
    highCapacityThreshold: 5000 // 5,000 Mb para enlaces ≥4 Gb
  },
  tierClassification: {
    tier1MinRadioBases: 15,      // Monterrey, Guadalajara
    tier1MinCapacity: 50000,     // 50 Gbps mínimo
    tier1MinTraffic: 20000       // 20 Gbps tráfico mínimo
  },
  costBenchmarks: {
    targetCostPerMbps: 38,       // $38 benchmark actual
    excellentThreshold: 25,      // <$25/Mbps excelente
    goodThreshold: 40,           // <$40/Mbps bueno
    poorThreshold: 60            // >$60/Mbps pobre
  },
  biweeklyPeriods: {
    currentPeriod: generateCurrentBiweeklyPeriod(),
    periodsToKeep: 12,           // 6 meses de histórico
    autoGenerate: true
  }
};

// Funciones de parseo de datos Observium
export class ObserviumDataParser {
  
  // Extraer Plaza/POP desde hostname
  static extractPlazaFromHostname(hostname: string): string {
    const plazaPatterns = {
      'MTY': ['mty', 'monterrey', 'garcia'],
      'GDL': ['gdl', 'guadalajara'],
      'QRO': ['qro', 'queretaro', 'querétaro'],
      'CDMX': ['cdmx', 'mexico', 'df'],
      'TIJ': ['tij', 'tijuana'],
      'LEO': ['leon'],
      'CEL': ['celaya'],
      'IRA': ['irapuato'],
      'MON': ['monclova']
    };

    const hostnameLower = hostname.toLowerCase();
    
    for (const [plaza, patterns] of Object.entries(plazaPatterns)) {
      if (patterns.some(pattern => hostnameLower.includes(pattern))) {
        return plaza;
      }
    }
    
    // Fallback: extraer primera parte del hostname
    const parts = hostname.split('-');
    return parts[0]?.toUpperCase() || 'UNKNOWN';
  }

  // Extraer Radio-Base desde hostname
  static extractRadioBaseFromHostname(hostname: string): string {
    // Patrones comunes: MTY-RB01, GDL-RADIOBASE-02, etc.
    const radioBasePatterns = [
      /rb\d+/i,           // rb01, rb02
      /radiobase[-_]?\d+/i, // radiobase01, radiobase-02
      /base[-_]?\d+/i,    // base01, base-02
      /site[-_]?\d+/i     // site01, site-02
    ];

    for (const pattern of radioBasePatterns) {
      const match = hostname.match(pattern);
      if (match) {
        return match[0].toUpperCase();
      }
    }

    // Fallback: usar hostname completo si no se encuentra patrón
    return hostname;
  }

  // Extraer Carrier desde ifAlias/ifDescr
  static extractCarrierFromAlias(ifAlias: string, ifDescr: string): string {
    const carrierPatterns = {
      'Neutral Networks': ['neutral', 'network', 'nn-'],
      'Cogent': ['cogent'],
      'TI Sparkle': ['ti-sparkle', 'sparkle', 'tisparkle'],
      'F16': ['f16'],
      'Fiber Optic': ['fiber', 'optic', 'transtelco'],
      'Level3': ['level3', 'lumen'],
      'Telmex': ['telmex', 'infinitum'],
      'Megacable': ['megacable'],
      'Totalplay': ['totalplay']
    };

    const searchText = `${ifAlias} ${ifDescr}`.toLowerCase();
    
    for (const [carrier, patterns] of Object.entries(carrierPatterns)) {
      if (patterns.some(pattern => searchText.includes(pattern))) {
        return carrier;
      }
    }
    
    return 'Other Carriers';
  }

  // Calcular umbral de ingeniería
  static calculateEngineeringThreshold(capacityMbps: number): number {
    // Lógica XCIEN: 5,000 Mb para enlaces ≥4 Gb
    if (capacityMbps >= 4000) {
      return 5000; // 5 Gbps threshold para enlaces grandes
    } else if (capacityMbps >= 1000) {
      return capacityMbps * 0.8; // 80% para enlaces medianos
    } else {
      return capacityMbps * 0.7; // 70% para enlaces pequeños
    }
  }

  // Clasificar ciudad como Tier I o II
  static classifyCity(cityData: {
    radioBases: number;
    totalCapacityMbps: number;
    totalTrafficMbps: number;
    carrierDiversity: number;
  }): 'I' | 'II' {
    const config = DEFAULT_XCIEN_CONFIG.tierClassification;
    
    // Tier I: Ciudades principales con alta capacidad
    if (
      cityData.radioBases >= config.tier1MinRadioBases &&
      cityData.totalCapacityMbps >= config.tier1MinCapacity &&
      cityData.totalTrafficMbps >= config.tier1MinTraffic
    ) {
      return 'I';
    }
    
    return 'II';
  }

  // Generar períodos quincenales
  static generateBiweeklyPeriods(startDate: Date, count: number): string[] {
    const periods: string[] = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < count; i++) {
      const periodStart = new Date(currentDate);
      const periodEnd = new Date(currentDate);
      periodEnd.setDate(periodEnd.getDate() + 14); // 15 días
      
      const periodId = `${periodStart.toISOString().split('T')[0]}_${periodEnd.toISOString().split('T')[0]}`;
      periods.push(periodId);
      
      currentDate.setDate(currentDate.getDate() + 15); // Siguiente período
    }
    
    return periods;
  }
}

// Procesador principal de inventario de enlaces
export function processLinkInventory(observiumPorts: any[], observiumDevices: any[]): XCIENLinkInventory[] {
  const deviceMap = new Map(observiumDevices.map(device => [device.device_id, device]));
  
  return observiumPorts
    .filter(port => port.port_descr_type === 'transit' || port.ifAlias?.toLowerCase().includes('transit'))
    .map(port => {
      const device = deviceMap.get(port.device_id);
      const hostname = device?.hostname || port.hostname || 'unknown';
      
      return {
        linkId: port.port_id,
        plaza: ObserviumDataParser.extractPlazaFromHostname(hostname),
        radioBase: ObserviumDataParser.extractRadioBaseFromHostname(hostname),
        carrierProvider: ObserviumDataParser.extractCarrierFromAlias(port.ifAlias || '', port.ifDescr || ''),
        contractedBandwidth: Math.round((parseFloat(port.ifSpeed) || 0) / 1000000), // bps a Mbps
        deviceId: port.device_id,
        hostname: hostname,
        ifAlias: port.ifAlias || '',
        ifDescr: port.ifDescr || '',
        status: port.ifOperStatus === 'up' ? 'up' : port.ifOperStatus === 'down' ? 'down' : 'unknown',
        location: port.location
      };
    });
}

// Procesador de métricas quincenales
export function processBiweeklyMetrics(
  linkInventory: XCIENLinkInventory[], 
  observiumBills: any[], 
  period: string
): BiweeklyMetrics[] {
  const periodLabel = formatPeriodLabel(period);
  
  return linkInventory.map(link => {
    // Buscar datos de billing para este enlace
    const linkBill = observiumBills.find(bill => 
      bill.hostname === link.hostname || 
      bill.device_id === link.deviceId
    );
    
    const rateIn95th = parseFloat(linkBill?.rate_95th_in || '0');
    const rateOut95th = parseFloat(linkBill?.rate_95th_out || '0');
    const maxRate95th = Math.max(rateIn95th, rateOut95th);
    const peakTrafficMbps = maxRate95th / 1000000; // bps a Mbps
    
    const utilizationPercent = link.contractedBandwidth > 0 
      ? (peakTrafficMbps / link.contractedBandwidth) * 100 
      : 0;
    
    const engineeringThreshold = ObserviumDataParser.calculateEngineeringThreshold(link.contractedBandwidth);
    
    let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
    if (utilizationPercent >= 80) {
      alertLevel = 'critical';
    } else if (utilizationPercent >= 70) {
      alertLevel = 'warning';
    }
    
    return {
      linkId: link.linkId,
      period: period,
      periodLabel: periodLabel,
      peakTrafficMbps: Math.round(peakTrafficMbps * 100) / 100,
      utilizationPercent: Math.round(utilizationPercent * 10) / 10,
      rateIn95th: rateIn95th,
      rateOut95th: rateOut95th,
      maxRate95th: maxRate95th,
      engineeringThreshold: engineeringThreshold,
      alertLevel: alertLevel,
      timestamp: new Date().toISOString()
    };
  });
}

// Procesador de análisis por radio-base
export function processRadioBaseAnalysis(linkInventory: XCIENLinkInventory[]): RadioBaseAnalysis[] {
  const radioBaseMap = new Map<string, XCIENLinkInventory[]>();
  
  // Agrupar enlaces por radio-base
  linkInventory.forEach(link => {
    const key = `${link.plaza}-${link.radioBase}`;
    if (!radioBaseMap.has(key)) {
      radioBaseMap.set(key, []);
    }
    radioBaseMap.get(key)!.push(link);
  });
  
  return Array.from(radioBaseMap.entries()).map(([key, links]) => {
    const [plaza, radioBase] = key.split('-');
    const totalCapacity = links.reduce((sum, link) => sum + link.contractedBandwidth, 0);
    const carriers = [...new Set(links.map(link => link.carrierProvider))];
    
    // Calcular utilización total (necesitaría datos de billing)
    const totalUtilization = totalCapacity * 0.6; // Estimación 60% promedio
    const oversubscriptionRatio = totalUtilization / totalCapacity;
    
    let status: 'operational' | 'degraded' | 'critical' = 'operational';
    if (oversubscriptionRatio > 0.9) {
      status = 'critical';
    } else if (oversubscriptionRatio > 0.8) {
      status = 'degraded';
    }
    
    return {
      radioBaseId: key,
      radioBaseName: radioBase,
      plaza: plaza,
      deviceCount: new Set(links.map(link => link.deviceId)).size,
      totalLinks: links.length,
      totalCapacityMbps: totalCapacity,
      totalUtilizationMbps: Math.round(totalUtilization),
      oversubscriptionRatio: Math.round(oversubscriptionRatio * 100) / 100,
      carriers: carriers,
      status: status
    };
  });
}

// Funciones auxiliares
function generateCurrentBiweeklyPeriod(): string {
  const now = new Date();
  const day = now.getDate();
  const isFirstHalf = day <= 15;
  
  if (isFirstHalf) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 15);
    return `${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
  } else {
    const start = new Date(now.getFullYear(), now.getMonth(), 16);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes
    return `${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
  }
}

function formatPeriodLabel(period: string): string {
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
