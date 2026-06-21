const ITEMS_PER_PAGE = 20;

const sectionIcons = {
  Stories:    "bi-feather",
  Characters: "bi-person-fill",
  Locations:  "bi-geo-alt-fill",
  Objects:    "bi-box-fill"
};

const sectionMap = {
  Stories:    "B-Stories",
  Characters: "C-Characters",
  Locations:  "D-Locations",
  Objects:    "E-Objects"
};

const sectionItems = { Stories: [], Characters: [], Locations: [], Objects: [] };
const sectionPage  = { Stories: 1,  Characters: 1,  Locations: 1,  Objects: 1  };
const sectionView  = { Stories: "list", Characters: "list", Locations: "list", Objects: "list" };

let activeSection = null;
// ===== INICIALIZA CONTROLES DE CADA SEÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  Object.keys(sectionMap).forEach(section => {
    const sectionEl = document.getElementById(sectionMap[section]);
    if (!sectionEl) return;

    const tab = sectionEl.querySelector(".section-tab");

    const actions = document.createElement("div");
    actions.className = "section-tab-actions";

    const btnAdd = tab.querySelector(".btn-add");
    tab.removeChild(btnAdd);

    const viewToggle = document.createElement("div");
    viewToggle.className = "view-toggle";
    viewToggle.innerHTML = `
      <button class="view-btn active" data-view="list" title="List view">
        <i class="bi bi-list-ul"></i>
      </button>
      <button class="view-btn" data-view="grid" title="Grid view">
        <i class="bi bi-grid-fill"></i>
      </button>
    `;

    viewToggle.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        sectionView[section] = btn.dataset.view;
        viewToggle.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderSection(section);
      });
    });

    actions.appendChild(viewToggle);
    actions.appendChild(btnAdd);
    tab.appendChild(actions);

    const list = sectionEl.querySelector(".section-list");
    const pagination = document.createElement("div");
    pagination.className = "section-pagination";
    list.after(pagination);
  });
});
// ===== RENDERIZA PÁGINA ATUAL DE UMA SEÇÃO =====
function renderSection(section) {
  const sectionEl = document.getElementById(sectionMap[section]);
  if (!sectionEl) return;

  const list  = sectionEl.querySelector(".section-list");
  const pagEl = sectionEl.querySelector(".section-pagination");
  const items = sectionItems[section];
  const view  = sectionView[section];
  const page  = sectionPage[section];

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  if (page > totalPages) sectionPage[section] = totalPages;
  const curPage = sectionPage[section];

  const start = (curPage - 1) * ITEMS_PER_PAGE;
  const slice = items.slice(start, start + ITEMS_PER_PAGE);

  list.innerHTML = "";
  if (view === "grid") {
    list.classList.add("grid-view");
  } else {
    list.classList.remove("grid-view");
  }

  slice.forEach(item => {
    const card = buildCard(section, item.id, item.name);
    list.appendChild(card);
  });

  renderPagination(pagEl, section, curPage, totalPages);
}
// ===== RENDERIZA PAGINAÇÃO =====
function renderPagination(container, section, curPage, totalPages) {
  container.innerHTML = "";
  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.className = "page-btn";
  prev.textContent = "‹";
  prev.disabled = curPage === 1;
  prev.addEventListener("click", () => {
    sectionPage[section] = curPage - 1;
    renderSection(section);
  });
  container.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === curPage ? " active" : "");
    btn.textContent = i;
    const p = i;
    btn.addEventListener("click", () => {
      sectionPage[section] = p;
      renderSection(section);
    });
    container.appendChild(btn);
  }

  const next = document.createElement("button");
  next.className = "page-btn";
  next.textContent = "›";
  next.disabled = curPage === totalPages;
  next.addEventListener("click", () => {
    sectionPage[section] = curPage + 1;
    renderSection(section);
  });
  container.appendChild(next);
}
// ===== CONSTRÓI UM CARD =====
function buildCard(section, id, name) {
  const icon = sectionIcons[section] || "bi-file";

  const card = document.createElement("div");
  card.className = "section-card";
  card.dataset.id = id;
  card.innerHTML = `
    <div class="card-thumb"><i class="bi ${icon}"></i></div>
    <div class="card-info">
      <span class="card-name">${name}</span>
    </div>
    <button class="card-delete" title="Delete">
      <i class="bi bi-trash3"></i>
    </button>
  `;

  card.querySelector(".card-delete").addEventListener("click", async (e) => {
    e.stopPropagation();
    await deleteItem(section, id, card);
  });

  card.addEventListener("click", () => openItemView(section, card, name, icon));

  return card;
}
// ===== DADOS DOS SELECTS DE PERSONAGEM =====
const STORY_ROLES = [
  "Protagonista", "Co-protagonista", "Antagonista", "Secundário",
  "Mentor", "Rival", "Aliado", "Figurante"
];
const CHAR_CLASSES = [
  "Herói", "Vilão", "Guerreiro", "Mago", "Arqueiro", "Cavaleiro",
  "Ferreiro", "Alquimista", "Sacerdote", "Mercador", "Assassino",
  "Caçador", "Bárbaro", "Monge", "Bardo", "Druida", "Invocador",
  "Necromante", "Curandeiro", "Cientista", "Inventor", "Fazendeiro"
];

function buildSelectOptions(values, selected) {
  const blank = `<option value="">— Selecionar —</option>`;
  return blank + values.map(v =>
    `<option value="${v}"${v === selected ? " selected" : ""}>${v}</option>`
  ).join("");
}
// ===== ABRIR ITEM VIEW =====
async function openItemView(section, card, name, icon) {
  const sectionEl = document.getElementById(sectionMap[section]);
  if (!sectionEl) return;

  sectionEl.querySelectorAll(".section-card").forEach(c => c.classList.remove("active"));
  card.classList.add("active");

  const content = sectionEl.querySelector(".section-content");
  const itemId  = card.dataset.id;

  content.innerHTML = `
    <div class="item-view">
      <div class="item-view-header">
        <div class="item-view-thumb"><i class="bi ${icon}"></i></div>
        <div class="item-view-name-wrap">
          <span class="item-view-name">${name}</span>
          <button class="item-view-edit-btn" title="Edit name">
            <i class="bi bi-pencil"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  if (section !== "Characters") return;

  const userId = window.currentUserId;
  if (!userId) return;

  let story_role = "", character_class = "";
  try {
    const res  = await fetch(`/get-item?section=Characters&id=${itemId}&user_id=${userId}`);
    const data = await res.json();
    if (data.success) {
      story_role      = data.item.story_role      || "";
      character_class = data.item.character_class || "";
    }
  } catch { /* silently skip */ }

  const view = content.querySelector(".item-view");
  const attrsEl = document.createElement("div");
  attrsEl.className = "char-attrs";
  attrsEl.innerHTML = `
    <div>
      <div class="char-attrs-title">Atributos do Personagem</div>
      <div class="char-attrs-grid">
        <div class="char-attr-field">
          <label>Papel na História</label>
          <select class="char-attr-select" id="attr-story-role">
            ${buildSelectOptions(STORY_ROLES, story_role)}
          </select>
        </div>
        <div class="char-attr-field">
          <label>Classe</label>
          <select class="char-attr-select" id="attr-class">
            ${buildSelectOptions(CHAR_CLASSES, character_class)}
          </select>
        </div>
      </div>
    </div>
    <span class="char-save-status" id="char-save-status"></span>
  `;
  view.appendChild(attrsEl);

  const roleEl   = attrsEl.querySelector("#attr-story-role");
  const classEl  = attrsEl.querySelector("#attr-class");
  const statusEl = attrsEl.querySelector("#char-save-status");

  async function saveAttrs() {
    statusEl.textContent = "Salvando...";
    statusEl.className   = "char-save-status";
    try {
      const res  = await fetch("/update-character", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(itemId),
          user_id: userId,
          story_role: roleEl.value,
          character_class: classEl.value
        })
      });
      const data = await res.json();
      if (data.success) {
        statusEl.textContent = "✓ Salvo";
        statusEl.className   = "char-save-status saved";
        setTimeout(() => { statusEl.textContent = ""; }, 2000);
      } else {
        statusEl.textContent = "Erro ao salvar";
        statusEl.className   = "char-save-status error";
      }
    } catch {
      statusEl.textContent = "Sem conexão";
      statusEl.className   = "char-save-status error";
    }
  }

  roleEl.addEventListener("change",  saveAttrs);
  classEl.addEventListener("change", saveAttrs);
}
// ===== DELETAR ITEM =====
async function deleteItem(section, id, card) {
  const userId = window.currentUserId;
  if (!userId) return;

  try {
    const res  = await fetch("/delete-item", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, id, user_id: userId })
    });
    const data = await res.json();
    if (data.success) {
      sectionItems[section] = sectionItems[section].filter(i => i.id !== id);

      const sectionEl = document.getElementById(sectionMap[section]);
      if (card.classList.contains("active")) {
        const content = sectionEl?.querySelector(".section-content");
        if (content) {
          content.innerHTML = `<p class="section-placeholder">Select an existing item or create a new one to begin.</p>`;
        }
      }

      renderSection(section);
    } else {
      alert(data.error || "Failed to delete item.");
    }
  } catch {
    alert("Unable to connect to the server.");
  }
}
// ===== ADICIONAR CARD NA LISTA =====
function addCardToList(section, id, name) {
  if (!sectionItems[section]) return;
  sectionItems[section].push({ id, name });

  const total = sectionItems[section].length;
  sectionPage[section] = Math.ceil(total / ITEMS_PER_PAGE);

  renderSection(section);
}
// ===== CARREGAR ITENS DO BANCO =====
async function loadUserItems(userId) {
  try {
    const res  = await fetch(`/get-items?user_id=${userId}`);
    const data = await res.json();
    if (!data.success) return;

    for (const [section, items] of Object.entries(data.items)) {
      sectionItems[section] = items;
      sectionPage[section]  = 1;
      renderSection(section);     
    }
  } catch (e) {
    console.error("Erro ao carregar itens:", e);
  }
}

window.loadUserItems = loadUserItems;
// ===== OPEN MODAL =====
document.querySelectorAll(".btn-add").forEach(button => {
  button.addEventListener("click", () => {
    activeSection = button.dataset.section;
    document.getElementById("create-modal").classList.add("open");
  });
});

// ===== CANCEL MODAL =====
document.querySelectorAll(".modal-btn-cancel").forEach(button => {
  button.addEventListener("click", () => {
    document.getElementById("create-modal").classList.remove("open");
    document.getElementById("modal-name-input").value = "";
    document.getElementById("modal-name-input").style.borderColor = "";
  });
});
// ===== CONFIRM MODAL (salvar no banco) =====
document.getElementById('modal-confirm').addEventListener('click', async () => {
  const name    = document.getElementById('modal-name-input').value.trim();
  const userId  = window.currentUserId;

  if (!name) {
    document.getElementById('modal-name-input').placeholder = 'Enter a name...';
    document.getElementById('modal-name-input').style.borderColor = 'red';
    return;
  }

  if (!userId) {
    alert('You must be logged in to create items.');
    return;
  }

  try {
    const res  = await fetch('/create-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: activeSection, name, user_id: userId })
    });
    const data = await res.json();

    if (data.success) {
      addCardToList(activeSection, data.id, data.name);
      document.getElementById("create-modal").classList.remove("open");
      document.getElementById("modal-name-input").value = "";
      document.getElementById("modal-name-input").style.borderColor = "";
    } else {
      alert(data.error || "Failed to create item.");
    }
  } catch {
    alert("Unable to connect to the server.");
  }
});