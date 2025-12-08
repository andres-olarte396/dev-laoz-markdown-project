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
    
    // Status Logic
    let displayName = item.name;
    let metaIcons = '';
    let itemClass = 'menu-item';
    
    if (!item.isDirectory) {
        if (item.title) displayName = item.title;
        if (item.completed) {
            metaIcons += '<ion-icon name="checkmark-circle" style="color:#10b981; margin-left:5px; font-size:0.9em;" title="Completado"></ion-icon>';
            itemClass += ' completed';
        }
        if (item.hasEvaluation) {
             metaIcons += '<ion-icon name="clipboard-outline" style="color:#f59e0b; margin-left:5px; font-size:0.9em;" title="Evaluación Disponible"></ion-icon>';
        }
    }
    row.className = itemClass;

    // Icon
    const isExpanded = expandedPaths.includes(currentPath);
    const iconName = item.isDirectory ?
      (isExpanded ? "folder-open-outline" : "folder-outline")
      : "document-text-outline";

    row.innerHTML = `<ion-icon name="${iconName}" class="icon"></ion-icon> <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${displayName}</span> ${metaIcons}`;

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
      img.src = `/api/file/${resolvedPath}`;
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

// Use api-files endpoint
const url = `/api/file/${path}`;

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

      // ===============================================
      // LMS Integration (Audio & Quiz)
      // ===============================================
      try {
        // Path is relative to content, e.g. "modulo_1/tema_1.md"
        // remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        
        const infoRes = await fetch(`/api/topic-by-path?path=${encodeURIComponent(cleanPath)}`);
        const infoData = await infoRes.json();
        
        if (infoData.data) {
           const topic = infoData.data;
           const toolbar = document.createElement('div');
           toolbar.className = 'content-toolbar';
           toolbar.style.marginBottom = '20px';
           toolbar.style.display = 'flex';
           toolbar.style.gap = '10px';
           
           // Audio Button
           if (topic.audio_path) {
               const btnAudio = document.createElement('button');
               btnAudio.innerHTML = '<ion-icon name="musical-notes-outline"></ion-icon> Escuchar Audio';
               btnAudio.className = 'action-btn';
               btnAudio.onclick = () => {
                   const audioDir = `/api/audio/${encodeURIComponent(topic.id)}`;
                   const audioPlayer = new Audio(audioDir);
                   audioPlayer.play();
                   alert('Reproduciendo audio...'); // Quick hack, better UI later
               };
               toolbar.appendChild(btnAudio);
           }

           // Quiz Button
           if (topic.evaluation_path) {
               const btnEval = document.createElement('button');
               btnEval.innerHTML = '<ion-icon name="create-outline"></ion-icon> Realizar Quiz';
               btnEval.className = 'action-btn btn-eval';
               btnEval.style.background = 'var(--accent-primary, #646cff)';
               btnEval.style.color = 'white';
               btnEval.onclick = () => startQuiz(topic.id);
               toolbar.appendChild(btnEval);
           }
           
           if (toolbar.children.length > 0) {
               container.insertBefore(toolbar, container.firstChild);
           }
           
           // Auto-complete logic
           if (!topic.completed) {
               // Mark as complete after 5 seconds of viewing
               setTimeout(() => markTopicComplete(topic.id), 5000);
           }
        }
      } catch (err) {
          console.warn('LMS info fetch error', err);
      }
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
    const response = await fetch("/api/files/content", {
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
      const response = await fetch("/api/files/content", {
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

// ==========================================
// QUIZ GLOBAL LOGIC
// ==========================================

let currentQuizTopicId = null;
let currentQuizQuestions = [];

async function startQuiz(topicId) {
    currentQuizTopicId = topicId;
    ensureQuizModalExists();
    
    const modal = document.getElementById('quizModal');
    const quizBody = document.getElementById('quizBody');
    quizBody.innerHTML = '<div style="text-align:center; padding:20px;">Cargando evaluación...</div>';
    modal.style.display = 'block';
    
    try {
        const response = await fetch(`/api/content/${encodeURIComponent(topicId)}/evaluation`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        if (!data.markdown) throw new Error('Contenido vacío');
        
        currentQuizQuestions = parseQuizMarkdown(data.markdown);
        
        if (currentQuizQuestions.length === 0) {
            quizBody.innerHTML = '<p>No se encontraron preguntas válidas.</p>';
            return;
        }
        
        renderQuiz(currentQuizQuestions);
        
    } catch (error) {
        console.error('Error starting quiz:', error);
        quizBody.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
    }
}

function ensureQuizModalExists() {
    if (document.getElementById('quizModal')) return;
    
    const modalHtml = `
    <div id="quizModal" class="modal" style="display:none; position:fixed; z-index:2000; left:0; top:0; width:100%; height:100%; overflow:auto; background-color:rgba(0,0,0,0.8); backdrop-filter:blur(5px);">
        <div class="modal-content" style="background-color:#1e1e1e; margin:5% auto; padding:0; border:1px solid #333; width:80%; max-width:800px; border-radius:10px; color:#fff;">
            <div class="modal-header" style="padding:15px 20px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                <h2 style="margin:0; font-size:1.2rem;">Evaluación</h2>
                <span class="close" onclick="closeQuiz()" style="cursor:pointer; font-size:1.5rem;">&times;</span>
            </div>
            <div id="quizBody" class="modal-body" style="padding:20px;"></div>
            <div class="modal-footer" style="padding:15px 20px; border-top:1px solid #333; text-align:right;">
                <button class="btn-submit-quiz action-btn" onclick="submitQuiz()" style="background:#10b981; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">Enviar Respuestas</button>
                <button onclick="closeQuiz()" style="background:transparent; border:1px solid #666; color:#fff; padding:8px 16px; border-radius:4px; cursor:pointer; margin-left:10px;">Cerrar</button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeQuiz() {
    document.getElementById('quizModal').style.display = 'none';
}

function parseQuizMarkdown(markdown) {
    const questions = [];
    const lines = markdown.split('\n');
    let currentQuestion = null;
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.match(/^#{1,4}\s+/) || trimmed.match(/^\d+\.\s+/)) {
            if (currentQuestion) questions.push(currentQuestion);
            currentQuestion = {
                text: trimmed.replace(/^[#\d\.]+\s+/, ''),
                options: [],
                type: 'single'
            };
        } else if (currentQuestion && trimmed.match(/^-\s*\[([ xX])\]/)) {
            const isCorrect = trimmed.match(/^-\s*\[([xX])\]/);
            const text = trimmed.replace(/^-\s*\[([ xX])\]\s*/, '');
            currentQuestion.options.push({ text: text, isCorrect: !!isCorrect });
        }
    });
    
    if (currentQuestion) questions.push(currentQuestion);
    return questions.filter(q => q.options.length > 0);
}

function renderQuiz(questions) {
    const quizBody = document.getElementById('quizBody');
    quizBody.innerHTML = '';
    
    questions.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'quiz-question';
        qDiv.style.marginBottom = '20px';
        qDiv.style.background = 'rgba(255,255,255,0.05)';
        qDiv.style.padding = '15px';
        qDiv.style.borderRadius = '8px';
        
        qDiv.innerHTML = `
            <h3 style="margin-top:0; font-size:1rem; margin-bottom:10px;">${index + 1}. ${q.text}</h3>
            <div class="quiz-options" style="display:flex; flex-direction:column; gap:8px;">
                ${q.options.map((opt, optIndex) => `
                    <div class="quiz-option" style="padding:8px; background:rgba(0,0,0,0.2); border-radius:4px;">
                        <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                            <input type="${hasMultipleCorrect(q) ? 'checkbox' : 'radio'}" 
                                   name="q${index}" 
                                   value="${optIndex}"
                                   ${hasMultipleCorrect(q) ? '' : 'required'}>
                            <span>${opt.text}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
        quizBody.appendChild(qDiv);
    });
}

function hasMultipleCorrect(question) {
    return question.options.filter(o => o.isCorrect).length > 1;
}

async function submitQuiz() {
    let score = 0;
    const results = [];
    
    currentQuizQuestions.forEach((q, index) => {
        const selectedInputs = document.querySelectorAll(`input[name="q${index}"]:checked`);
        const selectedIndices = Array.from(selectedInputs).map(i => parseInt(i.value));
        const correctIndices = q.options.map((o, i) => o.isCorrect ? i : -1).filter(i => i !== -1);
        
        const isCorrect = selectedIndices.length === correctIndices.length && selectedIndices.every(val => correctIndices.includes(val));
        if (isCorrect) score++;
        
        results.push({ question: q.text, isCorrect, selected: selectedIndices, correct: correctIndices });
        
        const qDiv = document.querySelectorAll('.quiz-question')[index];
        if (isCorrect) qDiv.style.borderLeft = '4px solid #10b981';
        else qDiv.style.borderLeft = '4px solid #ef4444';
    });
    
    const btnSubmit = document.querySelector('.btn-submit-quiz');
    btnSubmit.innerText = 'Guardando...';
    btnSubmit.disabled = true;
    
    try {
        await fetch(`/api/progress/submit-evaluation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topicId: currentQuizTopicId,
                score: score,
                maxScore: currentQuizQuestions.length,
                answers: results,
                timeSpent: 0
            })
        });
    } catch(e) { console.error(e); }
    
    const percentage = Math.round((score / currentQuizQuestions.length) * 100);
    const quizBody = document.getElementById('quizBody');
    quizBody.insertAdjacentHTML('afterbegin', `
        <div style="background:${percentage >= 70 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; padding:15px; border-radius:8px; margin-bottom:20px; text-align:center;">
            <h2 style="margin:0; color:${percentage >= 70 ? '#10b981' : '#ef4444'}">${percentage}%</h2>
            <p style="margin:5px 0 0 0;">Has acertado ${score} de ${currentQuizQuestions.length}</p>
        </div>
    `);
    
    btnSubmit.style.display = 'none';
    quizBody.scrollTop = 0;
}

async function markTopicComplete(topicId) {
    if(!topicId) return;
    try {
        await fetch('/api/progress/mark-complete', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                courseId: 'default', 
                moduleId: 'default', 
                topicId: topicId 
            })
        });
        
        // Update UI
        const activeRow = document.querySelector('.menu-item.active');
        if(activeRow && !activeRow.querySelector('ion-icon[name="checkmark-circle"]')) {
             activeRow.classList.add('completed');
             // Append icon just before any extra icons or at end
             const span = activeRow.querySelector('span'); // text span
             if(span) {
                span.insertAdjacentHTML('afterend', '<ion-icon name="checkmark-circle" style="color:#10b981; margin-left:5px; font-size:0.9em;" title="Completado"></ion-icon>');
             }
        }
    } catch(e) { console.error('Error marking complete', e); }
}
