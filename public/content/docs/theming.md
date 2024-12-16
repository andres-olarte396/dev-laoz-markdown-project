
# Temas en Wave Art CSS

**Wave Art CSS** soporta temas dinámicos para adaptarse a las preferencias del usuario. Este archivo te ayudará a personalizar los colores y estilos según tus necesidades.

## Definir los Temas

En el archivo `theme.css` se definen todas las variables necesarias para crear temas dinámicos. Los temas más comunes son el **modo claro** y el **modo oscuro**.

### 1. Modo Claro

El modo claro es el tema predeterminado y tiene colores brillantes y fondos claros.

```css
/* theme.css */

/* Colores predeterminados para el modo claro */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #ffffff;
  --text-color: #000000;
  --link-color: #007bff;
}
```

### 2. Modo Oscuro

El modo oscuro tiene un esquema de colores más oscuros y es adecuado para entornos con poca luz.

```css
/* theme.css */

/* Colores predeterminados para el modo oscuro */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #1a73e8;
    --secondary-color: #495057;
    --background-color: #121212;
    --text-color: #ffffff;
    --link-color: #1a73e8;
  }
}
```

## Personalización de Temas

Si deseas personalizar los colores de los temas para adaptarlos a la identidad de tu marca o negocio, simplemente edita las variables CSS definidas en el archivo `theme.css`.

### Ejemplo de personalización

```css
:root {
  --primary-color: #ff5722; /* Color principal de la marca */
  --secondary-color: #673ab7; /* Color secundario */
  --background-color: #fafafa;
  --text-color: #333;
}
```

Este enfoque permite una rápida adaptación a diferentes entornos de usuario, sin necesidad de cambiar el código HTML o JavaScript.

## Alternancia Automática de Temas

Wave Art CSS detecta automáticamente el esquema de color preferido del usuario utilizando la consulta de medios `prefers-color-scheme`. Esto asegura que el tema oscuro o claro se aplique según la configuración del sistema operativo del usuario.

---

**Consejos:**

- Puedes agregar más colores para personalizar otros aspectos de tu diseño como bordes, sombras, etc.
- Si deseas agregar más temas, simplemente sigue el formato de las consultas `@media` y ajusta las variables CSS.
