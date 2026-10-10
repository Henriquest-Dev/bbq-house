/* BBQ House — Hero da página inicial: carrossel vertical (scroll) com hambúrgueres em camadas; clique abre as camadas.
   Animação com GSAP: só transform e opacity, para manter 60 fps. */
(() => {
  'use strict';
  const gsap = window.gsap;
  const { SLIDES, ICONS, WA, reduced, isMobile, geoFor, buildBurger, sizeTags } = window.BBQ;
  const $ = (s, r = document) => r.querySelector(s);
  if (!$('#hero')) return;

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
    $('#price').innerHTML = `${s.from ? '<small>desde</small> ' : ''}${s.price} <small>MZN</small>`;
    const link = `${WA}?text=${encodeURIComponent(s.from ? 'Olá BBQ House! Gostaria de fazer um pedido.' : `Olá BBQ House! Quero encomendar: ${s.name}`)}`;
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
    syncLayersBtn();
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
    syncLayersBtn();
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
  // botão visível "Ver camadas" (o mesmo que clicar no hambúrguer)
  const layersBtn = $('#btn-layers');
  function syncLayersBtn() {
    if (!layersBtn) return;
    layersBtn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
    layersBtn.querySelector('span').textContent = isOpen ? 'Fechar camadas' : 'Ver camadas';
  }
  if (layersBtn) layersBtn.addEventListener('click', () => (isOpen ? close() : open()));

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
    tl = gsap.timeline({ onComplete: () => {
      busy = false; tl = null; pump();
      // demonstração: na primeira visita o hambúrguer abre-se sozinho por instantes, depois fecha
      let seen = false;
      try { seen = sessionStorage.getItem('bbq-demo') === '1'; sessionStorage.setItem('bbq-demo', '1'); } catch (e) { /* sem armazenamento */ }
      if (!seen && !reduced) gsap.delayedCall(0.6, () => {
        if (busy || isOpen || current !== 0 || scrollY > 40) return;
        open();
        if (closeCall) closeCall.kill();
        closeCall = gsap.delayedCall(3.2, close);
      });
    } });
    tl.fromTo(animEls(), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power3.out' }, 0.1);
    burgerIn(burger, 1, tl, 0.05);
    tl.from(peek, { opacity: 0, x: '+=140', duration: 1, ease: 'power3.out' }, 0.6);
    if (reduced) tl.progress(1);
    addEventListener('scroll', onScroll, { passive: true });
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

  window.BBQ.preloadLayers().then(() => {
    gsap.ticker.lagSmoothing(500, 33);
    initHero();
    document.dispatchEvent(new Event('bbq:ready')); // hero com a altura final: as outras secções podem medir
  });
})();
