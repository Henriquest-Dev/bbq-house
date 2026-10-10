# BBQ House — site

Site estático (HTML + CSS + JS). A animação usa GSAP 3.12.5, incluído em `assets/vendor/` (não depende de CDN). Abrir `index.html` através de um servidor local, por exemplo:

```bash
python3 -m http.server 8000
```

## Páginas

| Página | O que tem |
|---|---|
| `index.html` | Hero (carrossel dos hambúrgueres + botão **Ver camadas**; na primeira visita o hambúrguer abre-se sozinho por instantes), Faz zoom, menu resumido, A vibe, A casa, chamadas para Camadas e Reservas, Delivery |
| `menu.html` | Menu completo: 104 pratos e bebidas em 10 categorias, com as descrições publicadas em português. Barra de categorias fixa, pesquisa, destaques com foto e etiquetas (Picante, Poupa X). Cada prato tem "+" para juntar ao **pedido**, que segue formatado para o WhatsApp (entrega ou take-away) |
| `camadas.html` | "Camada a camada" para 4 hambúrgueres (Korean Chicken, The Classic, Double Beef, Crispy BBQ): o scroll separa os ingredientes, pausa com as legendas e volta a montar. `camadas.html#korean-chicken` abre diretamente um deles |
| `reservas.html` | Sistema de reservas (pessoas, dia, hora, ocasião → WhatsApp + calendário) |

Dados do menu: `js/menu-data.js`, gerado a partir de bbqhousemoz.com/pt/menu (consulta 10/10/2026). As etiquetas "Picante" são deduzidas das descrições (malagueta, jalapeño, peri peri, buffalo…).

Código: `js/layers.js` (camadas, partilhado), `js/main.js` (hero), `js/camadas.js`, `js/menu.js`, `js/extras.js` (zoom, galeria, ilustrações, reservas, menu do telemóvel, entradas das secções).

## Hero

- **Layout** inspirado na referência "The Double Decker": painel claro à esquerda, painel de cor à direita, navbar, fichas, miniaturas e setas.
- **Scroll vertical** (estilo Slider Revolution): cada ecrã de scroll troca de hambúrguer. A cor do painel entra num movimento vertical, as camadas do hambúrguer antigo saem a voar e as do novo chegam separadas e assentam umas nas outras.
- **Clique no hambúrguer**: abre todas as camadas com o nome de cada ingrediente e um botão "Encomendar". Fecha sozinho passados 7 s, com novo clique ou ao fazer scroll.

## Animação a 60 fps

Tudo o que se mexe é animado só com `transform` e `opacity` (camadas na GPU), num único relógio `requestAnimationFrame` (GSAP). Não há filtros, `clip-path` nem desfoque animados. As sombras de contacto são gradientes já prontos, e as imagens são descodificadas antes da primeira animação. Se o scroll for rápido, a transição em curso acelera em vez de se acumular.

## Onde editar

- `js/main.js` → `SLIDES`: nome, preço, cor do painel, texto e **ordem das camadas** de cada hambúrguer (de baixo para cima).
- `js/main.js` → `LAYERS`: nome dos ingredientes, encaixe com o hambúrguer fechado (`rise`, `sx`, `dx`) e espaçamento com o hambúrguer aberto (`open`).
- `assets/img/layers/` — camadas recortadas (pão, alface, tomate, cebola, queijo, carne, pão de baixo). Segmentação por ingrediente, cor dos contornos limpa do fundo preto e topo da carne reconstruído (estava tapado pela ponta do queijo).
- `assets/img/stack/<hambúrguer>/` — fotos reais da BBQ House cortadas nas suas camadas (cada ingrediente identificado). Fechadas, as camadas voltam a formar a fotografia original.
- `js/main.js` → `PHOTO`: posição de cada camada na foto e o nome do ingrediente mostrado ao cliente.
- `assets/brand/` — logótipo em versão escura (para fundo claro) e branca.

> **Fotos do Instagram:** foram recortadas de capturas de ecrã do perfil @bbqhouse.mz (resolução de telemóvel). Para publicar, pedir à casa os originais e a autorização das pessoas fotografadas.
>
> **Reservas:** o pedido só fica confirmado quando a equipa responder no WhatsApp. Para reservas automáticas é preciso ligar o formulário a um sistema de reservas.
>
> **Confirmar antes de publicar:** os nomes "Double Beef" e "Crispy BBQ" são provisórios (as fotos vêm das categorias Burgers e Combos do site e não identificam o prato) e não mostram preço. O agrupamento do menu por categorias e os valores "desde" foram deduzidos da lista de preços.
>
> Nomes e preços vêm do menu publicado (consulta de 09/10/2026, MZN). As camadas, os textos e as etiquetas de cada hambúrguer são ilustrativos: confirmar receitas com a cozinha.
> As camadas foram recortadas da imagem de referência (crédito: team NexGen). Para produção, o ideal é fotografar as camadas de um hambúrguer da casa e substituir os ficheiros em `assets/img/layers/` com os mesmos nomes.
