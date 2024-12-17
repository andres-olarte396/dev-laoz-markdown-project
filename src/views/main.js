// Carga el menú y el contenido
async function loadMenu() {
  try {
    const response = await fetch("/api/menu");
    if (!response.ok) {
      throw new Error(`Error en la carga del menú: ${response.statusText}`);
    }
    const menu = await response.json();

    // Si la respuesta tiene una estructura como { data: [...] }
    const menuData = Array.isArray(menu) ? menu : menu.data || [];
    renderMenu(menuData);
  } catch (error) {
    console.error("Error al cargar el menú:", error);
  }
}

// Renderiza el menú en el DOM
function renderMenu(files) {
  const container = document.getElementById("menu-container");
  container.innerHTML = "";
  createMenuList(container, files);
}

// Crea una lista
function createMenuList(container, menu) {
  if (!Array.isArray(menu)) {
    console.error("El menú no es un array:", menu);
    return;
  }

  const list = document.createElement("ul");
  container.appendChild(list);

  menu.forEach((item) => {
    const element = document.createElement("li");
    element.textContent = item.name;
    element.className = item.isDirectory ? "folder" : "file";

    if (item.isDirectory && Array.isArray(item.children)) {
      createMenuList(element, item.children);
    }

    element.onclick = () => {
      element.addEventListener("click", function (event) {
        if (event.target === this) {
          loadContent(item.path);
          const childList = this.querySelector(":scope > ul");
          if (childList) {
            childList.style.display =
              childList.style.display === "block" ? "none" : "block";
          }
        }
      });
    };

    list.appendChild(element);
  });
}

// Carga el contenido de un archivo Markdown
async function loadContent(path) {
  try {
    const response = await fetch(path);
    const content = await response.text();
    document.getElementById("content-container").innerHTML =
      marked.parse(content);
  } catch (error) {
    console.error("Error al cargar el contenido:", error);
    alert("No se pudo cargar el archivo");
  }
}

// Crear un nuevo archivo Markdown
async function createMarkdownFile() {
  const filename = prompt("Ingrese el nombre del nuevo archivo (sin extensión):");
  const content = prompt("Ingrese el contenido inicial del archivo:");
  if (filename && content !== null) {
    try {
      const response = await fetch("/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, content }),
      });
      if (response.ok) {
        alert("Archivo creado con éxito");
        loadMenu(); // Recargar menú
      } else {
        const error = await response.json();
        alert(`Error al crear el archivo: ${error.error}`);
      }
    } catch (error) {
      console.error("Error al crear archivo:", error);
      alert("No se pudo crear el archivo");
    }
  }
}

// Editar un archivo Markdown existente
async function editMarkdownFile() {
  const filename = prompt("Ingrese el nombre del archivo a editar (sin extensión):");
  if (!filename) return;
  const content = prompt("Ingrese el nuevo contenido del archivo:");
  if (content !== null) {
    try {
      const response = await fetch(`/markdown/${filename}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (response.ok) {
        alert("Archivo editado con éxito");
        loadMenu(); // Recargar menú
      } else {
        const error = await response.json();
        alert(`Error al editar el archivo: ${error.error}`);
      }
    } catch (error) {
      console.error("Error al editar archivo:", error);
      alert("No se pudo editar el archivo");
    }
  }
}

// Eliminar un archivo Markdown
async function deleteMarkdownFile() {
  const filename = prompt("Ingrese el nombre del archivo a eliminar (sin extensión):");
  if (filename) {
    try {
      const response = await fetch(`/markdown/${filename}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Archivo eliminado con éxito");
        loadMenu(); // Recargar menú
      } else {
        const error = await response.json();
        alert(`Error al eliminar el archivo: ${error.error}`);
      }
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      alert("No se pudo eliminar el archivo");
    }
  }
}

// Agregar botones para manejar operaciones
function setupActionButtons() {
  const actionsContainer = document.getElementById("actions-container");
  actionsContainer.innerHTML = `
    <button id="create-file">Crear Archivo</button>
    <button id="edit-file">Editar Archivo</button>
    <button id="delete-file">Eliminar Archivo</button>
  `;

  document.getElementById("create-file").onclick = createMarkdownFile;
  document.getElementById("edit-file").onclick = editMarkdownFile;
  document.getElementById("delete-file").onclick = deleteMarkdownFile;
}

// Inicializar
setupActionButtons();
loadMenu();
