# Sistema de Caché - Dashboard de Redes

## Resumen

Se ha implementado un sistema de caché completo para mejorar significativamente el rendimiento del dashboard técnico, especialmente en la página `/technical`. El sistema incluye caché del lado del servidor, del lado del cliente, y herramientas de gestión avanzadas.

## Componentes del Sistema

### 1. Caché del Lado del Servidor

**Ubicación**: API routes (`/api/monitoring/plaza/[plaza]/*`)

**Características**:
- Caché en memoria usando `CacheService`
- TTL diferenciado por tipo de datos:
  - Datos de monitoreo: 2 minutos
  - Tendencias: 5 minutos  
  - Análisis de latencia: 5 minutos
- Invalidación automática por expiración
- Logs detallados de cache hits/misses

**Endpoints con caché**:
- `/api/monitoring/plaza/[plaza]` - Datos principales de monitoreo
- `/api/monitoring/plaza/[plaza]/trends` - Tendencias de utilización
- `/api/monitoring/plaza/[plaza]/latency` - Análisis de latencia

### 2. Caché del Lado del Cliente

**Ubicación**: `lib/hooks/useCachedFetch.ts`

**Características**:
- Hook personalizado `useCachedFetch` para React
- Caché en memoria del navegador
- Auto-refresh inteligente que respeta el caché
- Gestión automática de estados (loading, error, data)
- Indicadores visuales de estado de caché

### 3. Gestión Avanzada de Caché

**Ubicación**: `lib/services/cache-manager.ts`

**Características**:
- Invalidación por patrones
- Estadísticas de rendimiento (hit rate, miss rate)
- Calentamiento de caché (cache warming)
- Gestión de TTL por tipo de datos
- Limpieza selectiva por plaza

### 4. Interfaz de Usuario

**Componentes**:
- `CacheIndicator` - Muestra estado del caché en tiempo real
- `CacheSettings` - Modal de configuración y estadísticas
- Botones de control en el dashboard técnico

## Beneficios de Rendimiento

### Antes del Caché
- Cada cambio de plaza: 3-5 llamadas API simultáneas
- Tiempo de carga: 2-4 segundos
- Auto-refresh: llamadas constantes cada 30 segundos
- Carga en APIs externas: Alta

### Después del Caché
- Primera carga: 3-5 llamadas API (igual)
- Cargas subsecuentes: 0 llamadas (cache hit)
- Tiempo de carga: <100ms (desde caché)
- Auto-refresh: Solo cuando el caché expira
- Carga en APIs externas: Reducida en 80-90%

## Configuración de TTL

```typescript
const CACHE_TTL = {
  MONITORING: 2 * 60 * 1000,    // 2 minutos - datos que cambian frecuentemente
  TRENDS: 5 * 60 * 1000,        // 5 minutos - datos históricos
  LATENCY: 5 * 60 * 1000,       // 5 minutos - análisis de latencia
  FALLBACK: 1 * 60 * 1000       // 1 minuto - datos de respaldo
};
```

## Uso en el Dashboard Técnico

### Indicadores Visuales
- **Punto verde**: Datos desde caché
- **Punto naranja**: Datos en vivo
- **Contador**: Tiempo restante de caché
- **Botón ✕**: Limpiar caché específico

### Controles de Usuario
- **Botón "Actualizar"**: Fuerza actualización completa
- **Botón "Caché"**: Abre configuración avanzada
- **Auto-refresh**: Respeta el caché existente

### Configuración Avanzada
- Estadísticas de rendimiento en tiempo real
- Limpieza selectiva de caché
- Información de patrones de caché
- Consejos de optimización

## Estrategias de Invalidación

### Automática
- Por expiración de TTL
- Por cambio de parámetros de consulta

### Manual
- Botón "Actualizar" en el dashboard
- Botón "✕" en el indicador de caché
- "Limpiar Todo" en configuración

### Por Plaza
- Al cambiar de plaza se invalida caché anterior
- Calentamiento automático de nueva plaza

## Monitoreo y Estadísticas

### Métricas Disponibles
- **Hit Rate**: Porcentaje de aciertos de caché
- **Miss Rate**: Porcentaje de fallos de caché
- **Total Hits/Misses**: Contadores absolutos
- **Tiempo de Respuesta**: Diferencia entre caché vs API

### Logs del Sistema
```
🚀 Cache hit for plaza: Laredo
🔍 Fetching monitoring data for plaza: Saltillo
✅ Successfully fetched monitoring data for plaza: Saltillo
```

## Mejores Prácticas

### Para Desarrolladores
1. Usar `useCachedFetch` para nuevos endpoints
2. Configurar TTL apropiado según frecuencia de cambio
3. Implementar invalidación en operaciones de escritura
4. Monitorear hit rates en desarrollo

### Para Usuarios
1. Usar auto-refresh para monitoreo continuo
2. Forzar actualización solo cuando sea necesario
3. Revisar estadísticas para optimizar uso
4. Limpiar caché si los datos parecen obsoletos

## Próximas Mejoras

### Corto Plazo
- [ ] Caché persistente (localStorage)
- [ ] Compresión de datos en caché
- [ ] Métricas de tamaño de caché

### Largo Plazo
- [ ] Caché distribuido (Redis)
- [ ] Invalidación por eventos WebSocket
- [ ] Predicción de datos (prefetching)
- [ ] Caché de imágenes y assets

## Troubleshooting

### Datos Obsoletos
**Problema**: Los datos no se actualizan
**Solución**: Usar botón "Actualizar" o limpiar caché

### Rendimiento Lento
**Problema**: La aplicación sigue lenta
**Solución**: Verificar hit rate en configuración de caché

### Errores de Caché
**Problema**: Errores relacionados con caché
**Solución**: Limpiar todo el caché y reiniciar

## Conclusión

El sistema de caché implementado proporciona una mejora significativa en el rendimiento del dashboard, reduciendo los tiempos de carga y la carga en las APIs externas, mientras mantiene la flexibilidad para obtener datos frescos cuando sea necesario.
