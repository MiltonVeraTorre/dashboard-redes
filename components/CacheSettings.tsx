'use client';
import React, { useState, useEffect } from 'react';
import { cacheManager } from '@/lib/services/cache-manager';

interface CacheSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CacheSettings({ isOpen, onClose }: CacheSettingsProps) {
  const [stats, setStats] = useState(cacheManager.getStats());
  const [patterns, setPatterns] = useState(cacheManager.getPatterns());

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setStats(cacheManager.getStats());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleClearAll = () => {
    cacheManager.clearAll();
    setStats(cacheManager.getStats());
  };

  const handleResetStats = () => {
    cacheManager.resetStats();
    setStats(cacheManager.getStats());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Configuración de Caché</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Estadísticas de Caché</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Aciertos</div>
                <div className="text-xl font-bold text-blue-900">{stats.hits}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Fallos</div>
                <div className="text-xl font-bold text-red-900">{stats.misses}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Tasa de Aciertos</div>
                <div className="text-xl font-bold text-green-900">{stats.hitRate.toFixed(1)}%</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Tasa de Fallos</div>
                <div className="text-xl font-bold text-orange-900">{stats.missRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Cache Patterns */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Patrones de Caché</h3>
            <div className="space-y-2">
              {patterns.map((pattern, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{pattern.pattern}</div>
                      <div className="text-sm text-gray-600">{pattern.description}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      TTL: {Math.floor(pattern.ttl / 1000 / 60)}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClearAll}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Limpiar Todo el Caché
            </button>
            <button
              onClick={handleResetStats}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reiniciar Estadísticas
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>

          {/* Cache Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Consejos de Caché</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los datos de monitoreo se cachean por 2 minutos para balance entre frescura y rendimiento</li>
              <li>• Las tendencias se cachean por 5 minutos ya que cambian menos frecuentemente</li>
              <li>• El auto-refresh respeta el caché para evitar llamadas innecesarias</li>
              <li>• Usa "Limpiar Caché" si necesitas datos completamente frescos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
