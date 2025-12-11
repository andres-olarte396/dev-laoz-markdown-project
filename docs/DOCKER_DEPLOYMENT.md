# Despliegue Docker - Plataforma LMS Teach Laoz

## 📋 Requisitos Previos

- Docker Desktop instalado y corriendo
- Docker Compose instalado (incluido con Docker Desktop)
- Puerto 7000 disponible en tu máquina

## 🚀 Despliegue Rápido

### 1. Construir y Levantar el Contenedor

```powershell
# Desde el directorio del proyecto
docker-compose up -d --build
```

### 2. Verificar que el Contenedor está Corriendo

```powershell
docker-compose ps
```

### 3. Ver los Logs

```powershell
docker-compose logs -f
```

### 4. Acceder a la Aplicación

**Desde tu máquina:**

- <http://localhost:7000/app>

**Desde otros dispositivos en tu red local:**

- http://[TU_IP_LOCAL]:7000/app
- Ejemplo: <http://192.168.1.100:7000/app>

## 🔍 Encontrar tu IP Local

### En Windows (PowerShell)

```powershell
# Opción 1: Comando simple
ipconfig | Select-String "IPv4"

# Opción 2: Más detallado
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object IPAddress, InterfaceAlias
```

### En Windows (CMD)

```cmd
ipconfig
```

Busca la sección de tu adaptador de red activo (Wi-Fi o Ethernet) y anota la dirección IPv4.

## 🛠️ Comandos Útiles

### Detener el Contenedor

```powershell
docker-compose down
```

### Reiniciar el Contenedor

```powershell
docker-compose restart
```

### Ver Logs en Tiempo Real

```powershell
docker-compose logs -f lms-platform
```

### Ejecutar Comandos Dentro del Contenedor

```powershell
docker-compose exec lms-platform sh
```

### Re-escanear Cursos

```powershell
# Desde dentro del contenedor
docker-compose exec lms-platform node -e "fetch('http://localhost:7000/api/courses/scan', {method: 'POST'})"

# O usando curl desde tu máquina
curl -X POST http://localhost:7000/api/courses/scan
```

### Reconstruir la Imagen (después de cambios en el código)

```powershell
docker-compose up -d --build --force-recreate
```

## 📁 Persistencia de Datos

Los siguientes directorios están montados como volúmenes para persistir datos:

- `./db` - Base de datos SQLite
- `./logs` - Archivos de log
- `./public/content` - Contenido de los cursos (solo lectura)

Esto significa que aunque elimines el contenedor, tus datos se mantendrán.

## 🌐 Acceso desde la Red Local

### Configurar Firewall (Windows)

Si otros dispositivos no pueden acceder, necesitas permitir el puerto 7000:

```powershell
# Ejecutar como Administrador
New-NetFirewallRule -DisplayName "LMS Platform" -Direction Inbound -LocalPort 7000 -Protocol TCP -Action Allow
```

### Probar Conectividad

Desde otro dispositivo en tu red:

```bash
# En Linux/Mac
curl http://[TU_IP]:7000/api/health

# En Windows PowerShell
Invoke-WebRequest -Uri "http://[TU_IP]:7000/api/health"
```

## 🔧 Solución de Problemas

### El contenedor no inicia

```powershell
# Ver logs detallados
docker-compose logs lms-platform

# Verificar que el puerto 7000 no esté en uso
netstat -ano | findstr :7000
```

### Error de permisos en la base de datos

```powershell
# Detener el contenedor
docker-compose down

# Eliminar la base de datos (CUIDADO: perderás datos)
Remove-Item .\db\courses.db

# Reiniciar
docker-compose up -d --build
```

### Actualizar contenido de cursos

Los cursos se cargan desde `./public/content`. Cualquier cambio en estos archivos se reflejará inmediatamente (el directorio está montado como volumen).

Para forzar un re-escaneo:

```powershell
curl -X POST http://localhost:7000/api/courses/scan
```

## 📊 Monitoreo

### Health Check

```powershell
curl http://localhost:7000/api/health
```

### Estado del Contenedor

```powershell
docker-compose ps
docker stats teach-laoz-lms
```

## 🛑 Detener y Limpiar

### Detener el servicio

```powershell
docker-compose down
```

### Eliminar todo (incluyendo volúmenes)

```powershell
docker-compose down -v
```

### Limpiar imágenes antiguas

```powershell
docker image prune -a
```

## 🔐 Seguridad

Para producción, considera:

1. **Usar HTTPS**: Configura un reverse proxy (nginx) con SSL
2. **Autenticación**: Implementar sistema de login
3. **Firewall**: Restringir acceso solo a IPs conocidas
4. **Backups**: Respaldar regularmente el directorio `./db`

## 📝 Notas

- El contenedor se reinicia automáticamente si falla (`restart: unless-stopped`)
- La base de datos se inicializa automáticamente en el primer arranque
- Los cursos se escanean automáticamente al iniciar el servidor
- El health check verifica el estado cada 30 segundos
