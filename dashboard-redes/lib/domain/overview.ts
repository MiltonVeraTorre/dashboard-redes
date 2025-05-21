import { NetworkOverview, Plaza } from './entities';
import { getSites, getLinks } from '../repositories/metrics';
import { getRecentAlerts } from '../repositories/alerts';

export async function getNetworkOverview(): Promise<NetworkOverview> {
  // Get all sites and links
  const sites = await getSites();
  const links = await getLinks();
  const recentAlerts = await getRecentAlerts({ limit: 5 });
  
  // Calculate sites per plaza
  const sitesPerPlaza: Record<Plaza, number> = {};
  sites.forEach(site => {
    sitesPerPlaza[site.plaza] = (sitesPerPlaza[site.plaza] || 0) + 1;
  });
  
  // Calculate critical sites (sites with at least one critical link)
  const criticalSiteIds = new Set<string>();
  links.forEach(link => {
    if (link.status === 'critical') {
      criticalSiteIds.add(link.siteId);
    }
  });
  
  // Calculate average utilization
  const totalUtilization = links.reduce((sum, link) => sum + link.utilizationPercentage, 0);
  const averageUtilization = links.length > 0 ? totalUtilization / links.length : 0;
  
  // Calculate utilization by plaza
  const utilizationByPlaza: Record<Plaza, number> = {};
  const linksByPlaza: Record<Plaza, number> = {};
  
  // First, map each link to its site's plaza
  for (const link of links) {
    const site = sites.find(s => s.id === link.siteId);
    if (site) {
      const plaza = site.plaza;
      utilizationByPlaza[plaza] = (utilizationByPlaza[plaza] || 0) + link.utilizationPercentage;
      linksByPlaza[plaza] = (linksByPlaza[plaza] || 0) + 1;
    }
  }
  
  // Then calculate the average for each plaza
  Object.keys(utilizationByPlaza).forEach(plaza => {
    if (linksByPlaza[plaza] > 0) {
      utilizationByPlaza[plaza as Plaza] = utilizationByPlaza[plaza as Plaza] / linksByPlaza[plaza as Plaza];
    }
  });
  
  return {
    totalSites: sites.length,
    sitesPerPlaza,
    criticalSites: criticalSiteIds.size,
    averageUtilization,
    utilizationByPlaza,
    recentAlerts,
  };
}