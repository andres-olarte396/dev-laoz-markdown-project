# 📚 Índice de Documentación - LMS Teach Laoz

Bienvenido a la documentación de la Plataforma LMS Teach Laoz. Esta guía te ayudará a encontrar rápidamente la información que necesitas.

---

## 🚀 Inicio Rápido

| Documento | Descripción |
|-----------|-------------|
| [QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md) | **Inicio rápido con Docker** - Despliega en 3 pasos |
| [README.md](./README.md) | **Documentación principal** - Visión general del proyecto |
| [UPDATES.md](./UPDATES.md) | **Actualizaciones recientes** - Nuevas funcionalidades v2.1.0 |

---

## 🐳 Docker

| Documento | Descripción |
|-----------|-------------|
| [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) | **Guía completa de Docker** - Despliegue, gestión y troubleshooting |
| [QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md) | **Inicio rápido** - Comandos esenciales |
| `Dockerfile` | Definición de imagen Docker |
| `docker-compose.yml` | Configuración de servicios |
| `deploy.ps1` | Script automatizado de despliegue |

---

## 📖 Historial y Cambios

| Documento | Descripción |
|-----------|-------------|
| [CHANGELOG.md](./CHANGELOG.md) | **Historial completo** - Todos los cambios v2.1.0 |
| [UPDATES.md](./UPDATES.md) | **Resumen ejecutivo** - Nuevas funcionalidades |

---

## 🎓 Cursos

| Documento | Descripción |
|-----------|-------------|
| [public/content/teach-laoz-curso-dibujo-ninos/INTEGRACION_PLATAFORMA.md](./public/content/teach-laoz-curso-dibujo-ninos/INTEGRACION_PLATAFORMA.md) | **Integración curso de dibujo** - Guía completa |
| `public/content/teach-laoz-curso-dibujo-ninos/course.json` | Metadata del curso de dibujo |

---

## 🏗️ Arquitectura y Desarrollo

| Documento | Ubicación |
|-----------|-----------|
| **Esquema de Base de Datos** | `db/schema.sql` |
| **Documentación Técnica** | `docs/` |
| **Resumen Final** | `docs/FINAL_SUMMARY.md` |
| **Requerimientos** | `docs/REQUIREMENTS_*.md` |
| **Plan de Implementación** | `docs/IMPLEMENTATION_*.md` |

---

## 🔧 Scripts y Utilidades

### Scripts de Despliegue

```powershell
# Docker
.\deploy.ps1 start    # Iniciar
.\deploy.ps1 stop     # Detener
.\deploy.ps1 status   # Ver estado
.\deploy.ps1 logs     # Ver logs
.\deploy.ps1 rebuild  # Reconstruir
.\deploy.ps1 ip       # Obtener IP local
```

### Scripts de Desarrollo

```bash
# Servidor
npm start              # Iniciar servidor
npm run dev            # Modo desarrollo

# Base de datos
npm run db:init        # Inicializar BD
npm run db:migrate     # Ejecutar migraciones
```

---

## 📊 Estructura de Archivos

```
dev-laoz-markdown-project/
├── 📄 README.md                    ← Documentación principal
├── 📄 UPDATES.md                   ← Actualizaciones v2.1.0
├── 📄 CHANGELOG.md                 ← Historial completo
├── 📄 QUICK_START_DOCKER.md        ← Inicio rápido Docker
├── 📄 DOCKER_DEPLOYMENT.md         ← Guía completa Docker
├── 📄 DOC_INDEX.md                 ← Este archivo
│
├── 🐳 Docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .dockerignore
│   └── deploy.ps1
│
├── 📁 db/                          ← Base de datos
│   ├── courses.db
│   └── schema.sql
│
├── 📁 docs/                        ← Documentación técnica
│   ├── README.md
│   ├── FINAL_SUMMARY.md
│   ├── REQUIREMENTS_*.md
│   └── IMPLEMENTATION_*.md
│
├── 📁 public/
│   └── content/                    ← Cursos
│       ├── teach-laoz-curso-dibujo-ninos/
│       │   ├── course.json
│       │   ├── INTEGRACION_PLATAFORMA.md
│       │   └── modulos/
│       └── teach-laoz-*/
│
├── 📁 src/                         ← Código fuente
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── views/
│
├── 📁 scripts/                     ← Scripts de utilidad
│   ├── initDatabase.js
│   └── utils/
│
└── 📁 logs/                        ← Logs de aplicación
```

---

## 🎯 Guías por Caso de Uso

### Quiero desplegar la aplicación

1. **Con Docker (Recomendado):**
   - Lee: [QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md)
   - Ejecuta: `.\deploy.ps1 start`

2. **Sin Docker:**
   - Lee: [README.md](./README.md) sección "Instalación"
   - Ejecuta: `npm install && npm run db:init && npm start`

### Quiero acceder desde mi red local

1. Lee: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) sección "Acceso desde la Red Local"
2. Ejecuta: `.\deploy.ps1 ip`
3. Configura firewall si es necesario

### Quiero agregar un nuevo curso

1. Lee: [public/content/teach-laoz-curso-dibujo-ninos/INTEGRACION_PLATAFORMA.md](./public/content/teach-laoz-curso-dibujo-ninos/INTEGRACION_PLATAFORMA.md)
2. Crea estructura de directorios
3. Crea `course.json`
4. Re-escanea: `POST /api/courses/scan`

### Quiero ver qué cambió recientemente

1. Lee: [UPDATES.md](./UPDATES.md) para resumen ejecutivo
2. Lee: [CHANGELOG.md](./CHANGELOG.md) para detalles técnicos

### Quiero solucionar un problema

1. Lee: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) sección "Solución de Problemas"
2. Verifica logs: `.\deploy.ps1 logs`
3. Verifica health: `http://localhost:7000/api/health`

---

## 🔗 Enlaces Rápidos

### API Endpoints

- **Aplicación:** <http://localhost:7000/app>
- **Health Check:** <http://localhost:7000/api/health>
- **Cursos:** <http://localhost:7000/api/courses>
- **Escanear:** <http://localhost:7000/api/courses/scan> (POST)

### Repositorio

- **GitHub:** <https://github.com/andres-olarte396/dev-laoz-markdown-project>

---

## 📞 Soporte

Para obtener ayuda:

1. **Consulta la documentación** relevante arriba
2. **Verifica los logs:** `.\deploy.ps1 logs`
3. **Revisa el health check:** `http://localhost:7000/api/health`
4. **Consulta troubleshooting:** [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

---

## 📝 Notas

- Todos los archivos `.md` están en formato Markdown
- Los scripts `.ps1` son para PowerShell (Windows)
- La documentación se actualiza con cada versión

---

**Última Actualización:** 10 de Diciembre de 2025  
**Versión:** 2.1.0  
**Mantenido por:** Andrés Olarte
