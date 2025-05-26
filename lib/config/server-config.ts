import getConfig from 'next/config';

/**
 * Obtiene la configuración del servidor desde next.config.js
 */
export function getServerConfig() {
  const { serverRuntimeConfig } = getConfig();
  
  return {
    openai: {
      apiKey: serverRuntimeConfig?.openai?.apiKey || '',
      model: serverRuntimeConfig?.openai?.model || 'gpt-4o-mini',
    }
  };
}