/* ==========================================================================
   R2TEC — Lógica da página produtos.html
   Filtros por categoria/subcategoria/venda/locação + busca, 100% client-side.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productsGrid");
  const filtersForm = document.getElementById("filtersForm");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const resultsCount = document.getElementById("resultsCount");
  const activeChips = document.getElementById("activeChips");
  const clearFiltersBtn = document.getElementById("clearFilters");

  if (!grid) return; // não estamos na página de produtos

  const produtos = await R2Catalog.load();

  const state = {
    categorias: new Set(),
    subcategorias: new Set(),
    venda: false,
    locacao: false,
    busca: "",
    ordenar: "relevancia",
  };

  // Preselecionar categoria via querystring (?categoria=Redes), usado pela Home
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get("categoria");
  if (catParam) state.categorias.add(catParam);

  buildFilterOptions();
  applyFilters();

  function buildFilterOptions() {
    const categorias = {};
    produtos.forEach((p) => {
      const cat = p.categoria.nome;
      const sub = p.categoria.subcategoria;
      if (!categorias[cat]) categorias[cat] = new Set();
      categorias[cat].add(sub);
    });

    const catGroup = document.getElementById("categoriaOptions");
    const subGroup = document.getElementById("subcategoriaOptions");

    catGroup.innerHTML = Object.keys(categorias)
      .sort()
      .map((cat) => {
        const count = produtos.filter((p) => p.categoria.nome === cat).length;
        const checked = state.categorias.has(cat) ? "checked" : "";
        return `<label class="filter-option">
          <input type="checkbox" value="${R2Catalog.escapeHtml(cat)}" data-filter="categoria" ${checked}>
          ${R2Catalog.escapeHtml(cat)}
          <span class="filter-count">${count}</span>
        </label>`;
      })
      .join("");

    function renderSubOptions() {
      const relevantCats = state.categorias.size ? [...state.categorias] : Object.keys(categorias);
      const subs = new Set();
      relevantCats.forEach((c) => categorias[c] && categorias[c].forEach((s) => subs.add(s)));
      subGroup.innerHTML = [...subs]
        .sort()
        .map((sub) => {
          const checked = state.subcategorias.has(sub) ? "checked" : "";
          return `<label class="filter-option">
            <input type="checkbox" value="${R2Catalog.escapeHtml(sub)}" data-filter="subcategoria" ${checked}>
            ${R2Catalog.escapeHtml(sub)}
          </label>`;
        })
        .join("");
      subGroup.querySelectorAll("input").forEach((el) => el.addEventListener("change", onFilterChange));
    }
    renderSubOptions();

    catGroup.querySelectorAll("input").forEach((el) =>
      el.addEventListener("change", () => {
        renderSubOptions();
        onFilterChange();
      })
    );
  }

  function onFilterChange() {
    state.categorias = new Set(
      [...filtersForm.querySelectorAll('[data-filter="categoria"]:checked')].map((el) => el.value)
    );
    state.subcategorias = new Set(
      [...filtersForm.querySelectorAll('[data-filter="subcategoria"]:checked')].map((el) => el.value)
    );
    state.venda = filtersForm.querySelector('[data-filter="venda"]').checked;
    state.locacao = filtersForm.querySelector('[data-filter="locacao"]').checked;
    applyFilters();
  }

  filtersForm.addEventListener("change", onFilterChange);

  searchInput.addEventListener("input", () => {
    state.busca = searchInput.value.trim().toLowerCase();
    applyFilters();
  });

  sortSelect.addEventListener("change", () => {
    state.ordenar = sortSelect.value;
    applyFilters();
  });

  clearFiltersBtn.addEventListener("click", () => {
    state.categorias.clear();
    state.subcategorias.clear();
    state.venda = false;
    state.locacao = false;
    state.busca = "";
    searchInput.value = "";
    filtersForm.querySelectorAll("input[type=checkbox]").forEach((el) => (el.checked = false));
    buildFilterOptions();
    applyFilters();
  });

  function applyFilters() {
    let result = produtos.filter((p) => {
      if (state.categorias.size && !state.categorias.has(p.categoria.nome)) return false;
      if (state.subcategorias.size && !state.subcategorias.has(p.categoria.subcategoria)) return false;
      if (state.venda && !p.venda) return false;
      if (state.locacao && !p.locacao) return false;
      if (state.busca && !p.nome.toLowerCase().includes(state.busca)) return false;
      return true;
    });

    if (state.ordenar === "az") result.sort((a, b) => a.nome.localeCompare(b.nome));
    if (state.ordenar === "za") result.sort((a, b) => b.nome.localeCompare(a.nome));

    R2Catalog.renderGrid(grid, result);
    resultsCount.textContent = `${result.length} produto${result.length === 1 ? "" : "s"} encontrado${result.length === 1 ? "" : "s"}`;
    renderChips();
  }

  function renderChips() {
    const chips = [];
    state.categorias.forEach((c) => chips.push({ label: c, type: "categoria" }));
    state.subcategorias.forEach((s) => chips.push({ label: s, type: "subcategoria" }));
    if (state.venda) chips.push({ label: "Venda", type: "venda" });
    if (state.locacao) chips.push({ label: "Locação", type: "locacao" });

    if (!chips.length) {
      activeChips.innerHTML = "";
      return;
    }

    activeChips.innerHTML = chips
      .map(
        (c) =>
          `<span class="chip">${R2Catalog.escapeHtml(c.label)}<button type="button" data-remove-chip="${c.type}" data-remove-value="${R2Catalog.escapeHtml(c.label)}">×</button></span>`
      )
      .join("");

    activeChips.querySelectorAll("[data-remove-chip]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const type = btn.dataset.removeChip;
        const value = btn.dataset.removeValue;
        if (type === "venda") {
          filtersForm.querySelector('[data-filter="venda"]').checked = false;
        } else if (type === "locacao") {
          filtersForm.querySelector('[data-filter="locacao"]').checked = false;
        } else {
          const input = filtersForm.querySelector(`[data-filter="${type}"][value="${CSS.escape(value)}"]`);
          if (input) input.checked = false;
        }
        onFilterChange();
      })
    );
  }
});
