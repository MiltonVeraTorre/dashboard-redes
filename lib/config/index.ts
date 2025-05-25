// Configuration settings for the application

export const config = {
  // API endpoints
  prtg: {
    baseUrl: process.env.PRTG_BASE_URL,
    username: process.env.PRTG_USERNAME,
    password: process.env.PRTG_PASSWORD,
  },
  observium: {
    baseUrl: process.env.OBSERVIUM_BASE_URL,
    username: process.env.OBSERVIUM_USERNAME,
    password: process.env.OBSERVIUM_PASSWORD,
  },
  // Application settings
  refreshInterval: parseInt(process.env.REFRESH_INTERVAL || '300000', 10), // 5 minutes
  defaultPlaza: 'CDMX',
};
