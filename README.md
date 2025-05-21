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
- **Arquitectura Limpia**: Implementación de Clean Architecture para mejor mantenibilidad y escalabilidad

## Tecnologías Utilizadas
- **Frontend**: [Next.js](https://nextjs.org/) con [React](https://react.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Arquitectura**: Clean Architecture
- **Base de Datos**: [Prisma ORM](https://www.prisma.io/) (en implementación)
- **Tipado**: [TypeScript](https://www.typescriptlang.org/)

## Arquitectura del Proyecto

El proyecto sigue los principios de Clean Architecture, organizando el código en capas concéntricas con dependencias que apuntan hacia el interior:

```
dashboard-redes/               ← Next.js (TypeScript) project root
│
├── app/                       ← UI layer using Next.js App Router
│   ├── (executive)/           ← HU-01 – Executive view
│   │   └── page.tsx
│   ├── (technical)/           ← HU-02 – Detailed technical view
│   │   └── page.tsx
│   ├── _components/           ← Reusable UI components (buttons, cards, Recharts graphs, etc.)
│   └── layout.tsx             ← Common shell (sidebar, navbar)
│
├── lib/                       ← Core application code
│   ├── bff/                   ← Facade API consumed by the UI
│   │   ├── overview.ts        ← /api/overview    (HU-01)
│   │   ├── sites.ts           ← /api/sites       (HU-02)
│   │   ├── alerts.ts          ← /api/alerts      (HU-03)
│   │   └── ranking.ts         ← /api/ranking     (HU-04)
│   │
│   ├── domain/                ← Pure business logic
│   │   ├── entities.ts        ← Core types (Site, Link, Alert...)
│   │   ├── thresholds.ts      ← "isOverThreshold" logic
│   │   └── ranking.ts         ← top-N critical sites logic
│   │
│   ├── adapters/              ← External ports (HTTP)
│   │   ├── PrtgApiAdapter.ts
│   │   └── ObserviumApiAdapter.ts
│   │
│   ├── repositories/          ← Internal data access
│   │   ├── MetricsRepo.ts     ← Redis/Prisma read/write operations
│   │   └── AlertsRepo.ts
│   │
│   ├── jobs/                  ← Scheduled tasks (Vercel Cron or node-cron)
│   │   ├── fetch-prtg.ts
│   │   ├── fetch-observium.ts
│   │   └── compute-ranking.ts
│   │
│   ├── config/                ← Constants, Zod schemas, env parser
│   │   └── index.ts
│   │
│   └── utils/                 ← Common helpers (logger, HTTP client)
│
├── prisma/                    ← Schema for Users/Roles only
│   └── schema.prisma
│
├── tests/                     ← Jest + Supertest + Playwright
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/                    ← Static assets (logos, favicon)
├── .env.example               ← Environment variables (PRTG & Observium credentials)
└── README.md
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
Accede a la vista técnica en [http://localhost:3000/technical](http://localhost:3000/technical)

### Dashboard Ejecutivo
Accede a la vista ejecutiva en [http://localhost:3000/](http://localhost:3000/)

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run start` - Inicia la aplicación compilada
- `npm run lint` - Ejecuta el linter para verificar el código

## Principios de Clean Architecture

El proyecto implementa los principios de Clean Architecture para lograr un código más mantenible, testeable y escalable:

### 1. Independencia de Frameworks
- La lógica de negocio (domain) no depende de ningún framework externo
- Las entidades y reglas de negocio son independientes de la UI y la base de datos

### 2. Separación de Capas
- **Domain Layer**: Contiene las entidades y reglas de negocio puras
- **Repository Layer**: Maneja el acceso a datos
- **Adapter Layer**: Adapta sistemas externos a nuestro modelo de dominio
- **BFF Layer**: Actúa como fachada entre la UI y la lógica de negocio
- **API Routes Layer**: Expone endpoints HTTP para la UI
- **UI Layer**: Implementa la interfaz de usuario

### 3. Flujo de Dependencias
Las dependencias siempre apuntan hacia el interior:
- La UI depende de las API Routes
- Las API Routes dependen del BFF
- El BFF depende del Domain y Repositories
- Los Repositories dependen del Domain
- El Domain no depende de ninguna otra capa

### 4. Inversión de Dependencias
Se utilizan interfaces para desacoplar las implementaciones concretas, permitiendo:
- Cambiar la fuente de datos sin afectar la lógica de negocio
- Sustituir servicios externos sin modificar el código que los consume
- Facilitar las pruebas unitarias mediante mocks

## Beneficios de Clean Architecture

La implementación de Clean Architecture en este proyecto proporciona los siguientes beneficios:

### Mantenibilidad
- **Código más legible**: Cada componente tiene una responsabilidad clara y bien definida
- **Cambios localizados**: Las modificaciones afectan solo a una capa específica
- **Menor acoplamiento**: Las dependencias están controladas y fluyen hacia el interior

### Testabilidad
- **Pruebas unitarias simplificadas**: La lógica de negocio puede probarse de forma aislada
- **Mocking facilitado**: Las interfaces permiten sustituir implementaciones reales por mocks
- **Mayor cobertura**: Es más fácil probar todos los escenarios posibles

### Escalabilidad
- **Crecimiento orgánico**: Nuevas funcionalidades se integran siguiendo los mismos principios
- **Rendimiento optimizado**: Separación clara entre operaciones síncronas y asíncronas
- **Paralelización del desarrollo**: Diferentes equipos pueden trabajar en diferentes capas

### Adaptabilidad
- **Cambio de frameworks**: La UI o la base de datos pueden cambiarse sin afectar la lógica de negocio
- **Evolución tecnológica**: Facilita la adopción de nuevas tecnologías y patrones
- **Integración con sistemas externos**: Los adaptadores aíslan el impacto de cambios en APIs externas

## Estado del Desarrollo
- ✅ Configuración inicial del proyecto
- ✅ Estructura base de la aplicación
- ✅ Refactorización a Clean Architecture
  - Separación en capas (Domain, Repository, BFF, API, UI)
  - Implementación de patrones de diseño
  - Mejora de la mantenibilidad y testabilidad
- ✅ Implementación de la vista ejecutiva (HU-01)
  - Creación de dashboard con información general sobre consumo y saturación por plaza
  - Visualización de tendencias de crecimiento histórico
  - Identificación visual de plazas críticas
- ✅ Implementación de la vista de monitoreo técnico (HU-02)
  - Consulta detallada por plaza y sitio individual
  - Visualización de capacidad y consumo actual por enlace
  - Histórico de utilización para análisis de tendencias
- 🔄 Integración con APIs de PRTG y Observium
  - Adaptadores implementados (estructura)
  - Pendiente conexión real con APIs externas
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
- Implementado siguiendo Clean Architecture (BFF, API Routes, UI Components)

### HU-02: Monitoreo Técnico Detallado
**Descripción:**
Como ingeniero o técnico de soporte, quiero consultar información detallada por plaza o nodo específico, para diagnosticar saturaciones, problemas técnicos y planear mejoras técnicas específicas.

**Implementación:**
- Vista detallada con filtrado por plaza y sitio individual
- Tablas de capacidad y consumo actual por enlace
- Indicadores de umbrales de saturación
- Gráficos de utilización histórica para análisis de tendencias
- Detalle técnico de enlaces con información de latencia y estado
- Implementado siguiendo Clean Architecture (Domain, Repository, BFF, API Routes, UI)

## Próximos Pasos
1. Implementar el sistema de alertas por umbral de capacidad (HU-03)
   - Crear entidades y reglas de negocio en el Domain Layer
   - Implementar repositorio de alertas
   - Desarrollar BFF y API Routes para alertas
   - Crear componentes UI para visualización de alertas
2. Desarrollar la clasificación automática de sitios críticos (HU-04)
   - Implementar algoritmos de ranking en el Domain Layer
   - Crear BFF y API Routes para ranking
   - Desarrollar componentes UI para visualización de sitios críticos
3. Implementar persistencia de datos
   - Configurar Prisma ORM
   - Implementar repositorios con acceso a base de datos
   - Mantener la arquitectura limpia con inversión de dependencias
4. Integrar completamente las APIs de PRTG y Observium
   - Completar implementación de adaptadores
   - Implementar jobs para sincronización periódica
5. Implementar sistema de autenticación y autorización
   - Crear middleware de autenticación
   - Implementar control de acceso basado en roles

## Contribución
Las contribuciones son bienvenidas. Por favor, sigue estos pasos:
1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia
Este proyecto está licenciado bajo [MIT License](LICENSE).
