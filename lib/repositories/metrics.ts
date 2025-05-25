import { Link, Site } from '../domain/entities';
import { mockLinks, mockSites } from './mocks/data';

// In a real application, this would fetch from a database or API
// For now, we'll use mock data

export async function getSites(options?: { plaza?: string }): Promise<Site[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Filter by plaza if specified
  if (options?.plaza) {
    return mockSites.filter((site: Site) =>
      site.plaza.toLowerCase() === options.plaza?.toLowerCase()
    );
  }

  return mockSites;
}

export async function getLinks(options?: { siteId?: string }): Promise<Link[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Filter by siteId if specified
  if (options?.siteId) {
    return mockLinks.filter((link: Link) => link.siteId === options.siteId);
  }

  return mockLinks;
}

export async function getSiteById(id: string): Promise<Site | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));

  return mockSites.find((site: Site) => site.id === id) || null;
}

export async function getLinkById(id: string): Promise<Link | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));

  return mockLinks.find((link: Link) => link.id === id) || null;
}
