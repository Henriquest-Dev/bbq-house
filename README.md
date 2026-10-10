# BBQ House — site

Site estático (HTML + CSS + JS). A animação usa GSAP 3.12.5, incluído em `assets/vendor/` (não depende de CDN). Abrir `index.html` através de um servidor local, por exemplo:

```bash
python3 -m http.server 8000
```

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
- `assets/img/burgers/` — hambúrgueres reais da BBQ House recortados.
- `assets/brand/` — logótipo em versão escura (para fundo claro) e branca.

> Nomes e preços vêm do menu publicado (consulta de 09/10/2026, MZN). As camadas, os textos e as etiquetas de cada hambúrguer são ilustrativos: confirmar receitas com a cozinha.
> As camadas foram recortadas da imagem de referência (crédito: team NexGen). Para produção, o ideal é fotografar as camadas de um hambúrguer da casa e substituir os ficheiros em `assets/img/layers/` com os mesmos nomes.
