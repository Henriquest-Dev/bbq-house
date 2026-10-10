/* BBQ House — camadas dos hambúrgueres (partilhado pelas páginas).
   Kits de camadas, geometria e construção do DOM; exporta window.BBQ. */
(() => {
  'use strict';
  const gsap = window.gsap;
  /* ======================================================================
     KITS DE CAMADAS
     ====================================================================== */

  /* Fotos reais da BBQ House cortadas em camadas (coordenadas em px da foto).
     As camadas encaixam exactamente: fechadas, voltam a formar a fotografia original. */
  const PHOTO = {
    korean: { by: 24, bx: 12, bw: 679, bh: 617, layers: [
      { name: 'bun-top',    x: 39,  y: 24,  w: 613, h: 248, label: 'Pão brioche com sésamo', icon: 'bun' },
      { name: 'mayo',       x: 50,  y: 248, w: 586, h: 85,  label: 'Maionese especial',      icon: 'sauce' },
      { name: 'garnish',    x: 124, y: 270, w: 568, h: 139, label: 'Alface e jalapeño',      icon: 'chili' },
      { name: 'chicken',    x: 13,  y: 326, w: 667, h: 225, label: 'Frango crocante em glace coreano', icon: 'chicken' },
      { name: 'bun-bottom', x: 44,  y: 488, w: 586, h: 154, label: 'Pão brioche',            icon: 'bun' },
    ] },
    beef: { by: 15, bx: 0, bw: 642, bh: 602, layers: [
      { name: 'bun-top',    x: 22,  y: 15,  w: 609, h: 254, label: 'Pão brioche',    icon: 'bun' },
      { name: 'tomato',     x: 27,  y: 178, w: 605, h: 100, label: 'Tomate',         icon: 'tomato' },
      { name: 'patty-1',    x: 60,  y: 239, w: 553, h: 77,  label: 'Carne grelhada', icon: 'patty' },
      { name: 'onion',      x: 108, y: 273, w: 506, h: 95,  label: 'Cebola roxa',    icon: 'onion' },
      { name: 'patty-2',    x: 65,  y: 276, w: 551, h: 174, label: 'Carne grelhada', icon: 'patty' },
      { name: 'lettuce',    x: 8,   y: 334, w: 603, h: 147, label: 'Alface',         icon: 'lettuce' },
      { name: 'sauce',      x: 48,  y: 426, w: 546, h: 108, label: 'Molho',          icon: 'sauce' },
      { name: 'bun-bottom', x: 0,   y: 427, w: 643, h: 191, label: 'Pão brioche',    icon: 'bun' },
    ] },
    'crispy-bbq': { by: 15, bx: 8, bw: 468, bh: 441, layers: [
      { name: 'bun-top',    x: 23, y: 14,  w: 436, h: 191, label: 'Pão brioche',              icon: 'bun' },
      { name: 'mayo',       x: 28, y: 161, w: 428, h: 61,  label: 'Molho',                    icon: 'sauce' },
      { name: 'garnish',    x: 8,  y: 182, w: 453, h: 102, label: 'Alface e jalapeño',        icon: 'chili' },
      { name: 'chicken',    x: 21, y: 234, w: 456, h: 136, label: 'Frango crocante glaceado', icon: 'chicken' },
      { name: 'bun-bottom', x: 36, y: 323, w: 404, h: 134, label: 'Pão brioche',              icon: 'bun' },
    ] },
  };

  /* Camadas da imagem de referência (ingredientes fotografados em separado).
     rise: encaixe com o hambúrguer fechado · open: espaço com o hambúrguer aberto · sx/dx: ajuste fechado */
  const REF = {
    'bun-top':    { w: 426, h: 227, cx: 637,   rise: 0,   open: 0,   sx: 1,    dx: 0,   label: 'Pão brioche',    icon: 'bun' },
    'lettuce':    { w: 404, h: 129, cx: 652,   rise: 34,  open: 112, sx: 1.04, dx: -14, label: 'Alface',         icon: 'lettuce' },
    'tomato':     { w: 348, h: 123, cx: 628,   rise: 30,  open: 103, sx: 1.12, dx: 0,   label: 'Tomate',         icon: 'tomato' },
    'onion':      { w: 262, h: 76,  cx: 583,   rise: 14,  open: 60,  sx: 1.42, dx: 40,  label: 'Cebola roxa',    icon: 'onion' },
    'cheese':     { w: 439, h: 134, cx: 595.5, rise: 26,  open: 134, sx: 1,    dx: 26,  label: 'Cheddar',        icon: 'cheese' },
    'patty':      { w: 427, h: 155, cx: 618.5, rise: 70,  open: 148, sx: 1,    dx: 6,   label: 'Carne grelhada', icon: 'patty' },
    'bun-bottom': { w: 442, h: 220, cx: 633,   rise: 112, open: 220, sx: 1,    dx: 0,   label: 'Pão brioche',    icon: 'bun' },
  };
  const REF_W = 470, REF_CX = 628;

  /* ---------- Slides do hero ----------
     Nomes, preços e descrições como publicados no menu (bbqhousemoz.com/menu). The Classic e Cheese Burger usam as
     camadas da imagem de referência; Holy Buns usa a foto da categoria Burgers do site (que não identifica o prato). */
  const SLIDES = [
    { name: 'Korean Chicken', tag: 'Chicken Burger', price: '770', color: '#C78A3B', ink: '#12100E', kit: 'korean',
      desc: 'Frango crocante frito em glace coreano, com a nossa maionese especial, jalapeño e alface.',
      facts: [['Camadas', 5], ['Proteína', 'Frango'], ['Pão', 'Brioche']] },
    { name: 'The Classic', tag: 'Beef Burger', price: '650', color: '#D93425', ink: '#F6F1E9',
      ref: ['bun-bottom', 'patty', 'onion', 'tomato', 'lettuce', 'bun-top'],
      desc: 'Suculento hambúrguer de vaca com alface crocante, cebola roxa, tomate fresco em molho cocktail.',
      facts: [['Camadas', 6], ['Proteína', 'Vaca'], ['Pão', 'Brioche']] },
    { name: 'Cheese Burger', tag: 'Beef Burger', price: '750', color: '#12100E', ink: '#F6F1E9',
      ref: ['bun-bottom', 'patty', 'cheese', 'onion', 'bun-top'],
      desc: 'Hambúrguer de vaca com cebola roxa, pickles, mostarda e cheddar derretido, em molho cocktail.',
      facts: [['Camadas', 5], ['Proteína', 'Vaca'], ['Pão', 'Brioche']] },
    // foto da categoria Burgers do site (o site não diz qual é o prato): mostra-se como a secção "Holy Buns"
    { name: 'Holy Buns', tag: 'Os nossos hambúrgueres', price: '650', from: true, color: '#8E2A1C', ink: '#F6F1E9', kit: 'beef',
      desc: 'Todos servidos no nosso pão brioche acabado de cozer. 15 hambúrgueres de vaca, frango e salmão no menu.',
      facts: [['Camadas', 8], ['No menu', 15], ['Pão', 'Brioche']] },
  ];


  const ICONS = {
    bun: 'M4 13c0-4.5 3.6-7 8-7s8 2.5 8 7z M3 16h18 M5 19h14 M9 9.5h.01 M13 8.5h.01 M15.5 10.5h.01',
    lettuce: 'M5 19C5 10 11 5 19 5c0 8-5 14-14 14z M5 19l9-9',
    tomato: 'M12 7a7.5 7 0 1 0 .01 0z M12 7c-1-2-3-2.5-4.5-1.5 M12 7c1-2 3-2.5 4.5-1.5',
    onion: 'M12 3c-2 3-7 5-7 11a7 7 0 0 0 14 0c0-6-5-8-7-11z M12 9c-1.5 2-3.5 3-3.5 5.5a3.5 3.5 0 0 0 7 0C15.5 12 13.5 11 12 9z',
    cheese: 'M3 17l9-11 9 6v5z M3 17h18 M8 14.5h.01 M14 13.5h.01 M17 15.5h.01',
    patty: 'M4 12c0-3 3.5-5 8-5s8 2 8 5-3.5 5-8 5-8-2-8-5z M8 11l3-2 M10.5 13.5l4-3 M14 15l3-2',
    chicken: 'M15.5 4.5a5 5 0 0 1 0 7.1l-2.8 2.8-4.3-4.3 2.8-2.8a5 5 0 0 1 4.3-2.8z M8.4 10.1l-3.6 3.6a2 2 0 1 0 2.8 2.8 2 2 0 1 0 2.8 2.8l3.6-3.6',
    sauce: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5',
    chili: 'M7 21c6 0 12-5 12-12 0-1.5-1-2.5-2.5-2.5-2 0-2 3-4 5.5S7 15 4.5 15C3 15 3 21 7 21z M16.5 6.5c0-2 1-3.5 3-3.5',
  };

  const WA = 'https://wa.me/258851550000';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const isMobile = () => innerWidth <= 820;

  /* ======================================================================
     GEOMETRIA COMUM
     items (de cima para baixo): { src, w, h, z, label, icon, s: pose fechada, o: pose aberta, oc: centro aberto }
     coordenadas: base = fundo do hambúrguer, x relativo ao centro; y negativo = para cima
     ====================================================================== */
  function geoFromPhoto(key) {
    const k = PHOTO[key], n = k.layers.length;
    const base = k.by + k.bh, cx = k.bx + k.bw / 2;
    const gap = k.bh * 0.085;
    const items = k.layers.map((l, i) => {
      const y = base - (l.y + l.h);
      const x = l.x - cx;
      const tilt = i === 0 || i === n - 1 ? 0 : (i % 2 ? 1.2 : -1.2);
      return { src: `assets/img/stack/${key}/${l.name}.webp`, name: l.name, w: l.w, h: l.h, z: n - i, label: l.label, icon: l.icon,
        s: { x, y: -y, rotation: 0, scaleX: 1 }, oy: y + gap * (n - 1 - i), ox: x, tilt };
    });
    const hS = k.bh, hO = k.bh + gap * (n - 1);
    const shift = (hO - hS) / 2;
    items.forEach(it => { it.o = { x: it.ox, y: -(it.oy - shift), rotation: it.tilt, scaleX: 1 }; it.oc = it.oy - shift + it.h / 2; });
    return { items, hS, hO, W: k.bw, contact: false };
  }

  function geoFromRef(recipe) {
    let yS = 0, yO = 0;
    const raw = recipe.map((name, i) => {
      const L = REF[name];
      const bun = name === 'bun-top' || name === 'bun-bottom';
      const it = { src: `assets/img/layers/${name}.webp`, name, w: L.w, h: L.h, z: i + 1, label: L.label, icon: L.icon, L,
        yS, yO, dxS: (L.cx - REF_CX) * 0.15 + L.dx, dxO: L.cx - REF_CX, tilt: bun ? 0 : (i % 2 ? 2.5 : -2.5) };
      yS += L.rise; yO += L.open + 18;
      return it;
    });
    const top = raw[raw.length - 1];
    const hS = top.yS + top.h, hO = top.yO + top.h, shift = (hO - hS) / 2;
    raw.forEach(it => {
      it.s = { x: -it.w / 2 + it.dxS, y: -it.yS, rotation: 0, scaleX: it.L.sx };
      it.o = { x: -it.w / 2 + it.dxO, y: -(it.yO - shift), rotation: it.tilt, scaleX: 1 };
      it.oc = it.yO - shift + it.h * 0.45;
    });
    return { items: raw.reverse(), hS, hO, W: REF_W, contact: true };
  }

  const geoFor = slide => (slide.kit ? geoFromPhoto(slide.kit) : geoFromRef(slide.ref));

  /* ---------- Construção do DOM de um hambúrguer ---------- */
  function buildBurger(geo, { labels = false, shadows = true, labelSize = 13 } = {}) {
    const el = document.createElement('div');
    el.className = 'burger';
    const n = geo.items.length;
    geo.items.forEach((it, i) => {
      if (geo.contact && shadows && i < n - 1) { // sombra de contacto sobre a camada de baixo
        const sh = document.createElement('i');
        sh.className = 'cshadow';
        sh.style.zIndex = it.z * 2 - 1;
        sh.style.width = `${it.w * it.s.scaleX * 0.92}px`;
        el.appendChild(sh);
        it.sh = sh;
        gsap.set(sh, { x: it.s.x + it.w * (1 - 0.92 * it.s.scaleX) / 2, y: it.s.y + 14, opacity: 1 });
      }
      const img = new Image();
      img.src = it.src; img.alt = ''; img.className = 'layer'; img.draggable = false; img.decoding = 'async';
      img.style.width = `${it.w}px`;
      img.style.zIndex = it.z * 2;
      el.appendChild(img);
      it.img = img;
      gsap.set(img, { ...it.s, transformOrigin: '50% 100%' });
      if (labels) {
        const side = i % 2 ? 'left' : 'right';
        const tag = document.createElement('span');
        tag.className = `tag-line ${side}`;
        tag.textContent = it.label;
        tag.style.bottom = `${it.oc}px`;
        const inset = Math.min(40, it.w * 0.08);
        if (side === 'right') tag.style.left = `${it.o.x + it.w - inset}px`;
        else tag.style.right = `${-it.o.x - inset}px`;
        el.appendChild(tag);
        it.tag = tag;
        gsap.set(tag, { opacity: 0, x: side === 'right' ? -20 : 20 });
      }
    });
    el.dataset.labelSize = labelSize;
    return el;
  }

  function sizeTags(el, scale) {
    const px = isMobile() ? 10 : +el.dataset.labelSize || 13;
    el.querySelectorAll('.tag-line').forEach(t => { t.style.fontSize = `${px / scale}px`; });
  }


  // descodifica as camadas antes da primeira animação (sem soluços no 1.º frame)
  function preloadLayers() {
    const urls = [
      ...Object.keys(REF).map(n => `assets/img/layers/${n}.webp`),
      ...Object.entries(PHOTO).flatMap(([k, v]) => v.layers.map(l => `assets/img/stack/${k}/${l.name}.webp`)),
    ];
    const ps = urls.map(u => { const i = new Image(); i.src = u; return i.decode().catch(() => {}); });
    return Promise.all([...ps, document.fonts ? document.fonts.ready : 0]);
  }

  window.BBQ = { PHOTO, REF, SLIDES, ICONS, WA, reduced, isMobile, geoFromPhoto, geoFromRef, geoFor, buildBurger, sizeTags, preloadLayers };
})();
