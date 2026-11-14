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

  /* ---------- black map ---------- */
  const SHOP = [40.82318, -73.89461];
  if (window.L) {
    const map = L.map('map', { scrollWheelZoom: false, zoomControl: true }).setView(SHOP, 16);
    // Standard OSM tiles, turned black-and-white-on-black with a CSS filter (see .leaflet-tile-pane)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const icon = L.divIcon({
      className: 'lt-pin',
      html: '<div class="lt-pin__body"><img src="assets/logo-mark-256.png" alt=""></div><span class="lt-pin__pulse"></span>',
      iconSize: [62, 80], iconAnchor: [31, 76], popupAnchor: [0, -70]
    });
    L.marker(SHOP, { icon, title: 'Los Toros Barber Shop' }).addTo(map)
      .bindPopup('<strong>LOS TOROS</strong><br>982 Westchester Ave<br>Bronx, NY 10459');
    map.on('click', () => map.scrollWheelZoom.enable());
    // keep the shop centered when the framed box changes size (layout, reveal, resize)
    new ResizeObserver(() => { map.invalidateSize(); map.setView(SHOP, map.getZoom(), { animate: false }); })
      .observe(document.getElementById('map'));
  }
})();
