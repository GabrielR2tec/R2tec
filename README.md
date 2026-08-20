# Site institucional R2TEC

Site estático (HTML, CSS e JavaScript puro — sem backend) com catálogo de
produtos dinâmico e carrinho para solicitação de orçamento via WhatsApp.

## Como visualizar

O catálogo carrega `data/produtos.json` via `fetch()`. Navegadores bloqueiam
`fetch()` em arquivos abertos diretamente (`file://`), então rode um
servidor local simples a partir da pasta do projeto:

```bash
# Python
python3 -m http.server 8080

# ou Node
npx serve .
```

Depois acesse `http://localhost:8080`. Quando o site for publicado em uma
hospedagem real, isso funciona automaticamente — não é necessário nenhum
servidor especial, apenas hospedagem de arquivos estáticos.

## O que configurar antes de publicar

1. **Número de WhatsApp** — `js/main.js`, linha com
   `window.R2_WHATSAPP_NUMBER = "5585999999999"`. Use o formato
   `55` + DDD + número, somente dígitos.
2. **Telefone, e-mail e endereço** exibidos em `contato.html` — são
   placeholders, substitua pelos dados reais da empresa.
3. **Fotos dos produtos** — coloque os arquivos de imagem em
   `images/produtos/` com os mesmos nomes referenciados no campo
   `imagem` de cada produto em `data/produtos.json`. Produtos sem imagem
   (ou com link quebrado) exibem automaticamente um ícone de placeholder,
   então o site funciona normalmente mesmo sem fotos ainda.
4. **Logo** — já configurado a partir dos arquivos enviados
   (`images/logo/`), usado sobre fundo escuro no cabeçalho/rodapé.

## Gerenciar o catálogo

Edite apenas `data/produtos.json`. Cada produto:

```json
{
  "id": 9,
  "nome": "Nome do produto",
  "categoria": { "nome": "Categoria", "subcategoria": "Subcategoria" },
  "detalhes": "Descrição detalhada.",
  "imagem": "images/produtos/arquivo.jpg",
  "ativo": true,
  "venda": true,
  "locacao": false
}
```

- `ativo: false` remove o produto do site sem precisar apagar o registro.
- Filtros de categoria/subcategoria na página Produtos são gerados
  automaticamente a partir dos dados — não precisam ser editados à mão.

## Estrutura de arquivos

```
index.html        Home
produtos.html      Catálogo com filtros e busca
servicos.html      Serviços
sobre.html         Sobre a empresa
contato.html       Contato
css/style.css      Estilos (todo o site)
js/cart.js         Carrinho de orçamento (localStorage)
js/catalog.js      Carregamento do JSON e renderização de cards
js/main.js         Navegação, drawer do carrinho, modais, WhatsApp
js/produtos-page.js Filtros e busca da página de catálogo
js/footer.js        Rodapé compartilhado entre as páginas
data/produtos.json  Base de dados dos produtos
images/             Logos e fotos de produtos
```

## Sobre o "carrinho"

Não é um e-commerce: não há checkout, pagamento ou frete. O botão
"+ Orçamento" apenas monta uma lista salva no navegador do visitante
(`localStorage`). Ao clicar em "Solicitar orçamento", o visitante
preenche nome, empresa, e-mail, telefone e observações, e uma mensagem
pronta é aberta no WhatsApp da empresa para envio.
