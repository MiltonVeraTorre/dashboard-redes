'use client';

import React from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import NetworkConsumptionCard from './cards/NetworkConsumptionCard';
import CapacityUsageCard from './cards/CapacityUsageCard';
import CriticalSitesCard from './cards/CriticalSitesCard';
import GrowthTrendsCard from './cards/GrowthTrendsCard';

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NetworkConsumptionCard />
            <CapacityUsageCard />
            <CriticalSitesCard />
            <GrowthTrendsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export  {Dashboard};
