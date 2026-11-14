(() => {
  const root = document.documentElement;
  const body = document.body;

  /* ---------- entrance curtain ---------- */
  const lift = () => {
    body.classList.add('is-loaded');
    setTimeout(() => body.classList.add('is-done'), 2200);
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
    toggle.querySelector('.nav__toggle-label').textContent = open ? 'Close' : 'Menu';
    body.classList.toggle('is-locked', open);
  };
  toggle.addEventListener('click', () => setMenu(!overlay.classList.contains('is-open')));
  overlay.querySelectorAll('[data-close]').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

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
  let text;
  if (isOpen) text = `Open now · until ${fmt(close)}`;
  else if (hr < open) text = `Closed · opens ${fmt(open)} today`;
  else text = `Closed · opens ${fmt(HOURS[(day + 1) % 7][0])} tomorrow`;
  badge.textContent = isOpen ? 'Open now' : 'Closed';
  badge.classList.add(isOpen ? 'is-open' : 'is-closed');
  status.textContent = text;

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
