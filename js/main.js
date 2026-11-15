(() => {
  const root = document.documentElement;
  const body = document.body;
  const T = (k) => (window.LT_I18N ? window.LT_I18N.t(k) : k);

  /* ---------- entrance: curtain opens, the crest flies up and slams into the header ---------- */
  const curtain = document.querySelector('.curtain');
  const fly = curtain && curtain.querySelector('.curtain__logo');
  const slot = document.querySelector('.nav__logo');
  const finishIntro = () => {
    body.classList.remove('intro-on');
    body.classList.add('is-loaded', 'is-done');
  };

  // the crest rises into view while the page loads
  const enter = fly && fly.animate(
    [{ opacity: 0, transform: 'translateY(22px) scale(.94)' }, { opacity: 1, transform: 'none' }],
    { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)' });

  // spring: starts at 1, rings and dies away (k in seconds)
  const spring = (k, zeta, w) => Math.exp(-zeta * w * k) * Math.cos(w * Math.sqrt(1 - zeta * zeta) * k);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // landing hit: shockwave ring, gold dust with gravity, and the header takes the blow
  const impact = (r) => {
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const layer = document.createElement('div');
    layer.className = 'impact';
    document.body.appendChild(layer);

    const ring = document.createElement('div');
    const d = r.width * 1.05;
    ring.className = 'impact__ring';
    Object.assign(ring.style, { width: d + 'px', height: d + 'px', left: cx - d / 2 + 'px', top: cy - d / 2 + 'px' });
    layer.appendChild(ring);
    ring.animate([{ transform: 'scale(.55)', opacity: .95 }, { transform: 'scale(2.3)', opacity: 0 }],
      { duration: 700, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards' });

    const bits = [];
    for (let i = 0; i < 26; i++) {
      const el = document.createElement('i');
      const size = 2 + Math.random() * 4;
      el.className = 'impact__dust';
      el.style.width = el.style.height = size + 'px';
      if (Math.random() < .35) el.style.background = '#FBF3E2';
      layer.appendChild(el);
      // burst sideways and down, away from the ceiling it just hit
      const ang = Math.PI * (Math.random() * 1.15 - .075);          // 0 = right, PI = left, through down
      const spd = 260 + Math.random() * 420;
      const side = Math.cos(ang) >= 0 ? 1 : -1;
      bits.push({
        el, x: cx + side * r.width * (.25 + Math.random() * .2), y: cy + r.height * (Math.random() * .3),
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd * .8 - 120, life: 650 + Math.random() * 450, age: 0
      });
    }
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(.04, (now - last) / 1000); last = now;
      let alive = 0;
      bits.forEach(p => {
        p.age += dt * 1000;
        if (p.age > p.life) { p.el.style.opacity = 0; return; }
        alive++;
        p.vy += 1300 * dt;                 // gravity
        p.vx *= Math.pow(.18, dt);         // air drag
        p.vy *= Math.pow(.5, dt);
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.el.style.opacity = 1 - Math.pow(p.age / p.life, 2);
        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      });
      if (alive) requestAnimationFrame(tick); else layer.remove();
    };
    requestAnimationFrame(tick);
    setTimeout(() => layer.remove(), 1600);

    // the header and the page take the hit
    header.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(5px)' }, { transform: 'translateY(-2.5px)' },
      { transform: 'translateY(1px)' }, { transform: 'translateY(0)' }], { duration: 460, easing: 'ease-out' });
    const push = (sel, dir) => {
      const el = document.querySelector(sel);
      if (el) el.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dir * 12}px)` }, { transform: `translateX(${-dir * 4}px)` },
        { transform: `translateX(${dir * 1.5}px)` }, { transform: 'translateX(0)' }], { duration: 620, easing: 'cubic-bezier(.2,.8,.3,1)' });
    };
    push('.nav__group--left', -1); push('.nav__group--right', 1); push('.lang', -1);
    const hc = document.querySelector('.hero__content');
    if (hc) hc.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)' }, { transform: 'translateY(-2px)' }, { transform: 'translateY(0)' }],
      { duration: 520, easing: 'ease-out' });
    if (navigator.vibrate) { try { navigator.vibrate(18); } catch (e) { /* not allowed before a tap: fine */ } }
  };

  let lifted = false;
  const lift = async () => {
    if (lifted) return;
    lifted = true;
    if (!curtain || !fly || !slot) { finishIntro(); return; }
    // never wait on a stalled timeline (background tab, throttled frames)
    await Promise.race([enter.finished.catch(() => {}), new Promise(r => setTimeout(r, 1100))]);
    if (enter.playState !== 'finished') enter.cancel();
    body.classList.add('is-loaded');
    setTimeout(() => { if (!body.classList.contains('is-done')) { fly.style.transform = ''; finishIntro(); } }, 6000);

    // curtains: a small tug toward the centre, then they swing open
    const open = (el, dir) => el.animate([
      { transform: 'translateX(0)', easing: 'cubic-bezier(.3,0,.4,1)' },
      { transform: `translateX(${-dir * 1.6}%)`, offset: .14, easing: 'cubic-bezier(.7,0,.25,1)' },
      { transform: `translateX(${dir * 101}%)` }
    ], { duration: 1300, fill: 'forwards' });
    open(curtain.querySelector('.curtain__panel--l'), -1);
    open(curtain.querySelector('.curtain__panel--r'), 1);

    const r0 = fly.getBoundingClientRect();
    const c0 = { x: r0.left + r0.width / 2, y: r0.top + r0.height / 2 };
    const WIND = 300, FLY = 480, SETTLE = 950;
    const WIND_S = 1.09, WIND_Y = 18, WIND_ROT = -3.5, ARC = Math.min(60, r0.width * .14);
    const t0 = performance.now() + 140;          // let the curtain tug lead
    let hit = false;

    const frame = (now) => {
      const t = now - t0;
      const r1 = slot.getBoundingClientRect();   // read live: the header can still be settling
      const s1 = r1.width / r0.width;
      const dx = r1.left + r1.width / 2 - c0.x, dy = r1.top + r1.height / 2 - c0.y;
      let x = 0, y = 0, s = 1, sx = 1, sy = 1, rot = 0;

      if (t <= 0) { /* hold */ }
      else if (t < WIND) {                       // wind-up: sinks and swells, like it's being lifted
        const p = easeInOut(t / WIND);
        s = lerp(1, WIND_S, p); y = WIND_Y * p; rot = WIND_ROT * p;
      } else if (t < WIND + FLY) {               // flight: accelerates all the way in
        const p = (t - WIND) / FLY, e = Math.pow(p, 2.3);
        x = dx * e - ARC * Math.sin(Math.PI * p);
        y = lerp(WIND_Y, dy, e);
        s = Math.exp(lerp(Math.log(WIND_S), Math.log(s1 * .84), e));
        rot = lerp(WIND_ROT, 5, e);
        sy = 1 + .06 * Math.sin(Math.PI * p);    // stretches along its path
        sx = 1 - .04 * Math.sin(Math.PI * p);
      } else {                                   // slam, squash, spring back
        if (!hit) { hit = true; impact(r1); }
        const k = (t - WIND - FLY) / 1000;
        const sp = spring(k, .3, 28);
        s = s1 * (1 - .16 * sp);
        sx = 1 + .1 * sp; sy = 1 - .1 * sp;
        x = dx; y = dy + 7 * Math.exp(-7 * k) * Math.sin(26 * k);
        rot = 5 * spring(k, .24, 19);
        if (t >= WIND + FLY + SETTLE) {
          fly.style.transform = '';
          finishIntro();
          return;
        }
      }
      fly.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s * sx}, ${s * sy})`;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  if (document.readyState === 'complete') setTimeout(lift, 400);
  else window.addEventListener('load', () => setTimeout(lift, 400));
  setTimeout(lift, 3500); // never block the page on a slow image

  /* ---------- header shrink on scroll ---------- */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- overlay menu ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const overlay = document.querySelector('[data-overlay]');
  const setMenu = (open) => {
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav__toggle-label').textContent = T(open ? 'nav.close' : 'nav.menu');
    body.classList.toggle('is-locked', open);
  };
  toggle.addEventListener('click', () => setMenu(!overlay.classList.contains('is-open')));
  overlay.querySelectorAll('[data-close]').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('langchange', () => {
    toggle.querySelector('.nav__toggle-label').textContent = T(overlay.classList.contains('is-open') ? 'nav.close' : 'nav.menu');
  });

  /* ---------- active nav link ---------- */
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 90 + 'ms';
    io.observe(el);
  });

  /* ---------- hours: highlight today + live open/closed (New York time) ---------- */
  const HOURS = { 0: [10, 17], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 21], 6: [8, 21] };
  const fmt = h => (h % 12 || 12) + (h < 12 ? ' AM' : ' PM');
  const nyNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = nyNow.getDay();
  const hr = nyNow.getHours() + nyNow.getMinutes() / 60;
  const [open, close] = HOURS[day];
  const isOpen = hr >= open && hr < close;

  const todayRow = document.querySelector(`[data-hours] li[data-day="${day}"]`);
  if (todayRow) todayRow.classList.add('is-today');

  const badge = document.querySelector('[data-open-badge]');
  const status = document.querySelector('[data-status]');
  const renderHours = () => {
    let text;
    if (isOpen) text = T('status.open')(fmt(close));
    else if (hr < open) text = T('status.opensToday')(fmt(open));
    else text = T('status.opensTomorrow')(fmt(HOURS[(day + 1) % 7][0]));
    badge.textContent = T(isOpen ? 'status.badgeOpen' : 'status.badgeClosed');
    badge.classList.toggle('is-open', isOpen);
    badge.classList.toggle('is-closed', !isOpen);
    status.textContent = text;
    if (todayRow) todayRow.querySelector('.d').dataset.today = T('hours.today');
  };
  renderHours();
  document.addEventListener('langchange', renderHours);

  /* ---------- map: custom vintage style on OpenFreeMap vector tiles ---------- */
  const SHOP = [-73.89461, 40.82318];           // [lng, lat]
  const mapEl = document.getElementById('map');
  if (window.maplibregl && mapEl) {
    const C = {
      land: '#1E1611', park: '#262A18', water: '#17252A',
      bldgEdge: '#120C08',
      road: '#E2D1AA', roadMinor: '#CDB993', casing: '#120C08',
      rail: '#C8B48C', ink: '#2B1810', gold: '#E3C680'
    };
    const w = (stops) => ['interpolate', ['exponential', 1.6], ['zoom'], ...stops];
    const MAJOR = ['literal', ['tertiary', 'secondary', 'primary', 'trunk', 'motorway']];
    const style = {
      version: 8,
      glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
      sources: { omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': C.land } },
        { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': C.park } },
        { id: 'green', type: 'fill', source: 'omt', 'source-layer': 'landcover',
          filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood']]], paint: { 'fill-color': C.park } },
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': C.water } },
        { id: 'bldg', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 13,
          paint: { 'fill-pattern': 'grain-brown', 'fill-outline-color': C.bldgEdge } },
        { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation',
          filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track']]],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': C.roadMinor, 'line-width': w([13, 0.6, 16, 5, 19, 22]) } },
        { id: 'road-major-casing', type: 'line', source: 'omt', 'source-layer': 'transportation',
          filter: ['in', ['get', 'class'], MAJOR],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': C.casing, 'line-width': w([12, 2, 16, 11, 19, 34]) } },
        { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation',
          filter: ['in', ['get', 'class'], MAJOR],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': C.road, 'line-width': w([12, 1.2, 16, 8, 19, 28]) } },
        { id: 'path', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 15,
          filter: ['==', ['get', 'class'], 'path'],
          paint: { 'line-color': '#8B7A60', 'line-width': 1, 'line-dasharray': [2, 2] } },
        { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation',
          filter: ['in', ['get', 'class'], ['literal', ['rail', 'transit']]],
          paint: { 'line-color': C.rail, 'line-width': w([13, 1, 16, 2.5, 19, 5]), 'line-dasharray': [3, 2] } },
        { id: 'road-names', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 14,
          layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Bold'],
                    'text-size': ['interpolate', ['linear'], ['zoom'], 14, 10, 17, 13, 19, 15], 'text-max-angle': 30 },
          paint: { 'text-color': C.ink, 'text-halo-color': C.road, 'text-halo-width': 1.4 } },
        { id: 'places', type: 'symbol', source: 'omt', 'source-layer': 'place',
          filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'quarter']]],
          layout: { 'text-field': ['upcase', ['get', 'name']], 'text-font': ['Noto Sans Italic'],
                    'text-size': 12, 'text-letter-spacing': 0.18 },
          paint: { 'text-color': C.gold, 'text-halo-color': C.land, 'text-halo-width': 1.6 } }
      ]
    };
    try {
      const map = new maplibregl.Map({
        container: mapEl, style, center: SHOP, zoom: 16.2, minZoom: 12, maxZoom: 19,
        attributionControl: false, cooperativeGestures: true, dragRotate: false, pitchWithRotate: false
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      // dark, grainy brown fill for buildings, generated once and used as a fill-pattern
      map.on('styleimagemissing', (e) => {
        if (e.id !== 'grain-brown' || map.hasImage('grain-brown')) return;
        const S = 96, data = new Uint8Array(S * S * 4);
        for (let i = 0; i < S * S; i++) {
          const n = (Math.random() - 0.5) * 30 + (Math.random() < 0.04 ? -22 : 0);
          data[i * 4] = Math.max(0, Math.min(255, 59 + n));
          data[i * 4 + 1] = Math.max(0, Math.min(255, 40 + n * 0.8));
          data[i * 4 + 2] = Math.max(0, Math.min(255, 25 + n * 0.6));
          data[i * 4 + 3] = 255;
        }
        map.addImage('grain-brown', { width: S, height: S, data });
      });
      const pin = document.createElement('img');
      pin.src = 'assets/map-marker.png?v=logo3'; pin.alt = 'Los Toros Barber Shop'; pin.className = 'lt-marker';
      new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat(SHOP)
        .setPopup(new maplibregl.Popup({ offset: 116, closeButton: false })
          .setHTML('<strong>Los Toros</strong><br>982 Westchester Ave<br>Bronx, NY 10459'))
        .addTo(map);
      map.on('resize', () => map.setCenter(SHOP));
    } catch (err) {
      mapEl.innerHTML = '<a class="map__fallback" href="https://www.google.com/maps/dir/?api=1&destination=982+Westchester+Ave+Bronx+NY+10459" target="_blank" rel="noopener">Open the map in Google Maps</a>';
    }
  }
})();
