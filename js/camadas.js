/* BBQ House — página "Camada a camada".
   Escolhe-se o hambúrguer; o scroll separa os ingredientes, faz uma pausa com as legendas e volta a montar.
   Só transform/opacity (60 fps). */
(() => {
  'use strict';
  const gsap = window.gsap, ST = window.ScrollTrigger;
  const { SLIDES, WA, reduced, isMobile, geoFor, buildBurger, sizeTags } = window.BBQ;
  const $ = (s, r = document) => r.querySelector(s);
  const sec = $('#story'), box = $('#story-stage'), list = $('#story-list'), tabs = $('#story-tabs');
  if (!sec || !box) return;

  const slug = s => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let cur = null; // { el, trigger, timeline, fit }

  function mount(idx, animate) {
    const s = SLIDES[idx];
    if (cur) {
      if (cur.trigger) cur.trigger.kill();
      if (cur.timeline) cur.timeline.kill();
      removeEventListener('resize', cur.fit);
      const old = cur.el;
      gsap.to(old, { opacity: 0, duration: 0.3, onComplete: () => old.remove() });
    }
    $$tabs().forEach((b, i) => b.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
    history.replaceState(null, '', `#${slug(s)}`);

    const words = s.name.split(' ');
    $('#story-title').innerHTML = words.length > 1 ? `${words[0]}<br>${words.slice(1).join(' ')}` : s.name;
    $('#story-desc').textContent = s.desc.replace(/ Toque no hambúrguer.*$/, '');
    $('#story-price').innerHTML = s.price ? `${s.price} <small>MZN</small>` : '<small>Preço no menu</small>';
    $('#story-order').href = `${WA}?text=${encodeURIComponent(`Olá BBQ House! Quero encomendar: ${s.name}`)}`;

    gsap.set('#story-cta', { opacity: reduced ? 1 : 0 });
    const geo = geoFor(s);
    const el = buildBurger(geo, { labels: true, labelSize: 12 });
    box.appendChild(el);
    list.innerHTML = geo.items.map((it, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${it.label}</li>`).join('');
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
    cur = { el, fit };
    if (animate) gsap.from(el, { opacity: 0, y: '+=60', duration: 0.7, ease: 'power3.out' });

    if (reduced || !ST) { // imagem estática: hambúrguer aberto com legendas
      geo.items.forEach(it => { gsap.set(it.img, it.o); if (it.tag) gsap.set(it.tag, { opacity: 1, x: 0 }); });
      lis.forEach(li => li.classList.add('is-on'));
      gsap.set('#story-cta', { opacity: 1 });
      return;
    }
    const n = geo.items.length;
    const t = gsap.timeline({ paused: true });
    // 1) separar: o pão de cima sobe primeiro, os outros seguem com atrasos curtos e rotação discreta
    geo.items.forEach((it, i) => {
      t.to(it.img, { ...it.o, duration: 1, ease: 'power2.out' }, i * 0.12);
      if (it.sh) t.to(it.sh, { opacity: 0, duration: 0.3 }, i * 0.12);
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
      if (it.sh) t.to(it.sh, { opacity: 1, duration: 0.3 }, back + order * 0.12 + 0.8);
      if (it.tag) t.to(it.tag, { opacity: 0, duration: 0.4 }, back + order * 0.12);
    });
    t.to('#story-steam', { opacity: 0, duration: 0.6 }, back + 0.3);
    t.to(el, { x: '-=14', duration: 1, ease: 'sine.inOut' }, back);
    t.fromTo('#story-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, '>-0.3');
    cur.timeline = t;
    cur.trigger = ST.create({
      trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.6, animation: t,
      onUpdate: self => { // a lista acompanha o que está separado, nos dois sentidos
        const p = self.progress * t.duration();
        lis.forEach((li, i) => li.classList.toggle('is-on', p > 0.3 + i * 0.12 && p < back + (n - 1 - i) * 0.12 + 0.5));
      },
    });
  }

  const $$tabs = () => [...tabs.querySelectorAll('button')];
  tabs.innerHTML = SLIDES.map((s, i) =>
    `<button type="button" role="tab" aria-selected="false" data-i="${i}"><b>${s.name}</b><small>${s.price ? s.price + ' MZN' : 'Ver no menu'}</small></button>`).join('');
  $$tabs().forEach((b, i) => b.addEventListener('click', () => {
    if (b.getAttribute('aria-selected') === 'true') return;
    const top = sec.getBoundingClientRect().top + scrollY;
    if (scrollY > top + 10) scrollTo({ top, behavior: 'auto' }); // recomeça com o hambúrguer montado
    mount(i, true);
  }));

  window.BBQ.preloadLayers().then(() => {
    const h = location.hash.slice(1);
    const start = Math.max(0, SLIDES.findIndex(s => slug(s) === h));
    mount(start, false);
    document.dispatchEvent(new Event('bbq:ready'));
  });
})();
