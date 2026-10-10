/* BBQ House — Carta de bebidas.
   Roda dos mocktails (estilo "match & move"): os copos estão numa roda que gira para trazer o seguinte,
   a cor de fundo cresce a partir do copo e o nome entra na vertical. Nomes e preços vêm do menu (BBQ_MENU).
   Só transform/opacity (60 fps). */
(() => {
  'use strict';
  const gsap = window.gsap;
  const CATS = window.BBQ_MENU;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $('#dwheel');
  if (!stage || !CATS) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = n => n.toLocaleString('en-US');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const ci = CATS.findIndex(c => c.id === 'drinks');
  const drinks = CATS[ci].items.map((it, ii) => ({ ...it, ii }));
  // aparência de cada copo (imagem ilustrativa) e cor do cartaz; nomes e preços vêm do menu
  const LOOK = {
    'Belinda': ['berry', '#8E2A1C'], 'Cordelia': ['pink', '#D93425'], 'Titania': ['plum', '#2A1B14'], 'Cressida': ['coral', '#B5702A'],
    'Piña Colada': ['cream', '#C78A3B'], 'Mango Madness': ['mango', '#12100E'], 'Summer Sunrise': ['sunrise', '#6E1F17'], 'Tropical Island': ['gold', '#B5702A'],
  };
  const MOCK = drinks.filter(d => d.g === 'Mocktails da Casa' && LOOK[d.n]);
  const N = MOCK.length, SPAN = 62; // ângulo entre o copo que sai e o que entra

  /* ---------- Roda ("match & move") ----------
     Só há um copo à vista. Ao mudar, o copo seguinte é posto na roda a SPAN graus do actual,
     a roda gira SPAN graus e traz o seguinte para o lugar; o anterior sai pelo outro lado. */
  const wheel = $('#dw-wheel'), fill = $('#dw-fill'), grow = $('#dw-grow');
  wheel.innerHTML = MOCK.map((d, i) => `<div class="dw-spoke"><img class="dw-glass" src="assets/img/drinks/${LOOK[d.n][0]}.webp" alt="" draggable="false"></div>`).join('');
  const spokes = $$('.dw-spoke', wheel);
  $('#dw-dots').innerHTML = MOCK.map((d, i) => `<button type="button" role="tab" aria-label="${esc(d.n)}" data-i="${i}"><span>${esc(d.n)}</span></button>`).join('');

  let cur = 0, angle = 0, busy = false, auto = null;
  const name = $('#dw-name'), price = $('#dw-price'), idx = $('#dw-idx'), addBtn = $('#dw-add');
  spokes.forEach((sp, i) => gsap.set(sp, { rotation: 0, autoAlpha: i === 0 ? 1 : 0 }));

  function paintText(d, i) {
    name.textContent = d.n;
    name.classList.toggle('is-long', d.n.length > 11);
    price.innerHTML = `${fmt(d.o[0][1])} <small>MZN</small>`;
    idx.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    addBtn.dataset.k = `${ci}.${d.ii}.0`;
    addBtn.setAttribute('aria-label', `Juntar ${d.n} ao pedido`);
    spokes.forEach((sp, j) => sp.querySelector('img').alt = j === i ? `${d.n} (imagem ilustrativa)` : '');
    stage.style.setProperty('--dw-c', LOOK[d.n][1]);
    $$('#dw-dots button').forEach((b, j) => b.setAttribute('aria-selected', j === i ? 'true' : 'false'));
  }

  function go(i, dir) {
    i = (i + N) % N;
    if (i === cur || busy) return;
    busy = true;
    dir = dir || (((i - cur + N) % N) <= N / 2 ? 1 : -1);
    const old = spokes[cur], nw = spokes[i];
    // o copo novo entra por baixo (dir 1) ou por cima (dir -1) da roda
    gsap.set(nw, { rotation: -angle + dir * SPAN, autoAlpha: 1 });
    angle += dir * SPAN;
    const d = MOCK[i], col = LOOK[d.n][1];
    const dur = reduced ? 0 : 1.05;
    const t = gsap.timeline({ onComplete: () => { gsap.set(old, { autoAlpha: 0 }); busy = false; } });
    t.to(wheel, { rotation: -angle, duration: dur, ease: 'power3.inOut' }, 0);
    // a cor nova cresce a partir do copo (scale: barato), depois passa a ser o fundo
    grow.style.background = col;
    t.fromTo(grow, { scale: 0, opacity: 1 }, { scale: 1, duration: reduced ? 0 : 0.9, ease: 'power2.inOut' }, 0.1)
      .add(() => { fill.style.background = col; gsap.set(grow, { opacity: 0 }); }, reduced ? 0 : 1.0);
    // nome: sai, troca, entra na vertical
    t.to(['#dw-name', '#dw-meta'], { yPercent: dir * -30, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.04 }, 0)
      .add(() => paintText(d, i), 0.4)
      .fromTo(['#dw-name', '#dw-meta'], { yPercent: dir * 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.06 }, 0.45);
    t.fromTo('#dw-badge', { rotation: 0 }, { rotation: dir * 120, duration: dur, ease: 'power3.inOut' }, 0);
    cur = i;
  }

  const next = () => go(cur + 1, 1), prev = () => go(cur - 1, -1);
  $('#dw-next').addEventListener('click', () => { stop(); next(); });
  $('#dw-prev').addEventListener('click', () => { stop(); prev(); });
  $('#dw-dots').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { stop(); go(+b.dataset.i); } });
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); stop(); next(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); stop(); prev(); }
  });
  // arrastar/deslizar (dedo ou rato) para mudar de bebida
  let sx = 0, sy = 0, down = false;
  stage.addEventListener('pointerdown', e => { if (e.target.closest('button, a')) return; down = true; sx = e.clientX; sy = e.clientY; });
  addEventListener('pointerup', e => {
    if (!down) return; down = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
    stop();
    (Math.abs(dy) > Math.abs(dx) ? dy < 0 : dx < 0) ? next() : prev();
  });
  // passa sozinha enquanto está à vista; pára quando a pessoa interage
  function stop() { if (auto) { auto.kill(); auto = null; } }
  function startAuto() { if (reduced || auto) return; auto = gsap.delayedCall(4.2, function tick() { next(); auto = gsap.delayedCall(4.2, tick); }); }
  new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? startAuto() : stop())), { threshold: 0.5 }).observe(stage);
  stage.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') stop(); });

  paintText(MOCK[0], 0);
  fill.style.background = LOOK[MOCK[0].n][1];
  if (!reduced) {
    gsap.from(wheel, { rotation: SPAN, duration: 1.4, ease: 'power3.out' });
    gsap.from(['#dw-name', '#dw-meta'], { yPercent: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.3 });
  }

  /* ---------- Resto da carta ---------- */
  const groups = [];
  drinks.forEach(d => {
    if (d.g === 'Mocktails da Casa') return;
    let g = groups.find(x => x.g === d.g);
    if (!g) groups.push(g = { g: d.g, items: [] });
    g.items.push(d);
  });
  const COLORS = ['#C78A3B', '#D93425', '#12100E'];
  $('#dcarta').innerHTML = groups.map((g, gi) => `<article class="dcard" style="--dw-c:${COLORS[gi % COLORS.length]}" data-reveal>
      <div class="dcard__arc" aria-hidden="true"></div>
      <h3>${esc(g.g)}</h3>
      <ul>${g.items.map(d => `<li><span>${esc(d.n)}</span><i aria-hidden="true"></i><b>${fmt(d.o[0][1])}</b>
        <button type="button" class="dadd" data-k="${ci}.${d.ii}.0" aria-label="Juntar ${esc(d.n)} ao pedido">+</button></li>`).join('')}</ul>
    </article>`).join('') + CATS[ci].extras.map(e => `<p class="dcarta__extras">${esc(e)}</p>`).join('');

  /* ---------- Juntar ao pedido (o mesmo pedido da página do menu) ---------- */
  const toast = $('#dtoast');
  function add(k, label) {
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('bbq-pedido') || '[]'); } catch (e) { cart = []; }
    const [c, i, o] = k.split('.').map(Number), it = CATS[c].items[i];
    const l = cart.find(x => x.k === k);
    if (l) l.q++; else cart.push({ k, name: it.n + (it.o[o][0] ? ` (${it.o[o][0]})` : ''), price: it.o[o][1], q: 1 });
    try { localStorage.setItem('bbq-pedido', JSON.stringify(cart)); } catch (e) { /* sem armazenamento */ }
    const n = cart.reduce((a, x) => a + x.q, 0);
    $('#dtoast-msg').textContent = `${label} junto ao pedido · ${n} ${n === 1 ? 'item' : 'itens'}`;
    toast.hidden = false;
    gsap.fromTo(toast, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', overwrite: true });
    gsap.to(toast, { y: 30, opacity: 0, duration: 0.3, delay: 3.2, onComplete: () => { toast.hidden = true; } });
  }
  addBtn.addEventListener('click', () => { stop(); add(addBtn.dataset.k, MOCK[cur].n); });
  $('#dcarta').addEventListener('click', e => {
    const b = e.target.closest('.dadd'); if (!b) return;
    add(b.dataset.k, b.closest('li').querySelector('span').textContent);
    gsap.fromTo(b, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
  });
})();
