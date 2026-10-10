/* BBQ House — site.
   Hero: carrossel vertical (scroll) com hambúrgueres em camadas; clique abre as camadas.
   "Camada a camada": o scroll separa os ingredientes, pausa e volta a montar (direcção visual).
   Animação com GSAP: só transform e opacity, para manter 60 fps. */
(() => {
  'use strict';
  const gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

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
      { name: 'chicken',    x: 13,  y: 326, w: 667, h: 225, label: 'Frango crocante, cobertura coreana', icon: 'chicken' },
      { name: 'bun-bottom', x: 44,  y: 488, w: 586, h: 154, label: 'Pão brioche',            icon: 'bun' },
    ] },
    beef: { by: 15, bx: 0, bw: 642, bh: 602, layers: [
      { name: 'bun-top',    x: 22,  y: 15,  w: 609, h: 254, label: 'Pão brioche',    icon: 'bun' },
      { name: 'tomato',     x: 27,  y: 178, w: 605, h: 100, label: 'Tomate',         icon: 'tomato' },
      { name: 'patty-1',    x: 60,  y: 239, w: 553, h: 77,  label: 'Carne grelhada', icon: 'patty' },
      { name: 'onion',      x: 108, y: 273, w: 506, h: 95,  label: 'Cebola roxa',    icon: 'onion' },
      { name: 'patty-2',    x: 65,  y: 276, w: 551, h: 174, label: 'Carne grelhada', icon: 'patty' },
      { name: 'lettuce',    x: 8,   y: 334, w: 603, h: 147, label: 'Alface',         icon: 'lettuce' },
      { name: 'sauce',      x: 48,  y: 426, w: 546, h: 108, label: 'Molho rosa',     icon: 'sauce' },
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
    'bun-top':    { w: 426, h: 227, cx: 637,   rise: 0,   open: 0,   sx: 1,    dx: 0,   label: 'Pão com sésamo', icon: 'bun' },
    'lettuce':    { w: 404, h: 129, cx: 652,   rise: 34,  open: 112, sx: 1.04, dx: -14, label: 'Alface',         icon: 'lettuce' },
    'tomato':     { w: 348, h: 123, cx: 628,   rise: 30,  open: 103, sx: 1.12, dx: 0,   label: 'Tomate',         icon: 'tomato' },
    'onion':      { w: 262, h: 76,  cx: 583,   rise: 14,  open: 60,  sx: 1.42, dx: 40,  label: 'Cebola roxa',    icon: 'onion' },
    'cheese':     { w: 439, h: 134, cx: 595.5, rise: 26,  open: 134, sx: 1,    dx: 26,  label: 'Queijo',         icon: 'cheese' },
    'patty':      { w: 427, h: 155, cx: 618.5, rise: 70,  open: 148, sx: 1,    dx: 6,   label: 'Carne grelhada', icon: 'patty' },
    'bun-bottom': { w: 442, h: 220, cx: 633,   rise: 112, open: 220, sx: 1,    dx: 0,   label: 'Pão tostado',    icon: 'bun' },
  };
  const REF_W = 470, REF_CX = 628;

  /* ---------- Slides do hero ----------
     Korean Chicken: foto e preço publicados no site. The Classic: receita da direcção visual, montada com as camadas
     de referência (sem queijo). Double Beef / Crispy BBQ: fotos do site (categoria Burgers e Combos) — o nome exacto
     do prato não está confirmado; confirmar nome e preço antes de publicar. */
  const SLIDES = [
    { name: 'Korean Chicken', tag: 'Destaque da casa', price: '770', color: '#C78A3B', ink: '#12100E', kit: 'korean',
      desc: 'Frango crocante com cobertura coreana, maionese especial, jalapeño e alface em pão brioche. Toque no hambúrguer para o ver camada a camada.',
      facts: [['Camadas', 5], ['Proteína', 'Frango'], ['Picante', 'Sim']] },
    { name: 'The Classic', tag: 'Clássico', price: '650', color: '#D93425', ink: '#F6F1E9',
      ref: ['bun-bottom', 'patty', 'onion', 'tomato', 'lettuce', 'bun-top'],
      desc: 'O original da casa, sem rodeios: carne, alface, cebola roxa, tomate e molho cocktail. Sem queijo, como manda a receita.',
      facts: [['Camadas', 6], ['Proteína', 'Vaca'], ['Queijo', '—']] },
    { name: 'Double Beef', tag: 'Dose dupla', price: null, color: '#12100E', ink: '#F6F1E9', kit: 'beef',
      desc: 'Duas carnes grelhadas, tomate, cebola roxa, alface e molho rosa em pão brioche.',
      facts: [['Camadas', 8], ['Carne', '2×'], ['Picante', '—']] },
    { name: 'Crispy BBQ', tag: 'Frango', price: null, color: '#8E2A1C', ink: '#F6F1E9', kit: 'crispy-bbq',
      desc: 'Frango crocante glaceado, alface ralada, jalapeño e molho em pão brioche.',
      facts: [['Camadas', 5], ['Proteína', 'Frango'], ['Picante', 'Sim']] },
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

  /* ======================================================================
     HERO
     ====================================================================== */
  const hero = $('#hero'), section = $('#hero-scroll'), stage = $('#stage'), hit = $('#hit');
  const par = $('#parallax'), bob = $('#bob');
  const hint = $('#hint'), shadow = $('#shadow'), peekBox = $('#peek'), thumbsBox = $('#thumbs');
  const panel = $('#panel'), root = document.documentElement;
  const N = SLIDES.length;
  const animEls = () => [...document.querySelectorAll('#copy [data-anim]'), $('#facts')];

  let S = 1, OPEN_K = 1;
  function computeScale(geo) {
    const vw = innerWidth, vh = innerHeight;
    S = isMobile()
      ? Math.min((vw * 0.7) / geo.W, (vh * 0.34) / geo.hS)
      : Math.min((vw * 0.27) / geo.W, (vh * 0.47) / geo.hS);
    OPEN_K = Math.min(1, (vh * (isMobile() ? 0.56 : 0.66)) / (geo.hO * S));
    if (isMobile()) OPEN_K = Math.min(OPEN_K, ((vw / 2 - 96) / (geo.W / 2)) / S);
  }
  const burgerPose = (b, open) => {
    const k = open ? OPEN_K : 1;
    return { x: 0, y: (b.geo.hS / 2) * S * k - (open ? innerHeight * 0.05 : 0), scale: S * k };
  };

  function placeStageBits(b) {
    const half = (b.geo.hS / 2) * S;
    const w = b.geo.W * S;
    const r = stage.getBoundingClientRect();
    gsap.set(shadow, { width: w * 0.95, xPercent: -50, y: half - 22 });
    Object.assign(hit.style, { left: `${r.left - w / 2}px`, top: `${r.top - half}px`, width: `${w}px`, height: `${half * 2}px` });
    hint.style.top = `${r.top + half + 26}px`;
  }

  let current = 0, target = 0, busy = false, isOpen = false, closeCall = null;
  let burger = null, peek = null, tl = null;
  const orderPop = document.createElement('a');
  orderPop.className = 'btn-order btn-order--red order-float';
  orderPop.target = '_blank'; orderPop.rel = 'noopener';
  orderPop.textContent = 'Encomendar';
  hero.appendChild(orderPop);
  gsap.set(orderPop, { autoAlpha: 0, xPercent: -50 });

  function fillCopy(s) {
    const words = s.name.split(' ');
    $('#title').innerHTML = words.length > 1 ? `${words[0]}<br>${words.slice(1).join(' ')}` : s.name;
    $('#tag').textContent = s.tag;
    $('#desc').textContent = s.desc;
    $('#price').innerHTML = s.price ? `${s.price} <small>MZN</small>` : '<small class="price-tbc">Preço no menu</small>';
    const link = `${WA}?text=${encodeURIComponent(`Olá BBQ House! Quero encomendar: ${s.name}`)}`;
    $('#order').href = link; orderPop.href = link;

    const geo = geoFor(s);
    const uniq = [];
    geo.items.forEach(it => { if (!uniq.find(u => u.icon === it.icon)) uniq.push(it); });
    $('#ingredients').innerHTML = uniq.slice(0, 4).map(it =>
      `<li title="${it.label}"><svg viewBox="0 0 24 24"><path d="${ICONS[it.icon]}"/></svg></li>`).join('')
      + (uniq.length > 4 ? `<li class="more">+${uniq.length - 4}</li>` : '');
    $('#facts').innerHTML = s.facts.map(([k, v]) => `<div class="fact"><span>${k}</span><b>${v}</b></div>`).join('');
    $('#counter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
  }

  function setColors(s) {
    root.style.setProperty('--panel', s.color);
    root.style.setProperty('--panel-ink', s.ink);
  }

  function burgerIn(b, dir, t, at) {
    const off = (innerHeight * 1.15) / S;
    const n = b.geo.items.length;
    b.geo.items.forEach((it, i) => {
      const order = dir > 0 ? i : n - 1 - i;
      t.fromTo(it.img, { ...it.o, y: it.o.y + dir * off, rotation: it.tilt * 3, force3D: true }, {
        keyframes: [
          { ...it.o, y: it.o.y * 0.82 + it.s.y * 0.18, duration: 0.72, ease: 'power3.out' },
          { ...it.s, duration: 0.5, ease: 'power2.inOut' },
        ],
      }, at + order * 0.04);
      if (it.sh) t.fromTo(it.sh, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'none' }, at + order * 0.04 + 0.95);
    });
  }

  function burgerOut(b, dir, t) {
    const off = (innerHeight * 1.2) / S;
    const n = b.geo.items.length;
    b.geo.items.forEach((it, i) => {
      const order = dir > 0 ? i : n - 1 - i;
      t.to(it.img, { ...it.o, y: it.o.y - dir * off, rotation: -it.tilt * 4, duration: 0.62, ease: 'power3.in', force3D: true }, order * 0.028);
      if (it.sh) t.to(it.sh, { opacity: 0, duration: 0.15 }, order * 0.028);
    });
    b.el.querySelectorAll('.tag-line').forEach(tag => t.to(tag, { opacity: 0, duration: 0.2 }, 0));
    t.add(() => b.el.remove());
  }

  function wipePanel(s, dir, t) {
    const w = document.createElement('div');
    w.className = 'panel__wipe';
    w.style.background = s.color;
    panel.appendChild(w);
    t.fromTo(w, { yPercent: dir > 0 ? 100 : -100, force3D: true }, { yPercent: 0, duration: 0.95, ease: 'expo.inOut' }, 0)
      .add(() => root.style.setProperty('--panel-ink', s.ink), 0.48)
      .add(() => { setColors(s); w.remove(); }, 0.95);
  }

  function copySwap(s, dir, t) {
    const els = animEls();
    t.to(els, { y: -dir * 26, opacity: 0, duration: 0.28, stagger: 0.02, ease: 'power2.in' }, 0)
      .add(() => fillCopy(s), 0.42)
      .fromTo(els, { y: dir * 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out' }, 0.45);
  }

  function open() {
    if (busy || isOpen || !burger) return;
    isOpen = true;
    hero.classList.add('is-open');
    const t = gsap.timeline({ defaults: { overwrite: 'auto' } });
    t.to(burger.el, { ...burgerPose(burger, true), duration: 0.9, ease: 'power3.out' }, 0);
    sizeTags(burger.el, S * OPEN_K);
    burger.geo.items.forEach((it, i) => {   // o pão de cima sobe primeiro
      t.to(it.img, { ...it.o, duration: 0.9, ease: 'power3.out', force3D: true }, i * 0.05);
      if (it.sh) t.to(it.sh, { opacity: 0, duration: 0.25 }, 0);
      if (it.tag) t.to(it.tag, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.35 + i * 0.05);
    });
    t.to([...animEls(), peekBox], { opacity: 0.08, duration: 0.4 }, 0);
    const r = stage.getBoundingClientRect();
    const bottom = r.top + (burger.geo.hO / 2) * S * OPEN_K - innerHeight * 0.05;
    gsap.set(orderPop, { left: r.left, top: Math.min(bottom + 14, innerHeight - 130), y: 14 });
    t.to(orderPop, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.5);
    closeCall = gsap.delayedCall(7, close); // fecha sozinho passado algum tempo
  }

  function close(fast) {
    if (closeCall) closeCall.kill();
    if (!isOpen || !burger) return;
    isOpen = false;
    hero.classList.remove('is-open');
    fast = fast === true;
    const d = fast ? 0.35 : 0.85;
    const n = burger.geo.items.length;
    const t = gsap.timeline({ defaults: { overwrite: 'auto' } });
    t.to(burger.el, { ...burgerPose(burger, false), duration: d, ease: 'power3.inOut' }, 0);
    burger.geo.items.forEach((it, i) => {   // fecha de baixo para cima; o pão de cima fecha por último
      const order = n - 1 - i;
      t.to(it.img, { ...it.s, duration: d, ease: 'power3.inOut', force3D: true }, fast ? 0 : order * 0.04);
      if (it.sh) t.to(it.sh, { opacity: 1, duration: 0.3 }, d * 0.8 + (fast ? 0 : order * 0.04));
      if (it.tag) t.to(it.tag, { opacity: 0, x: it.tag.classList.contains('right') ? -20 : 20, duration: 0.25 }, 0);
    });
    if (!fast) t.to([...animEls(), peekBox], { opacity: 1, duration: 0.4 }, 0.3);
    else gsap.set(peekBox, { opacity: 1 });
    t.to(orderPop, { autoAlpha: 0, y: 14, duration: 0.25 }, 0);
  }
  hit.addEventListener('click', () => (isOpen ? close() : open()));

  function renderPeek(idx, t) {
    const geo = geoFor(SLIDES[(idx + 1) % N]);
    const el = buildBurger(geo);
    const k = Math.min((innerWidth * 0.19) / geo.W, (innerHeight * 0.34) / geo.hS);
    const pose = { x: -geo.W * k * 0.32, y: (geo.hS / 2) * k, scale: k };
    peekBox.appendChild(el);
    if (peek) {
      const old = peek;
      if (t) t.to(old, { y: '-=140', opacity: 0, duration: 0.6, ease: 'power2.in', onComplete: () => old.remove() }, 0.1);
      else old.remove();
    }
    if (t) t.fromTo(el, { ...pose, x: pose.x + 180, opacity: 0 }, { ...pose, opacity: 1, duration: 1, ease: 'power3.out' }, 0.55);
    else gsap.set(el, pose);
    peek = el;
  }

  function renderThumbs() {
    thumbsBox.innerHTML = '';
    SLIDES.forEach((s, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', s.name);
      const geo = geoFor(s);
      const el = buildBurger(geo, { shadows: false });
      const size = isMobile() ? 36 : 44;
      const k = Math.min(size / geo.W, size / geo.hS);
      gsap.set(el, { y: (geo.hS / 2) * k, scale: k });
      btn.appendChild(el);
      btn.addEventListener('click', () => goTo(i));
      li.appendChild(btn);
      thumbsBox.appendChild(li);
    });
    markThumb();
  }
  const markThumb = () => thumbsBox.querySelectorAll('button').forEach((b, i) => b.classList.toggle('is-active', i === current));

  function mountBurger(slide) {
    const geo = geoFor(slide);
    computeScale(geo);
    const el = buildBurger(geo, { labels: true });
    bob.appendChild(el);
    const b = { el, geo };
    gsap.set(el, burgerPose(b, false));
    sizeTags(el, S);
    return b;
  }

  function show(idx) {
    const dir = idx > current ? 1 : -1;
    busy = true;
    hero.classList.add('is-busy');
    if (isOpen) close(true);
    const old = burger;
    current = idx;
    markThumb();
    const s = SLIDES[idx];
    tl = gsap.timeline({ onComplete: () => { busy = false; tl = null; hero.classList.remove('is-busy'); pump(); } });
    wipePanel(s, dir, tl);
    copySwap(s, dir, tl);
    if (old) burgerOut(old, dir, tl);
    burger = mountBurger(s);
    placeStageBits(burger);
    burgerIn(burger, dir, tl, 0.46);
    renderPeek(idx, tl);
    if (reduced) tl.progress(1);
  }

  function pump() {
    if (target === current) return;
    if (busy) { if (tl) tl.timeScale(1.8); return; } // scroll rápido: acelera a transição em curso
    show(target);
  }

  function setupScroll() {
    section.style.height = `${N * 100}vh`;
    section.querySelectorAll('.snap').forEach(s => s.remove());
    for (let i = 0; i < N; i++) {
      const m = document.createElement('i');
      m.className = 'snap';
      m.style.top = `${i * 100}vh`;
      section.appendChild(m);
    }
  }

  let navLock = null, navTimer = null;
  function onScroll() {
    const vh = innerHeight;
    const off = -section.getBoundingClientRect().top;
    if (navLock !== null) {
      if (Math.abs(off - navLock * vh) < 4) navLock = null;
      return;
    }
    let t = target;
    while (t < N - 1 && off > (t + 0.12) * vh) t++;
    while (t > 0 && off < (t - 0.12) * vh) t--;
    if (t !== target) { target = t; pump(); }
    else if (isOpen && Math.abs(off - current * vh) > vh * 0.25) close();
  }

  function goTo(i) {
    i = Math.max(0, Math.min(N - 1, i));
    navLock = i;
    if (navTimer) navTimer.kill();
    navTimer = gsap.delayedCall(1.5, () => { navLock = null; });
    target = i;
    pump();
    scrollTo({ top: section.offsetTop + i * innerHeight, behavior: reduced ? 'auto' : 'smooth' });
  }
  $('#prev').addEventListener('click', () => goTo(target - 1));
  $('#next').addEventListener('click', () => goTo(target + 1));

  const px = gsap.quickTo(par, 'x', { duration: 0.8, ease: 'power3.out' });
  const py = gsap.quickTo(par, 'y', { duration: 0.8, ease: 'power3.out' });
  const kx = gsap.quickTo(peekBox, 'x', { duration: 1, ease: 'power3.out' });
  hero.addEventListener('pointermove', e => {
    if (reduced || isMobile()) return;
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    px(x * 18); py(y * 12); kx(x * -12);
  });
  if (!reduced) gsap.to(bob, { y: -8, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  function initHero() {
    setupScroll();
    const off = -section.getBoundingClientRect().top;
    current = target = Math.max(0, Math.min(N - 1, Math.round(off / innerHeight)));
    const s = SLIDES[current];
    setColors(s);
    fillCopy(s);
    burger = mountBurger(s);
    placeStageBits(burger);
    renderPeek(current, null);
    renderThumbs();
    hero.classList.add('is-ready');
    busy = true;
    tl = gsap.timeline({ onComplete: () => { busy = false; tl = null; pump(); } });
    tl.fromTo(animEls(), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power3.out' }, 0.1);
    burgerIn(burger, 1, tl, 0.05);
    tl.from(peek, { opacity: 0, x: '+=140', duration: 1, ease: 'power3.out' }, 0.6);
    if (reduced) tl.progress(1);
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ======================================================================
     CAMADA A CAMADA — o scroll separa, pausa e volta a montar (Korean Chicken)
     ====================================================================== */
  function initStory() {
    const sec = $('#story'), box = $('#story-stage'), list = $('#story-list');
    if (!sec || !box) return;
    const geo = geoFromPhoto('korean');
    const el = buildBurger(geo, { labels: true, labelSize: 12 });
    box.appendChild(el);
    list.innerHTML = geo.items.map((it, i) =>
      `<li><span>${String(i + 1).padStart(2, '0')}</span>${it.label}</li>`).join('');
    const lis = [...list.children];

    const fit = () => {
      const r = box.getBoundingClientRect();
      const amp = isMobile() ? 0.7 : 1; // no telemóvel, menos amplitude
      const k = Math.min(r.width / (geo.W * (isMobile() ? 1.9 : 1.55)), (r.height * 0.9) / (geo.hS + (geo.hO - geo.hS) * amp));
      gsap.set(el, { x: r.width / 2, y: r.height / 2 + (geo.hS / 2) * k, scale: k });
      sizeTags(el, k);
    };
    fit();
    addEventListener('resize', fit);

    if (reduced || !window.ScrollTrigger) { // imagem estática: hambúrguer aberto com legendas
      geo.items.forEach(it => { gsap.set(it.img, it.o); if (it.tag) gsap.set(it.tag, { opacity: 1, x: 0 }); });
      lis.forEach(li => li.classList.add('is-on'));
      return;
    }
    const n = geo.items.length;
    const t = gsap.timeline();
    // 1) separar: o pão de cima sobe primeiro, os outros seguem com atrasos curtos e rotação discreta
    geo.items.forEach((it, i) => {
      t.to(it.img, { ...it.o, duration: 1, ease: 'power2.out' }, i * 0.12);
      if (it.tag) t.to(it.tag, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.4 + i * 0.12);
    });
    t.to('#story-steam', { opacity: 1, duration: 0.6 }, 0.5);
    // 2) pausa para observar, com paralaxe lateral mínima
    t.to(el, { x: '+=14', duration: 1.4, ease: 'sine.inOut' }, '>');
    // 3) voltar a montar: de baixo para cima, o pão superior fecha por último, sem ressaltos
    const back = t.duration();
    geo.items.forEach((it, i) => {
      const order = n - 1 - i;
      t.to(it.img, { ...it.s, duration: 1, ease: 'power2.inOut' }, back + order * 0.12);
      if (it.tag) t.to(it.tag, { opacity: 0, duration: 0.4 }, back + order * 0.12);
    });
    t.to('#story-steam', { opacity: 0, duration: 0.6 }, back + 0.3);
    t.to(el, { x: '-=14', duration: 1, ease: 'sine.inOut' }, back);
    t.fromTo('#story-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '>-0.3');
    window.ScrollTrigger.create({
      trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.6, animation: t,
      onUpdate: self => { // a lista acompanha o que está separado, nos dois sentidos
        const p = self.progress * t.duration();
        lis.forEach((li, i) => li.classList.toggle('is-on', p > 0.3 + i * 0.12 && p < back + (n - 1 - i) * 0.12 + 0.5));
      },
    });
  }

  /* ======================================================================
     ENTRADAS DAS SECÇÕES
     ====================================================================== */
  function initReveals() {
    if (reduced || !window.ScrollTrigger) return;
    gsap.set('[data-reveal]', { opacity: 0, y: 40 });
    window.ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', overwrite: true }),
    });
    document.querySelectorAll('[data-parallax]').forEach(img => {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Resize do hero ---------- */
  let rz;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      if (!burger || busy) return;
      computeScale(burger.geo);
      gsap.set(burger.el, burgerPose(burger, isOpen));
      sizeTags(burger.el, S * (isOpen ? OPEN_K : 1));
      placeStageBits(burger);
      peekBox.innerHTML = ''; peek = null;
      renderPeek(current, null);
      renderThumbs();
    }, 120);
  });

  /* ---------- Arranque: descodifica as camadas antes da primeira animação ---------- */
  const urls = [
    ...Object.keys(REF).map(n => `assets/img/layers/${n}.webp`),
    ...Object.entries(PHOTO).flatMap(([k, v]) => v.layers.map(l => `assets/img/stack/${k}/${l.name}.webp`)),
  ];
  const preload = urls.map(u => { const i = new Image(); i.src = u; return i.decode().catch(() => {}); });
  Promise.all([...preload, document.fonts ? document.fonts.ready : 0]).then(() => {
    gsap.ticker.lagSmoothing(500, 33);
    initHero();
    initStory();
    initReveals();
  });
})();
