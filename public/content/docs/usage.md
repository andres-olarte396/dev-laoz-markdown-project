# Uso de Wave Art CSS

Este archivo te ayudará a entender cómo utilizar los diferentes módulos de **Wave Art CSS** para diseñar interfaces modernas, responsivas y accesibles.

## 1. Estilos Base

El archivo `base.css` contiene estilos generales para la normalización y la base de todos los elementos HTML. Asegúrate de incluir este archivo en tu proyecto.

### Ejemplo

```html
<link rel="stylesheet" href="src/base.css">
```

**Base incluye:**

- Estilos predeterminados para la tipografía y los márgenes.
- Normalización de los estilos de los navegadores.
- Estilos base para todos los controles de formulario.

---

## 2. Controles de Formularios

El archivo `components.css` contiene estilos personalizados para controles de formulario, botones, tablas y más.

### Ejemplo de Formulario:

```html
<form>
  <label for="name">Nombre:</label>
  <input type="text" id="name" name="name" placeholder="Escribe tu nombre">
  
  <label for="email">Correo Electrónico:</label>
  <input type="email" id="email" name="email" placeholder="ejemplo@correo.com">
  
  <button type="submit">Enviar</button>
</form>
```

**Controles soportados:**

- Inputs (`text`, `email`, `password`, `number`).
- Botones.
- Selectores.
- Checkboxes y radios.

---

## 3. Animaciones Avanzadas

En `animations.css`, se definen animaciones avanzadas como transiciones suaves y animaciones basadas en el desplazamiento (scroll-driven animations).

### Ejemplo de Animación de Hover

```css
button:hover {
  animation: bounce 0.5s ease-in-out;
}

@keyframes bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

---

## 4. Utilidades

El archivo `utilities.css` incluye clases de utilidad que puedes usar para ajustar espaciados, alineación y diseño con Flexbox o Grid.

### Ejemplo de Utilidades de Espaciado

```html
<div class="m-2 p-3">
  Contenido con márgenes y padding
</div>
```

**Utilidades comunes:**

- Espaciado (`m-1`, `m-2`, `p-1`, etc.).
- Flexbox helpers (`.flex-center`, `.flex-between`).
- Grid helpers (`.grid-2`, `.grid-3`).

---

## 5. Personalización

Si deseas personalizar aún más los estilos, edita las variables de `theme.css` y crea nuevas clases en los archivos correspondientes. 

---

**Consejos**:

- Usa los archivos `components.css` y `utilities.css` para mantener tu HTML limpio y reutilizable.
- Aprovecha las animaciones para mejorar la interacción del usuario, pero no sobrecargues la interfaz.
