# Plan de Implementación: Integración teach-laoz con dev-laoz-markdown-project

## 📋 Información General

**Proyecto:** dev-laoz-markdown-project → L4OZ Learning Platform  
**Objetivo:** Transformar el visualizador de Markdown en una plataforma LMS completa  
**Duración Estimada:** 8-10 semanas  
**Metodología:** Desarrollo iterativo en fases (MVP → Mejoras → Optimización)

---

## 🎯 Fases del Proyecto

### **FASE 1: Fundamentos y MVP (Semanas 1-3)**

#### Objetivo

Crear la base funcional que permita visualizar cursos, navegar entre módulos y reproducir audio.

---

### **Sprint 1.1: Refactorización de Arquitectura (Semana 1)**

#### Tareas

**1.1.1 Reestructurar Backend**

- [ ] Crear estructura modular de servicios:

  ```
  src/
  ├── controllers/
  │   ├── courseController.js
  │   ├── contentController.js
  │   └── progressController.js
  ├── services/
  │   ├── courseService.js
  │   ├── fileService.js
  │   └── audioService.js
  ├── models/
  │   ├── Course.js
  │   ├── Module.js
  │   └── Progress.js
  ├── routes/
  │   ├── api.js
  │   └── content.js
  └── middleware/
      ├── errorHandler.js
      └── validator.js
  ```

**1.1.2 Implementar API REST**

- [ ] `GET /api/courses` - Listar cursos disponibles
- [ ] `GET /api/courses/:courseId/structure` - Estructura del curso
- [ ] `GET /api/courses/:courseId/content/:path` - Contenido Markdown
- [ ] `GET /api/courses/:courseId/audio/:path` - Archivo de audio
- [ ] Implementar manejo de errores centralizado
- [ ] Agregar validación de parámetros

**1.1.3 Configurar Base de Datos**

- [ ] Instalar SQLite: `npm install sqlite3 better-sqlite3`
- [ ] Crear esquema de base de datos (`db/schema.sql`)
- [ ] Implementar servicio de base de datos (`services/dbService.js`)
- [ ] Crear migraciones iniciales

**Entregables:**

- ✅ API REST funcional
- ✅ Base de datos SQLite configurada
- ✅ Documentación de endpoints (Postman/Swagger)

---

### **Sprint 1.2: Sistema de Cursos (Semana 2)**

#### Tareas

**1.2.1 Servicio de Detección de Cursos**

- [ ] Implementar `courseService.scanCourses()`:
  - Escanear `public/content/teach-laoz-*`
  - Leer metadata desde `README.md` o `course.json`
  - Generar estructura de módulos y temas
- [ ] Crear caché de estructura de cursos
- [ ] Implementar hot-reload al detectar cambios

**1.2.2 Parser de Estructura de Cursos**

- [ ] Leer `INDICE.md` para generar navegación
- [ ] Detectar módulos y temas automáticamente
- [ ] Asociar archivos de audio con contenido:

  ```javascript
  // Ejemplo de convención
  modulo1/contenido.md → modulo1/audio/contenido.mp3
  ```

- [ ] Validar integridad de la estructura

**1.2.3 Modelo de Datos**

- [ ] Crear clase `Course`:

  ```javascript
  class Course {
    constructor(id, title, description, modules) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.modules = modules; // Array de Module
    }
  }
  ```

- [ ] Crear clase `Module` con temas y evaluaciones
- [ ] Implementar serialización JSON

**Entregables:**

- ✅ Detección automática de cursos
- ✅ Estructura de datos normalizada
- ✅ API devolviendo lista de cursos

---

### **Sprint 1.3: Frontend Básico (Semana 3)**

#### Tareas

**1.3.1 Configurar Framework Frontend**

- [ ] Decidir: Vue.js 3 o React (Recomendación: Vue.js por simplicidad)
- [ ] Instalar dependencias:

  ```bash
  npm install vue@next vue-router@4 pinia
  npm install marked highlight.js mermaid
  ```

- [ ] Configurar Vite para desarrollo rápido
- [ ] Crear estructura de componentes

**1.3.2 Componentes Principales**

- [ ] `CourseSelector.vue` - Catálogo de cursos
- [ ] `CourseViewer.vue` - Contenedor principal
- [ ] `NavigationMenu.vue` - Menú lateral jerárquico
- [ ] `ContentRenderer.vue` - Renderizador de Markdown
- [ ] `AudioPlayer.vue` - Reproductor de audio

**1.3.3 Renderizado de Markdown**

- [ ] Configurar `marked` con opciones:

  ```javascript
  import { marked } from 'marked';
  import hljs from 'highlight.js';
  
  marked.setOptions({
    highlight: (code, lang) => {
      return hljs.highlight(code, { language: lang }).value;
    },
    gfm: true,
    breaks: true
  });
  ```

- [ ] Integrar Mermaid para diagramas
- [ ] Sanitizar HTML para prevenir XSS

**1.3.4 Navegación**

- [ ] Implementar menú lateral con árbol de módulos
- [ ] Breadcrumb dinámico
- [ ] Botones "Anterior/Siguiente"
- [ ] Persistir estado de menú (expandido/colapsado)

**Entregables:**

- ✅ Interfaz funcional para seleccionar cursos
- ✅ Visualización de contenido Markdown
- ✅ Navegación entre temas

---

### **FASE 2: Funcionalidades Avanzadas (Semanas 4-6)**

---

### **Sprint 2.1: Sistema de Audio (Semana 4)**

#### Tareas

**2.1.1 Reproductor de Audio**

- [ ] Crear componente `AudioPlayer.vue` con controles:
  - Play/Pause
  - Barra de progreso con seek
  - Control de velocidad (0.5x - 2x)
  - Control de volumen
  - Botón de descarga
- [ ] Implementar atajos de teclado:
  - `Espacio`: Play/Pause
  - `←/→`: Retroceder/Avanzar 10s
  - `↑/↓`: Subir/Bajar volumen

**2.1.2 Integración Audio-Contenido**

- [ ] Detectar automáticamente archivos de audio asociados
- [ ] Mostrar reproductor solo si existe audio
- [ ] Persistir posición de reproducción en localStorage
- [ ] Implementar auto-play opcional al cambiar de tema

**2.1.3 Sincronización (Opcional - Fase Futura)**

- [ ] Definir formato de metadata para timestamps:

  ```json
  {
    "audio": "contenido.mp3",
    "timestamps": [
      { "time": 0, "paragraph": 1 },
      { "time": 45, "paragraph": 2 }
    ]
  }
  ```

- [ ] Resaltar párrafo actual durante reproducción

**Entregables:**

- ✅ Reproductor de audio funcional
- ✅ Integración con contenido de cursos
- ✅ Persistencia de posición de reproducción

---

### **Sprint 2.2: Sistema de Evaluación (Semana 5)**

#### Tareas

**2.2.1 Parser de Evaluaciones**

- [ ] Crear servicio para parsear `evaluacion.md`:

  ```javascript
  // Formato esperado en Markdown:
  ## Pregunta 1
  ¿Cuál es...?
  
  - [ ] A) Opción 1
  - [x] B) Opción correcta
  - [ ] C) Opción 3
  
  **Explicación:** Porque...
  ```

- [ ] Extraer preguntas, opciones y respuestas correctas
- [ ] Validar formato de evaluaciones

**2.2.2 Componente de Evaluación**

- [ ] `EvaluationView.vue` - Vista de evaluación
- [ ] `QuestionCard.vue` - Tarjeta de pregunta individual
- [ ] Tipos de pregunta:
  - Opción múltiple
  - Verdadero/Falso
  - Respuesta corta (validación manual)
- [ ] Temporizador opcional
- [ ] Indicador de progreso (X de Y preguntas)

**2.2.3 Calificación y Retroalimentación**

- [ ] Calcular puntaje automáticamente
- [ ] Mostrar retroalimentación inmediata:
  - ✅ Correcta (verde)
  - ❌ Incorrecta (rojo) + explicación
- [ ] Generar reporte de evaluación:

  ```javascript
  {
    score: 8,
    maxScore: 10,
    percentage: 80,
    timeSpent: 300, // segundos
    answers: [...],
    submittedAt: "2025-12-07T20:00:00Z"
  }
  ```

- [ ] Guardar resultados en base de datos

**2.2.4 API de Evaluaciones**

- [ ] `POST /api/evaluations/:id/submit` - Enviar respuestas
- [ ] `GET /api/evaluations/:id/results` - Obtener resultados
- [ ] Validación de respuestas en backend

**Entregables:**

- ✅ Sistema de evaluación funcional
- ✅ Calificación automática
- ✅ Retroalimentación con explicaciones

---

### **Sprint 2.3: Seguimiento de Progreso (Semana 6)**

#### Tareas

**2.3.1 Modelo de Progreso**

- [ ] Implementar lógica de progreso:

  ```javascript
  class Progress {
    markAsCompleted(courseId, moduleId, topicId) {
      // Guardar en DB
    }
    
    getProgress(courseId) {
      // Calcular porcentaje
    }
    
    getCourseStats(courseId) {
      return {
        totalModules: 6,
        completedModules: 3,
        totalTopics: 24,
        completedTopics: 15,
        percentage: 62.5
      };
    }
  }
  ```

**2.3.2 Indicadores Visuales**

- [ ] Marcar temas completados con ✅ en menú
- [ ] Barra de progreso por módulo
- [ ] Barra de progreso general del curso
- [ ] Botón "Marcar como completado" en cada tema

**2.3.3 Dashboard de Progreso**

- [ ] Crear `ProgressDashboard.vue`:
  - Resumen general (% completado)
  - Módulos completados
  - Evaluaciones aprobadas
  - Tiempo total de estudio
  - Gráfico de progreso (Chart.js)
- [ ] Historial de actividad reciente

**2.3.4 Persistencia**

- [ ] Guardar progreso en SQLite
- [ ] Implementar sincronización con localStorage (backup)
- [ ] API de progreso:
  - `POST /api/progress/mark-complete`
  - `GET /api/progress/:courseId`

**Entregables:**

- ✅ Sistema de seguimiento de progreso
- ✅ Dashboard con estadísticas
- ✅ Persistencia en base de datos

---

### **FASE 3: Optimización y Pulido (Semanas 7-8)**

---

### **Sprint 3.1: UX/UI Mejorado (Semana 7)**

#### Tareas

**3.1.1 Diseño Responsivo**

- [ ] Adaptar layout para móviles:
  - Menú lateral colapsable (hamburger)
  - Navegación táctil optimizada
- [ ] Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

**3.1.2 Modo Oscuro**

- [ ] Implementar toggle de tema claro/oscuro
- [ ] Persistir preferencia en localStorage
- [ ] Ajustar colores de sintaxis de código

**3.1.3 Accesibilidad**

- [ ] Navegación completa por teclado
- [ ] Atributos ARIA en componentes
- [ ] Contraste de colores (WCAG AA)
- [ ] Focus visible en elementos interactivos

**3.1.4 Mejoras de Usabilidad**

- [ ] Tabla de contenidos flotante para documentos largos
- [ ] Búsqueda de contenido (Ctrl+F mejorado)
- [ ] Marcadores/favoritos
- [ ] Ajuste de tamaño de fuente

**Entregables:**

- ✅ Diseño responsivo completo
- ✅ Modo oscuro funcional
- ✅ Cumplimiento de estándares de accesibilidad

---

### **Sprint 3.2: Rendimiento y Testing (Semana 8)**

#### Tareas

**3.2.1 Optimización de Rendimiento**

- [ ] Lazy loading de módulos no visitados
- [ ] Caché de contenido renderizado (Markdown → HTML)
- [ ] Compresión de respuestas (gzip)
- [ ] Optimización de imágenes (WebP)
- [ ] Code splitting en frontend

**3.2.2 Testing**

- [ ] Tests unitarios (Jest/Vitest):
  - Servicios de backend
  - Componentes Vue
  - Utilidades
- [ ] Tests de integración:
  - API endpoints
  - Flujo de navegación
- [ ] Tests E2E (Playwright):
  - Seleccionar curso
  - Navegar entre temas
  - Completar evaluación
  - Guardar progreso

**3.2.3 Validación con Cursos Reales**

- [ ] Probar con `teach-laoz-communication`
- [ ] Probar con `teach-laoz-security`
- [ ] Probar con `teach-laoz-curso_devops_avanzado`
- [ ] Documentar problemas encontrados
- [ ] Ajustar parser según necesidades

**Entregables:**

- ✅ Cobertura de tests > 80%
- ✅ Tiempo de carga < 3s
- ✅ Validación con 3+ cursos reales

---

### **FASE 4: Lanzamiento y Documentación (Semanas 9-10)**

---

### **Sprint 4.1: Documentación (Semana 9)**

#### Tareas

**4.1.1 Documentación de Usuario**

- [ ] Actualizar `README.md` con:
  - Nuevas funcionalidades
  - Capturas de pantalla
  - Video demo
- [ ] Crear guía de usuario (`docs/USER_GUIDE.md`)
- [ ] Crear FAQ

**4.1.2 Documentación para Autores de Cursos**

- [ ] Guía de estructura de cursos (`docs/COURSE_AUTHORING.md`):
  - Formato de archivos
  - Convenciones de nombres
  - Metadata requerida
  - Formato de evaluaciones
- [ ] Plantillas de ejemplo
- [ ] Validador de estructura de cursos

**4.1.3 Documentación Técnica**

- [ ] Documentar API (Swagger/OpenAPI)
- [ ] Diagrama de arquitectura actualizado
- [ ] Guía de contribución
- [ ] Changelog

**Entregables:**

- ✅ Documentación completa y actualizada
- ✅ Guías para usuarios y autores de cursos

---

### **Sprint 4.2: Despliegue y Monitoreo (Semana 10)**

#### Tareas

**4.2.1 Preparación para Producción**

- [ ] Configurar variables de entorno
- [ ] Optimizar build de producción
- [ ] Configurar logging (Winston/Pino)
- [ ] Implementar health check endpoint

**4.2.2 Despliegue**

- [ ] Dockerizar aplicación:

  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --production
  COPY . .
  RUN npm run build
  EXPOSE 3000
  CMD ["npm", "start"]
  ```

- [ ] Crear `docker-compose.yml`
- [ ] Documentar proceso de despliegue

**4.2.3 Integración con Ecosistema**

- [ ] Actualizar `dev-laoz-ecosystem` para incluir este proyecto
- [ ] Agregar entrada en `config/projects.json`
- [ ] Actualizar scripts de despliegue

**Entregables:**

- ✅ Aplicación desplegada y funcional
- ✅ Integración con ecosistema L4OZ
- ✅ Monitoreo básico configurado

---

## 📊 Cronograma Visual

```
Semana 1: [████████] Refactorización Backend
Semana 2: [████████] Sistema de Cursos
Semana 3: [████████] Frontend Básico
         ─────────────────────────────────
                    MVP ✅
         ─────────────────────────────────
Semana 4: [████████] Sistema de Audio
Semana 5: [████████] Sistema de Evaluación
Semana 6: [████████] Seguimiento de Progreso
Semana 7: [████████] UX/UI Mejorado
Semana 8: [████████] Rendimiento y Testing
Semana 9: [████████] Documentación
Semana 10:[████████] Despliegue
```

---

## 🛠️ Stack Tecnológico Final

### Frontend

- **Framework:** Vue.js 3 + Vite
- **Router:** Vue Router 4
- **State:** Pinia
- **Markdown:** Marked + Highlight.js
- **Diagramas:** Mermaid.js
- **Audio:** HTML5 Audio API
- **Charts:** Chart.js
- **Estilos:** CSS Modules / SCSS

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Base de Datos:** SQLite (better-sqlite3)
- **Validación:** Joi / Zod
- **Logging:** Winston

### Testing

- **Unit:** Vitest
- **E2E:** Playwright
- **Coverage:** c8

### DevOps

- **Containerización:** Docker
- **CI/CD:** GitHub Actions
- **Linting:** ESLint + Prettier

---

## 📦 Dependencias a Instalar

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "marked": "^11.0.0",
    "highlight.js": "^11.9.0",
    "vue": "^3.3.13",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "mermaid": "^10.6.1",
    "chart.js": "^4.4.1",
    "joi": "^17.11.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.10",
    "vitest": "^1.1.0",
    "@playwright/test": "^1.40.1",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

---

## 🎯 Métricas de Éxito

### MVP (Fase 1)

- ✅ 3+ cursos cargados correctamente
- ✅ Navegación fluida entre temas
- ✅ Audio reproduciéndose correctamente
- ✅ 0 errores críticos en consola

### Producto Completo (Fase 4)

- ✅ Todos los cursos de teach-laoz funcionando
- ✅ Sistema de evaluación con 90%+ precisión
- ✅ Progreso guardándose correctamente
- ✅ Cobertura de tests > 80%
- ✅ Tiempo de carga < 3s
- ✅ Puntuación Lighthouse > 90

---

## 🚨 Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Estructura inconsistente entre cursos | Alta | Alto | Crear validador de estructura + documentación clara |
| Archivos de audio faltantes | Media | Medio | Hacer audio opcional, mostrar mensaje si no existe |
| Rendimiento con cursos grandes | Media | Alto | Implementar lazy loading y paginación |
| Compatibilidad con navegadores antiguos | Baja | Bajo | Definir navegadores soportados (últimas 2 versiones) |

---

## 📞 Puntos de Decisión

### Decisiones Pendientes

1. **Framework Frontend:** ¿Vue.js o React?
   - **Recomendación:** Vue.js (más simple, curva de aprendizaje menor)

2. **Autenticación:** ¿Implementar desde el inicio o después?
   - **Recomendación:** Después del MVP (usar localStorage inicialmente)

3. **Hosting de Audio:** ¿Local o CDN?
   - **Recomendación:** Local para MVP, CDN en producción

4. **Gamificación:** ¿Incluir en MVP?
   - **Recomendación:** No, dejar para fase futura

---

## ✅ Checklist de Inicio

Antes de comenzar la implementación:

- [ ] Revisar y aprobar requerimientos
- [ ] Configurar repositorio Git con ramas (main, develop, feature/*)
- [ ] Configurar entorno de desarrollo
- [ ] Instalar dependencias base
- [ ] Crear estructura de carpetas
- [ ] Configurar linter y formatter
- [ ] Configurar CI/CD básico
- [ ] Crear tablero de proyecto (GitHub Projects / Jira)

---

**Versión:** 1.0  
**Fecha:** 2025-12-07  
**Autor:** Andrés Olarte  
**Estado:** Propuesta Inicial  
**Próxima Revisión:** Antes de iniciar Sprint 1.1
