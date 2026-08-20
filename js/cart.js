/* ==========================================================================
   R2TEC — Carrinho de orçamento (localStorage)
   Não é um carrinho de compras: apenas monta a lista de itens que o
   visitante deseja incluir em uma solicitação de orçamento.
   ========================================================================== */

const R2Cart = (function () {
  const STORAGE_KEY = "r2tec_carrinho";

  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Não foi possível ler o carrinho:", e);
      return [];
    }
  }

  function write(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Não foi possível salvar o carrinho:", e);
    }
    document.dispatchEvent(new CustomEvent("r2cart:change", { detail: { items } }));
  }

  function getItems() {
    return read();
  }

  function getCount() {
    return read().reduce((sum, i) => sum + i.quantidade, 0);
  }

  function add(produto, quantidade) {
    quantidade = quantidade || 1;
    const items = read();
    const existing = items.find((i) => i.id === produto.id);
    if (existing) {
      existing.quantidade += quantidade;
    } else {
      items.push({
        id: produto.id,
        nome: produto.nome,
        categoria: produto.categoria,
        imagem: produto.imagem,
        quantidade: quantidade,
      });
    }
    write(items);
  }

  function updateQty(id, quantidade) {
    let items = read();
    if (quantidade <= 0) {
      items = items.filter((i) => i.id !== id);
    } else {
      const item = items.find((i) => i.id === id);
      if (item) item.quantidade = quantidade;
    }
    write(items);
  }

  function remove(id) {
    const items = read().filter((i) => i.id !== id);
    write(items);
  }

  function clear() {
    write([]);
  }

  return { getItems, getCount, add, updateQty, remove, clear };
})();
