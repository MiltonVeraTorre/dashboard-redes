'use client';

import React from 'react';

/**
 * Settings Page
 * 
 * Configuration page for the XCIEN Network Dashboard
 */

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración de API</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Observium
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://observium.xcien.com"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario API
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="equipo2"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Dashboard Settings */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Dashboard</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo de Actualización
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="300">5 minutos</option>
                  <option value="600">10 minutos</option>
                  <option value="1800">30 minutos</option>
                  <option value="3600">1 hora</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tema
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-alerts"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="email-alerts" className="ml-2 text-sm text-gray-700">
                  Alertas por email
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="browser-notifications"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="browser-notifications" className="ml-2 text-sm text-gray-700">
                  Notificaciones del navegador
                </label>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Versión: 1.0.0</div>
              <div>Última actualización: {new Date().toLocaleDateString()}</div>
              <div>Estado API: Conectado</div>
              <div>Uptime: 99.97%</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Guardar Configuración
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Restablecer
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Limpiar Caché
          </button>
        </div>

        {/* Navigation Test */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ Navegación Exitosa</h3>
          <p className="text-sm text-green-700">
            Si puedes ver esta página, la navegación desde el sidebar está funcionando correctamente.
          </p>
        </div>
      </div>
    </div>
  );
}
