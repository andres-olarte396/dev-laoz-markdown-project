# L4OZ Learning Platform

> **Plataforma LMS moderna para cursos técnicos con soporte de audio, evaluaciones y seguimiento de progreso**

[![Status](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com)
[![Progress](https://img.shields.io/badge/progress-60%25-blue)](./docs/FINAL_SUMMARY.md)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE.txt)

## 🎯 Descripción

L4OZ Learning Platform es un **Learning Management System (LMS)** diseñado específicamente para cursos técnicos del ecosistema **teach-laoz**. Permite a los usuarios:

- � **VER** contenido en Markdown con renderizado avanzado
- 🎧 **ESCUCHAR** audio sincronizado con el contenido
- 🧭 **NAVEGAR** entre módulos y temas de forma intuitiva
- ✅ **EVALUAR** conocimientos con cuestionarios interactivos
- 📊 **RASTREAR** progreso y obtener certificados

## � Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm 9+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/andres-olarte396/dev-laoz-markdown-project.git
cd dev-laoz-markdown-project

# Instalar dependencias
npm install

# Inicializar base de datos
npm run db:init

# Iniciar servidor
npm start
```

El servidor estará disponible en `http://localhost:7000`

### Endpoints Principales

- **Health Check:** `http://localhost:7000/api/health`
- **Cursos:** `http://localhost:7000/api/courses`
- **Estructura:** `http://localhost:7000/api/courses/:id/structure`
- **Contenido:** `http://localhost:7000/api/content/:topicId`

## � Estructura del Proyecto

```
dev-laoz-markdown-project/
├── db/                          # Base de datos SQLite
│   └── schema.sql              # Esquema de BD
├── docs/                        # 📚 Documentación completa
│   ├── README.md               # Índice de documentación
│   ├── FINAL_SUMMARY.md        # Resumen del proyecto
│   ├── REQUIREMENTS_*.md       # Requerimientos
│   └── IMPLEMENTATION_*.md     # Plan de implementación
├── logs/                        # Logs de la aplicación
├── public/
│   └── content/                # Cursos en formato Markdown
│       └── teach-laoz-*/       # Cursos teach-laoz
├── scripts/
│   ├── initDatabase.js         # Inicialización de BD
│   └── utils/                  # Scripts de utilidad
├── src/
│   ├── controllers/            # Controladores de API
│   ├── middleware/             # Middleware Express
│   ├── routes/                 # Rutas de API
│   ├── services/               # Lógica de negocio
│   ├── utils/                  # Utilidades
│   └── views/                  # Frontend (HTML/CSS/JS)
├── package.json
├── server.js                   # Servidor principal
└── README.md                   # Este archivo
```

## 📚 Documentación

La documentación completa está en el directorio [`docs/`](./docs/):

- **[Resumen Final](./docs/FINAL_SUMMARY.md)** - Estado actual y próximos pasos
- **[Requerimientos](./docs/REQUIREMENTS_TEACH_LAOZ_INTEGRATION.md)** - Especificaciones completas
- **[Plan de Implementación](./docs/IMPLEMENTATION_PLAN_TEACH_LAOZ.md)** - Roadmap detallado
- **[Estado de Implementación](./docs/IMPLEMENTATION_STATUS.md)** - Progreso actual

## 🎨 Características

### Implementadas ✅

- ✅ Arquitectura backend moderna (MVC)
- ✅ Base de datos SQLite con 10 tablas
- ✅ API REST con 15 endpoints
- ✅ Sistema de logging profesional
- ✅ Detección automática de cursos
- ✅ Health check y monitoreo

### En Desarrollo ⏳

- ⏳ Sistema de cursos (85%)
- ⏳ Persistencia de módulos y temas
- ⏳ Frontend Vue.js
- ⏳ Reproductor de audio

### Planificadas 📋

- 📋 Sistema de evaluaciones
- 📋 Seguimiento de progreso
- 📋 Dashboard de usuario
- 📋 Certificados de finalización

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start              # Iniciar servidor
npm run dev            # Modo desarrollo (con nodemon)

# Base de datos
npm run db:init        # Inicializar/reinicializar BD
npm run db:migrate     # Ejecutar migraciones

# Utilidades
node scripts/utils/check-db-json.js    # Verificar estado de BD
```

## 🛠️ Stack Tecnológico

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Base de Datos:** SQLite (sqlite3)
- **Logging:** Winston
- **Markdown:** Marked + Highlight.js

### Frontend (Planificado)

- **Framework:** Vue.js 3
- **Router:** Vue Router 4
- **State:** Pinia
- **Build:** Vite

## 📊 Estado del Proyecto

| Componente | Progreso |
|------------|----------|
| Backend Architecture | ![100%](https://progress-bar.dev/100) |
| Database Schema | ![100%](https://progress-bar.dev/100) |
| API REST | ![100%](https://progress-bar.dev/100) |
| Course System | ![85%](https://progress-bar.dev/85) |
| Frontend | ![0%](https://progress-bar.dev/0) |
| Audio System | ![0%](https://progress-bar.dev/0) |

**Progreso Global:** ![60%](https://progress-bar.dev/60)

## 🐛 Issues Conocidos

1. **Módulos no se persisten en BD** (Prioridad: Alta)
   - Estado: Investigando
   - Solución propuesta en [FINAL_SUMMARY.md](./docs/FINAL_SUMMARY.md)

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Para contribuir:

1. Lee la [documentación completa](./docs/)
2. Revisa el [plan de implementación](./docs/IMPLEMENTATION_PLAN_TEACH_LAOZ.md)
3. Verifica los [issues conocidos](./docs/FINAL_SUMMARY.md#-problema-pendiente)

## 📄 Licencia

MIT License - Ver [LICENSE.txt](./LICENSE.txt) para más detalles

## 👤 Autor

**Andrés Olarte**

- GitHub: [@andres-olarte396](https://github.com/andres-olarte396)

---

## � Enlaces Relacionados

- [Ecosistema teach-laoz](../teach-laoz/)
- [Documentación del Proyecto](./docs/)
- [Plan de Implementación](./docs/IMPLEMENTATION_PLAN_TEACH_LAOZ.md)

---

**Última Actualización:** 2025-12-07  
**Versión:** 2.0.0  
**Estado:** En Desarrollo Activo 🚀
