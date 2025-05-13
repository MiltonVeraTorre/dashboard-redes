'use client';

import React from 'react';
import Link from 'next/link';
import {
  DashboardIcon,
  MonitoringIcon,
  AlertsIcon,
  ReportsIcon,
  LocationIcon,
  SettingsIcon,
  LogoutIcon,
  UserIcon
} from './icons';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">NetMonitor</h1>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="py-2">
            <ul>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-800 bg-gray-100 font-medium">
                  <DashboardIcon /> Dashboard Ejecutivo
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <MonitoringIcon /> Monitoreo Técnico
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <AlertsIcon /> Alertas
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <ReportsIcon /> Reportes
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div className="py-2 border-t border-gray-200">
            <ul>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <LocationIcon /> CDMX
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <LocationIcon /> Monterrey
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <LocationIcon /> Guadalajara
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <LocationIcon /> Miami
                </Link>
              </li>
            </ul>
          </div>

          {/* Settings & Logout */}
          <div className="py-2 border-t border-gray-200">
            <ul>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <SettingsIcon /> Configuración
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50">
                  <LogoutIcon /> Cerrar sesión
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Usuario</p>
              <p className="text-xs text-gray-500">Ingeniero de Red</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
