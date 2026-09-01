/* ==========================================================================
   R2TEC — main.js
   Navegação, drawer do carrinho, modal de detalhes do produto e
   formulário de solicitação de orçamento (gera mensagem para WhatsApp).
   ========================================================================== */

/* -----------------------------------------------------------------------
   CONFIGURAÇÃO — altere aqui o número de WhatsApp da empresa
   Formato: código do país + DDD + número, somente dígitos.
   ----------------------------------------------------------------------- */
window.R2_WHATSAPP_NUMBER = "558584222062"; // TODO: substituir pelo número real da R2TEC

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initCartUI();
  initProductModal();
  initQuoteModal();
  initToast();
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});

/* ---------------------------------------------------------------------- */
/* Navegação mobile                                                       */
/* ---------------------------------------------------------------------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    const expanded = nav.classList.contains("open");
    toggle.setAttribute("aria-expanded", expanded);
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
}

/* ---------------------------------------------------------------------- */
/* Toast                                                                  */
/* ---------------------------------------------------------------------- */
function initToast() {
  if (document.querySelector(".toast")) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span data-toast-text></span>`;
  document.body.appendChild(toast);
}
function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.querySelector("[data-toast-text]").textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* ---------------------------------------------------------------------- */
/* Carrinho / drawer de orçamento                                         */
/* ---------------------------------------------------------------------- */
function initCartUI() {
  ensureDrawer();
  updateCartCount();

  // Delegação: botões "+ Orçamento" em qualquer página
  document.addEventListener("click", async (e) => {
    const addBtn = e.target.closest(".btn-add");
    if (addBtn) {
      const id = Number(addBtn.dataset.id);
      const produtos = await R2Catalog.load();
      const produto = produtos.find((p) => p.id === id);
      if (produto) {
        R2Cart.add(produto, 1);
        showToast(`"${produto.nome}" adicionado ao orçamento.`);
        pulseCartIcon();
      }
    }

    const cartOpenBtn = e.target.closest("[data-cart-open]");
    if (cartOpenBtn) {
      e.preventDefault();
      openDrawer();
    }
  });

  document.addEventListener("r2cart:change", () => {
    updateCartCount();
    renderDrawer();
  });
}

function pulseCartIcon() {
  const btn = document.querySelector("[data-cart-open]");
  if (!btn) return;
  btn.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }],
    { duration: 320, easing: "ease-out" }
  );
}

function updateCartCount() {
  const count = R2Cart.getCount();
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = count;
    el.dataset.empty = count === 0 ? "true" : "false";
  });
}

function ensureDrawer() {
  if (document.querySelector(".drawer")) return;

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.setAttribute("data-drawer-overlay", "");

  const drawer = document.createElement("aside");
  drawer.className = "drawer";
  drawer.setAttribute("aria-label", "Solicitação de orçamento");
  drawer.innerHTML = `
    <div class="drawer-head">
      <h3>Minha solicitação de orçamento</h3>
      <button type="button" class="drawer-close" data-drawer-close aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="drawer-body" data-drawer-body></div>
    <div class="drawer-foot" data-drawer-foot></div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  overlay.addEventListener("click", closeDrawer);
  drawer.querySelector("[data-drawer-close]").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  renderDrawer();
}

function openDrawer() {
  document.querySelector(".drawer").classList.add("open");
  document.querySelector("[data-drawer-overlay]").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeDrawer() {
  const drawer = document.querySelector(".drawer");
  const overlay = document.querySelector("[data-drawer-overlay]");
  if (drawer) drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
}

function renderDrawer() {
  const body = document.querySelector("[data-drawer-body]");
  const foot = document.querySelector("[data-drawer-foot]");
  if (!body || !foot) return;

  const items = R2Cart.getItems();

  if (!items.length) {
    body.innerHTML = `<div class="cart-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6L4 3H2"/></svg>
      <p>Sua solicitação de orçamento está vazia.</p>
      <a href="produtos.html" class="btn btn-outline btn-sm">Ver produtos</a>
    </div>`;
    foot.innerHTML = "";
    return;
  }

  body.innerHTML = items
    .map((item) => {
      const src = R2Catalog.fmtImgSrc(item.imagem);
      return `
      <div class="cart-item" data-cart-item="${item.id}">
        <div class="cart-item-media">
          ${src ? `<img src="${src}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ""}
          <div class="ph-wrap" style="display:${src ? "none" : "flex"};width:100%;height:100%;align-items:center;justify-content:center;">${R2Catalog.PLACEHOLDER_ICON}</div>
        </div>
        <div class="cart-item-info">
          <span class="product-cat">${R2Catalog.escapeHtml(item.categoria?.nome || "")}</span>
          <h4>${R2Catalog.escapeHtml(item.nome)}</h4>
          <div class="qty-control">
            <button type="button" data-qty-minus="${item.id}" aria-label="Diminuir quantidade">−</button>
            <span>${item.quantidade}</span>
            <button type="button" data-qty-plus="${item.id}" aria-label="Aumentar quantidade">+</button>
          </div>
          <button type="button" class="cart-item-remove" data-cart-remove="${item.id}">Remover</button>
        </div>
      </div>`;
    })
    .join("");

  const totalItens = items.reduce((s, i) => s + i.quantidade, 0);
  foot.innerHTML = `
    <div class="cart-summary-row"><span>Itens no carrinho</span><strong>${totalItens}</strong></div>
    <button type="button" class="btn btn-primary btn-block" data-open-quote>Solicitar orçamento</button>
    <button type="button" class="btn btn-ghost btn-block" data-cart-clear>Limpar lista</button>
  `;

  body.querySelectorAll("[data-qty-plus]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.qtyPlus);
      const item = R2Cart.getItems().find((i) => i.id === id);
      if (item) R2Cart.updateQty(id, item.quantidade + 1);
    })
  );
  body.querySelectorAll("[data-qty-minus]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.qtyMinus);
      const item = R2Cart.getItems().find((i) => i.id === id);
      if (item) R2Cart.updateQty(id, item.quantidade - 1);
    })
  );
  body.querySelectorAll("[data-cart-remove]").forEach((btn) =>
    btn.addEventListener("click", () => R2Cart.remove(Number(btn.dataset.cartRemove)))
  );
  const clearBtn = foot.querySelector("[data-cart-clear]");
  if (clearBtn) clearBtn.addEventListener("click", () => R2Cart.clear());

  const quoteBtn = foot.querySelector("[data-open-quote]");
  if (quoteBtn) quoteBtn.addEventListener("click", () => { closeDrawer(); openQuoteModal(); });
}

/* ---------------------------------------------------------------------- */
/* Modal — detalhes do produto                                            */
/* ---------------------------------------------------------------------- */
function initProductModal() {
  ensureProductModal();

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-detalhes");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const produtos = await R2Catalog.load();
    const produto = produtos.find((p) => p.id === id);
    if (produto) openProductModal(produto);
  });

  // Suporta abrir produto direto via ?produto=ID (link compartilhável)
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("produto");
  if (idParam) {
    R2Catalog.load().then((produtos) => {
      const produto = produtos.find((p) => p.id === Number(idParam));
      if (produto) openProductModal(produto);
    });
  }
}

function ensureProductModal() {
  if (document.querySelector(".product-modal")) return;
  const modal = document.createElement("div");
  modal.className = "modal product-modal";
  modal.innerHTML = `
    <div class="modal-panel" data-product-panel role="dialog" aria-modal="true">
      <button type="button" class="modal-close" data-modal-close aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <div data-product-content></div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeProductModal();
  });
  modal.querySelector("[data-modal-close]").addEventListener("click", closeProductModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProductModal();
  });
}

function openProductModal(produto) {
  const modal = document.querySelector(".product-modal");
  const content = modal.querySelector("[data-product-content]");
  const gallery = R2Catalog.getGallery(produto);
  const mainSrc = R2Catalog.fmtImgSrc(gallery[0] || "");

  content.innerHTML = `
    <div class="product-detail">
      <div class="product-gallery">
        <div class="product-detail-media" data-gallery-main>
          ${mainSrc ? `<img src="${mainSrc}" alt="${R2Catalog.escapeHtml(produto.nome)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ""}
          <div class="ph-wrap" style="display:${mainSrc ? "none" : "flex"};width:100%;height:100%;align-items:center;justify-content:center;">${R2Catalog.PLACEHOLDER_ICON}</div>
        </div>
        ${gallery.length > 1 ? `
        <div class="gallery-thumbs" data-gallery-thumbs>
          ${gallery.map((img, i) => `
            <button type="button" class="gallery-thumb ${i === 0 ? "active" : ""}" data-gallery-src="${R2Catalog.escapeHtml(R2Catalog.fmtImgSrc(img))}">
              <img src="${R2Catalog.fmtImgSrc(img)}" alt="${R2Catalog.escapeHtml(produto.nome)} — foto ${i + 1}" loading="lazy">
            </button>`).join("")}
        </div>` : ""}
      </div>
      <div class="product-detail-info">
        <span class="product-cat">${R2Catalog.escapeHtml(produto.categoria.nome)}</span>
        <h2>${R2Catalog.escapeHtml(produto.nome)}</h2>
        <span class="product-sub">${R2Catalog.escapeHtml(produto.categoria.subcategoria)}</span>
        <p>${R2Catalog.escapeHtml(produto.detalhes)}</p>
        <div class="availability-row">
          <span class="avail-pill ${produto.venda ? "yes" : "no"}"><span class="dot"></span>Disponível para venda</span>
          <span class="avail-pill ${produto.locacao ? "yes" : "no"}"><span class="dot"></span>Disponível para locação</span>
        </div>
        <dl class="detail-specs">
          <dt>Categoria</dt><dd>${R2Catalog.escapeHtml(produto.categoria.nome)}</dd>
          <dt>Subcategoria</dt><dd>${R2Catalog.escapeHtml(produto.categoria.subcategoria)}</dd>
          <dt>Código interno</dt><dd>R2T-${String(produto.id).padStart(4, "0")}</dd>
        </dl>
        <div class="detail-actions">
          <button type="button" class="btn btn-primary btn-add" data-id="${produto.id}">+ Adicionar ao orçamento</button>
          <button type="button" class="btn btn-outline" data-open-quote-direct="${produto.id}">Solicitar orçamento agora</button>
          ${produto.manual ? `<a href="${R2Catalog.escapeHtml(produto.manual)}" target="_blank" rel="noopener" class="btn btn-outline">Ver manual do produto</a>` : ""}
        </div>
      </div>
    </div>`;

  content.querySelectorAll("[data-gallery-src]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const src = thumb.dataset.gallerySrc;
      const mainWrap = content.querySelector("[data-gallery-main]");
      let img = mainWrap.querySelector("img");
      const phWrap = mainWrap.querySelector(".ph-wrap");
      if (!img) {
        img = document.createElement("img");
        img.alt = R2Catalog.escapeHtml(produto.nome);
        img.onerror = () => { img.style.display = "none"; phWrap.style.display = "flex"; };
        mainWrap.insertBefore(img, phWrap);
      }
      img.style.display = "";
      phWrap.style.display = "none";
      img.src = src;
      content.querySelectorAll("[data-gallery-src]").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  content.querySelector("[data-open-quote-direct]").addEventListener("click", async () => {
    const produtos = await R2Catalog.load();
    const p = produtos.find((pp) => pp.id === produto.id);
    if (p) R2Cart.add(p, 1);
    closeProductModal();
    openQuoteModal();
  });

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  const modal = document.querySelector(".product-modal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

/* ---------------------------------------------------------------------- */
/* Modal — formulário de orçamento + WhatsApp                             */
/* ---------------------------------------------------------------------- */
function initQuoteModal() {
  ensureQuoteModal();
  document.querySelectorAll("[data-quote-trigger]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openQuoteModal();
    })
  );
}

function ensureQuoteModal() {
  if (document.querySelector(".quote-modal")) return;
  const modal = document.createElement("div");
  modal.className = "modal quote-modal";
  modal.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true">
      <button type="button" class="modal-close" data-modal-close aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <div class="quote-form">
        <h2>Solicitar orçamento</h2>
        <p>Confira os itens selecionados e preencha seus dados. Vamos gerar uma mensagem para enviar via WhatsApp.</p>
        <div class="quote-summary" data-quote-summary></div>
        <form data-quote-form novalidate>
          <div class="field-row">
            <div class="field">
              <label for="qNome">Nome <span class="req">*</span></label>
              <input type="text" id="qNome" name="nome" required>
            </div>
            <div class="field">
              <label for="qEmpresa">Empresa</label>
              <input type="text" id="qEmpresa" name="empresa">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="qEmail">E-mail <span class="req">*</span></label>
              <input type="email" id="qEmail" name="email" required>
            </div>
            <div class="field">
              <label for="qTelefone">Telefone / WhatsApp <span class="req">*</span></label>
              <input type="tel" id="qTelefone" name="telefone" required>
            </div>
          </div>
          <div class="field">
            <label for="qObs">Observações</label>
            <textarea id="qObs" name="observacoes" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-block">
            Enviar solicitação via WhatsApp
          </button>
          <p class="form-note">Ao enviar, o WhatsApp será aberto com sua mensagem já preenchida para confirmação e envio.</p>
        </form>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeQuoteModal(); });
  modal.querySelector("[data-modal-close]").addEventListener("click", closeQuoteModal);

  modal.querySelector("[data-quote-form]").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    sendQuoteToWhatsApp(data);
  });
}

function openQuoteModal() {
  renderQuoteSummary();
  const modal = document.querySelector(".quote-modal");
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeQuoteModal() {
  const modal = document.querySelector(".quote-modal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

function renderQuoteSummary() {
  const el = document.querySelector("[data-quote-summary]");
  const items = R2Cart.getItems();
  const submitBtn = document.querySelector("[data-quote-form] button[type=submit]");
  if (!items.length) {
    el.innerHTML = `<em style="color:var(--muted-2)">Nenhum produto adicionado ainda. Você também pode enviar a solicitação apenas com uma mensagem de contato.</em>`;
  } else {
    el.innerHTML = items
      .map((i) => `<div class="quote-summary-item"><span>${i.quantidade}x ${R2Catalog.escapeHtml(i.nome)}</span></div>`)
      .join("");
  }
}

function sendQuoteToWhatsApp(data) {
  const items = R2Cart.getItems();
  let msg = "Olá, gostaria de solicitar um orçamento";
  msg += items.length ? " para os seguintes produtos:\n\n" : ".\n\n";
  items.forEach((i) => {
    msg += `${i.quantidade}x ${i.nome}\n`;
  });
  msg += "\n";
  msg += `Nome: ${data.nome}\n`;
  if (data.empresa) msg += `Empresa: ${data.empresa}\n`;
  msg += `E-mail: ${data.email}\n`;
  msg += `Telefone: ${data.telefone}\n`;
  if (data.observacoes) msg += `Observações: ${data.observacoes}\n`;

  const url = `https://wa.me/${window.R2_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
  closeQuoteModal();
  showToast("Solicitação preparada! Confirme o envio no WhatsApp.");
}

/* Exposto para uso em produtos.html (filtros) */
window.R2_openQuoteModal = openQuoteModal;
