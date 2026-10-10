/* BBQ House — secções extra: Faz zoom, A vibe (galeria horizontal), ilustrações animadas, reservas, menu do telemóvel.
   Tudo animado só com transform/opacity para manter 60 fps. */
(() => {
  'use strict';
  const gsap = window.gsap, ST = window.ScrollTrigger;
  if (ST) gsap.registerPlugin(ST);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth <= 820;
  const WA = 'https://wa.me/258851550000';

  /* ======================================================================
     FAZ ZOOM — as 4 fotos do post do Instagram formam um zoom contínuo.
     Cada foto mostra o hambúrguer a um tamanho diferente (W, relativo à 1.ª)
     e com o centro em C (px da foto 1080×1350). Um único "nível de zoom" z
     escala e alinha todas as fotos em conjunto; a de cima entra por opacidade.
     ====================================================================== */
  function initZoom() {
    const sec = $('#zoom'), imgs = $$('.zoom__img'), words = $$('.zoom__word');
    if (!sec || !imgs.length) return;
    const IW = 1080, IH = 1350;
    const W = [1, 2.15, 3.2, 5.45];                         // tamanho do hambúrguer em cada foto
    const C = [[525, 825], [537, 772], [537, 750], [820, 641]]; // centro do hambúrguer em cada foto
    const ZMAX = 3.5;
    imgs.forEach((im, i) => { im.style.transformOrigin = `${C[i][0] / IW * 100}% ${C[i][1] / IH * 100}%`; });

    const lerp = (a, b, t) => a + (b - a) * t;
    const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    let word = -1;

    function render(z) {
      const i0 = Math.min(Math.floor(z), 2), t = Math.min(z - i0, 1.5);
      const logB = z <= 3 ? lerp(Math.log(W[i0]), Math.log(W[i0 + 1]), Math.min(t, 1)) : Math.log(W[3] * (1 + 0.12 * (z - 3) / (ZMAX - 3)));
      const B = Math.exp(logB);
      const ia = Math.min(Math.floor(z), 3), ta = Math.min(z - ia, 1);
      const ib = Math.min(ia + 1, 3);
      const A = [lerp(C[ia][0], C[ib][0], ta), lerp(C[ia][1], C[ib][1], ta)]; // ponto de ancoragem comum
      imgs.forEach((im, i) => {
        const op = i === 0 ? 1 : smooth(i - 0.55, i - 0.05, z);
        const covered = i < 3 && z > i + 1.4; // a seguinte já a tapa, incluindo a borda esbatida
        if (op <= 0 || covered) { im.style.opacity = 0; return; } // opacidade 0 (não visibility): a camada fica pronta na GPU
        const s = (B / W[i]) * 1.04;
        const dx = (A[0] - C[i][0]) / IW * 100, dy = (A[1] - C[i][1]) / IH * 100;
        im.style.opacity = op;
        im.style.transform = `translate3d(${dx}%, ${dy}%, 0) scale(${s})`;
      });
      const w = Math.min(3, Math.max(0, Math.round(z - 0.15)));
      if (w !== word) setWord(w);
      $('#zoom-bar').style.transform = `scaleX(${z / ZMAX})`;
    }

    function setWord(w) {
      const prev = word; word = w;
      words.forEach((el, i) => {
        if (i === w) gsap.fromTo(el, { opacity: 0, y: prev < w ? 50 : -50 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', overwrite: true });
        else if (i === prev) gsap.to(el, { opacity: 0, y: prev < w ? -50 : 50, duration: 0.35, ease: 'power2.in', overwrite: true });
      });
      gsap.to('.zoom__cta', { opacity: w === 3 ? 1 : 0, y: w === 3 ? 0 : 16, duration: 0.5, ease: 'power2.out', overwrite: true });
    }

    imgs.forEach(im => im.decode && im.decode().catch(() => {}));
    if (reduced || !ST) { render(ZMAX); return; }
    const state = { z: 0 };
    render(0);
    gsap.to(state, {
      z: ZMAX, ease: 'none', onUpdate: () => render(state.z),
      scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    });
    // fundo desfocado com uma deriva lenta (pré-desfocado: sem filtros em tempo real)
    gsap.fromTo('.zoom__bg', { scale: 1.1 }, { scale: 1.3, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true } });
  }

  /* ======================================================================
     A VIBE — galeria horizontal presa ao scroll
     ====================================================================== */
  let vibeTl = null;
  function initVibe() {
    const sec = $('#vibe'), track = $('#vibe-track');
    if (!sec || !track || reduced || !ST) return;
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    vibeTl = gsap.timeline({
      scrollTrigger: { trigger: sec, pin: true, start: 'top top', end: () => `+=${dist()}`, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    vibeTl.to(track, { x: () => -dist(), ease: 'none' }, 0);
    $$('.vcard img', track).forEach(img => vibeTl.fromTo(img, { xPercent: -6, scale: 1.12 }, { xPercent: 6, scale: 1.12, ease: 'none' }, 0));
    $$('.deco', sec).forEach(d => {
      const k = +d.dataset.depth || 1;
      vibeTl.fromTo(d, { x: 160 * k, rotation: 0 }, { x: -260 * k, rotation: +d.dataset.rot || 25, ease: 'none' }, 0);
    });
  }

  /* ======================================================================
     ILUSTRAÇÕES — paralaxe e rotação com o scroll; umas surgem, outras somem;
     seguem o rato de leve.
     ====================================================================== */
  function initDeco() {
    const decos = $$('.deco').filter(d => !d.closest('#vibe'));
    if (reduced || !ST) return;
    decos.forEach(d => {
      const k = +d.dataset.depth || 1, r = +d.dataset.rot || 0;
      const host = d.closest('section') || d.parentElement;
      gsap.fromTo(d, { y: 140 * k, rotation: -r / 2 }, {
        y: -140 * k, rotation: r / 2, ease: 'none',
        scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });
      if (d.hasAttribute('data-pop')) {
        // surge com um "pop" ao entrar e esconde-se ao sair, nos dois sentidos
        gsap.set(d, { scale: 0, opacity: 0 });
        ST.create({
          trigger: host, start: 'top 70%', end: 'bottom 30%',
          onToggle: self => gsap.to(d, self.isActive
            ? { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.6)', overwrite: 'auto' }
            : { scale: 0.4, opacity: 0, duration: 0.45, ease: 'power2.in', overwrite: 'auto' }),
        });
      } else {
        // aparece a meio da secção e desaparece ao sair
        gsap.fromTo(d, { opacity: 0 }, {
          keyframes: [{ opacity: 1, duration: 0.3 }, { opacity: 1, duration: 0.4 }, { opacity: 0, duration: 0.3 }], ease: 'none',
          scrollTrigger: { trigger: host, start: 'top 85%', end: 'bottom 15%', scrub: true },
        });
      }
    });
    // o rato empurra as ilustrações (camadas mais "perto" mexem mais)
    const movers = decos.map(d => ({ k: +d.dataset.depth || 1, fx: gsap.quickTo(d, 'x', { duration: 1.1, ease: 'power3.out' }) }));
    addEventListener('pointermove', e => {
      if (isMobile()) return;
      const mx = e.clientX / innerWidth - 0.5;
      movers.forEach(m => m.fx(mx * -40 * m.k));
    }, { passive: true });
  }

  /* ======================================================================
     RESERVAS — pedido enviado pelo WhatsApp (sem servidor) + ficheiro .ics
     ====================================================================== */
  function initReserve() {
    const form = $('#rform'), done = $('#rdone');
    if (!form) return;
    const OPEN = [10, 30], LAST = [21, 0], STEP = 30; // aberto 10:30–21:30, última mesa às 21:00
    const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const fmtLong = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
    const st = { people: 2, day: null, time: null, occasion: '' };
    const daysBox = $('#r-days'), timesBox = $('#r-times'), err = $('#r-error');

    // rascunho de nome/telefone neste navegador (conveniência; pode falhar sem problema)
    try {
      const saved = JSON.parse(localStorage.getItem('bbq-reserva') || '{}');
      if (saved.name) $('#r-name').value = saved.name;
      if (saved.phone) $('#r-phone').value = saved.phone;
    } catch (e) { /* armazenamento indisponível */ }

    const slots = [];
    for (let m = OPEN[0] * 60 + OPEN[1]; m <= LAST[0] * 60 + LAST[1]; m += STEP) slots.push(m);
    const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const sameDay = (a, b) => a.toDateString() === b.toDateString();

    function radio(btn, group, on) {
      $$('[role="radio"]', group).forEach(b => { b.setAttribute('aria-checked', b === btn ? 'true' : 'false'); b.tabIndex = b === btn ? 0 : -1; });
      if (on) on();
    }
    function keyNav(group) { // setas para mudar de opção, como num grupo de rádio
      group.addEventListener('keydown', e => {
        if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
        const items = $$('[role="radio"]:not(:disabled)', group), i = items.indexOf(document.activeElement);
        if (i < 0) return;
        e.preventDefault();
        const n = items[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length];
        n.focus(); n.click();
      });
    }

    function renderDays() {
      const now = new Date();
      const lastToday = new Date(now); lastToday.setHours(LAST[0], LAST[1] - 30, 0, 0);
      const start = now > lastToday ? 1 : 0;
      daysBox.innerHTML = '';
      for (let i = start; i < start + 14; i++) {
        const d = new Date(now); d.setDate(now.getDate() + i); d.setHours(0, 0, 0, 0);
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'day'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.tabIndex = -1;
        b.setAttribute('aria-label', fmtLong.format(d));
        b.innerHTML = `<small>${i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : DOW[d.getDay()]}</small><b>${d.getDate()}</b>`;
        b.addEventListener('click', () => radio(b, daysBox, () => { st.day = d; renderTimes(); }));
        daysBox.appendChild(b);
      }
      daysBox.firstChild.click();
    }

    function renderTimes() {
      const now = new Date(), minM = sameDay(st.day, now) ? now.getHours() * 60 + now.getMinutes() + 30 : 0;
      timesBox.innerHTML = '';
      slots.forEach(m => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'tslot'; b.textContent = hhmm(m);
        b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.tabIndex = -1;
        b.disabled = m < minM;
        b.addEventListener('click', () => radio(b, timesBox, () => { st.time = m; err.textContent = ''; }));
        timesBox.appendChild(b);
      });
      if (st.time !== null) {
        const keep = $$('.tslot', timesBox).find(b => !b.disabled && b.textContent === hhmm(st.time));
        if (keep) keep.click(); else st.time = null;
      }
      const first = $('.tslot:not(:disabled)', timesBox); if (first && st.time === null) first.tabIndex = 0;
    }

    $$('.pbtn', form).forEach(b => b.addEventListener('click', () => {
      st.people = Math.min(30, Math.max(1, st.people + +b.dataset.delta));
      $('#r-people').textContent = st.people;
      gsap.fromTo('#r-people', { scale: 1.3 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
    }));

    const occ = $('#r-occasion');
    $$('.chip', occ).forEach(c => {
      c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', 'false');
      c.addEventListener('click', () => {
        const on = c.getAttribute('aria-checked') !== 'true';
        $$('.chip', occ).forEach(x => x.setAttribute('aria-checked', 'false'));
        c.setAttribute('aria-checked', on ? 'true' : 'false');
        st.occasion = on ? c.dataset.v : '';
      });
    });
    keyNav(daysBox); keyNav(timesBox);

    function message(d) {
      const lines = [
        'Olá BBQ House! Gostaria de reservar uma mesa.',
        `• Nome: ${d.name}`, `• Telefone: ${d.phone}`, `• Dia: ${fmtLong.format(st.day)}`,
        `• Hora: ${hhmm(st.time)}`, `• Pessoas: ${st.people}${st.people > 12 ? ' (grupo grande)' : ''}`,
      ];
      if (st.occasion) lines.push(`• Ocasião: ${st.occasion}`);
      if (d.notes) lines.push(`• Notas: ${d.notes}`);
      return lines.join('\n');
    }

    function ics(d) {
      const p = n => String(n).padStart(2, '0');
      const s = new Date(st.day); s.setHours(Math.floor(st.time / 60), st.time % 60, 0, 0);
      const e = new Date(s.getTime() + 2 * 3600e3);
      const f = x => `${x.getFullYear()}${p(x.getMonth() + 1)}${p(x.getDate())}T${p(x.getHours())}${p(x.getMinutes())}00`;
      const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BBQ House//Reservas//PT', 'BEGIN:VEVENT',
        `UID:${Date.now()}@bbqhouse`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`,
        `SUMMARY:BBQ House · mesa para ${st.people}`, 'LOCATION:BBQ House\\, Baía Mall\\, Maputo',
        `DESCRIPTION:Pedido de reserva em nome de ${d.name}. Aguarda confirmação da BBQ House pelo WhatsApp.`,
        'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
      a.download = 'reserva-bbq-house.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    let last = null;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#r-name').value.trim(), phone = $('#r-phone').value.trim(), notes = $('#r-notes').value.trim();
      $('#r-name').setAttribute('aria-invalid', name.length < 2);
      $('#r-phone').setAttribute('aria-invalid', phone.replace(/\D/g, '').length < 8);
      let msg = '';
      if (st.time === null) msg = 'Escolhe uma hora.';
      else if (name.length < 2) msg = 'Diz-nos o teu nome.';
      else if (phone.replace(/\D/g, '').length < 8) msg = 'Indica um telefone válido para confirmarmos a reserva.';
      err.textContent = msg;
      if (msg) {
        gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, .3)' });
        const bad = st.time === null ? $('.tslot:not(:disabled)', timesBox) : $('[aria-invalid="true"]', form);
        if (bad) bad.focus();
        return;
      }
      try { localStorage.setItem('bbq-reserva', JSON.stringify({ name, phone })); } catch (er) { /* sem armazenamento */ }
      last = { name, phone, notes };
      $('#d-name').textContent = name.split(' ')[0];
      $('#d-day').textContent = fmtLong.format(st.day);
      $('#d-time').textContent = hhmm(st.time);
      $('#d-people').textContent = st.people;
      $('#d-wa').href = `${WA}?text=${encodeURIComponent(message(last))}`;
      form.hidden = true; done.hidden = false; done.focus({ preventScroll: true });
      gsap.fromTo(done, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      gsap.fromTo('.rdone__tick', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2)', delay: 0.15 });
      if (ST) ST.refresh();
    });
    $('#d-ics').addEventListener('click', () => last && ics(last));
    $('#d-edit').addEventListener('click', () => { done.hidden = true; form.hidden = false; $('#r-name').focus(); if (ST) ST.refresh(); });

    renderDays();
  }

  /* ======================================================================
     BOTÃO "RESERVAR MESA" FLUTUANTE + MENU DO TELEMÓVEL
     ====================================================================== */
  function initChrome() {
    // botão flutuante: aparece depois do topo da página, esconde-se onde já há um botão de reserva
    const fab = $('#fab'), top = $('#hero-scroll') || $('.page-hero'), foot = $('#contacto');
    if (fab && top) {
      const hideIn = ['#reservas', '#zoom', '#rform', '#basket'].map(q => $(q)).filter(Boolean);
      const upd = () => {
        const past = top.getBoundingClientRect().bottom < innerHeight * 0.4;
        const busy = hideIn.some(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4; });
        fab.classList.toggle('is-on', past && !busy && foot.getBoundingClientRect().top > innerHeight - 40);
      };
      addEventListener('scroll', upd, { passive: true }); upd();
    }

    const btn = $('#burger-btn'), nav = $('#mnav');
    if (!btn || !nav) return;
    const toggle = open => {
      btn.setAttribute('aria-expanded', open); nav.hidden = !open;
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) $('#mnav-close').focus();
      if (open) gsap.from('#mnav nav a, #mnav .btn-order', { y: 40, opacity: 0, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
    };
    btn.addEventListener('click', () => toggle(nav.hidden));
    $('#mnav-close').addEventListener('click', () => { toggle(false); btn.focus(); });
    $$('a', nav).forEach(a => a.addEventListener('click', () => toggle(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape' && !nav.hidden) { toggle(false); btn.focus(); } });
  }

  /* ======================================================================
     ENTRADAS DAS SECÇÕES (todas as páginas)
     ====================================================================== */
  function initReveals() {
    if (reduced || !ST) return;
    gsap.set('[data-reveal]', { opacity: 0, y: 40 });
    ST.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', overwrite: true }),
    });
    $$('[data-parallax]').forEach(img => {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  initReserve();
  initChrome();
  // as animações de scroll medem a página: nas páginas com hambúrguer animado, só depois de este estar montado
  const startScroll = () => {
    initZoom();
    initVibe();
    initDeco();
    initReveals();
    if (ST) { ST.sort(); ST.refresh(); }
  };
  if ($('#hero') || $('#story')) document.addEventListener('bbq:ready', startScroll, { once: true });
  else startScroll();
  // posições finais depois de as imagens e fontes carregarem (o pin da galeria muda a altura da página)
  addEventListener('load', () => { if (ST) { ST.sort(); ST.refresh(); } });
})();
