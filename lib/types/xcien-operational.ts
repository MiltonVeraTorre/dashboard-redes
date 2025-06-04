// Tipos de datos para funcionalidades operativas XCIEN
// Basado en datos disponibles de Observium API

export interface XCIENLinkInventory {
  // Inventario Fijo (Columnas A-D del Excel)
  linkId: string;           // port_id de Observium
  plaza: string;            // Extraído de hostname/location
  radioBase: string;        // Extraído de hostname/device
  carrierProvider: string;  // Extraído de ifAlias/ifDescr
  contractedBandwidth: number; // ifSpeed convertido a Mbps
  deviceId: string;         // device_id de Observium
  hostname: string;         // hostname del dispositivo
  ifAlias: string;          // Descripción del enlace
  ifDescr: string;          // Descripción de la interfaz
  status: 'up' | 'down' | 'unknown'; // ifOperStatus
  location?: string;        // location si está disponible
}

export interface BiweeklyMetrics {
  // Métricas Quincenales (Columnas por período del Excel)
  linkId: string;
  period: string;           // "2024-02-16_2024-02-28" formato
  periodLabel: string;      // "Feb 16-28" formato display
  peakTrafficMbps: number;  // MB (Pico 95º percentil) en Mbps
  utilizationPercent: number; // % utilización
  rateIn95th: number;       // rate_95th_in en bps
  rateOut95th: number;      // rate_95th_out en bps
  maxRate95th: number;      // Max(in, out) en bps
  engineeringThreshold: number; // Umbral específico por enlace
  alertLevel: 'normal' | 'warning' | 'critical'; // Estado de alerta
  timestamp: string;        // Fecha de captura
}

export interface RadioBaseAnalysis {
  // Análisis por Radio-Base
  radioBaseId: string;      // Identificador único
  radioBaseName: string;    // Nombre extraído de hostname
  plaza: string;            // Plaza/ciudad
  deviceCount: number;      // Número de dispositivos
  totalLinks: number;       // Total de enlaces
  totalCapacityMbps: number; // Capacidad total contratada
  totalUtilizationMbps: number; // Utilización total
  oversubscriptionRatio: number; // Ratio sobresuscripción
  carriers: string[];       // Lista de carriers usados
  status: 'operational' | 'degraded' | 'critical';
  coordinates?: {lat: number, lng: number}; // Si disponible
}

export interface CityTierClassification {
  // Clasificación Tier I vs Tier II
  cityName: string;
  plaza: string;            // Plaza principal
  tier: 'I' | 'II';         // Clasificación automática
  radioBases: number;       // # Radio-bases
  totalLinks: number;       // Total enlaces
  totalCapacityGbps: number; // Capacidad total
  totalTrafficGbps: number; // Tráfico total
  averageUtilization: number; // Utilización promedio
  carrierDiversity: number; // Número de carriers únicos
  priority: 'expansion' | 'optimization' | 'maintenance';
  classificationReason: string; // Razón de la clasificación
}

export interface EngineeringThreshold {
  // Umbrales de Ingeniería
  linkId: string;
  capacityMbps: number;
  thresholdMbps: number;    // 5,000 Mb para enlaces ≥4 Gb
  warningPercent: number;   // 70% por defecto
  criticalPercent: number;  // 80% por defecto
  currentUtilization: number;
  alertStatus: 'normal' | 'warning' | 'critical' | 'capacity_risk';
  recommendedAction: string;
  lastUpdated: string;
}

export interface CostPerMbUsed {
  // Cálculo de Costo por Mb Usado
  linkId: string;
  carrierProvider: string;
  monthlyRecurringCharge: number; // De bill_quota o estimado
  peakUsageMbps: number;    // Pico 95º percentil
  costPerMbps: number;      // MRC / Pico_95º_percentil
  efficiency: 'excellent' | 'good' | 'poor' | 'critical';
  benchmarkCostPerMbps: number; // $38 benchmark
  costVariance: number;     // Diferencia vs benchmark
  optimizationPotential: number; // Ahorro potencial
}

export interface HistoricalTrend {
  // Histórico Quincenal
  linkId: string;
  periods: BiweeklyMetrics[];
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  growthRate: number;       // % crecimiento quincenal
  seasonality: boolean;     // Detecta patrones estacionales
  forecastNext: number;     // Predicción próxima quincena
  capacityExhaustionDate?: string; // Fecha estimada saturación
}

export interface AutomatedAlert {
  // Alertas Automáticas
  id: string;
  linkId: string;
  alertType: 'utilization' | 'threshold' | 'cost' | 'performance';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  description: string;
  currentValue: number;
  thresholdValue: number;
  recommendedAction: string;
  autoResolve: boolean;
  createdAt: string;
  resolvedAt?: string;
  plaza: string;
  carrierProvider: string;
}

export interface XCIENOperationalDashboard {
  // Dashboard Operativo Completo
  linkInventory: XCIENLinkInventory[];
  biweeklyMetrics: BiweeklyMetrics[];
  radioBaseAnalysis: RadioBaseAnalysis[];
  cityTierClassification: CityTierClassification[];
  engineeringThresholds: EngineeringThreshold[];
  costAnalysis: CostPerMbUsed[];
  historicalTrends: HistoricalTrend[];
  activeAlerts: AutomatedAlert[];
  lastUpdated: string;
  dataQuality: {
    completeness: number;   // % datos completos
    accuracy: number;       // % datos precisos
    freshness: number;      // Minutos desde última actualización
  };
}

// Tipos para configuración
export interface XCIENConfig {
  // Configuración Operativa
  engineeringThresholds: {
    defaultWarning: number;     // 70%
    defaultCritical: number;    // 80%
    highCapacityThreshold: number; // 5000 Mbps para enlaces ≥4 Gb
  };
  
  tierClassification: {
    tier1MinRadioBases: number;    // Mínimo para Tier I
    tier1MinCapacity: number;      // Capacidad mínima Tier I
    tier1MinTraffic: number;       // Tráfico mínimo Tier I
  };
  
  costBenchmarks: {
    targetCostPerMbps: number;     // $38 benchmark
    excellentThreshold: number;    // <$25/Mbps
    goodThreshold: number;         // <$40/Mbps
    poorThreshold: number;         // >$60/Mbps
  };
  
  biweeklyPeriods: {
    currentPeriod: string;
    periodsToKeep: number;         // Histórico a mantener
    autoGenerate: boolean;         // Auto-generar períodos
  };
}

// Tipos para parseo de datos Observium
export interface ObserviumDataParser {
  // Funciones de parseo
  extractPlazaFromHostname: (hostname: string) => string;
  extractRadioBaseFromHostname: (hostname: string) => string;
  extractCarrierFromAlias: (ifAlias: string, ifDescr: string) => string;
  calculateEngineeringThreshold: (capacityMbps: number) => number;
  classifyCity: (cityData: any) => 'I' | 'II';
  generateBiweeklyPeriods: (startDate: Date, count: number) => string[];
}
