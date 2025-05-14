'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import MonitoreoTecnicoHeader from '@/components/MonitoreoTecnicoHeader';
import EnlacesTable from '@/components/EnlacesTable';
import TendenciasUtilizacion from '@/components/TendenciasUtilizacion';
import AnalisisLatencia from '@/components/AnalisisLatencia';

export default function MonitoreoTecnico() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MonitoreoTecnicoHeader />
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Enlaces Table */}
          <div className="mb-6">
            <EnlacesTable />
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TendenciasUtilizacion />
            <AnalisisLatencia />
          </div>
        </div>
      </div>
    </div>
  );
}
