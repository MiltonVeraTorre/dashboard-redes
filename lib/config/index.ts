// Configuration settings for the application

export const config = {
  // API endpoints
  prtg: {
    baseUrl: process.env.PRTG_BASE_URL || 'https://prtg.example.com',
    username: process.env.PRTG_USERNAME || 'demo',
    password: process.env.PRTG_PASSWORD || 'demo',
  },
  observium: {
    baseUrl: process.env.OBSERVIUM_BASE_URL || 'http://201.150.5.213/api/v0',
    username: process.env.OBSERVIUM_USERNAME || 'equipo2',
    password: process.env.OBSERVIUM_PASSWORD || '91Rert@mU',
  },
  // Application settings
  refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '300000', 10), // 5 minutes
  defaultPlaza: 'CDMX',
};
