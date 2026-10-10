/* BBQ House — página do Menu.
   Desenha o menu a partir de window.BBQ_MENU, com barra de categorias, pesquisa e um pedido
   (carrinho) que segue formatado para o WhatsApp da casa. */
(() => {
  'use strict';
  const gsap = window.gsap;
  const CATS = window.BBQ_MENU, WA = 'https://wa.me/258851550000';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = $('#menu-root');
  if (!root || !CATS) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = n => n.toLocaleString('en-US');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  /* ---------- Desenho ---------- */
  const addBtns = (it, ci, ii) => it.o.map((o, oi) => {
    const label = o[0] ? `${o[0]} · ${fmt(o[1])}` : 'Adicionar';
    return `<button type="button" class="add" data-k="${ci}.${ii}.${oi}" aria-label="Adicionar ${esc(it.n)}${o[0] ? ' ' + esc(o[0]) : ''} ao pedido"><span aria-hidden="true">+</span>${esc(label)}</button>`;
  }).join('');
  const priceHtml = it => it.o.length > 1
    ? it.o.map(o => `<span><small>${esc(o[0])}</small>${fmt(o[1])}</span>`).join('')
    : `${it.old ? `<s>${fmt(it.old)}</s>` : ''}${fmt(it.o[0][1])}`;
  const tags = it => (it.t || []).map(t => `<span class="tag${t === 'Picante' ? ' tag--hot' : ' tag--save'}">${esc(t)}</span>`).join('');

  function dish(it, ci, ii, compact) {
    const search = norm(`${it.n} ${it.d || ''} ${it.g || ''}`);
    return `<li class="dish${compact ? ' dish--compact' : ''}" data-s="${esc(search)}">
      <div class="dish__head"><h4>${esc(it.n)}</h4><i class="dish__dots" aria-hidden="true"></i><span class="dish__price">${priceHtml(it)}</span></div>
      ${it.d ? `<p>${esc(it.d)}</p>` : ''}
      <div class="dish__foot">${tags(it)}${it.layers ? `<a class="dish__layers" href="camadas.html#${it.layers}">Ver camada a camada →</a>` : ''}<span class="dish__adds">${addBtns(it, ci, ii)}</span></div>
    </li>`;
  }

  function feature(it, ci, ii) {
    return `<article class="feat feat--${it.imgk}" data-s="${esc(norm(`${it.n} ${it.d || ''}`))}">
      <div class="feat__img"><img src="assets/img/${it.img}" alt="${esc(it.n)}" loading="lazy"></div>
      <div class="feat__body">
        <span class="eyebrow">Destaque</span>
        <h4>${esc(it.n)}</h4>
        <p>${esc(it.d || '')}</p>
        <div class="feat__foot"><span class="dish__price">${priceHtml(it)}</span>${tags(it)}
          ${it.layers ? `<a class="dish__layers" href="camadas.html#${it.layers}">Camada a camada →</a>` : ''}
          <span class="dish__adds">${addBtns(it, ci, ii)}</span></div>
      </div>
    </article>`;
  }

  root.innerHTML = CATS.map((c, ci) => {
    const feats = c.items.map((it, ii) => [it, ii]).filter(([it]) => it.img);
    const groups = [];
    c.items.forEach((it, ii) => {
      if (it.img) return;
      const g = it.g || '';
      let grp = groups.find(x => x.g === g);
      if (!grp) groups.push(grp = { g, items: [] });
      grp.items.push([it, ii]);
    });
    const compact = c.id === 'drinks';
    return `<section class="mcat" id="${c.id}" aria-labelledby="h-${c.id}">
      <div class="wrap mcat__grid">
        <figure class="mcat__photo">
          <img src="assets/img/photos/${c.photo}.webp" alt="${esc(c.alt)}" loading="lazy">
          <span class="mcat__idx">${String(ci + 1).padStart(2, '0')}</span>
          <figcaption>${esc(c.caption)}</figcaption>
        </figure>
        <div class="mcat__body">
          <span class="eyebrow">${esc(c.title)}</span>
          <h2 id="h-${c.id}">${esc(c.name)}</h2>
          ${c.note ? `<p class="mcat__note">${esc(c.note)}</p>` : ''}
          ${feats.map(([it, ii]) => feature(it, ci, ii)).join('')}
          ${groups.map(g => `${g.g ? `<h3 class="mgroup">${esc(g.g)}</h3>` : ''}<ul class="dishes${compact ? ' dishes--grid' : ''}">${g.items.map(([it, ii]) => dish(it, ci, ii, compact)).join('')}</ul>`).join('')}
          ${c.extras.map(e => `<p class="mcat__extras">${esc(e)}</p>`).join('')}
        </div>
      </div>
    </section>`;
  }).join('') + '<p class="menu-empty" id="menu-empty" hidden>Nenhum prato encontrado. Experimenta outra palavra.</p>';

  /* ---------- Barra de categorias + secção activa ---------- */
  const chips = $('#mchips');
  chips.innerHTML = CATS.map(c => `<a href="#${c.id}" data-id="${c.id}">${esc(c.name)}</a>`).join('');
  const setActive = id => $$('a', chips).forEach(a => {
    const on = a.dataset.id === id;
    a.classList.toggle('is-on', on);
    if (on) chips.scrollTo({ left: a.offsetLeft - chips.clientWidth / 2 + a.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
  });
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('.mcat').forEach(s => io.observe(s));

  /* ---------- Pesquisa ---------- */
  const q = $('#msearch');
  q.addEventListener('input', () => {
    const v = norm(q.value.trim());
    let any = false;
    $$('.mcat').forEach(sec => {
      let n = 0;
      $$('[data-s]', sec).forEach(el => { const ok = !v || el.dataset.s.includes(v); el.hidden = !ok; if (ok) n++; });
      $$('.dishes', sec).forEach(ul => { const h = ul.previousElementSibling; const vis = $$('.dish:not([hidden])', ul).length; ul.hidden = !vis; if (h && h.classList.contains('mgroup')) h.hidden = !vis; });
      sec.hidden = n === 0; any = any || n > 0;
      $$('a', chips).find(a => a.dataset.id === sec.id).hidden = n === 0;
    });
    $('#menu-empty').hidden = any;
    // resultados à vista: o início do menu fica logo abaixo da barra
    const top = root.getBoundingClientRect().top, bar = $('#mbar').getBoundingClientRect().bottom;
    if (v && (top > innerHeight * 0.5 || top < bar - 10)) scrollTo(0, scrollY + top - bar - 10);
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });

  /* ======================================================================
     PEDIDO (carrinho) — enviado pelo WhatsApp
     ====================================================================== */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('bbq-pedido') || '[]'); } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem('bbq-pedido', JSON.stringify(cart)); } catch (e) { /* sem armazenamento */ } };
  const drawer = $('#basket'), list = $('#basket-list'), fab = $('#basket-fab');
  let mode = 'Entrega';

  function lineOf(k) {
    const [ci, ii, oi] = k.split('.').map(Number);
    const it = CATS[ci].items[ii], o = it.o[oi];
    return { k, name: it.n + (o[0] ? ` (${o[0]})` : ''), price: o[1] };
  }
  function render() {
    const count = cart.reduce((a, l) => a + l.q, 0);
    const total = cart.reduce((a, l) => a + l.q * l.price, 0);
    $('#basket-count').textContent = count;
    $('#basket-count-2').textContent = count;
    $('#basket-total').textContent = `${fmt(total)} MZN`;
    $('#basket-fab-total').textContent = `${fmt(total)} MZN`;
    fab.classList.toggle('is-on', count > 0);
    list.innerHTML = cart.length ? cart.map(l => `<li>
        <div><b>${esc(l.name)}</b><small>${fmt(l.price)} MZN</small></div>
        <div class="qty"><button type="button" data-q="${l.k}" data-d="-1" aria-label="Menos ${esc(l.name)}">−</button><output>${l.q}</output><button type="button" data-q="${l.k}" data-d="1" aria-label="Mais ${esc(l.name)}">+</button></div>
      </li>`).join('') : '<li class="basket__empty">O pedido está vazio. Escolhe pratos no menu com o botão “+”.</li>';
    $('#basket-send').disabled = !cart.length;
    save();
  }
  function add(k, from) {
    const l = cart.find(x => x.k === k);
    if (l) l.q++; else cart.push({ ...lineOf(k), q: 1 });
    render();
    if (reduced || !from) return;
    // um ponto voa do botão até ao pedido
    const a = from.getBoundingClientRect(), b = fab.getBoundingClientRect();
    const dot = document.createElement('i');
    dot.className = 'fly';
    document.body.appendChild(dot);
    gsap.set(dot, { x: a.left + a.width / 2, y: a.top + a.height / 2 });
    gsap.timeline({ onComplete: () => dot.remove() })
      .to(dot, { x: b.left + b.width / 2, duration: 0.7, ease: 'power1.in' }, 0)
      .to(dot, { y: b.top + b.height / 2, duration: 0.7, ease: 'back.in(1.4)' }, 0)
      .to(dot, { scale: 0.4, duration: 0.2 }, 0.5);
    // pulo do botão com a propriedade 'scale' (não mexe no translate que o centra)
    setTimeout(() => fab.animate([{ scale: 1 }, { scale: 1.12 }, { scale: 1 }], { duration: 360, easing: 'ease-out' }), 620);
    from.classList.add('is-added');
    setTimeout(() => from.classList.remove('is-added'), 900);
  }
  root.addEventListener('click', e => { const b = e.target.closest('.add'); if (b) add(b.dataset.k, b); });
  list.addEventListener('click', e => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    const l = cart.find(x => x.k === b.dataset.q);
    l.q += +b.dataset.d;
    if (l.q <= 0) cart = cart.filter(x => x !== l);
    render();
  });

  const openDrawer = open => {
    drawer.hidden = !open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) {
      gsap.fromTo('.basket__panel', { xPercent: 100 }, { xPercent: 0, duration: reduced ? 0 : 0.5, ease: 'power3.out' });
      gsap.fromTo('.basket__shade', { opacity: 0 }, { opacity: 1, duration: 0.3 });
      $('#basket-close').focus();
    }
  };
  [fab, $('#open-basket')].forEach(b => b && b.addEventListener('click', () => openDrawer(true)));
  $('#basket-close').addEventListener('click', () => { openDrawer(false); fab.focus(); });
  $('.basket__shade').addEventListener('click', () => openDrawer(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) openDrawer(false); });

  $$('#basket-mode button').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.v;
    $$('#basket-mode button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    $('#basket-addr-wrap').hidden = mode !== 'Entrega';
  }));
  $('#basket-clear').addEventListener('click', () => { cart = []; render(); });

  $('#basket-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#b-name').value.trim(), addr = $('#b-addr').value.trim(), notes = $('#b-notes').value.trim();
    const err = $('#basket-err');
    err.textContent = !cart.length ? 'Adiciona pelo menos um prato.' : name.length < 2 ? 'Diz-nos o teu nome.' : (mode === 'Entrega' && addr.length < 5) ? 'Indica a morada de entrega.' : '';
    if (err.textContent) return;
    const total = cart.reduce((a, l) => a + l.q * l.price, 0);
    const msg = [
      `Olá BBQ House! Gostaria de fazer um pedido (${mode}).`, '',
      ...cart.map(l => `• ${l.q}× ${l.name} — ${fmt(l.q * l.price)} MZN`), '',
      `Total estimado: ${fmt(total)} MZN${mode === 'Entrega' ? ' (+ taxa de entrega)' : ''}`,
      `Nome: ${name}`, mode === 'Entrega' ? `Morada: ${addr}` : 'Levantamento no Baía Mall', notes ? `Notas: ${notes}` : '',
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
    window.open(`${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  render();
  $$('.mcat__photo img').forEach(img => img.setAttribute('data-parallax', ''));
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 50); }
})();
