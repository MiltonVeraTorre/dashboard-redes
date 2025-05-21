/**
 * Backend for Frontend (BFF) layer for site ranking
 * 
 * This module acts as a facade between the UI and the domain layer,
 * providing a simplified API for the UI to consume.
 */

import { Site, Link } from '../domain/entities';
import * as SitesDomain from '../domain/sites';

interface RankedSite extends Site {
  utilizationPercentage: number;
  criticalLinks: number;
  totalLinks: number;
}

/**
 * Get sites ranked by utilization percentage
 */
export async function getSitesRankedByUtilization(limit: number = 10): Promise<RankedSite[]> {
  const sites = await SitesDomain.getSites();
  const rankedSites: RankedSite[] = [];
  
  // For each site, calculate the average utilization and count critical links
  for (const site of sites) {
    const { links } = await SitesDomain.getSiteWithLinks(site.id) || { links: [] };
    
    if (links.length === 0) continue;
    
    // Calculate average utilization
    const totalUtilization = links.reduce((sum, link) => sum + link.utilizationPercentage, 0);
    const averageUtilization = totalUtilization / links.length;
    
    // Count critical links
    const criticalLinks = links.filter(link => link.status === 'critical').length;
    
    rankedSites.push({
      ...site,
      utilizationPercentage: averageUtilization,
      criticalLinks,
      totalLinks: links.length,
    });
  }
  
  // Sort by utilization percentage (descending)
  rankedSites.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);
  
  // Apply limit
  return rankedSites.slice(0, limit);
}

/**
 * Get sites ranked by number of critical links
 */
export async function getSitesRankedByCriticalLinks(limit: number = 10): Promise<RankedSite[]> {
  const sites = await SitesDomain.getSites();
  const rankedSites: RankedSite[] = [];
  
  // For each site, calculate the average utilization and count critical links
  for (const site of sites) {
    const { links } = await SitesDomain.getSiteWithLinks(site.id) || { links: [] };
    
    if (links.length === 0) continue;
    
    // Calculate average utilization
    const totalUtilization = links.reduce((sum, link) => sum + link.utilizationPercentage, 0);
    const averageUtilization = totalUtilization / links.length;
    
    // Count critical links
    const criticalLinks = links.filter(link => link.status === 'critical').length;
    
    rankedSites.push({
      ...site,
      utilizationPercentage: averageUtilization,
      criticalLinks,
      totalLinks: links.length,
    });
  }
  
  // Sort by number of critical links (descending)
  rankedSites.sort((a, b) => b.criticalLinks - a.criticalLinks);
  
  // Apply limit
  return rankedSites.slice(0, limit);
}
