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
          {navItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                href={item.path}
                className={`flex items-center px-4 py-2 text-sm rounded-lg mx-2 transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link
          href="/help"
          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faQuestionCircle} className="w-5 h-5 mr-3" />
          Ayuda
        </Link>
      </div>
    </aside>
  );
}