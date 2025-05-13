'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faSearch, 
  faBars, 
  faTachometerAlt, 
  faDesktop, 
  faBell, 
  faFileAlt, 
  faCog, 
  faSignOutAlt,
  faMapMarkerAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React from 'react';

// Dashboard Icon
export const DashboardIcon = () => (
  <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
);

// Monitoring Icon
export const MonitoringIcon = () => (
  <FontAwesomeIcon icon={faDesktop} className="mr-2" />
);

// Alerts Icon
export const AlertsIcon = () => (
  <FontAwesomeIcon icon={faBell} className="mr-2" />
);

// Reports Icon
export const ReportsIcon = () => (
  <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
);

// Location Icon
export const LocationIcon = () => (
  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
);

// Settings Icon
export const SettingsIcon = () => (
  <FontAwesomeIcon icon={faCog} className="mr-2" />
);

// Logout Icon
export const LogoutIcon = () => (
  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
);

// User Icon
export const UserIcon = () => (
  <FontAwesomeIcon icon={faUser} className="mr-2" />
);

// Search Icon
export const SearchIcon = () => (
  <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
);

// Menu Icon
export const MenuIcon = () => (
  <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
);

// Chart Icon
export const ChartIcon = () => (
  <FontAwesomeIcon icon={faChartLine} className="mr-2" />
);

// Generic Icon component for reusability
interface IconProps {
  icon: IconProp;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ icon, className = '' }) => (
  <FontAwesomeIcon icon={icon} className={className} />
);
