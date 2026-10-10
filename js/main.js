/* BBQ House — Hero com carrossel vertical (scroll) e hambúrguer em camadas.
   Animação feita com GSAP (requestAnimationFrame): só transform e opacity, para manter 60 fps. */
(() => {
  'use strict';
  const gsap = window.gsap;

  /* ---------- Camadas recortadas (unidades = px da imagem de referência) ----------
     w/h:    tamanho do recorte · cx: centro horizontal na referência
     rise:   quanto a camada sobe a pilha com o hambúrguer fechado (encaixe)
     open:   distância até à camada seguinte com o hambúrguer aberto (igual à referência)
     sx/dx:  ajuste de largura e posição só no hambúrguer fechado */
  const LAYERS = {
    'bun-top':    { w: 426, h: 227, cx: 637,   rise: 0,   open: 0,   sx: 1,    dx: 0,   label: 'Pão com sésamo', icon: 'bun' },
    'lettuce':    { w: 404, h: 129, cx: 652,   rise: 34,  open: 112, sx: 1.04, dx: -14, label: 'Alface',         icon: 'lettuce' },
    'tomato':     { w: 348, h: 123, cx: 628,   rise: 30,  open: 103, sx: 1.12, dx: 0,   label: 'Tomate',         icon: 'tomato' },
    'onion':      { w: 262, h: 76,  cx: 583,   rise: 14,  open: 60,  sx: 1.42, dx: 40,  label: 'Cebola roxa',    icon: 'onion' },
    'cheese':     { w: 439, h: 134, cx: 595.5, rise: 26,  open: 134, sx: 1,    dx: 26,  label: 'Queijo',         icon: 'cheese' },
    'patty':      { w: 427, h: 155, cx: 618.5, rise: 70,  open: 148, sx: 1,    dx: 6,   label: 'Carne grelhada', icon: 'patty' },
    'bun-bottom': { w: 442, h: 220, cx: 633,   rise: 112, open: 220, sx: 1,    dx: 0,   label: 'Pão tostado',    icon: 'bun' },
  };
  const REF_W = 470, REF_CX = 628, OPEN_GAP = 18;

  /* ---------- Slides (nomes e preços do menu publicado; composição das camadas ilustrativa — confirmar receitas) ---------- */
  const SLIDES = [
    { name: 'Cheese Burger',  tag: 'Novo',            price: '750', color: '#C78A3B', ink: '#12100E',
      layers: ['bun-bottom', 'patty', 'cheese', 'onion', 'tomato', 'lettuce', 'bun-top'],
      desc: 'Carne grelhada na chama, queijo derretido e vegetais frescos entre pão com sésamo. Toque no hambúrguer para o ver camada a camada.' },
    { name: 'The Classic',    tag: 'Clássico',        price: '650', color: '#D93425', ink: '#F6F1E9',
      layers: ['bun-bottom', 'patty', 'onion', 'tomato', 'lettuce', 'bun-top'],
      desc: 'O original da casa, sem rodeios: carne grelhada, tomate, cebola e alface. Simples, como deve ser.' },
    { name: 'Cheese Bomb',    tag: 'Queijo a dobrar', price: '850', color: '#12100E', ink: '#F6F1E9',
      layers: ['bun-bottom', 'lettuce', 'patty', 'cheese', 'patty', 'cheese', 'bun-top'],
      desc: 'Duas carnes e queijo a dobrar. Para quem acha que queijo nunca é demais.' },
    { name: 'Cuban Onion',    tag: 'Cebola',          price: '790', color: '#8E2A1C', ink: '#F6F1E9',
      layers: ['bun-bottom', 'patty', 'cheese', 'tomato', 'onion', 'onion', 'bun-top'],
      desc: 'Cebola em dose dupla sobre carne grelhada e queijo. Doce, tostado, intenso.' },
    { name: 'Special BBQ',    tag: 'Da casa',         price: '830', color: '#B5702A', ink: '#12100E',
      layers: ['bun-bottom', 'patty', 'patty', 'cheese', 'onion', 'lettuce', 'bun-top'],
      desc: 'Dupla de carne na brasa com queijo e cebola — o sabor que dá nome à casa.' },
    { name: 'Truffle Burger', tag: 'Premium',         price: '960', color: '#2A1B14', ink: '#F6F1E9',
      layers: ['bun-bottom', 'onion', 'patty', 'cheese', 'lettuce', 'bun-top'],
      desc: 'Carne grelhada, queijo e um toque de trufa. O mais elegante do menu.' },
  ];

  const ICONS = {
    bun: 'M4 13c0-4.5 3.6-7 8-7s8 2.5 8 7z M3 16h18 M5 19h14 M9 9.5h.01 M13 8.5h.01 M15.5 10.5h.01',
    lettuce: 'M5 19C5 10 11 5 19 5c0 8-5 14-14 14z M5 19l9-9',
    tomato: 'M12 7a7.5 7 0 1 0 .01 0z M12 7c-1-2-3-2.5-4.5-1.5 M12 7c1-2 3-2.5 4.5-1.5',
    onion: 'M12 3c-2 3-7 5-7 11a7 7 0 0 0 14 0c0-6-5-8-7-11z M12 9c-1.5 2-3.5 3-3.5 5.5a3.5 3.5 0 0 0 7 0C15.5 12 13.5 11 12 9z',
    cheese: 'M3 17l9-11 9 6v5z M3 17h18 M8 14.5h.01 M14 13.5h.01 M17 15.5h.01',
    patty: 'M4 12c0-3 3.5-5 8-5s8 2 8 5-3.5 5-8 5-8-2-8-5z M8 11l3-2 M10.5 13.5l4-3 M14 15l3-2',
  };

  const WA = 'https://wa.me/258851550000';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);

  const hero = $('#hero'), section = $('#hero-scroll'), stage = $('#stage'), hit = $('#hit');
  const par = $('#parallax'), bob = $('#bob');
  const hint = $('#hint'), shadow = $('#shadow'), peekBox = $('#peek'), thumbsBox = $('#thumbs');
  const panel = $('#panel'), root = document.documentElement;
  const N = SLIDES.length;

  /* ---------- Geometria ---------- */
  function layout(recipe) {
    const items = [];
    let yS = 0, yO = 0;
    recipe.forEach((name, i) => {
      const L = LAYERS[name];
      const bun = name === 'bun-top' || name === 'bun-bottom';
      items.push({
        name, L, yS, yO,
        dxS: (L.cx - REF_CX) * 0.15 + L.dx,  // fechado: tudo centrado no pão
        dxO: (L.cx - REF_CX),                 // aberto: posição da referência
        tilt: bun ? 0 : (i % 2 ? 2.5 : -2.5),
      });
      yS += L.rise;
      yO += L.open + OPEN_GAP;
    });
    const top = items[items.length - 1];
    const hS = top.yS + top.L.h;
    const hO = top.yO + top.L.h;
    const shift = (hO - hS) / 2;               // ao abrir, mantém o centro no mesmo sítio
    items.forEach(it => { it.yO -= shift; });
    return { items, hS, hO };
  }

  // estados de cada camada (GSAP: x/y em px do recorte, dentro do contentor escalado)
  const stacked = it => ({ x: -it.L.w / 2 + it.dxS, y: -it.yS, rotation: 0, scaleX: it.L.sx });
  const opened = it => ({ x: -it.L.w / 2 + it.dxO, y: -it.yO, rotation: it.tilt, scaleX: 1 });

  function buildBurger(slide, { labels = false, shadows = true } = {}) {
    const geo = layout(slide.layers);
    const el = document.createElement('div');
    el.className = 'burger';
    geo.items.forEach((it, i) => {
      if (shadows && i > 0) { // sombra de contacto sobre a camada de baixo
        const sh = document.createElement('i');
        sh.className = 'cshadow';
        sh.style.zIndex = i * 2;
        sh.style.width = `${it.L.w * it.L.sx * 0.92}px`;
        el.appendChild(sh);
        it.sh = sh;
        gsap.set(sh, { x: -it.L.w * it.L.sx * 0.46 + it.dxS, y: -it.yS + 14, opacity: 1 });
      }
      const img = new Image();
      img.src = `assets/img/layers/${it.name}.webp`;
      img.alt = '';
      img.className = 'layer';
      img.draggable = false;
      img.decoding = 'async';
      img.style.width = `${it.L.w}px`;
      img.style.zIndex = i * 2 + 1;
      el.appendChild(img);
      it.img = img;
      gsap.set(img, { ...stacked(it), transformOrigin: '50% 100%' });
      if (labels) {
        const prev = geo.items[i - 1];
        if (prev && prev.name === it.name) return; // não repetir etiqueta igual seguida
        const side = i % 2 ? 'left' : 'right';
        const tag = document.createElement('span');
        tag.className = `tag-line ${side}`;
        tag.textContent = it.L.label;
        const half = Math.max(it.L.w / 2 - 30, 120);
        tag.style.bottom = `${it.yO + it.L.h * 0.45}px`;
        if (side === 'right') tag.style.left = `${half + it.dxO}px`;
        else tag.style.right = `${half - it.dxO}px`;
        el.appendChild(tag);
        it.tag = tag;
        gsap.set(tag, { opacity: 0, x: side === 'right' ? -20 : 20 });
      }
    });
    return { el, geo, slide };
  }

  /* ---------- Escala ---------- */
  let S = 1, OPEN_K = 1;
  const isMobile = () => innerWidth <= 820;
  function computeScale(geo) {
    const vw = innerWidth, vh = innerHeight;
    S = isMobile()
      ? Math.min((vw * 0.74) / REF_W, (vh * 0.34) / geo.hS)
      : Math.min((vw * 0.28) / REF_W, (vh * 0.48) / geo.hS);
    OPEN_K = Math.min(1, (vh * (isMobile() ? 0.58 : 0.66)) / (geo.hO * S));
    if (isMobile()) OPEN_K = Math.min(OPEN_K, ((vw / 2 - 128) / (REF_W / 2)) / S);
  }
  const burgerPose = (b, open) => {
    const k = open ? OPEN_K : 1;
    return { x: 0, y: (b.geo.hS / 2) * S * k - (open ? innerHeight * 0.05 : 0), scale: S * k };
  };
  function sizeTags(b, open) {
    const k = S * (open ? OPEN_K : 1);
    b.el.querySelectorAll('.tag-line').forEach(t => { t.style.fontSize = `${(isMobile() ? 10 : 13) / k}px`; });
  }

  function placeStageBits(b) {
    const half = (b.geo.hS / 2) * S;
    const w = REF_W * S;
    const r = stage.getBoundingClientRect();
    gsap.set(shadow, { width: w * 0.95, xPercent: -50, y: half - 22 });
    Object.assign(hit.style, { left: `${r.left - w / 2}px`, top: `${r.top - half}px`, width: `${w}px`, height: `${half * 2}px` });
    hint.style.top = `${r.top + half + 26}px`;
  }

  /* ---------- Estado ---------- */
  let current = 0, target = 0, busy = false, isOpen = false, closeCall = null;
  let burger = null, peek = null, tl = null;
  const orderPop = document.createElement('a');
  orderPop.className = 'btn-order btn-order--red order-float';
  orderPop.target = '_blank'; orderPop.rel = 'noopener';
  orderPop.textContent = 'Encomendar';
  hero.appendChild(orderPop);
  gsap.set(orderPop, { autoAlpha: 0, xPercent: -50 });

  /* ---------- Texto ---------- */
  function fillCopy(s) {
    const words = s.name.split(' ');
    $('#title').innerHTML = words.length > 1 ? `${words[0]}<br>${words.slice(1).join(' ')}` : s.name;
    $('#tag').textContent = s.tag;
    $('#desc').textContent = s.desc;
    $('#price').innerHTML = `${s.price} <small>MZN</small>`;
    const link = `${WA}?text=${encodeURIComponent(`Olá BBQ House! Quero encomendar: ${s.name}`)}`;
    $('#order').href = link; orderPop.href = link;

    const uniq = [...new Set(s.layers.slice().reverse().map(n => LAYERS[n].icon))];
    $('#ingredients').innerHTML = uniq.slice(0, 4).map(k =>
      `<li title="${Object.values(LAYERS).find(l => l.icon === k).label}"><svg viewBox="0 0 24 24"><path d="${ICONS[k]}"/></svg></li>`).join('')
      + (uniq.length > 4 ? `<li class="more">+${uniq.length - 4}</li>` : '');

    const count = n => s.layers.filter(l => l === n).length;
    $('#f-layers').textContent = s.layers.length;
    $('#f-meat').textContent = `${count('patty')}×`;
    $('#f-cheese').textContent = count('cheese') ? `${count('cheese')}×` : '—';
    $('#counter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
  }
  const animEls = () => [...document.querySelectorAll('[data-anim]'), $('#facts')];

  function setColors(s) {
    root.style.setProperty('--panel', s.color);
    root.style.setProperty('--panel-ink', s.ink);
  }

  /* ---------- Animações ---------- */
  function burgerIn(b, dir, t, at) {
    const off = (innerHeight * 1.15) / S;
    const n = b.geo.items.length;
    b.geo.items.forEach((it, i) => {
      const order = dir > 0 ? n - 1 - i : i;
      const o = opened(it), s = stacked(it);
      t.fromTo(it.img, { ...o, y: o.y + dir * off, rotation: it.tilt * 3, force3D: true }, {
        keyframes: [
          { x: o.x, y: -(it.yO * 0.82 + it.yS * 0.18), rotation: it.tilt, scaleX: 1, duration: 0.72, ease: 'power3.out' },
          { ...s, duration: 0.5, ease: 'power2.inOut' },
        ],
      }, at + order * 0.04);
      if (it.sh) t.fromTo(it.sh, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'none' }, at + order * 0.04 + 0.95);
    });
  }

  function burgerOut(b, dir, t) {
    const off = (innerHeight * 1.2) / S;
    const n = b.geo.items.length;
    b.geo.items.forEach((it, i) => {
      const order = dir > 0 ? n - 1 - i : i;
      const o = opened(it);
      t.to(it.img, { x: o.x, y: o.y - dir * off, rotation: -it.tilt * 4, scaleX: 1, duration: 0.62, ease: 'power3.in', force3D: true }, order * 0.028);
      if (it.sh) t.to(it.sh, { opacity: 0, duration: 0.15 }, order * 0.035);
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

  /* ---------- Abrir / fechar camadas (clique) ---------- */
  function open() {
    if (busy || isOpen || !burger) return;
    isOpen = true;
    hero.classList.add('is-open');
    const n = burger.geo.items.length;
    const t = gsap.timeline({ defaults: { overwrite: 'auto' } });
    t.to(burger.el, { ...burgerPose(burger, true), duration: 0.9, ease: 'power3.out' }, 0);
    sizeTags(burger, true);
    burger.geo.items.forEach((it, i) => {
      t.to(it.img, { ...opened(it), duration: 0.9, ease: 'power3.out', force3D: true }, (n - 1 - i) * 0.05);
      if (it.sh) t.to(it.sh, { opacity: 0, duration: 0.25 }, 0);
      if (it.tag) t.to(it.tag, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.35 + (n - 1 - i) * 0.05);
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
    const t = gsap.timeline({ defaults: { overwrite: 'auto' } });
    t.to(burger.el, { ...burgerPose(burger, false), duration: d, ease: 'power3.inOut' }, 0);
    burger.geo.items.forEach((it, i) => {
      t.to(it.img, { ...stacked(it), duration: d, ease: 'power3.inOut', force3D: true }, fast ? 0 : i * 0.04);
      if (it.sh) t.to(it.sh, { opacity: 1, duration: 0.3 }, d * 0.8 + (fast ? 0 : i * 0.04));
      if (it.tag) t.to(it.tag, { opacity: 0, x: it.tag.classList.contains('right') ? -20 : 20, duration: 0.25 }, 0);
    });
    if (!fast) t.to([...animEls(), peekBox], { opacity: 1, duration: 0.4 }, 0.3);
    else gsap.set(peekBox, { opacity: 1 });
    t.to(orderPop, { autoAlpha: 0, y: 14, duration: 0.25 }, 0);
    t.add(() => sizeTags(burger, false));
  }

  hit.addEventListener('click', () => (isOpen ? close() : open()));

  /* ---------- Próximo hambúrguer a espreitar + miniaturas ---------- */
  function renderPeek(idx, t) {
    const b = buildBurger(SLIDES[(idx + 1) % N]);
    const k = S * 0.72;
    const pose = { x: -REF_W * k * 0.32, y: (b.geo.hS / 2) * k, scale: k };
    peekBox.appendChild(b.el);
    if (peek) {
      const old = peek.el;
      if (t) t.to(old, { y: '-=140', opacity: 0, duration: 0.6, ease: 'power2.in', onComplete: () => old.remove() }, 0.1);
      else old.remove();
    }
    if (t) t.fromTo(b.el, { ...pose, x: pose.x + 180, opacity: 0 }, { ...pose, opacity: 1, duration: 1, ease: 'power3.out' }, 0.55);
    else gsap.set(b.el, pose);
    peek = b;
  }

  function renderThumbs() {
    thumbsBox.innerHTML = '';
    SLIDES.forEach((s, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', s.name);
      const b = buildBurger(s, { shadows: false });
      const size = isMobile() ? 36 : 44;
      const k = Math.min(size / REF_W, size / b.geo.hS);
      gsap.set(b.el, { y: (b.geo.hS / 2) * k, scale: k });
      btn.appendChild(b.el);
      btn.addEventListener('click', () => goTo(i));
      li.appendChild(btn);
      thumbsBox.appendChild(li);
    });
    markThumb();
  }
  const markThumb = () => thumbsBox.querySelectorAll('button').forEach((b, i) => b.classList.toggle('is-active', i === current));

  /* ---------- Transição entre slides ---------- */
  function mountBurger(slide) {
    const b = buildBurger(slide, { labels: true });
    computeScale(b.geo);
    bob.appendChild(b.el);
    gsap.set(b.el, burgerPose(b, false));
    sizeTags(b, false);
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

  /* ---------- Scroll → slide ---------- */
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
    if (navLock !== null) { // scroll programado (miniaturas/setas): vai direto ao destino
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

  /* ---------- Parallax suave com o rato + flutuação ---------- */
  const px = gsap.quickTo(par, 'x', { duration: 0.8, ease: 'power3.out' });
  const py = gsap.quickTo(par, 'y', { duration: 0.8, ease: 'power3.out' });
  const kx = gsap.quickTo(peekBox, 'x', { duration: 1, ease: 'power3.out' });
  hero.addEventListener('pointermove', e => {
    if (reduced || isMobile()) return;
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    px(x * 18); py(y * 12); kx(x * -12);
  });
  if (!reduced) gsap.to(bob, { y: -8, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  /* ---------- Resize ---------- */
  let rz;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      if (!burger || busy) return;
      computeScale(burger.geo);
      gsap.set(burger.el, burgerPose(burger, isOpen));
      sizeTags(burger, isOpen);
      placeStageBits(burger);
      peekBox.innerHTML = ''; peek = null;
      renderPeek(current, null);
      renderThumbs();
    }, 120);
  });

  /* ---------- Arranque ---------- */
  function init() {
    gsap.ticker.lagSmoothing(500, 33);
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
    tl.from(peek.el, { opacity: 0, x: '+=140', duration: 1, ease: 'power3.out' }, 0.6);
    if (reduced) tl.progress(1);
    addEventListener('scroll', onScroll, { passive: true });
  }

  // descodifica as camadas antes da primeira animação (sem soluços no 1.º frame)
  const preload = Object.keys(LAYERS).map(n => {
    const i = new Image(); i.src = `assets/img/layers/${n}.webp`;
    return i.decode().catch(() => {});
  });
  Promise.all([...preload, document.fonts ? document.fonts.ready : 0]).then(init);
})();
