/* ==========================================================================
   R2TEC — Rodapé compartilhado
   Injeta o mesmo rodapé em todas as páginas a partir de <footer id="footer">.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById("footer");
  if (!target) return;

  target.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="images/logo/r2tec-logo-dark-bg.jpg" alt="R2TEC">
          <p>Tecnologia, prestação de serviços e venda/locação de equipamentos de informática e infraestrutura para empresas.</p>
          <div class="social-row">
            <a href="https://www.instagram.com/r2technologie/" target="_blank" rel="noopener" aria-label="Instagram da R2TEC">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
            </a>
          </div>
        </div>
        <div class="footer-col">
          <h5>Navegação</h5>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="produtos.html">Produtos</a></li>
            <li><a href="servicos.html">Serviços</a></li>
            <li><a href="sobre.html">Sobre a empresa</a></li>
            <li><a href="contato.html">Contato</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Catálogo</h5>
          <ul>
            <li><a href="produtos.html?categoria=Computadores">Computadores</a></li>
            <li><a href="produtos.html?categoria=Servidores">Servidores</a></li>
            <li><a href="produtos.html?categoria=Redes">Redes</a></li>
            <li><a href="produtos.html?categoria=Monitores">Monitores</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Contato</h5>
          <ul>
            <li><a href="contato.html">Fale com a equipe</a></li>
            <li><a href="#" data-quote-trigger>Solicitar orçamento</a></li>
            <li><a href="https://www.instagram.com/r2technologie/" target="_blank" rel="noopener">@r2technologie</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span data-year></span> R2TEC — Todos os direitos reservados.</span>
        <span>Tecnologia · Serviços · Equipamentos</span>
      </div>
    </div>
  `;
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Botão flutuante do WhatsApp
  const fab = document.getElementById("waFab");
  if (fab && !fab.dataset.filled) {
    fab.dataset.filled = "1";
    fab.outerHTML = `<a class="wa-fab" id="waFab" target="_blank" rel="noopener" aria-label="Falar no WhatsApp"
      href="https://wa.me/${window.R2_WHATSAPP_NUMBER || "5585999999999"}?text=${encodeURIComponent("Olá, gostaria de falar com a R2TEC.")}">
      <svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.02 2.67C8.65 2.67 2.67 8.65 2.67 16.02c0 2.5.68 4.85 1.87 6.87L2.67 29.33l6.6-1.83a13.3 13.3 0 006.75 1.84h.01c7.37 0 13.35-5.98 13.35-13.35S23.39 2.67 16.02 2.67zm0 24.03h-.01a11.1 11.1 0 01-5.68-1.56l-.41-.24-4.03 1.12 1.08-3.94-.27-.4a11.13 11.13 0 01-1.7-5.95c0-6.14 5-11.14 11.15-11.14 2.98 0 5.78 1.16 7.88 3.27a11.06 11.06 0 013.26 7.88c0 6.15-5 11.16-11.16 11.16zm6.11-8.35c-.33-.17-1.98-.98-2.29-1.09-.31-.11-.53-.17-.76.17s-.86 1.09-1.06 1.31c-.19.22-.39.25-.72.08-.33-.17-1.38-.51-2.63-1.62-.97-.87-1.63-1.94-1.82-2.27-.19-.33-.02-.5.15-.67.15-.15.33-.39.5-.58.17-.19.22-.33.33-.55.11-.22.06-.42-.03-.58-.08-.17-.76-1.83-1.04-2.5-.27-.66-.55-.57-.76-.58h-.65c-.22 0-.58.08-.89.42-.31.33-1.17 1.14-1.17 2.79 0 1.64 1.2 3.23 1.37 3.45.17.22 2.36 3.6 5.71 5.05.8.34 1.42.55 1.9.7.8.25 1.53.22 2.11.13.64-.1 1.98-.81 2.26-1.59.28-.78.28-1.44.19-1.59-.08-.14-.3-.22-.63-.39z"/></svg>
    </a>`;
  }
});
