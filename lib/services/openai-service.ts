import OpenAI from 'openai';

// Variable para almacenar la instancia de OpenAI
let openaiClient: OpenAI | null = null;

// Función para obtener o crear el cliente de OpenAI
function getOpenAIClient(): OpenAI | null {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Servicio para generar resúmenes ejecutivos usando OpenAI
 */
export const OpenAIService = {
  /**
   * Verifica si OpenAI está configurado correctamente
   */
  isConfigured: () => {
    return !!process.env.OPENAI_API_KEY;
  },

  /**
   * Genera un resumen ejecutivo basado en los datos de monitoreo
   */
  generateExecutiveSummary: async (
    devices: any[],
    ports: any[],
    alerts: any[]
  ): Promise<string> => {
    // Obtener el cliente de OpenAI
    const client = getOpenAIClient();
    if (!client) {
      return "OpenAI no está configurado. Por favor, configure la clave API en las variables de entorno.";
    }

    try {
      // Extraer información clave de los dispositivos
      const totalDevices = devices.length;
      const activeDevices = devices.filter(d => d.status === '1').length;
      const deviceAvailability = totalDevices > 0
        ? (activeDevices / totalDevices * 100).toFixed(1)
        : '0';

      // Extraer información clave de los puertos
      const totalPorts = ports.length;
      const activePorts = ports.filter(p => p.ifOperStatus === 'up').length;
      const portAvailability = totalPorts > 0
        ? (activePorts / totalPorts * 100).toFixed(1)
        : '0';

      // Extraer información clave de las alertas
      const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
      const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

      // Calcular utilización promedio de los enlaces
      let totalUtilization = 0;
      let linksWithUtilization = 0;

      ports.forEach(port => {
        if (port.ifOperStatus === 'up' && port.ifSpeed && (port.ifInOctets_rate || port.ifOutOctets_rate)) {
          const speed = parseFloat(port.ifSpeed);
          if (speed > 0) {
            const inRate = parseFloat(port.ifInOctets_rate || '0') * 8; // bits
            const outRate = parseFloat(port.ifOutOctets_rate || '0') * 8; // bits
            const maxRate = Math.max(inRate, outRate);
            const utilization = (maxRate / speed) * 100;

            if (!isNaN(utilization)) {
              totalUtilization += utilization;
              linksWithUtilization++;
            }
          }
        }
      });

      const averageUtilization = linksWithUtilization > 0
        ? (totalUtilization / linksWithUtilization).toFixed(1)
        : '0';

      // Crear el contenido para OpenAI con la información clave
      const content = `
        Genera un resumen ejecutivo conciso (máximo 3 párrafos) sobre el estado actual de la red basado en estos datos:

        - Dispositivos: ${activeDevices} activos de ${totalDevices} totales (${deviceAvailability}% disponibilidad)
        - Interfaces: ${activePorts} activas de ${totalPorts} totales (${portAvailability}% disponibilidad)
        - Alertas: ${criticalAlerts} críticas, ${warningAlerts} advertencias
        - Utilización promedio de enlaces: ${averageUtilization}%

        Incluye:
        1. Una evaluación general del estado de la red
        2. Áreas que requieren atención inmediata (si las hay)
        3. Recomendaciones breves

        Usa un tono profesional y directo, apropiado para ejecutivos.
      `;

      // Llamar a la API de OpenAI
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: "system", content: "Eres un analista de redes experto que proporciona resúmenes ejecutivos concisos y accionables." },
          { role: "user", content }
        ],
        temperature: 0.3, // Baja temperatura para respuestas más consistentes
        max_tokens: 350, // Limitar longitud del resumen
      });

      return response.choices[0]?.message?.content ||
        "No se pudo generar el resumen ejecutivo. Por favor, revise los datos del dashboard técnico.";
    } catch (error) {
      console.error('Error generando resumen ejecutivo con OpenAI:', error);
      return "Error al generar el resumen ejecutivo. Por favor, revise los datos del dashboard técnico.";
    }
  }
};

export default OpenAIService;