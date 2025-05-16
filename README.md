# Dashboard para Monitoreo y Análisis de Red

## Descripción del Proyecto
Este repositorio contiene el **Dashboard para Monitoreo y Análisis de Red**, una solución integral para consolidar datos de PRTG y Observium, presentar información clave según el perfil del usuario (técnico o ejecutivo) y facilitar la toma de decisiones estratégicas y operativas.

## Características Principales
- **Visualización Dual**: Interfaces específicas para perfiles técnicos y ejecutivos
- **Integración de Datos**: Consolidación de información desde PRTG y Observium
- **Monitoreo en Tiempo Real**: Seguimiento de métricas críticas de red
- **Sistema de Alertas**: Notificaciones sobre incidentes y anomalías
- **Clasificación Automática**: Identificación de sitios críticos
- **Generación de Reportes**: Informes personalizados según necesidades

## Tecnologías Utilizadas
- **Frontend**: [Next.js](https://nextjs.org/) (v15.3) con [React](https://react.dev/) (v19.0)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) (v4.0)
- **Gráficos**: [Recharts](https://recharts.org/) (v2.15)
- **Iconos**: [Font Awesome](https://fontawesome.com/)
- **Base de Datos**: [Prisma ORM](https://www.prisma.io/) (en implementación)
- **Tipado**: [TypeScript](https://www.typescriptlang.org/) (v5.0)

## Estructura del Proyecto
```
dashboard-redes/
├── app/                    # Páginas y rutas de la aplicación
│   ├── monitoreo-tecnico/  # Vista para perfil técnico
│   └── page.tsx            # Página principal
├── components/             # Componentes reutilizables
├── lib/                    # Utilidades y funciones auxiliares
├── prisma/                 # Esquema y configuración de la base de datos
└── public/                 # Archivos estáticos
```

## Requisitos Previos
- Node.js 18.0 o superior
- npm 9.0 o superior

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-organizacion/dashboard-redes.git
   cd dashboard-redes
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env` basado en `.env.example`
   - Configura las credenciales para PRTG y Observium

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

### Dashboard Técnico
Accede a la vista técnica en [http://localhost:3000/monitoreo-tecnico](http://localhost:3000/monitoreo-tecnico)

### Dashboard Ejecutivo
Accede a la vista ejecutiva en [http://localhost:3000/ejecutivo](http://localhost:3000/ejecutivo) (en desarrollo)

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo con Turbopack
- `npm run build` - Compila la aplicación para producción
- `npm run start` - Inicia la aplicación compilada
- `npm run lint` - Ejecuta el linter para verificar el código

## Estado del Desarrollo
- ✅ Configuración inicial del proyecto
- ✅ Estructura base de la aplicación
- ✅ Implementación de la vista ejecutiva (HU-01)
  - Creación de dashboard con información general sobre consumo y saturación por plaza
  - Visualización de tendencias de crecimiento histórico
  - Identificación visual de plazas críticas 
- ✅ Implementación de la vista de monitoreo técnico (HU-02)
  - Consulta detallada por plaza y sitio individual
  - Visualización de capacidad y consumo actual por enlace
  - Histórico de utilización para análisis de tendencias
- 🔄 Integración con APIs de PRTG y Observium
- 🔜 Sistema de alertas por umbral de capacidad (HU-03)
- 🔜 Clasificación automática de sitios críticos (HU-04)
- 🔜 Acceso a información en dos capas (HU-05)
- 🔜 Consumo de datos desde fuentes externas (HU-06)
- 🔜 Reportes automáticos (HU-07)
- 🔜 Propuesta de nuevos indicadores (HU-08)

## Historias de Usuario Implementadas

### HU-01: Visualización Ejecutiva del Estado de la Red
**Descripción:**
Como director del área técnica o ejecutiva, quiero visualizar un dashboard resumido con información general sobre el consumo, saturaciones, crecimiento y fallas críticas de la red, para tomar decisiones estratégicas informadas.

**Implementación:**
- Dashboard principal con visualización global de la red
- Gráficos de consumo total por plaza
- Indicadores visuales para plazas con saturación crítica
- Tendencias de crecimiento con análisis temporal
- Listado de sitios críticos por saturación y fallas

### HU-02: Monitoreo Técnico Detallado
**Descripción:**
Como ingeniero o técnico de soporte, quiero consultar información detallada por plaza o nodo específico, para diagnosticar saturaciones, problemas técnicos y planear mejoras técnicas específicas.

**Implementación:**
- Vista detallada con filtrado por plaza y sitio individual
- Tablas de capacidad y consumo actual por enlace
- Indicadores de umbrales de saturación
- Gráficos de utilización histórica para análisis de tendencias
- Detalle técnico de enlaces con información de latencia y estado

## Próximos Pasos
1. Implementar el sistema de alertas por umbral de capacidad (HU-03)
2. Desarrollar la clasificación automática de sitios críticos (HU-04)
3. Implementar el sistema de autenticación y roles
4. Integrar completamente las APIs de PRTG y Observium
5. Desarrollar el módulo de alertas
6. Implementar la clasificación automática de sitios
7. Crear el sistema de generación de reportes

## Contribución
Las contribuciones son bienvenidas. Por favor, sigue estos pasos:
1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia
Este proyecto está licenciado bajo [MIT License](LICENSE).
