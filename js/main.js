/* BBQ House — Hero com carrossel vertical (scroll) e hambúrguer em camadas */
(() => {
  'use strict';

  /* ---------- Camadas recortadas (unidades = px da imagem de referência) ----------
     w/h: tamanho do recorte · cx: centro horizontal original
     stack: quanto a camada "sobe" a pilha quando o hambúrguer está fechado
     open:  espaço até à camada seguinte quando o hambúrguer abre (tirado da referência) */
  const LAYERS = {
    'bun-top':    { w: 430, h: 235, cx: 637, stack: 0,   open: 0,   label: 'Pão com sésamo', icon: 'bun' },
    'lettuce':    { w: 406, h: 130, cx: 652, stack: 48,  open: 112, label: 'Alface',         icon: 'lettuce' },
    'tomato':     { w: 351, h: 124, cx: 628, stack: 40,  open: 108, label: 'Tomate',         icon: 'tomato' },
    'onion':      { w: 269, h: 81,  cx: 582, stack: 20,  open: 78,  label: 'Cebola roxa',    icon: 'onion' },
    'cheese':     { w: 445, h: 128, cx: 594, stack: 26,  open: 124, label: 'Queijo',         icon: 'cheese' },
    'patty':      { w: 431, h: 156, cx: 618, stack: 66,  open: 160, label: 'Carne grelhada', icon: 'patty' },
    'bun-bottom': { w: 444, h: 228, cx: 633, stack: 118, open: 230, label: 'Pão tostado',    icon: 'bun' },
  };
  const REF_W = 480, REF_CX = 628;

  /* ---------- Slides (nomes e preços do menu publicado; composição das camadas ilustrativa — confirmar receitas) ---------- */
  const SLIDES = [
    { name: 'Cheese Burger',  tag: 'Novo',          price: '750', color: '#C78A3B', ink: '#12100E',
      layers: ['bun-bottom', 'patty', 'cheese', 'onion', 'tomato', 'lettuce', 'bun-top'],
      desc: 'Carne grelhada na chama, queijo derretido e vegetais frescos entre pão com sésamo. Toque no hambúrguer para o ver camada a camada.' },
    { name: 'The Classic',    tag: 'Clássico',      price: '650', color: '#D93425', ink: '#F6F1E9',
      layers: ['bun-bottom', 'patty', 'onion', 'tomato', 'lettuce', 'bun-top'],
      desc: 'O original da casa, sem rodeios: carne grelhada, tomate, cebola e alface. Simples, como deve ser.' },
    { name: 'Cheese Bomb',    tag: 'Queijo a dobrar', price: '850', color: '#12100E', ink: '#F6F1E9',
      layers: ['bun-bottom', 'lettuce', 'patty', 'cheese', 'patty', 'cheese', 'bun-top'],
      desc: 'Duas carnes e queijo a dobrar. Para quem acha que queijo nunca é demais.' },
    { name: 'Cuban Onion',    tag: 'Cebola',        price: '790', color: '#8E2A1C', ink: '#F6F1E9',
      layers: ['bun-bottom', 'patty', 'cheese', 'tomato', 'onion', 'onion', 'bun-top'],
      desc: 'Cebola em dose dupla sobre carne grelhada e queijo. Doce, tostado, intenso.' },
    { name: 'Special BBQ',    tag: 'Da casa',       price: '830', color: '#B5702A', ink: '#12100E',
      layers: ['bun-bottom', 'patty', 'patty', 'cheese', 'onion', 'lettuce', 'bun-top'],
      desc: 'Dupla de carne na brasa com queijo e cebola — o sabor que dá nome à casa.' },
    { name: 'Truffle Burger', tag: 'Premium',       price: '960', color: '#2A1B14', ink: '#F6F1E9',
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
  const EASE_OUT = 'cubic-bezier(.22,.8,.2,1)';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);

  const hero = $('#hero'), section = $('#hero-scroll'), stage = $('#stage'), hit = $('#hit');
  const hint = $('#hint'), shadow = $('#shadow'), peekBox = $('#peek'), thumbsBox = $('#thumbs');
  const root = document.documentElement;
  const N = SLIDES.length;

  /* ---------- Geometria ---------- */
  function layout(recipe) {
    const items = [];
    let yS = 0, yO = 0;
    recipe.forEach((name, i) => {
      const L = LAYERS[name];
      const tilt = name === 'bun-top' || name === 'bun-bottom' ? 0 : (i % 2 ? 2.2 : -2.2);
      items.push({ name, L, yS, yO, dx: (L.cx - REF_CX) * 0.8, tilt });
      yS += L.stack;
      yO += L.open + 16;
    });
    const top = items[items.length - 1];
    const hS = top.yS + top.L.h;
    const hO = top.yO + top.L.h;
    // ao abrir, mantém o centro do hambúrguer no mesmo sítio
    const shift = (hO - hS) / 2;
    items.forEach(it => { it.yO -= shift; });
    return { items, hS, hO, shift };
  }

  const tf = (it, y, rot = 0) => `translate(${-it.L.w / 2 + it.dx}px, ${-y}px) rotate(${rot}deg)`;

  function buildBurger(slide, { labels = false } = {}) {
    const geo = layout(slide.layers);
    const el = document.createElement('div');
    el.className = 'burger';
    geo.items.forEach((it, i) => {
      const img = new Image();
      img.src = `assets/img/layers/${it.name}.webp`;
      img.alt = '';
      img.className = 'layer';
      img.draggable = false;
      img.style.width = `${it.L.w}px`;
      img.style.zIndex = i + 1;
      img.style.transform = tf(it, it.yS);
      el.appendChild(img);
      it.img = img;
      if (labels) {
        const prev = geo.items[i - 1];
        if (prev && prev.name === it.name && it.name !== 'bun-top') return; // não repetir etiqueta igual seguida
        const tag = document.createElement('span');
        const side = i % 2 ? 'left' : 'right';
        tag.className = `tag-line ${side}`;
        tag.textContent = it.L.label;
        const half = Math.max(it.L.w / 2 - 30, 120);
        tag.style.bottom = `${it.yO + it.L.h * 0.45}px`;
        tag.style.left = side === 'right' ? `${half + it.dx}px` : 'auto';
        tag.style.right = side === 'left' ? `${half - it.dx}px` : 'auto';
        el.appendChild(tag);
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
      : Math.min((vw * 0.28) / REF_W, (vh * 0.47) / geo.hS);
    OPEN_K = Math.min(1, (vh * (isMobile() ? 0.58 : 0.66)) / (geo.hO * S));
    // no telemóvel as etiquetas têm de caber dos dois lados
    if (isMobile()) OPEN_K = Math.min(OPEN_K, ((vw / 2 - 128) / (REF_W / 2)) / S);
  }

  function placeBurger(b, open = false) {
    const k = open ? OPEN_K : 1;
    const base = (b.geo.hS / 2) * S * k - (open ? innerHeight * 0.05 : 0); // abre um pouco acima, longe da barra
    b.el.style.transform = `translate(0, ${base}px) scale(${S * k})`;
    b.el.style.setProperty('--sk', S * k);
    b.el.querySelectorAll('.tag-line').forEach(t => { t.style.fontSize = `${(isMobile() ? 10 : 13) / (S * k)}px`; });
  }

  function placeStageBits(b) {
    const half = (b.geo.hS / 2) * S;
    const w = REF_W * S;
    const r = stage.getBoundingClientRect();
    shadow.style.width = `${w * 0.95}px`;
    shadow.style.transform = `translate(-50%, ${half - 22}px)`;
    Object.assign(hit.style, { left: `${r.left - w / 2}px`, top: `${r.top - half}px`, width: `${w}px`, height: `${half * 2}px` });
    hint.style.top = `${r.top + half + 26}px`;
  }

  /* ---------- Estado ---------- */
  let current = 0, target = 0, busy = false, isOpen = false, closeTimer = 0;
  let burger = null, peek = null;
  const orderPop = document.createElement('a');
  orderPop.className = 'btn-order btn-order--red order-float';
  orderPop.target = '_blank'; orderPop.rel = 'noopener';
  orderPop.textContent = 'Encomendar';
  Object.assign(orderPop.style, { position: 'absolute', zIndex: 13, opacity: 0, pointerEvents: 'none', transition: 'opacity .4s, transform .5s ' + EASE_OUT });
  hero.appendChild(orderPop);

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
    const shown = uniq.slice(0, 4);
    $('#ingredients').innerHTML = shown.map(k =>
      `<li title="${Object.values(LAYERS).find(l => l.icon === k).label}"><svg viewBox="0 0 24 24"><path d="${ICONS[k]}"/></svg></li>`).join('')
      + (uniq.length > 4 ? `<li class="more">+${uniq.length - 4}</li>` : '');

    const count = n => s.layers.filter(l => l === n).length;
    $('#f-layers').textContent = s.layers.length;
    $('#f-meat').textContent = `${count('patty')}×`;
    $('#f-cheese').textContent = count('cheese') ? `${count('cheese')}×` : '—';
    $('#counter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
  }

  const animEls = () => [...document.querySelectorAll('[data-anim]'), $('#facts')];

  function copyOut(dir) {
    if (reduced) return Promise.resolve();
    return Promise.all(animEls().map((el, i) => el.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${-dir * 26}px)` }],
      { duration: 280, delay: i * 22, easing: 'ease-in', fill: 'forwards' }).finished));
  }
  function copyIn(dir) {
    animEls().forEach((el, i) => {
      el.getAnimations().forEach(a => a.cancel());
      if (reduced) return;
      el.animate([{ opacity: 0, transform: `translateY(${dir * 40}px)` }, { opacity: 1, transform: 'none' }],
        { duration: 650, delay: 120 + i * 55, easing: EASE_OUT, fill: 'backwards' });
    });
  }

  /* ---------- Painel colorido (wipe vertical, como no vídeo) ---------- */
  function setColors(s) {
    root.style.setProperty('--panel', s.color);
    root.style.setProperty('--panel-ink', s.ink);
  }
  function wipePanel(s, dir) {
    if (reduced) { setColors(s); return; }
    const w = document.createElement('div');
    w.className = 'panel__wipe';
    w.style.background = s.color;
    $('#panel').after(w);
    const from = dir > 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)';
    const a = w.animate([{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], { duration: 950, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
    setTimeout(() => root.style.setProperty('--panel-ink', s.ink), 480);
    a.finished.then(() => { setColors(s); w.remove(); });
  }

  /* ---------- Hambúrguer: entrada / saída ---------- */
  function mountBurger(slide) {
    const b = buildBurger(slide, { labels: true });
    computeScale(b.geo);
    stage.appendChild(b.el);
    placeBurger(b);
    return b;
  }

  function burgerIn(b, dir) {
    if (reduced) return Promise.resolve();
    b.el.classList.add('no-tr');
    const off = (innerHeight * 1.15) / S;
    const n = b.geo.items.length;
    return Promise.all(b.geo.items.map((it, i) => {
      const order = dir > 0 ? n - 1 - i : i;
      const a = it.img.animate([
        { transform: tf(it, it.yO - dir * off, it.tilt * 3) },
        { transform: tf(it, it.yO * 0.85 + it.yS * 0.15, it.tilt), offset: 0.55 },
        { transform: tf(it, it.yS) },
      ], { duration: 1250, delay: 280 + order * 45, easing: EASE_OUT, fill: 'backwards' });
      return a.finished;
    })).then(() => b.el.classList.remove('no-tr'));
  }

  function burgerOut(b, dir) {
    const done = () => b.el.remove();
    if (reduced) { done(); return Promise.resolve(); }
    b.el.classList.add('no-tr');
    const off = (innerHeight * 1.2) / S;
    const n = b.geo.items.length;
    return Promise.all(b.geo.items.map((it, i) => {
      const order = dir > 0 ? n - 1 - i : i;
      return it.img.animate([
        { transform: getComputedStyle(it.img).transform },
        { transform: tf(it, it.yO + dir * off, -it.tilt * 4) },
      ], { duration: 820, delay: order * 38, easing: 'cubic-bezier(.55,0,.75,.35)', fill: 'forwards' }).finished;
    })).then(done);
  }

  /* ---------- Abrir / fechar camadas (clique) ---------- */
  function open() {
    if (busy || isOpen || !burger) return;
    isOpen = true;
    hero.classList.add('is-open');
    const n = burger.geo.items.length;
    burger.geo.items.forEach((it, i) => {
      it.img.style.transitionDelay = `${(n - 1 - i) * 55}ms`;
      it.img.style.transform = tf(it, it.yO, it.tilt);
    });
    burger.el.style.transition = `transform .9s ${EASE_OUT}`;
    placeBurger(burger, true);
    const r = stage.getBoundingClientRect();
    const bottom = r.top + (burger.geo.hO / 2) * S * OPEN_K - innerHeight * 0.05;
    Object.assign(orderPop.style, { left: `${r.left}px`, top: `${Math.min(bottom + 14, innerHeight - 130)}px`, transform: 'translate(-50%, 0)', opacity: 1, pointerEvents: 'auto' });
    clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 7000); // fecha sozinho passado algum tempo
  }

  function close() {
    clearTimeout(closeTimer);
    if (!isOpen || !burger) return;
    isOpen = false;
    hero.classList.remove('is-open');
    burger.geo.items.forEach((it, i) => {
      it.img.style.transitionDelay = `${i * 45}ms`;
      it.img.style.transform = tf(it, it.yS);
    });
    placeBurger(burger, false);
    Object.assign(orderPop.style, { opacity: 0, pointerEvents: 'none', transform: 'translate(-50%, 12px)' });
  }

  hit.addEventListener('click', () => (isOpen ? close() : open()));

  /* ---------- Próximo hambúrguer a espreitar + miniaturas ---------- */
  function renderPeek(idx, animate) {
    const s = SLIDES[(idx + 1) % N];
    const b = buildBurger(s);
    const k = S * 0.72;
    const base = (b.geo.hS / 2) * k;
    const x = -REF_W * k * 0.32;
    b.el.style.transform = `translate(${x + (animate ? 160 : 0)}px, ${base}px) scale(${k})`;
    b.el.style.opacity = animate ? 0 : 1;
    peekBox.appendChild(b.el);
    if (peek) {
      const old = peek.el;
      old.style.opacity = 0;
      old.style.transform += ' translateY(-120px)';
      setTimeout(() => old.remove(), 700);
    }
    if (animate) requestAnimationFrame(() => requestAnimationFrame(() => {
      b.el.style.transform = `translate(${x}px, ${base}px) scale(${k})`;
      b.el.style.opacity = 1;
    }));
    peek = b;
  }

  function renderThumbs() {
    thumbsBox.innerHTML = '';
    SLIDES.forEach((s, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', s.name);
      const b = buildBurger(s);
      const size = isMobile() ? 36 : 44;
      const k = Math.min(size / REF_W, size / b.geo.hS);
      b.el.style.transform = `translate(0, ${(b.geo.hS / 2) * k}px) scale(${k})`;
      btn.appendChild(b.el);
      btn.addEventListener('click', () => goTo(i));
      li.appendChild(btn);
      thumbsBox.appendChild(li);
    });
    markThumb();
  }
  const markThumb = () => thumbsBox.querySelectorAll('button').forEach((b, i) => b.classList.toggle('is-active', i === current));

  /* ---------- Transição entre slides ---------- */
  async function show(idx) {
    const dir = idx > current ? 1 : -1;
    busy = true;
    hero.classList.add('is-busy');
    close();
    const old = burger;
    current = idx;
    markThumb();
    wipePanel(SLIDES[idx], dir);
    const out = old ? burgerOut(old, dir) : Promise.resolve();
    await copyOut(dir);
    fillCopy(SLIDES[idx]);
    copyIn(dir);
    burger = mountBurger(SLIDES[idx]);
    placeStageBits(burger);
    renderPeek(idx, true);
    await Promise.all([out, burgerIn(burger, dir)]);
    busy = false;
    hero.classList.remove('is-busy');
    pump();
  }

  function pump() {
    if (busy || target === current) return;
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

  let navLock = null, navTimer = 0;
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
    const top = section.offsetTop + i * innerHeight;
    navLock = i;
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { navLock = null; }, 1500);
    target = i;
    pump();
    scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }

  $('#prev').addEventListener('click', () => goTo(target - 1));
  $('#next').addEventListener('click', () => goTo(target + 1));

  /* ---------- Parallax leve com o rato ---------- */
  hero.addEventListener('pointermove', e => {
    if (reduced || isMobile()) return;
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    stage.style.translate = `${x * 18}px ${y * 12}px`;
    peekBox.style.translate = `${x * -10}px ${y * -6}px`;
  });

  /* ---------- Resize ---------- */
  let rz;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      if (!burger) return;
      computeScale(burger.geo);
      placeBurger(burger, isOpen);
      placeStageBits(burger);
      peekBox.innerHTML = ''; peek = null;
      renderPeek(current, false);
      renderThumbs();
    }, 120);
  });

  /* ---------- Arranque ---------- */
  function init() {
    setupScroll();
    // se a página abrir a meio do hero, começa no slide certo
    const off = -section.getBoundingClientRect().top;
    current = target = Math.max(0, Math.min(N - 1, Math.round(off / innerHeight)));
    const s = SLIDES[current];
    setColors(s);
    fillCopy(s);
    burger = mountBurger(s);
    placeStageBits(burger);
    renderPeek(current, false);
    renderThumbs();
    hero.classList.add('is-ready');
    copyIn(1);
    busy = true;
    burgerIn(burger, 1).then(() => { busy = false; pump(); });
    addEventListener('scroll', onScroll, { passive: true });
  }

  // espera pelas imagens das camadas para a primeira animação sair limpa
  const preload = Object.keys(LAYERS).map(n => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = `assets/img/layers/${n}.webp`; }));
  Promise.all([...preload, document.fonts ? document.fonts.ready : 0]).then(init);
})();
