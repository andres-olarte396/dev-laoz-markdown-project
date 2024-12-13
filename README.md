# 📁 Markdown Menu Project

Este proyecto genera un menú dinámico basado en archivos Markdown (`.md`) contenidos en un directorio. Los archivos se representan en un menú vertical, y los subdirectorios aparecen como submenús. Al hacer clic en un archivo, se muestra su contenido en formato HTML.

## 🚀 Características

- 📂 Generación automática de un menú basado en la estructura del directorio.
- 📄 Visualización del contenido de archivos Markdown en HTML.
- 📑 Submenús para directorios con el mismo nombre que un archivo Markdown.
- 🌐 Interfaz web sencilla con menú vertical.

---

## 🛠️ Instalación y Configuración

### Pre-requisitos

- [Node.js](https://nodejs.org) instalado en tu sistema.
- Un entorno donde puedas ejecutar aplicaciones Node.js.

### Pasos de Instalación

1. Clona este repositorio:

   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd markdown-menu-project
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor:

   ```bash
   npm start
   ```

4. Abre tu navegador en `http://localhost:3000`.

---

## 📂 Estructura del Proyecto

```textplain
markdown-menu-project/
│
├── src/
│   ├── controllers/       # Lógica del controlador
│   ├── services/          # Servicios, como la generación de menús
│   ├── utils/             # Utilidades auxiliares (lectura de archivos)
│   └── views/             # Archivos de frontend (HTML, CSS, JS)
│
├── public/
│   └── content/           # Archivos Markdown y directorios que definen el menú
│       ├── example.md     # Archivo Markdown de ejemplo
│       └── subfolder/     # Subdirectorio con más archivos Markdown
│
├── server.js              # Servidor Express que maneja API y contenido estático
├── package.json           # Configuración del proyecto y dependencias
└── README.md              # Documentación del proyecto
```

---

## 👨‍💻 Uso del Proyecto

1. **Añadir archivos Markdown:**
   Coloca tus archivos `.md` en la carpeta `public/content`. Por ejemplo:

   ```textplain
   public/content/
   ├── archivo1.md
   ├── archivo2.md
   └── carpeta/
       └── archivo3.md
   ```

2. **Navegar en la aplicación:**
   - Los archivos aparecerán automáticamente en el menú.
   - Haz clic en un archivo para ver su contenido renderizado en la página.

---

## 🧩 Personalización

Si deseas modificar el comportamiento del menú o la interfaz, edita los archivos correspondientes en la carpeta `src/views/`.

---

## 📜 Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

---
