'use client';

import React from 'react';
import { MenuIcon, SearchIcon } from './icons';

const MonitoreoTecnicoHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button className="md:hidden mr-4 text-gray-500">
          <MenuIcon />
        </button>

        <h1 className="text-xl font-semibold text-gray-800">Monitoreo Técnico</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar..."
          className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          <SearchIcon />
        </div>
      </div>
    </header>
  );
};

export default MonitoreoTecnicoHeader;
