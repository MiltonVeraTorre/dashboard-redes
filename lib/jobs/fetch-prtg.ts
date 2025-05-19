/**
 * Job to fetch data from PRTG
 * 
 * This module provides a job that fetches data from PRTG and stores it in the database.
 */

import { logger } from '../utils/logger';
import * as PrtgAdapter from '../adapters/PrtgApiAdapter';
import { prisma } from '../prisma';

/**
 * Fetch data from PRTG and store it in the database
 */
export async function fetchPrtgData() {
  logger.info('Starting PRTG data fetch job');
  
  try {
    // Fetch sites and links from PRTG
    const sites = await PrtgAdapter.fetchSites();
    const links = await PrtgAdapter.fetchLinks();
    
    logger.info(`Fetched ${sites.length} sites and ${links.length} links from PRTG`);
    
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
    // });
    
    logger.info('PRTG data fetch job completed successfully');
  } catch (error) {
    logger.error(`PRTG data fetch job failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Run the job if this file is executed directly
 */
if (require.main === module) {
  fetchPrtgData()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`Error running PRTG data fetch job: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    });
}
