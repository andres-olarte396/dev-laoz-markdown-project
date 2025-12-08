# Requerimientos: Integración de dev-laoz-markdown-project con teach-laoz

## 📋 Resumen Ejecutivo

**Objetivo:** Transformar `dev-laoz-markdown-project` en una plataforma completa de aprendizaje (LMS) que permita **ver, escuchar, navegar, evaluar y rastrear el progreso** de los cursos contenidos en el ecosistema `teach-laoz`.

**Alcance:** Integración con todos los cursos existentes:

- `teach-laoz-communication` (Comunicación Técnica Efectiva)
- `teach-laoz-security` (Seguridad)
- `teach-laoz-curso_optimizacion_entrenamientos` (Optimización de Entrenamientos)
- `teach-laoz-curso_devops_avanzado` (DevOps Avanzado)
- Futuros cursos generados por `teach-laoz-courses-generator`

---

## 🎯 Requerimientos Funcionales

### 1. Visualización de Contenido (VER)

#### 1.1 Renderizado de Markdown

- **REQ-VIS-001:** Renderizar archivos `.md` con soporte completo de Markdown (GFM - GitHub Flavored Markdown)
- **REQ-VIS-002:** Soporte para sintaxis extendida:
  - Tablas
  - Listas de tareas
  - Bloques de código con resaltado de sintaxis
  - Diagramas Mermaid
  - Fórmulas matemáticas (LaTeX/KaTeX)
  - Emojis
- **REQ-VIS-003:** Renderizado de imágenes embebidas en el contenido
- **REQ-VIS-004:** Soporte para enlaces internos entre módulos y temas

#### 1.2 Navegación Estructurada

- **REQ-NAV-001:** Menú lateral jerárquico basado en la estructura de directorios:

  ```
  📚 Curso
    📖 Módulo 1
      📄 Presentación
      📝 Contenido
      🎯 Actividades
      📊 Evaluación
    📖 Módulo 2
      ...
  ```

- **REQ-NAV-002:** Breadcrumb (migas de pan) mostrando la ruta actual
- **REQ-NAV-003:** Botones de navegación "Anterior" y "Siguiente" entre temas
- **REQ-NAV-004:** Índice automático generado desde `INDICE.md` de cada curso
- **REQ-NAV-005:** Búsqueda de contenido dentro del curso activo

#### 1.3 Interfaz de Usuario

- **REQ-UI-001:** Diseño responsivo (móvil, tablet, desktop)
- **REQ-UI-002:** Modo oscuro/claro
- **REQ-UI-003:** Ajuste de tamaño de fuente
- **REQ-UI-004:** Marcadores/favoritos para temas importantes
- **REQ-UI-005:** Tabla de contenidos flotante para documentos largos

---

### 2. Reproducción de Audio (ESCUCHAR)

#### 2.1 Integración de Audio

- **REQ-AUD-001:** Detectar y asociar archivos de audio (`.mp3`, `.wav`, `.ogg`) con contenido Markdown
- **REQ-AUD-002:** Convención de nombres:
  - `contenido.md` → `contenido.mp3`
  - `modulo1/tema1.md` → `modulo1/tema1.mp3`
- **REQ-AUD-003:** Reproductor de audio integrado con controles:
  - Play/Pause
  - Velocidad de reproducción (0.5x, 1x, 1.25x, 1.5x, 2x)
  - Barra de progreso con seek
  - Control de volumen
  - Descarga del archivo de audio

#### 2.2 Sincronización Audio-Texto

- **REQ-AUD-004:** Resaltado automático del párrafo actual durante la reproducción (si existe metadata de timestamps)
- **REQ-AUD-005:** Opción de auto-scroll durante la reproducción
- **REQ-AUD-006:** Generación automática de transcripciones (futuro)

---

### 3. Sistema de Evaluación (EVALUAR)

#### 3.1 Tipos de Evaluación

- **REQ-EVAL-001:** Soporte para cuestionarios de opción múltiple
- **REQ-EVAL-002:** Soporte para preguntas de verdadero/falso
- **REQ-EVAL-003:** Soporte para preguntas de respuesta corta
- **REQ-EVAL-004:** Soporte para ejercicios prácticos con validación de código

#### 3.2 Formato de Evaluaciones

- **REQ-EVAL-005:** Leer evaluaciones desde archivos `evaluacion.md` en formato estructurado:

  ```markdown
  ## Pregunta 1
  ¿Cuál es el propósito de Git?
  
  - [ ] A) Compilar código
  - [x] B) Control de versiones
  - [ ] C) Ejecutar tests
  - [ ] D) Desplegar aplicaciones
  
  **Explicación:** Git es un sistema de control de versiones distribuido.
  ```

#### 3.3 Calificación y Retroalimentación

- **REQ-EVAL-006:** Calificación automática de respuestas
- **REQ-EVAL-007:** Mostrar retroalimentación inmediata con explicaciones
- **REQ-EVAL-008:** Permitir múltiples intentos con registro de mejores resultados
- **REQ-EVAL-009:** Generar reporte de evaluación con:
  - Puntaje obtenido
  - Tiempo empleado
  - Respuestas correctas/incorrectas
  - Áreas de mejora

---

### 4. Seguimiento de Progreso (RASTREAR)

#### 4.1 Persistencia de Datos

- **REQ-PROG-001:** Almacenar progreso del usuario en base de datos local (SQLite/IndexedDB) o backend
- **REQ-PROG-002:** Guardar estado de:
  - Temas completados
  - Evaluaciones realizadas
  - Calificaciones obtenidas
  - Tiempo dedicado por módulo
  - Última posición de lectura

#### 4.2 Indicadores Visuales

- **REQ-PROG-003:** Marcar temas completados con ✅
- **REQ-PROG-004:** Mostrar barra de progreso por módulo y curso completo
- **REQ-PROG-005:** Dashboard de progreso con:
  - Porcentaje de avance general
  - Módulos completados
  - Evaluaciones aprobadas
  - Tiempo total de estudio
  - Racha de días consecutivos

#### 4.3 Certificación

- **REQ-PROG-006:** Generar certificado de finalización al completar el 100% del curso
- **REQ-PROG-007:** Exportar progreso en formato PDF o JSON

---

### 5. Gestión de Múltiples Cursos

#### 5.1 Selector de Cursos

- **REQ-CURSO-001:** Pantalla inicial con catálogo de cursos disponibles
- **REQ-CURSO-002:** Cada curso muestra:
  - Título
  - Descripción
  - Duración estimada
  - Nivel (Básico, Intermedio, Avanzado)
  - Progreso del usuario
  - Imagen de portada

#### 5.2 Configuración de Cursos

- **REQ-CURSO-003:** Leer metadata desde archivo `course.json` o frontmatter en `README.md`:

  ```json
  {
    "title": "Comunicación Técnica Efectiva",
    "description": "Curso para desarrolladores",
    "level": "Intermedio",
    "duration": "40 horas",
    "modules": 6,
    "author": "Andrés Olarte",
    "version": "1.0.0"
  }
  ```

---

## 🔧 Requerimientos Técnicos

### 6. Arquitectura del Sistema

#### 6.1 Frontend

- **REQ-TECH-001:** Framework: Vue.js 3 o React
- **REQ-TECH-002:** Librería de Markdown: `marked` o `markdown-it`
- **REQ-TECH-003:** Resaltado de sintaxis: `Prism.js` o `highlight.js`
- **REQ-TECH-004:** Diagramas: `Mermaid.js`
- **REQ-TECH-005:** Reproductor de audio: HTML5 Audio API o `Howler.js`

#### 6.2 Backend

- **REQ-TECH-006:** Mantener servidor Express.js existente
- **REQ-TECH-007:** API REST para:
  - `/api/courses` - Listar cursos disponibles
  - `/api/courses/:id/structure` - Estructura del curso
  - `/api/courses/:id/content/:path` - Contenido de un tema
  - `/api/courses/:id/audio/:path` - Archivo de audio
  - `/api/progress` - Guardar/recuperar progreso
  - `/api/evaluations/:id/submit` - Enviar respuestas de evaluación

#### 6.3 Base de Datos

- **REQ-TECH-008:** SQLite para desarrollo local
- **REQ-TECH-009:** Esquema de datos:

  ```sql
  -- Usuarios
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT,
    created_at DATETIME
  );
  
  -- Progreso
  CREATE TABLE progress (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    course_id TEXT,
    module_id TEXT,
    topic_id TEXT,
    completed BOOLEAN,
    last_position INTEGER,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  -- Evaluaciones
  CREATE TABLE evaluation_results (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    course_id TEXT,
    module_id TEXT,
    evaluation_id TEXT,
    score REAL,
    max_score REAL,
    answers JSON,
    submitted_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  ```

---

## 📦 Requerimientos de Integración

### 7. Compatibilidad con teach-laoz

#### 7.1 Estructura de Directorios

- **REQ-INT-001:** Soportar la estructura actual de `teach-laoz`:

  ```
  teach-laoz-communication/
  ├── INDICE.md
  ├── README.md
  ├── modulos/
  │   ├── modulo1/
  │   │   ├── Presentacion.md
  │   │   ├── contenido.md
  │   │   ├── contenido.mp3
  │   │   ├── Actividades/
  │   │   ├── Material/
  │   │   └── Evaluaciones/
  │   │       └── evaluacion.md
  │   └── modulo2/
  │       └── ...
  ├── plantillas/
  └── recursos/
  ```

#### 7.2 Sincronización de Contenido

- **REQ-INT-002:** Detectar automáticamente nuevos cursos en `public/content/teach-laoz-*`
- **REQ-INT-003:** Hot-reload al actualizar archivos Markdown
- **REQ-INT-004:** Validar integridad de la estructura del curso al cargar

---

## 🎨 Requerimientos de UX/UI

### 8. Experiencia de Usuario

#### 8.1 Flujo de Aprendizaje

- **REQ-UX-001:** Onboarding inicial para nuevos usuarios
- **REQ-UX-002:** Sugerencias de "Siguiente paso" basadas en progreso
- **REQ-UX-003:** Notificaciones de logros (gamificación):
  - "¡Completaste tu primer módulo!"
  - "Racha de 7 días consecutivos"
  - "100% en evaluación"

#### 8.2 Accesibilidad

- **REQ-ACC-001:** Cumplir con WCAG 2.1 nivel AA
- **REQ-ACC-002:** Navegación completa por teclado
- **REQ-ACC-003:** Soporte para lectores de pantalla
- **REQ-ACC-004:** Subtítulos opcionales para audio (si disponibles)

---

## 🔒 Requerimientos de Seguridad

### 9. Seguridad y Privacidad

- **REQ-SEC-001:** Autenticación opcional (para guardar progreso en la nube)
- **REQ-SEC-002:** Encriptación de datos sensibles en base de datos
- **REQ-SEC-003:** Validación de entrada en evaluaciones
- **REQ-SEC-004:** Protección contra XSS en renderizado de Markdown
- **REQ-SEC-005:** CORS configurado correctamente para APIs

---

## 📊 Requerimientos de Rendimiento

### 10. Optimización

- **REQ-PERF-001:** Carga inicial < 3 segundos
- **REQ-PERF-002:** Lazy loading de módulos no visitados
- **REQ-PERF-003:** Caché de contenido renderizado
- **REQ-PERF-004:** Compresión de archivos de audio
- **REQ-PERF-005:** Paginación para cursos con > 50 temas

---

## 🧪 Requerimientos de Testing

### 11. Calidad y Pruebas

- **REQ-TEST-001:** Cobertura de tests unitarios > 80%
- **REQ-TEST-002:** Tests E2E para flujos críticos:
  - Navegación entre temas
  - Completar evaluación
  - Guardar progreso
- **REQ-TEST-003:** Tests de integración con estructura de cursos reales
- **REQ-TEST-004:** Validación automática de formato de evaluaciones

---

## 📝 Requerimientos de Documentación

### 12. Documentación

- **REQ-DOC-001:** README actualizado con instrucciones de uso
- **REQ-DOC-002:** Guía para autores de cursos (formato de archivos)
- **REQ-DOC-003:** API documentation (Swagger/OpenAPI)
- **REQ-DOC-004:** Changelog versionado

---

## 🚀 Criterios de Aceptación

### Definición de "Hecho"

Un requerimiento se considera completado cuando:

1. ✅ Funcionalidad implementada y probada
2. ✅ Tests automatizados pasando
3. ✅ Documentación actualizada
4. ✅ Code review aprobado
5. ✅ Validado con al menos 2 cursos de teach-laoz
6. ✅ Sin regresiones en funcionalidad existente

---

## 📅 Priorización

### Prioridad Alta (MVP)

- REQ-VIS-001 a REQ-VIS-004 (Visualización básica)
- REQ-NAV-001 a REQ-NAV-004 (Navegación)
- REQ-AUD-001 a REQ-AUD-003 (Audio básico)
- REQ-PROG-001 a REQ-PROG-004 (Progreso básico)
- REQ-CURSO-001 a REQ-CURSO-003 (Múltiples cursos)

### Prioridad Media

- REQ-EVAL-001 a REQ-EVAL-009 (Sistema de evaluación)
- REQ-UI-001 a REQ-UI-005 (Mejoras de UI)
- REQ-AUD-004 a REQ-AUD-006 (Sincronización audio)

### Prioridad Baja (Futuro)

- REQ-PROG-006 a REQ-PROG-007 (Certificación)
- REQ-UX-003 (Gamificación)
- REQ-SEC-001 (Autenticación en la nube)

---

**Versión:** 1.0  
**Fecha:** 2025-12-07  
**Autor:** Andrés Olarte  
**Estado:** Propuesta Inicial
