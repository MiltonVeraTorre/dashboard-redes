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
  },

  /**
   * Genera un resumen ejecutivo basado en los datos del dashboard ejecutivo
   */
  generateExecutiveDashboardSummary: async (dashboardData: any): Promise<string> => {
    // Obtener el cliente de OpenAI
    const client = getOpenAIClient();
    if (!client) {
      return "OpenAI no está configurado. Por favor, configure la clave API en las variables de entorno.";
    }

    try {
      // Extraer información clave del dashboard ejecutivo
      const networkConsumption = dashboardData.networkConsumption || {};
      const capacityUtilization = dashboardData.capacityUtilization || {};
      const criticalSites = dashboardData.criticalSites || {};
      const growthTrends = dashboardData.growthTrends || {};

      // Información de consumo de red
      const plazas = networkConsumption.plazas || [];
      const averageConsumption = networkConsumption.summary?.averageConsumption || {};
      const totalPlazas = plazas.length;

      // Información de capacidad
      const capacityData = capacityUtilization.data || [];
      const capacitySummary = capacityUtilization.summary || {};
      const averageUtilization = capacitySummary.averageUtilization || 0;
      const totalDevices = capacitySummary.totalDevices || 0;
      const totalPorts = capacitySummary.totalPorts || 0;

      // Sitios críticos
      const criticalSitesData = criticalSites.data || [];
      const criticalSitesSummary = criticalSites.summary || {};
      const totalCriticalSites = criticalSitesSummary.totalCriticalSites || 0;
      const averageHealthScore = criticalSitesSummary.averageHealthScore || 0;
      const totalAlerts = criticalSitesSummary.totalAlerts || 0;

      // Identificar plazas con mayor utilización
      const highUtilizationPlazas = capacityData
        .filter(plaza => plaza.utilization > 80)
        .map(plaza => `${plaza.plaza} (${plaza.utilization.toFixed(1)}%)`)
        .slice(0, 3);

      // Identificar sitios más críticos
      const mostCriticalSites = criticalSitesData
        .filter(site => site.status === 'critical')
        .map(site => `${site.site} en ${site.plaza}`)
        .slice(0, 3);

      // Crear el contenido para OpenAI
      const content = `
        Genera un resumen ejecutivo conciso (máximo 4 párrafos) sobre el estado general de la red basado en estos datos del dashboard ejecutivo:

        INFRAESTRUCTURA GENERAL:
        - ${totalPlazas} plazas monitoreadas: ${plazas.join(', ')}
        - ${totalDevices} dispositivos totales con ${totalPorts} puertos
        - Utilización promedio de capacidad: ${averageUtilization.toFixed(1)}%

        SITIOS CRÍTICOS:
        - ${totalCriticalSites} sitios requieren atención inmediata
        - ${totalAlerts} alertas activas en el sistema
        - Puntuación promedio de salud: ${averageHealthScore.toFixed(1)}/100

        PLAZAS CON ALTA UTILIZACIÓN:
        ${highUtilizationPlazas.length > 0 ? highUtilizationPlazas.join(', ') : 'Ninguna plaza con utilización crítica'}

        SITIOS MÁS CRÍTICOS:
        ${mostCriticalSites.length > 0 ? mostCriticalSites.join(', ') : 'No hay sitios en estado crítico'}

        CONSUMO DE RED POR PLAZA:
        ${Object.entries(averageConsumption).map(([plaza, consumo]) =>
          `${plaza}: ${Number(consumo).toFixed(1)}%`).join(', ')}

        Incluye:
        1. Evaluación general del estado de la infraestructura de red
        2. Identificación de riesgos y áreas que requieren atención prioritaria
        3. Impacto en el negocio y recomendaciones estratégicas
        4. Próximos pasos sugeridos

        Usa un tono ejecutivo, enfocado en el impacto del negocio y decisiones estratégicas.
      `;

      // Llamar a la API de OpenAI
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: "system",
            content: "Eres un consultor senior de infraestructura de red que proporciona resúmenes ejecutivos estratégicos para la alta dirección, enfocándote en el impacto del negocio y decisiones de inversión."
          },
          { role: "user", content }
        ],
        temperature: 0.3, // Baja temperatura para respuestas más consistentes
        max_tokens: 500, // Más tokens para un resumen ejecutivo más completo
      });

      return response.choices[0]?.message?.content ||
        "No se pudo generar el resumen ejecutivo. Por favor, revise los datos del dashboard ejecutivo.";
    } catch (error) {
      console.error('Error generando resumen ejecutivo del dashboard con OpenAI:', error);
      return "Error al generar el resumen ejecutivo. Por favor, revise los datos del dashboard ejecutivo.";
    }
  },

  /**
   * Genera un resumen ejecutivo financiero basado en los datos del dashboard financiero
   */
  generateFinancialExecutiveSummary: async (financialData: any): Promise<string> => {
    // Obtener el cliente de OpenAI
    const client = getOpenAIClient();
    if (!client) {
      return "OpenAI no está configurado. Por favor, configure la clave API en las variables de entorno.";
    }

    try {
      // Extraer información clave del dashboard financiero
      const summary = financialData.summary || {};
      const carrierAnalysis = financialData.carrierAnalysis || [];
      const plazaBreakdown = financialData.plazaBreakdown || [];
      const optimizationOpportunities = financialData.optimizationOpportunities || [];

      // Métricas principales
      const totalMonthlyCost = summary.totalMonthlyCost || 0;
      const averageUtilization = summary.averageUtilization || 0;
      const potentialSavings = summary.potentialSavings || 0;
      const optimizableContracts = summary.optimizableContracts || 0;
      const costPerMbps = summary.costPerMbps || 0;

      // Análisis de carriers
      const totalCarriers = carrierAnalysis.length;
      const efficientCarriers = carrierAnalysis.filter(c => c.status === 'efficient').length;
      const criticalCarriers = carrierAnalysis.filter(c => c.status === 'critical').length;
      const topCarrierByCost = carrierAnalysis[0]?.carrier || 'N/A';
      const topCarrierCost = carrierAnalysis[0]?.monthlyCost || 0;

      // Análisis de plazas
      const totalPlazas = plazaBreakdown.length;
      const mostExpensivePlaza = plazaBreakdown[0]?.plaza || 'N/A';
      const mostExpensivePlazaCost = plazaBreakdown[0]?.monthlyCost || 0;
      const leastEfficientPlaza = plazaBreakdown.reduce((min, plaza) =>
        plaza.efficiency < min.efficiency ? plaza : min, plazaBreakdown[0] || { plaza: 'N/A', efficiency: 100 });

      // Oportunidades de optimización
      const highPriorityOpportunities = optimizationOpportunities.filter(opp => opp.priority === 'high').length;
      const cancellationOpportunities = optimizationOpportunities.filter(opp => opp.type === 'cancellation').length;
      const renegotiationOpportunities = optimizationOpportunities.filter(opp => opp.type === 'renegotiation').length;

      // Top 3 oportunidades por ahorro
      const topOpportunities = optimizationOpportunities
        .slice(0, 3)
        .map(opp => `${opp.carrier} en ${opp.plaza} (${opp.type === 'cancellation' ? 'cancelación' : 'renegociación'}: $${opp.potentialSaving.toLocaleString()}/mes)`)
        .join(', ');

      // Crear el contenido para OpenAI
      const content = `
        Genera un resumen ejecutivo financiero conciso (máximo 4 párrafos) para XCIEN sobre la optimización de contratos de carriers basado en estos datos:

        RESUMEN FINANCIERO GENERAL:
        - Gasto total mensual: $${totalMonthlyCost.toLocaleString()} USD
        - Eficiencia promedio de utilización: ${averageUtilization.toFixed(1)}%
        - Ahorro potencial identificado: $${potentialSavings.toLocaleString()} USD/mes
        - Contratos optimizables: ${optimizableContracts} de ${totalCarriers} carriers
        - Costo promedio por Mbps utilizado: $${costPerMbps.toFixed(2)} USD

        ANÁLISIS POR CARRIER:
        - ${totalCarriers} carriers activos (${efficientCarriers} eficientes, ${criticalCarriers} críticos)
        - Carrier con mayor gasto: ${topCarrierByCost} ($${topCarrierCost.toLocaleString()}/mes)
        - Carriers eficientes (>70% utilización): ${efficientCarriers}
        - Carriers críticos (<30% utilización): ${criticalCarriers}

        ANÁLISIS POR PLAZA:
        - ${totalPlazas} plazas monitoreadas
        - Plaza con mayor gasto: ${mostExpensivePlaza} ($${mostExpensivePlazaCost.toLocaleString()}/mes)
        - Plaza menos eficiente: ${leastEfficientPlaza.plaza} (${leastEfficientPlaza.efficiency.toFixed(1)}% eficiencia)

        OPORTUNIDADES DE OPTIMIZACIÓN:
        - ${highPriorityOpportunities} oportunidades de alta prioridad
        - ${cancellationOpportunities} contratos candidatos a cancelación (0% uso)
        - ${renegotiationOpportunities} contratos para renegociación (<30% uso)
        - Top 3 oportunidades: ${topOpportunities || 'No hay oportunidades identificadas'}

        Incluye:
        1. Evaluación del estado financiero actual de los contratos de carriers
        2. Identificación de las mayores oportunidades de ahorro y su impacto
        3. Recomendaciones estratégicas priorizadas por ROI
        4. Próximos pasos para implementar optimizaciones

        Usa un tono ejecutivo enfocado en el impacto financiero, ROI y decisiones de negocio. Menciona cifras específicas y plazos recomendados.
      `;

      // Llamar a la API de OpenAI con modelo o3 (como prefiere el usuario)
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'o3-mini', // Usar o3 como prefiere el usuario
        messages: [
          {
            role: "system",
            content: "Eres un consultor financiero senior especializado en optimización de costos de telecomunicaciones que proporciona análisis ejecutivos estratégicos para la alta dirección, enfocándote en ROI, ahorro de costos y decisiones de inversión."
          },
          { role: "user", content }
        ],
        temperature: 0.3, // Baja temperatura para respuestas más consistentes
        max_tokens: 600, // Más tokens para un análisis financiero completo
      });

      return response.choices[0]?.message?.content ||
        "No se pudo generar el resumen ejecutivo financiero. Por favor, revise los datos del dashboard financiero.";
    } catch (error) {
      console.error('Error generando resumen ejecutivo financiero con OpenAI:', error);
      return "Error al generar el resumen ejecutivo financiero. Por favor, revise los datos del dashboard financiero.";
    }
  }
};

export default OpenAIService;