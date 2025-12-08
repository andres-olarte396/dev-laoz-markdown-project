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

  // Restore state
  const expandedPaths = JSON.parse(localStorage.getItem("docs_expanded") || "[]");
  createMenuList(container, files, expandedPaths);

  // Setup Sidebar Controls
  setupSidebarControls(container);

  // Search Input (Regex Filter)
  const searchInput = document.getElementById("doc-search");
  if (searchInput) {
    searchInput.oninput = (e) => {
      const term = e.target.value;
      const allItems = container.querySelectorAll("li");

      try {
        const regex = new RegExp(term, 'i');

        allItems.forEach(li => {
          const span = li.querySelector("span");
          // Checks
          let match = false;
          if (term === "") match = true;
          else if (span && regex.test(span.textContent)) match = true;

          if (match) {
            li.style.display = "block";
            // Show Parents
            let parent = li.parentElement;
            while (parent && parent.id !== "menu-container") {
              if (parent.tagName === 'LI') parent.style.display = "block";
              if (parent.tagName === 'UL') parent.style.display = "block";
              parent = parent.parentElement;
            }
          } else {
            li.style.display = "none";
          }
        });
      } catch (err) {
        console.warn("Invalid regex", err);
      }
    };
  }
}

function setupSidebarControls(container) {
  // Expand All
  if (document.getElementById("btn-expand-all")) {
    document.getElementById("btn-expand-all").onclick = () => {
      container.querySelectorAll("li > ul").forEach(ul => {
        ul.style.display = "block";
        const icon = ul.parentElement.querySelector("div > ion-icon");
        if (icon) icon.setAttribute("name", "folder-open-outline");
      });
    };
  }

  // Collapse All
  if (document.getElementById("btn-collapse-all")) {
    document.getElementById("btn-collapse-all").onclick = () => {
      container.querySelectorAll("li > ul").forEach(ul => {
        ul.style.display = "none";
        const icon = ul.parentElement.querySelector("div > ion-icon");
        if (icon) icon.setAttribute("name", "folder-outline");
      });
    };
  }

  // Hide Menu
  if (document.getElementById("btn-hide-menu")) {
    document.getElementById("btn-hide-menu").onclick = () => {
      document.getElementById("sidebar").style.display = "none";
      document.getElementById("btn-show-menu").style.display = "block";
    };
  }

  // Show Menu
  if (document.getElementById("btn-show-menu")) {
    document.getElementById("btn-show-menu").onclick = () => {
      document.getElementById("sidebar").style.display = "flex";
      document.getElementById("btn-show-menu").style.display = "none";
    };
  }

  // Content Search
  if (document.getElementById("btn-search-content")) {
    document.getElementById("btn-search-content").onclick = async () => {
      const query = document.getElementById("doc-search").value;
      if (!query) return alert("Enter text to search in content");

      const contentContainer = document.getElementById("content-container");
      contentContainer.innerHTML = "<h3>Searching...</h3>";

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          let html = `<h2>Search Results for "${query}"</h2><ul style="list-style: none; padding: 0;">`;
          data.results.forEach(item => {
            html += `
                        <li style="background: var(--bg-card); padding: 10px; margin-bottom: 8px; border-radius: 6px; cursor: pointer;"
                            onclick="loadContent('${item.path}')">
                            <div style="font-weight: bold; color: var(--accent-primary);">${item.name}</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">...${item.match}...</div>
                        </li>`;
          });
          html += "</ul>";
          contentContainer.innerHTML = html;
        } else {
          contentContainer.innerHTML = `<h2>No results found for "${query}"</h2>`;
        }
      } catch (e) {
        contentContainer.innerHTML = `<h2>Error searching</h2><p>${e.message}</p>`;
      }
    };
  }
}

// Crea una lista recursiva
function createMenuList(container, menu, expandedPaths, parentPath = "") {
  if (!Array.isArray(menu)) return;

  const list = document.createElement("ul");
  container.appendChild(list);

  menu.forEach((item) => {
    const li = document.createElement("li");
    const currentPath = parentPath + "/" + item.name;

    // Div wrapper for the item content (row)
    const row = document.createElement("div");
    row.className = "menu-item";

    // Icon
    const isExpanded = expandedPaths.includes(currentPath);
    const iconName = item.isDirectory ?
      (isExpanded ? "folder-open-outline" : "folder-outline")
      : "document-text-outline";

    row.innerHTML = `<ion-icon name="${iconName}" class="icon"></ion-icon> <span>${item.name}</span>`;

    row.onclick = (event) => {
      event.stopPropagation();

      // Toggle handling
      if (item.isDirectory) {
        const childUl = li.querySelector(":scope > ul");
        if (childUl) {
          const isHidden = childUl.style.display === "none";
          childUl.style.display = isHidden ? "block" : "none";

          // Icon Toggle
          const icon = row.querySelector("ion-icon");
          icon.setAttribute("name", isHidden ? "folder-open-outline" : "folder-outline");

          // Persistence
          let currentExpanded = JSON.parse(localStorage.getItem("docs_expanded") || "[]");
          if (isHidden) {
            if (!currentExpanded.includes(currentPath)) currentExpanded.push(currentPath);
          } else {
            currentExpanded = currentExpanded.filter(p => p !== currentPath);
          }
          localStorage.setItem("docs_expanded", JSON.stringify(currentExpanded));
        }
      } else {
        // Handle active state
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        row.classList.add('active');
        loadContent(item.path);
      }
    };

    li.appendChild(row);

    if (item.isDirectory && Array.isArray(item.children)) {
      createMenuList(li, item.children, expandedPaths, currentPath);
      const childUl = li.querySelector("ul");
      // Initial State based on persistence
      if (childUl && !isExpanded) {
        childUl.style.display = "none";
      }
    }

    list.appendChild(li);
  });
}

// Helper: Resolve relative path
function resolvePath(currentFilePath, relativePath) {
  // If absolute or HTTP, return as-is
  if (relativePath.startsWith('/') || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  // Get directory of current file (remove filename)
  const pathParts = currentFilePath.split('/').slice(0, -1);

  // Split relative path and process each part
  const relativeParts = relativePath.split('/').filter(p => p);

  for (const part of relativeParts) {
    if (part === '..') {
      pathParts.pop(); // Go up one directory
    } else if (part !== '.') {
      pathParts.push(part); // Add to path
    }
    // Skip '.' (current directory)
  }

  const resolved = pathParts.join('/');
  console.log(`Path resolution: ${currentFilePath} + ${relativePath} => ${resolved}`);
  return resolved;
}

// Helper: Fix image paths in HTML
function fixImagePaths(html, currentFilePath) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/api/')) {
      const resolvedPath = resolvePath(currentFilePath, src);
      img.src = `http://localhost:3000/api/file/${resolvedPath}`;
    }
  });

  return doc.body.innerHTML;
}

// Helper: Fix internal markdown links
function fixInternalLinks(html, currentFilePath) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.endsWith('.md') || href.endsWith('.txt')) && !href.startsWith('http')) {
      const resolvedPath = resolvePath(currentFilePath, href);
      link.setAttribute('data-internal-path', resolvedPath);
      link.setAttribute('href', '#');
      link.onclick = (e) => {
        e.preventDefault();
        loadContent(resolvedPath);
        // Update active state
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      };
    }
  });

  return doc.body.innerHTML;
}

// Helper: Render mermaid diagrams
async function renderMermaidDiagrams() {
  if (!window.mermaid) return;

  const codeBlocks = document.querySelectorAll('pre code.language-mermaid');

  for (let i = 0; i < codeBlocks.length; i++) {
    const code = codeBlocks[i];
    const pre = code.parentElement;
    const mermaidCode = code.textContent;

    try {
      const { svg } = await window.mermaid.render(`mermaid-${Date.now()}-${i}`, mermaidCode);
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-diagram';
      wrapper.innerHTML = svg;
      pre.replaceWith(wrapper);
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      pre.innerHTML = `<code style="color: #ef4444;">Error rendering diagram: ${err.message}</code>`;
    }
  }
}

// Carga el contenido de un archivo
async function loadContent(path) {
  try {
    const container = document.getElementById("content-container");
    const ext = path.split('.').pop().toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);

    // Use api-files endpoint with full path structure
    const url = `http://localhost:3000/api/file/${path}`;

    if (isImage) {
      container.innerHTML = `
            <h2>${path.split('/').pop()}</h2>
            <div style="text-align: center; margin-top: 20px;">
                <img src="${url}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);" />
            </div>
        `;
    } else if (ext === 'pdf') {
      container.innerHTML = `
            <h2>${path.split('/').pop()}</h2>
            <iframe src="${url}" width="100%" height="800px" style="border: none;"></iframe>
        `;
    } else {
      // Assume text/markdown
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.statusText);
      const content = await response.text();

      // Parse markdown
      let html = marked.parse(content);

      // Fix paths and links
      html = fixImagePaths(html, path);
      html = fixInternalLinks(html, path);

      container.innerHTML = html;

      // Render mermaid diagrams
      await renderMermaidDiagrams();
    }
  } catch (error) {
    console.error("Error al cargar el contenido:", error);
    document.getElementById("content-container").innerHTML = `<div style="color: #ff6b6b; padding: 20px;">Error loading file: ${error.message}</div>`;
  }
}

// Crear un nuevo archivo Markdown
async function createMarkdownFile() {
  const filename = prompt("Ingrese el nombre del nuevo archivo (sin extensión):");
  if (!filename) return;

  const content = prompt("Ingrese el contenido inicial del archivo:") || "# New File";

  // Path relative to e:/MyRepos (REPOS adapter)
  // We place it in the markdown project content folder so it appears in the viewer
  const targetPath = `dev-laoz-markdown-project/public/content/${filename}.md`;

  try {
    const response = await fetch("http://localhost:3000/api/files/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: targetPath,
        content: content,
        storageType: 'REPOS'
      }),
    });

    if (response.ok) {
      alert("Archivo creado con éxito");
      // Auto-refresh via Automator takes a second, but we can try reloading menu
      setTimeout(loadMenu, 2000);
    } else {
      const error = await response.json();
      alert(`Error al crear el archivo: ${error.error}`);
    }
  } catch (error) {
    console.error("Error al crear archivo:", error);
    alert("No se pudo crear el archivo");
  }
}

// Editar un archivo Markdown existente
async function editMarkdownFile() {
  // Current selection logic? 
  // We don't have a "selected file" state easily accessible except maybe active class.
  // Let's ask for name, or better, leverage the UI state if we had it.
  // Existing code asked for filename.
  // IMPROVEMENT: Get active item from DOM?

  // Fallback to prompt for now as per original code, but improved pathing.
  const filename = prompt("Ingrese el PATH relativo del archivo a editar (ej: dev-laoz-markdown-project/public/content/docs.md):");
  // This is hard for user.
  // Better: If they are viewing a file, edit THAT file.
  // But usage pattern says "using our buttons".
  // Let's assume the user knows the path or we simplify for the root docs.

  if (!filename) return;
  const content = prompt("Ingrese el nuevo contenido del archivo:");

  if (content !== null) {
    try {
      const response = await fetch("http://localhost:3000/api/files/content", {
        method: "POST", // SaveContent handles update too
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: filename,
          content: content,
          storageType: 'REPOS'
        }),
      });

      if (response.ok) {
        alert("Archivo editado con éxito");
        setTimeout(() => {
          loadMenu();
          // reload content if it was active?
        }, 2000);
      } else {
        const error = await response.json();
        alert(`Error al editar: ${error.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  }
}

// Eliminar un archivo Markdown
async function deleteMarkdownFile() {
  alert("Función de eliminar en desarrollo (API Support Pending)");
}

// Agregar botones para manejar operaciones
function setupActionButtons() {
  const actionsContainer = document.getElementById("actions-container");
  actionsContainer.innerHTML = `
    <button id="create-file" class="action-btn" title="New File"><ion-icon name="add-outline"></ion-icon></button>
    <button id="edit-file" class="action-btn" title="Edit File"><ion-icon name="create-outline"></ion-icon></button>
    <button id="delete-file" class="action-btn" title="Delete File"><ion-icon name="trash-outline"></ion-icon></button>
  `;

  document.getElementById("create-file").onclick = createMarkdownFile;
  document.getElementById("edit-file").onclick = editMarkdownFile;
  document.getElementById("delete-file").onclick = deleteMarkdownFile;
}

// Inicializar
setupActionButtons();
loadMenu();
