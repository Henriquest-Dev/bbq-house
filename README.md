# BBQ House — site

Site estático (HTML + CSS + JS, sem dependências). Abrir `index.html` através de um servidor local, por exemplo:

```bash
python3 -m http.server 8000
```

## Hero

- **Layout** inspirado na referência "The Double Decker": painel claro à esquerda, painel de cor à direita, navbar, fichas, miniaturas e setas.
- **Scroll vertical** (estilo Slider Revolution): cada ecrã de scroll troca de hambúrguer. A cor do painel entra num movimento vertical, as camadas do hambúrguer antigo saem a voar e as do novo chegam separadas e assentam umas nas outras.
- **Clique no hambúrguer**: abre todas as camadas com o nome de cada ingrediente e um botão "Encomendar". Fecha sozinho passados 7 s, com novo clique ou ao fazer scroll.

## Onde editar

- `js/main.js` → `SLIDES`: nome, preço, cor do painel, texto e **ordem das camadas** de cada hambúrguer (de baixo para cima).
- `js/main.js` → `LAYERS`: nome dos ingredientes e o espaçamento de cada camada (fechado / aberto).
- `assets/img/layers/` — camadas recortadas (pão, alface, tomate, cebola, queijo, carne, pão de baixo).
- `assets/img/burgers/` — hambúrgueres reais da BBQ House recortados.
- `assets/brand/` — logótipo em versão escura (para fundo claro) e branca.

> Nomes e preços vêm do menu publicado (consulta de 09/10/2026, MZN). As camadas, os textos e as etiquetas de cada hambúrguer são ilustrativos: confirmar receitas com a cozinha.
> As camadas foram recortadas da imagem de referência (crédito: team NexGen). Para produção, o ideal é fotografar as camadas de um hambúrguer da casa e substituir os ficheiros em `assets/img/layers/` com os mesmos nomes.
