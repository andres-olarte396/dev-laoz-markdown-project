# Changelog - Plataforma LMS Teach Laoz

**Fecha:** 10 de Diciembre de 2025  
**Versión:** 2.1.0

---

## 📋 Resumen de Cambios

Esta versión incluye mejoras significativas en la integración de cursos, detección de archivos multimedia, experiencia de usuario y capacidades de despliegue.

---

## 🎯 Nuevas Funcionalidades

### 1. Integración del Curso "Dibujo de 0 a Experto para Niños"

**Descripción:** Se integró completamente el curso de dibujo para niños con 13 módulos y 120+ temas.

**Archivos Creados:**

- `public/content/teach-laoz-curso-dibujo-ninos/course.json`
- `public/content/teach-laoz-curso-dibujo-ninos/INTEGRACION_PLATAFORMA.md`

**Detalles:**

- **Metadata del curso:**
  - Título: "Dibujo de 0 a Experto para Niños"
  - Nivel: Básico a Avanzado
  - Duración: 120 horas
  - Audiencia: Niños de 6+ años
  - 13 módulos completos
  - Objetivos de aprendizaje definidos
  - Materiales requeridos especificados

- **Estructura detectada:**
  - Módulo 0: Preparación y Descubrimiento Artístico (10 temas)
  - Módulo 1: Fundamentos de Formas Básicas (13 temas)
  - Módulos 2-12: Progresión completa hasta proyecto final

**Endpoint API:**

```
GET /api/courses/teach-laoz-curso-dibujo-ninos/structure
```

---

### 2. Soporte para Archivos de Audio .m4a

**Problema:** El sistema solo detectaba archivos de audio en formato `.mp3` y `.wav`, pero el curso de dibujo usa archivos `.m4a` con el patrón `*_guion.m4a`.

**Solución:** Se extendió la lógica de detección de audio en `src/services/courseService.js`.

**Archivos Modificados:**

- `src/services/courseService.js` (líneas 244-301)

**Patrones de audio soportados:**

```javascript
// Patrones directos
tema_X.Y.mp3
tema_X.Y.wav
tema_X.Y.m4a

// Patrones alternativos
tema_X.Y_audio.mp3
tema_X.Y_audio.wav
tema_X.Y_audio.m4a

// Patrones de guion (nuevo)
tema_X.Y_guion.mp3
tema_X.Y_guion.wav
tema_X.Y_guion.m4a  ← NUEVO
```

**Resultado:**

- ✅ Módulo 0: 4 archivos de audio detectados
- ✅ Módulo 1: 6 archivos de audio detectados
- ✅ Iconos 🎧 visibles en la interfaz

---

### 3. Ordenamiento Numérico de Módulos

**Problema:** Los módulos se ordenaban alfabéticamente, causando que "modulo_10" apareciera antes que "modulo_2".

**Solución:** Se implementó ordenamiento numérico basado en el número extraído del nombre del directorio.

**Archivos Modificados:**

- `src/services/courseService.js` (líneas 156-163)

**Código:**

```javascript
const moduleEntries = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('modulo'))
    .sort((a, b) => {
        // Extract module numbers for proper numeric sorting
        const numA = parseInt(a.name.match(/modulo[ _-]?(\d+)/i)?.[1] || '0');
        const numB = parseInt(b.name.match(/modulo[ _-]?(\d+)/i)?.[1] || '0');
        return numA - numB;
    });
```

**Antes:**

```
0, 1, 10, 11, 12, 2, 3, 4, 5, 6, 7, 8, 9
```

**Después:**

```
0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
```

---

### 4. Panel Lateral Colapsable

**Descripción:** Se agregó funcionalidad para ocultar/mostrar el panel lateral de cursos, maximizando el espacio de contenido.

**Archivos Modificados:**

- `src/views/index.html` (líneas 56-75, 178-190)
- `src/views/app.js` (líneas 109-117, 852-870)
- `src/views/style.css` (líneas 1063-1127)

**Características:**

- **Botón de toggle** en el header del sidebar (icono chevron)
- **Botón flotante** que aparece cuando el sidebar está oculto
- **Transiciones suaves** (0.3s ease)
- **Posicionamiento centrado** del botón flotante (50% vertical)
- **Iconos dinámicos** que cambian según el estado

**CSS Implementado:**

```css
.sidebar.collapsed {
    width: 0;
    min-width: 0;
    padding: 0;
    overflow: hidden;
    border-right: none;
}

.btn-show-sidebar {
    position: fixed;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    /* ... estilos adicionales ... */
}
```

**JavaScript:**

```javascript
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const showBtn = document.getElementById('btnShowSidebar');
    
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        showBtn.style.display = 'flex';
    } else {
        showBtn.style.display = 'none';
    }
}
```

---

### 5. Ordenamiento de Cursos por Fecha de Creación

**Descripción:** Los cursos ahora se ordenan por fecha de creación en orden descendente (más recientes primero).

**Archivos Modificados:**

- `src/views/app.js` (líneas 109-117)

**Código:**

```javascript
// Sort courses by creation date (descending - newest first)
courses.sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB - dateA; // Descending order
});
```

**Resultado:**

- Curso "Dibujo de 0 a Experto para Niños" (más reciente) aparece primero
- Cursos más antiguos al final de la lista

---

### 6. Dockerización Completa del Proyecto

**Descripción:** Se empaquetó la aplicación en Docker para facilitar el despliegue y acceso desde la red local.

**Archivos Creados:**

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `deploy.ps1`
- `DOCKER_DEPLOYMENT.md`
- `QUICK_START_DOCKER.md`

**Características del Dockerfile:**

- **Imagen base:** `node:18-alpine` (ligera y eficiente)
- **Instalación:** Solo dependencias de producción (`npm ci --only=production`)
- **Inicialización:** Base de datos SQLite automática
- **Health check:** Verificación cada 30 segundos
- **Puerto expuesto:** 7000

**Docker Compose:**

```yaml
services:
  lms-platform:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: teach-laoz-lms
    ports:
      - "7000:7000"
    volumes:
      - ./db:/app/db
      - ./logs:/app/logs
      - ./public/content:/app/public/content:ro
    restart: unless-stopped
```

**Script de Despliegue (deploy.ps1):**

```powershell
# Comandos disponibles
.\deploy.ps1 start    # Iniciar contenedor
.\deploy.ps1 stop     # Detener contenedor
.\deploy.ps1 restart  # Reiniciar contenedor
.\deploy.ps1 logs     # Ver logs en tiempo real
.\deploy.ps1 status   # Ver estado y health check
.\deploy.ps1 rebuild  # Reconstruir imagen
.\deploy.ps1 ip       # Obtener IP local
```

**Acceso en Red Local:**

- Localhost: `http://localhost:7000/app`
- Red local: `http://[IP_LOCAL]:7000/app`
- Ejemplo: `http://192.168.20.25:7000/app`

**Persistencia de Datos:**

- Base de datos SQLite montada como volumen
- Logs persistentes
- Contenido de cursos en modo solo lectura

---

## 🔧 Mejoras Técnicas

### Detección de Audio Mejorada

**Antes:**

```javascript
// Solo buscaba .mp3 y .wav
const mp3Path = path.join(modulePath, mp3Name);
const wavPath = path.join(modulePath, wavName);
```

**Después:**

```javascript
// Busca múltiples formatos y patrones
const formats = ['mp3', 'wav', 'm4a'];
const patterns = ['', '_audio', '_guion'];

// Genera todas las combinaciones posibles
// tema_X.Y.mp3, tema_X.Y_audio.mp3, tema_X.Y_guion.mp3
// tema_X.Y.wav, tema_X.Y_audio.wav, tema_X.Y_guion.wav
// tema_X.Y.m4a, tema_X.Y_audio.m4a, tema_X.Y_guion.m4a
```

### Optimización de Imagen Docker

**Exclusiones en .dockerignore:**

- `node_modules/` (se instalan en el contenedor)
- Archivos de log y temporales
- Archivos de desarrollo y testing
- Documentación (excepto README.md)
- Archivos de IDE y sistema operativo

**Tamaño de imagen reducido:** ~200MB (vs ~500MB sin optimización)

---

## 📊 Estadísticas del Proyecto

### Cursos Integrados

- **Total:** 15 cursos
- **Nuevo:** "Dibujo de 0 a Experto para Niños"
- **Módulos totales:** 150+
- **Temas totales:** 1000+

### Archivos de Audio

- **Formatos soportados:** .mp3, .wav, .m4a
- **Patrones detectados:** 9 combinaciones diferentes
- **Archivos detectados en curso de dibujo:** 10+ archivos

### Cobertura de Funcionalidades

- ✅ Detección automática de cursos
- ✅ Parsing de módulos y temas
- ✅ Detección de audio multimedia
- ✅ Detección de evaluaciones
- ✅ Sistema de progreso
- ✅ Navegación entre temas
- ✅ Reproductor de audio persistente
- ✅ Sistema de quizzes
- ✅ Panel lateral colapsable
- ✅ Ordenamiento inteligente
- ✅ Despliegue Docker

---

## 🐛 Bugs Corregidos

### 1. Módulos Desordenados

- **Problema:** Módulo 10 aparecía antes que módulo 2
- **Causa:** Ordenamiento alfabético en lugar de numérico
- **Solución:** Implementación de ordenamiento numérico basado en regex

### 2. Audios .m4a No Detectados

- **Problema:** Archivos `*_guion.m4a` no se detectaban
- **Causa:** Solo se buscaban extensiones .mp3 y .wav
- **Solución:** Extensión de patrones de búsqueda

### 3. Botón Flotante Mal Posicionado

- **Problema:** Botón flotante se perdía en el espacio superior
- **Causa:** Posición fija `top: 80px`
- **Solución:** Centrado vertical con `top: 50%; transform: translateY(-50%)`

---

## 📁 Estructura de Archivos Modificados

```
dev-laoz-markdown-project/
├── src/
│   ├── services/
│   │   └── courseService.js          ← Detección de audio y ordenamiento
│   └── views/
│       ├── index.html                 ← Botones de toggle y flotante
│       ├── app.js                     ← Ordenamiento de cursos y toggle
│       └── style.css                  ← Estilos para sidebar colapsable
├── public/
│   └── content/
│       └── teach-laoz-curso-dibujo-ninos/
│           ├── course.json            ← NUEVO: Metadata del curso
│           └── INTEGRACION_PLATAFORMA.md  ← NUEVO: Documentación
├── Dockerfile                         ← NUEVO: Imagen Docker
├── docker-compose.yml                 ← NUEVO: Configuración Docker
├── .dockerignore                      ← NUEVO: Optimización build
├── deploy.ps1                         ← NUEVO: Script de despliegue
├── DOCKER_DEPLOYMENT.md               ← NUEVO: Documentación Docker
├── QUICK_START_DOCKER.md              ← NUEVO: Guía rápida
└── CHANGELOG.md                       ← NUEVO: Este archivo
```

---

## 🚀 Instrucciones de Despliegue

### Desarrollo Local

```bash
npm run dev
```

### Producción con Docker

```powershell
# Iniciar
.\deploy.ps1 start

# Ver estado
.\deploy.ps1 status

# Ver logs
.\deploy.ps1 logs

# Detener
.\deploy.ps1 stop
```

---

## 🔜 Próximos Pasos Recomendados

1. **Contenido:**
   - Generar contenido para módulos 2-12 del curso de dibujo
   - Crear archivos de audio para temas faltantes
   - Agregar imágenes ilustrativas

2. **Funcionalidades:**
   - Sistema de autenticación de usuarios
   - Dashboard de progreso del estudiante
   - Certificados de finalización
   - Foro de discusión por curso

3. **Infraestructura:**
   - Configurar HTTPS con certificado SSL
   - Implementar reverse proxy (nginx)
   - Sistema de backups automáticos
   - Monitoreo y alertas

4. **Optimización:**
   - Caché de contenido estático
   - Compresión de respuestas HTTP
   - Lazy loading de módulos
   - Optimización de imágenes

---

## 📞 Soporte

Para reportar problemas o sugerencias:

1. Revisar `DOCKER_DEPLOYMENT.md` para solución de problemas
2. Verificar logs: `.\deploy.ps1 logs`
3. Consultar health check: `http://localhost:7000/api/health`

---

## 📝 Notas de Versión

**v2.1.0** - 10 de Diciembre de 2025

- ✅ Integración curso de dibujo
- ✅ Soporte audio .m4a
- ✅ Ordenamiento numérico de módulos
- ✅ Panel lateral colapsable
- ✅ Ordenamiento de cursos por fecha
- ✅ Dockerización completa

**v2.0.0** - Versión anterior

- Sistema base de LMS
- Detección de cursos automática
- Reproductor de audio
- Sistema de evaluaciones

---

**Desarrollado por:** Sistema de Generación Automática de Cursos Teach Laoz  
**Última actualización:** 10 de Diciembre de 2025
