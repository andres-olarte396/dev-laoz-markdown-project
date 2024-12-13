// Carga el menú y el contenido
async function loadMenu() {
  const response = await fetch("/api/menu");
  const menu = await response.json();
  renderMenu(menu);
}

function renderMenu(menu) {
  const container = document.getElementById("menu-container");
  container.innerHTML = "";
  createMenuList(container, menu);
}

function createMenuList(container, menu) {
  const list = document.createElement("ul");
  container.appendChild(list);

  menu.forEach((item) => {
    const element = document.createElement("li");
    element.textContent = item.name;
    element.className = item.isDirectory ? "folder" : "file";

    if (item.isDirectory) {
      createMenuList(element, item.children);
    }

    element.onclick = () => {
      element.addEventListener("click", function (event) {
        // Verifica que el clic sea directamente en el padre (no en subelementos)
        if (event.target === this) {
          loadContent(item.path);
          const childList = this.querySelector(":scope > ul"); // Encuentra el <ul> hijo directo
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

async function loadContent(path) {
  const response = await fetch(path);
  const content = await response.text();
  document.getElementById("content-container").innerHTML =
    marked.parse(content);
}

loadMenu();
