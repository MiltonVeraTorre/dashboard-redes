import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faNetworkWired, 
  faBell, 
  faChartPie, 
  faGear, 
  faQuestionCircle 
} from '@fortawesome/free-solid-svg-icons';

export function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const navItems = [
    { name: 'Dashboard Ejecutivo', path: '/', icon: faChartPie },
    { name: 'Monitoreo Técnico', path: '/technical', icon: faNetworkWired },
    { name: 'Alertas', path: '/alerts', icon: faBell },
    { name: 'Reportes', path: '/reports', icon: faChartLine },
    { name: 'Configuración', path: '/settings', icon: faGear },
  ];
  
  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">NetMonitor</h2>
      </div>
      
      <nav className="flex-1 pt-4">
        <ul>
          {nav