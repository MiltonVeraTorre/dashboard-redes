/**
 * Job to fetch data from Observium
 * 
 * This module provides a job that fetches data from Observium and stores it in the database.
 */

import { logger } from '../utils/logger';
import * as ObserviumAdapter from '../adapters/ObserviumApiAdapter';
import { prisma } from '../prisma';

/**
 * Fetch data from Observium and store it in the database
 */
export async function fetchObserviumData() {
  logger.info('Starting Observium data fetch job');
  
  try {
    // Fetch sites, links, and alerts from Observium
    const sites = await ObserviumAdapter.fetchSites();
    const links = await ObserviumAdapter.fetchLinks();
    const alerts = await ObserviumAdapter.fetchAlerts();
    
    logger.info(`Fetched ${sites.length} sites, ${links.length} links, and ${alerts.length} alerts from Observium`);
    
    // In a real implementation, this would store the data in the database
    // For now, we'll just log the data
    
    // Example of how this would be implemented:
    // await prisma.$transaction(async (tx) => {
    //   // Store sites
    //   for (const site of sites) {
    //     await tx.site.upsert({
    //       where: { id: site.id },
    //       update: site,
    //       create: site,
    //     });
    //   }
    //   
    //   // Store links
    //   for (const link of links) {
    //     await tx.link.upsert({
    //       where: { id: link.id },
    //       update: link,
    //       create: link,
    //     });
    //   }
    //   
    //   // Store alerts
    //   for (const alert of alerts) {
    //     await tx.alert.upsert({
    //       where: { id: alert.id },
    //       update: alert,
    //       create: alert,
    //     });
    //   }
    // });
    
    logger.info('Observium data fetch job completed successfully');
  } catch (error) {
    logger.error(`Observium data fetch job failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Run the job if this file is executed directly
 */
if (require.main === module) {
  fetchObserviumData()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`Error running Observium data fetch job: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    });
}
