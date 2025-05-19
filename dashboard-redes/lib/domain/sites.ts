import { Site, Link } from './entities';
import { getSites as getRepositorySites, getLinks } from '../repositories/metrics';

interface GetSitesOptions {
  plaza?: string;
  limit?: number;
}

export async function getSites(options: GetSitesOptions = {}): Promise<Site[]> {
  const { plaza, limit } = options;
  
  // Get sites from repository
  let sites = await getRepositorySites({ plaza });
  
  // Apply limit if specified
  if (limit && limit > 0) {
    sites = sites.slice(0, limit);
  }
  
  return sites;
}

export async function getSiteWithLinks(siteId: string): Promise<{ site: Site; links: Link[] } | null> {
  // Get all sites
  const sites = await getRepositorySites();
  
  // Find the requested site
  const site = sites.find(s => s.id === siteId);
  if (!site) {
    return null;
  }
  
  // Get links for this site
  const links = await getLinks({ siteId });
  
  return { site, links };
}