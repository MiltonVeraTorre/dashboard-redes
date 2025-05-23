'use client';

import React, { useState } from 'react';
import { SiteStatusChart } from '@/app/_components/site-status-chart';
import { SiteTrendChart } from '@/app/_components/site-trend-chart';

export default function ClassificationPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("status");

  const mostSaturatedSites = [
    { id: 1, name: "CDMX-Norte-01", saturation: 95, trend: "up", outages: 3 },
    { id: 2, name: "MTY-Centro-03", saturation: 86, trend: "up", outages: 1 },
    { id: 3, name: "QRO-Terras-04", saturation: 78, trend: "stable", outages: 0 },
    { id: 4, name: "GDL-Sur-02", saturation: 72, trend: "up", outages: 2 },
    { id: 5, name: "CDMX-Sur-06", saturation: 68, trend: "down", outages: 0 },
  ];

  const sitesWithMostOutages = [
    { id: 6, name: "PUE-Industrial-02", outages: 7, lastOutage: "2025-05-21", saturation: 65 },
    { id: 7, name: "VER-Puerto-01", outages: 5, lastOutage: "2025-05-20", saturation: 62 },
    { id: 1, name: "CDMX-Norte-01", outages: 3, lastOutage: "2025-05-22", saturation: 95 },
    { id: 8, name: "LEO-Centro-03", outages: 3, lastOutage: "2025-05-19", saturation: 58 },
    { id: 4, name: "GDL-Sur-02", outages: 2, lastOutage: "2025-05-18", saturation: 72 },
  ];

  const sitesWithIncreasingTrend = [
    { id: 1, name: "CDMX-Norte-01", saturation: 95, trend: 18, previousSaturation: 77 },
    { id: 2, name: "MTY-Centro-03", saturation: 86, trend: 12, previousSaturation: 74 },
    { id: 4, name: "GDL-Sur-02", saturation: 72, trend: 9, previousSaturation: 63 },
    { id: 9, name: "QRO-Terras-04", saturation: 78, trend: 8, previousSaturation: 70 },
    { id: 10, name: "MER-Centro-01", saturation: 65, trend: 7, previousSaturation: 58 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white">
        <div className="flex h-14 items-center px-4">
          
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                placeholder="Buscar..."
                className="h-9 w-64 rounded-md border border-gray-300 bg-white pl-8 text-sm outline-none focus:border-gray-500"
              />
            </div>
            <button className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50">
              <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
                <path
                  d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1.5 7C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H1.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-normal">Clasificación de Sitios Críticos</h2>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
                Últimos 7 días
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Most Saturated Sites */}
            <div className="rounded-md border border-gray-300 bg-white p-4">
              <h3 className="mb-4 text-lg font-normal">Sitios Más Saturados</h3>
              <div className="space-y-4">
                {mostSaturatedSites.map((site) => (
                  <div key={site.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-normal">{site.name}</span>
                      <span className="font-normal">{site.saturation}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${
                          site.saturation >= 85 ? "bg-gray-800" : site.saturation >= 70 ? "bg-gray-600" : "bg-gray-400"
                        }`}
                        style={{ width: `${site.saturation}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sites with Most Outages */}
            <div className="rounded-md border border-gray-300 bg-white p-4">
              <h3 className="mb-4 text-lg font-normal">Sitios con Más Caídas</h3>
              <div className="space-y-4">
                {sitesWithMostOutages.map((site) => (
                  <div key={site.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <div className="font-normal">{site.name}</div>
                      <div className="text-sm text-gray-500">Última: {site.lastOutage}</div>
                    </div>
                    <div className="rounded-md bg-gray-200 px-2 py-1 text-sm">{site.outages} caídas</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sites with Increasing Trend */}
          <div className="mt-6 rounded-md border border-gray-300 bg-white p-4">
            <h3 className="mb-4 text-lg font-normal">Sitios con Tendencia Creciente</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sitesWithIncreasingTrend.map((site) => (
                <div key={site.id} className="rounded-md border border-gray-300 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-normal">{site.name}</span>
                    <span className="text-sm">+{site.trend}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${
                        site.saturation >= 85 ? "bg-gray-800" : site.saturation >= 70 ? "bg-gray-600" : "bg-gray-400"
                      }`}
                      style={{ width: `${site.saturation}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>Anterior: {site.previousSaturation}%</span>
                    <span>Actual: {site.saturation}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="border-b border-gray-300">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("status")}
                    className={`px-4 py-2 text-sm font-normal border-b-2 ${
                      activeTab === "status"
                        ? "border-gray-800 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Tendencias de Utilización
                  </button>
                  <button
                    onClick={() => setActiveTab("trends")}
                    className={`px-4 py-2 text-sm font-normal border-b-2 ${
                      activeTab === "trends"
                        ? "border-gray-800 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Análisis de Latencia
                  </button>
                </div>
              </div>
              <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
                <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
                Opciones
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "status" && (
              <div className="mt-4 rounded-md border border-gray-300 bg-white p-4">
                <div className="h-[300px]">
                  <SiteStatusChart />
                </div>
              </div>
            )}

            {activeTab === "trends" && (
              <div className="mt-4 rounded-md border border-gray-300 bg-white p-4">
                <div className="h-[300px]">
                  <SiteTrendChart />
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between rounded-md border border-gray-300 bg-white p-4">
            <span className="text-sm text-gray-500">Mostrando 1 a 5 de 135 sitios</span>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">Anterior</button>
              <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
                Siguiente
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 