/**
 * Backend for Frontend (BFF) layer for sites
 * 
 * This module acts as a facade between the UI and the domain layer,
 * providing a simplified API for the UI to consume.
 */

import { Site, Link } from '../domain/entities';
import * as SitesDomain from '../domain/sites';

export interface GetSitesOptions {
  plaza?: string;
  limit?: number;
}

/**
 * Get a list of sites with optional filtering
 */
export async function getSites(options: GetSitesOptions = {}): Promise<Site[]> {
  return SitesDomain.getSites(options);
}

/**
 * Get a single site by ID with its associated links
 */
export async function getSiteWithLinks(siteId: string): Promise<{ site: Site; links: Link[] } | null> {
  return SitesDomain.getSiteWithLinks(siteId);
}

/**
 * Get sites grouped by plaza
 */
export async function getSitesByPlaza(): Promise<Record<string, Site[]>> {
  const sites = await SitesDomain.getSites();
  
  // Group sites by plaza
  const sitesByPlaza: Record<string, Site[]> = {};
  
  sites.forEach(site => {
    if (!sitesByPlaza[site.plaza]) {
      sitesByPlaza[site.plaza] = [];
    }
    
    sitesByPlaza[site.plaza].push(site);
  });
  
  return sitesByPlaza;
}

/**
 * Get critical sites (sites with at least one critical link)
 */
export async function getCriticalSites(): Promise<Site[]> {
  const sites = await SitesDomain.getSites();
  const criticalSites: Site[] = [];
  
  // For each site, check if it has any critical links
  for (const site of sites) {
    const { links } = await SitesDomain.getSiteWithLinks(site.id) || { links: [] };
    
    if (links.some(link => link.status === 'critical')) {
      criticalSites.push(site);
    }
  }
  
  return criticalSites;
}
