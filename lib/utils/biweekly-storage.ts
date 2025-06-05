// Sistema de almacenamiento para datos históricos quincenales
// Simula base de datos usando localStorage y memoria para demo

import React from 'react';
import { BiweeklyMetrics, HistoricalTrend } from '@/lib/types/xcien-operational';

interface BiweeklyStorageData {
  periods: string[];
  metrics: { [period: string]: BiweeklyMetrics[] };
  lastUpdated: string;
}

class BiweeklyStorageManager {
  private storageKey = 'xcien-biweekly-data';
  private maxPeriods = 12; // 6 meses de histórico

  // Obtener todos los datos históricos
  getAllData(): BiweeklyStorageData {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return {
        periods: [],
        metrics: {},
        lastUpdated: new Date().toISOString()
      };
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error reading biweekly storage:', error);
    }

    return {
      periods: [],
      metrics: {},
      lastUpdated: new Date().toISOString()
    };
  }

  // Guardar datos de un período
  savePeriodData(period: string, metrics: BiweeklyMetrics[]): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('localStorage not available, skipping save');
      return;
    }

    try {
      const data = this.getAllData();

      // Agregar período si no existe
      if (!data.periods.includes(period)) {
        data.periods.push(period);
        data.periods.sort(); // Mantener orden cronológico

        // Limitar número de períodos
        if (data.periods.length > this.maxPeriods) {
          const oldPeriod = data.periods.shift();
          if (oldPeriod) {
            delete data.metrics[oldPeriod];
          }
        }
      }

      // Guardar métricas del período
      data.metrics[period] = metrics;
      data.lastUpdated = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log(`✅ Saved biweekly data for period ${period}: ${metrics.length} metrics`);

    } catch (error) {
      console.error('Error saving biweekly data:', error);
    }
  }

  // Obtener datos de un período específico
  getPeriodData(period: string): BiweeklyMetrics[] {
    const data = this.getAllData();
    return data.metrics[period] || [];
  }

  // Obtener datos históricos de un enlace específico
  getLinkHistory(linkId: string): BiweeklyMetrics[] {
    const data = this.getAllData();
    const history: BiweeklyMetrics[] = [];
    
    data.periods.forEach(period => {
      const periodMetrics = data.metrics[period] || [];
      const linkMetric = periodMetrics.find(m => m.linkId === linkId);
      if (linkMetric) {
        history.push(linkMetric);
      }
    });
    
    return history.sort((a, b) => a.period.localeCompare(b.period));
  }

  // Generar tendencias históricas
  generateHistoricalTrends(linkIds: string[]): HistoricalTrend[] {
    return linkIds.map(linkId => {
      const history = this.getLinkHistory(linkId);
      
      if (history.length < 2) {
        return {
          linkId,
          periods: history,
          trendDirection: 'stable',
          growthRate: 0,
          seasonality: false,
          forecastNext: history[0]?.utilizationPercent || 0
        };
      }
      
      // Calcular tendencia
      const utilizationValues = history.map(h => h.utilizationPercent);
      const growthRate = this.calculateGrowthRate(utilizationValues);
      const trendDirection = this.determineTrendDirection(growthRate);
      const seasonality = this.detectSeasonality(utilizationValues);
      const forecastNext = this.forecastNextPeriod(utilizationValues);
      const capacityExhaustionDate = this.estimateCapacityExhaustion(history);
      
      return {
        linkId,
        periods: history,
        trendDirection,
        growthRate,
        seasonality,
        forecastNext,
        capacityExhaustionDate
      };
    });
  }

  // Calcular tasa de crecimiento
  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    const periods = values.length - 1;
    
    if (first === 0) return 0;
    
    return ((last - first) / first) / periods * 100;
  }

  // Determinar dirección de tendencia
  private determineTrendDirection(growthRate: number): 'increasing' | 'decreasing' | 'stable' {
    if (growthRate > 2) return 'increasing';
    if (growthRate < -2) return 'decreasing';
    return 'stable';
  }

  // Detectar estacionalidad (simplificado)
  private detectSeasonality(values: number[]): boolean {
    if (values.length < 6) return false;
    
    // Buscar patrones repetitivos simples
    const variance = this.calculateVariance(values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Si la varianza es alta relativa a la media, podría haber estacionalidad
    return variance > (mean * 0.3);
  }

  // Calcular varianza
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Pronóstico simple para próximo período
  private forecastNextPeriod(values: number[]): number {
    if (values.length < 2) return values[0] || 0;
    
    // Promedio móvil simple de últimos 3 períodos
    const recentValues = values.slice(-3);
    const average = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    
    // Aplicar tendencia
    const growthRate = this.calculateGrowthRate(values);
    const forecast = average * (1 + growthRate / 100);
    
    return Math.max(0, Math.min(100, forecast)); // Limitar entre 0-100%
  }

  // Estimar fecha de agotamiento de capacidad
  private estimateCapacityExhaustion(history: BiweeklyMetrics[]): string | undefined {
    if (history.length < 3) return undefined;
    
    const recentHistory = history.slice(-6); // Últimos 6 períodos
    const utilizationValues = recentHistory.map(h => h.utilizationPercent);
    const growthRate = this.calculateGrowthRate(utilizationValues);
    
    // Solo calcular si hay crecimiento positivo
    if (growthRate <= 0) return undefined;
    
    const currentUtilization = utilizationValues[utilizationValues.length - 1];
    const periodsToExhaustion = (90 - currentUtilization) / (growthRate / 100 * currentUtilization);
    
    if (periodsToExhaustion <= 0 || periodsToExhaustion > 24) return undefined; // Más de 2 años
    
    const exhaustionDate = new Date();
    exhaustionDate.setDate(exhaustionDate.getDate() + (periodsToExhaustion * 15)); // 15 días por período
    
    return exhaustionDate.toISOString().split('T')[0];
  }

  // Limpiar datos antiguos
  clearOldData(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('localStorage not available, skipping clear');
      return;
    }

    try {
      localStorage.removeItem(this.storageKey);
      console.log('✅ Cleared old biweekly data');
    } catch (error) {
      console.error('Error clearing biweekly data:', error);
    }
  }

  // Exportar datos para análisis
  exportData(): string {
    const data = this.getAllData();
    return JSON.stringify(data, null, 2);
  }

  // Importar datos desde backup
  importData(jsonData: string): boolean {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('localStorage not available, skipping import');
      return false;
    }

    try {
      const data = JSON.parse(jsonData);

      // Validar estructura básica
      if (!data.periods || !data.metrics || !Array.isArray(data.periods)) {
        throw new Error('Invalid data structure');
      }

      localStorage.setItem(this.storageKey, jsonData);
      console.log('✅ Imported biweekly data successfully');
      return true;

    } catch (error) {
      console.error('Error importing biweekly data:', error);
      return false;
    }
  }

  // Obtener estadísticas de almacenamiento
  getStorageStats(): {
    totalPeriods: number;
    totalMetrics: number;
    oldestPeriod: string | null;
    newestPeriod: string | null;
    storageSize: number;
  } {
    const data = this.getAllData();
    const totalMetrics = Object.values(data.metrics).reduce((sum, metrics) => sum + metrics.length, 0);
    
    return {
      totalPeriods: data.periods.length,
      totalMetrics,
      oldestPeriod: data.periods[0] || null,
      newestPeriod: data.periods[data.periods.length - 1] || null,
      storageSize: new Blob([JSON.stringify(data)]).size
    };
  }
}

// Instancia singleton
export const biweeklyStorage = new BiweeklyStorageManager();

// Funciones de utilidad para generar períodos
export function generateBiweeklyPeriods(count: number = 12): string[] {
  const periods: string[] = [];
  const now = new Date();
  
  // Empezar desde el período actual hacia atrás
  for (let i = count - 1; i >= 0; i--) {
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - (i * 15)); // 15 días por período
    
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

// Hook para usar el almacenamiento en componentes React
export function useBiweeklyStorage() {
  // Check if we're in a browser environment before using React hooks
  if (typeof window === 'undefined') {
    return {
      data: null,
      loading: false,
      savePeriodData: () => {},
      getLinkHistory: () => [],
      generateTrends: () => [],
      getStats: () => ({ totalPeriods: 0, totalMetrics: 0, oldestPeriod: null, newestPeriod: null, storageSize: 0 })
    };
  }

  // Import React dynamically to avoid SSR issues
  const React = require('react');

  const [data, setData] = React.useState<BiweeklyStorageData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const storageData = biweeklyStorage.getAllData();
      setData(storageData);
    } catch (error) {
      console.error('Error loading biweekly storage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePeriodData = React.useCallback((period: string, metrics: BiweeklyMetrics[]) => {
    biweeklyStorage.savePeriodData(period, metrics);
    setData(biweeklyStorage.getAllData());
  }, []);

  const getLinkHistory = React.useCallback((linkId: string) => {
    return biweeklyStorage.getLinkHistory(linkId);
  }, []);

  return {
    data,
    loading,
    savePeriodData,
    getLinkHistory,
    generateTrends: biweeklyStorage.generateHistoricalTrends.bind(biweeklyStorage),
    getStats: biweeklyStorage.getStorageStats.bind(biweeklyStorage)
  };
}
