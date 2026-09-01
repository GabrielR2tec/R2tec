/* ==========================================================================
   R2TEC — Catálogo de produtos
   Carrega data/produtos.json e expõe helpers de renderização usados em
   index.html (produtos em destaque) e produtos.html (catálogo completo
   com filtros e busca). Somente produtos com "ativo": true são exibidos.
   ========================================================================== */

const R2Catalog = (function () {
  const JSON_PATH = "data/produtos.json";

  let cache = null;

  const PLACEHOLDER_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="ph-icon"><rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21h8M12 17v4"/></svg>`;

  async function load() {
    if (cache) return cache;
    try {
      const res = await fetch(JSON_PATH, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      cache = (data.produtos || []).filter((p) => p.ativo === true);
      return cache;
    } catch (err) {
      console.error("Erro ao carregar produtos.json:", err);
      const container = document.querySelector("[data-catalog-error-target]") || document.body;
      const notice = document.createElement("div");
      notice.className = "empty-state";
      notice.innerHTML =
        "<strong>Não foi possível carregar o catálogo.</strong><br>Se você abriu este arquivo diretamente (file://), sirva a pasta por um servidor local (ex: <code>python -m http.server</code>) para que o navegador possa ler data/produtos.json.";
      container.prepend(notice);
      cache = [];
      return cache;
    }
  }

  function fmtImgSrc(src) {
    return src || "";
  }

  // Reúne todas as imagens do produto: a "imagem" (capa) sempre primeiro,
  // seguida das extras em "imagens" (array opcional), sem repetir.
  function getGallery(p) {
    const list = [];
    if (p.imagem) list.push(p.imagem);
    if (Array.isArray(p.imagens)) {
      p.imagens.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }

  function tagsHtml(p) {
    let html = "";
    if (p.venda) html += `<span class="tag tag-venda">Venda</span>`;
    if (p.locacao) html += `<span class="tag tag-locacao">Locação</span>`;
    return html;
  }

  function mediaHtml(p) {
    const src = fmtImgSrc(p.imagem);
    const galleryCount = getGallery(p).length;
    return `<div class="product-media">
      <div class="product-tags">${tagsHtml(p)}</div>
      ${src ? `<img src="${src}" alt="${escapeHtml(p.nome)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ""}
      <div class="ph-wrap" style="display:${src ? "none" : "flex"};width:100%;height:100%;align-items:center;justify-content:center;">${PLACEHOLDER_ICON}</div>
     
    </div>`;
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function cardHtml(p) {
    return `
    <article class="card product-card" data-id="${p.id}">
      ${mediaHtml(p)}
      <div class="product-body">
        <span class="product-cat">${escapeHtml(p.categoria.nome)}</span>
        <h3>${escapeHtml(p.nome)}</h3>
        <span class="product-sub">${escapeHtml(p.categoria.subcategoria)}</span>
        <div class="product-actions">
          <button type="button" class="btn btn-outline btn-detalhes" data-id="${p.id}">Ver detalhes</button>
          <button type="button" class="btn btn-primary btn-add" data-id="${p.id}">+ Orçamento</button>
        </div>
      </div>
    </article>`;
  }

  function renderGrid(container, produtos) {
    if (!produtos.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        <p style="margin:0">Nenhum produto encontrado com os filtros selecionados.</p>
      </div>`;
      return;
    }
    container.innerHTML = produtos.map(cardHtml).join("");
  }

  return { load, renderGrid, cardHtml, mediaHtml, getGallery, fmtImgSrc, escapeHtml, PLACEHOLDER_ICON };
})();
