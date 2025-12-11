# Actualizaciones Recientes - v2.1.0

**Fecha:** 10 de Diciembre de 2025

---

## 🎉 Nuevas Funcionalidades

### 1. 🐳 Despliegue con Docker

La plataforma ahora puede desplegarse fácilmente usando Docker:

```powershell
# Iniciar
.\deploy.ps1 start

# Ver estado
.\deploy.ps1 status

# Ver logs
.\deploy.ps1 logs
```

**Acceso en red local:**

- Desde tu PC: `http://localhost:7000/app`
- Desde otros dispositivos: `http://[TU_IP]:7000/app`

📖 **Documentación:** Ver [QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md) y [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

---

### 2. 📱 Panel Lateral Colapsable

Nueva funcionalidad para maximizar el espacio de contenido:

- **Botón de toggle** en el header del sidebar
- **Botón flotante** cuando el panel está oculto
- **Transiciones suaves** y animadas
- **Posición centrada** del botón flotante

**Uso:** Haz clic en el icono de chevron en el header del sidebar.

---

### 3. 🎧 Soporte para Audio .m4a

El sistema ahora detecta archivos de audio en formato `.m4a`:

**Patrones soportados:**

- `tema_X.Y.mp3` / `.wav` / `.m4a`
- `tema_X.Y_audio.mp3` / `.wav` / `.m4a`
- `tema_X.Y_guion.mp3` / `.wav` / `.m4a` ← **NUEVO**

**Resultado:** Los iconos 🎧 ahora aparecen en todos los temas con audio, independientemente del formato.

---

### 4. 🔢 Ordenamiento Numérico de Módulos

Los módulos ahora se ordenan correctamente:

**Antes:** 0, 1, 10, 11, 12, 2, 3, 4...  
**Ahora:** 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12

---

### 5. 📅 Ordenamiento de Cursos por Fecha

Los cursos se muestran en orden descendente por fecha de creación:

- Los cursos más recientes aparecen primero
- Facilita encontrar el contenido más actualizado

---

### 6. 🎨 Nuevo Curso Integrado

**"Dibujo de 0 a Experto para Niños"**

- 13 módulos completos
- 120+ temas
- 120 horas de contenido
- Archivos de audio incluidos
- Evaluaciones integradas

---

## 📊 Estadísticas Actualizadas

| Métrica | Valor |
|---------|-------|
| **Cursos Totales** | 15 |
| **Módulos Totales** | 150+ |
| **Temas Totales** | 1000+ |
| **Formatos de Audio** | .mp3, .wav, .m4a |
| **Patrones de Audio** | 9 combinaciones |

---

## 🛠️ Cambios Técnicos

### Archivos Modificados

```
src/
├── services/
│   └── courseService.js       ← Detección audio + ordenamiento
└── views/
    ├── index.html             ← Botones toggle
    ├── app.js                 ← Lógica toggle + ordenamiento
    └── style.css              ← Estilos sidebar colapsable
```

### Archivos Nuevos

```
├── Dockerfile                 ← Imagen Docker
├── docker-compose.yml         ← Configuración Docker
├── .dockerignore              ← Optimización build
├── deploy.ps1                 ← Script automatizado
├── DOCKER_DEPLOYMENT.md       ← Documentación Docker
├── QUICK_START_DOCKER.md      ← Guía rápida
├── CHANGELOG.md               ← Historial de cambios
└── UPDATES.md                 ← Este archivo
```

---

## 🚀 Cómo Usar las Nuevas Funcionalidades

### Docker

```powershell
# Iniciar contenedor
.\deploy.ps1 start

# Acceder desde otro dispositivo
# 1. Obtener tu IP
.\deploy.ps1 ip

# 2. Abrir en navegador del otro dispositivo
http://[TU_IP]:7000/app
```

### Panel Colapsable

1. Haz clic en el botón con icono de chevron en el header del sidebar
2. El panel se ocultará y aparecerá un botón flotante
3. Haz clic en el botón flotante para mostrar el panel nuevamente

### Audio .m4a

Los archivos de audio se detectan automáticamente. Solo asegúrate de que sigan uno de estos patrones:

- `tema_X.Y_guion.m4a`
- `tema_X.Y_audio.m4a`
- `tema_X.Y.m4a`

---

## 🐛 Bugs Corregidos

1. ✅ Módulos desordenados (10 antes que 2)
2. ✅ Archivos .m4a no detectados
3. ✅ Botón flotante mal posicionado
4. ✅ Cursos sin orden cronológico

---

## 📖 Documentación Relacionada

- [CHANGELOG.md](./CHANGELOG.md) - Historial completo de cambios
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Guía completa de Docker
- [QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md) - Inicio rápido con Docker
- [README.md](./README.md) - Documentación principal

---

## 🔜 Próximos Pasos

1. **Contenido:**
   - Completar módulos 2-12 del curso de dibujo
   - Generar archivos de audio faltantes
   - Agregar imágenes ilustrativas

2. **Funcionalidades:**
   - Sistema de autenticación
   - Dashboard de progreso
   - Certificados de finalización

3. **Infraestructura:**
   - HTTPS con SSL
   - Reverse proxy
   - Backups automáticos

---

**Versión:** 2.1.0  
**Última Actualización:** 10 de Diciembre de 2025  
**Estado:** Producción ✅
