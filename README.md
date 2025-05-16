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
- 🔄 Implementación de la vista de monitoreo técnico
- 🔄 Integración con APIs de PRTG y Observium
- 🔜 Desarrollo de la vista ejecutiva
- 🔜 Sistema de alertas
- 🔜 Clasificación automática de sitios críticos
- 🔜 Generación de reportes

## Próximos Pasos
1. Completar la implementación de la vista de monitoreo técnico
2. Desarrollar la vista ejecutiva
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
