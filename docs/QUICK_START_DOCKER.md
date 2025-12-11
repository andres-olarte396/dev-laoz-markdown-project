# 🚀 Inicio Rápido - Docker

## Desplegar en 3 Pasos

### 1. Iniciar el Contenedor

```powershell
.\deploy.ps1 start
```

### 2. Obtener tu IP Local

```powershell
.\deploy.ps1 ip
```

### 3. Acceder a la Aplicación

**Desde tu PC:**

- <http://localhost:7000/app>

**Desde otros dispositivos (móvil, tablet, otra PC):**

- http://[TU_IP]:7000/app
- Ejemplo: <http://192.168.20.25:7000/app>

---

## Comandos Útiles

```powershell
# Ver estado
.\deploy.ps1 status

# Ver logs en tiempo real
.\deploy.ps1 logs

# Reiniciar
.\deploy.ps1 restart

# Detener
.\deploy.ps1 stop

# Reconstruir (después de cambios en código)
.\deploy.ps1 rebuild
```

---

## ⚠️ Firewall de Windows

Si otros dispositivos no pueden conectarse, ejecuta como **Administrador**:

```powershell
New-NetFirewallRule -DisplayName "LMS Platform" -Direction Inbound -LocalPort 7000 -Protocol TCP -Action Allow
```

---

## 📚 Documentación Completa

Ver `DOCKER_DEPLOYMENT.md` para instrucciones detalladas.
