/* Los Toros: Spanish (default) / English.
   Markup carries Spanish; elements tagged with data-i18n / data-i18n-html / data-i18n-attr
   are swapped from this dictionary. Other scripts listen for the "langchange" event. */
(() => {
  const STR = {
    es: {
      'meta.title': 'Los Toros Barber Shop · El Bronx',
      'meta.desc': 'Los Toros Barber Shop: fades, cerquillos, barbas y afeitado con toalla caliente en el 982 de Westchester Ave, en el Bronx.',
      'lang.label': 'Idioma',
      'nav.services': 'Servicios', 'nav.gallery': 'Galería', 'nav.reviews': 'Reseñas',
      'nav.booking': 'Citas', 'nav.visit': 'Visítanos', 'nav.cta': 'Reserva tu silla',
      'nav.menu': 'Menú', 'nav.close': 'Cerrar', 'nav.home': 'Los Toros Barber Shop, Bronx NY: inicio',
      'hero.kicker': 'Barbería · Avenida Westchester',
      'hero.kickerLabel': 'Barbería en la Avenida Westchester',
      'hero.title': 'Todo cliente<br>sale coronado.',
      'hero.lede': 'Fades, cerquillos limpios, barbas perfiladas y afeitado con toalla caliente, todo a mano en el Sur del Bronx.',
      'hero.book': 'Reserva tu silla', 'hero.services': 'Servicios y precios',
      'shop.title': 'La Casa de Los Toros',
      'shop.lede': 'Sillas de cuero, navaja bien afilada y un equipo que te conoce por tu nombre. Siéntate y deja que el barbero haga lo suyo.',
      'shop.alt1': 'Barbero terminando un fade (foto de muestra)',
      'shop.alt2': 'Afeitado con navaja (foto de muestra)',
      'shop.alt3': 'Barbero haciendo un fade al costado de la cabeza de un cliente (foto de muestra)',
      'visit.title': 'Visítanos',
      'visit.lede': 'Siempre atendemos sin cita. Reserva con tiempo y tu silla te estará esperando.',
      'visit.address': 'Dirección', 'visit.call': 'Llama o escribe', 'visit.getting': 'Cómo llegar',
      'visit.trains': 'Trenes 2 y 5 hasta Simpson St', 'visit.parking': 'Estacionamiento en la calle por Westchester Ave',
      'hours.title': 'Horario', 'hours.to': 'a', 'hours.today': 'hoy',
      'hours.note': 'Las citas tienen prioridad; sin cita, se espera turno.',
      'day.1': 'Lunes', 'day.2': 'Martes', 'day.3': 'Miércoles', 'day.4': 'Jueves', 'day.5': 'Viernes', 'day.6': 'Sábado', 'day.0': 'Domingo',
      'map.label': 'Mapa de Los Toros en el 982 de Westchester Ave',
      'map.directions': 'Cómo llegar con Google Maps',
      'soon.text': 'Próximamente en la versión completa: servicios y precios, reseñas, guía de reservas y pie de página.',
      'status.badgeOpen': 'Abierto', 'status.badgeClosed': 'Cerrado',
      'status.open': (t) => `Abierto · hasta las ${t}`,
      'status.opensToday': (t) => `Cerrado · abre hoy a las ${t}`,
      'status.opensTomorrow': (t) => `Cerrado · abre mañana a las ${t}`
    },
    en: {
      'meta.title': 'Los Toros Barber Shop · The Bronx',
      'meta.desc': 'Los Toros Barber Shop: fades, lineups, beard work and hot-towel shaves at 982 Westchester Ave in the Bronx.',
      'lang.label': 'Language',
      'nav.services': 'Services', 'nav.gallery': 'Gallery', 'nav.reviews': 'Reviews',
      'nav.booking': 'Booking Guide', 'nav.visit': 'Visit', 'nav.cta': 'Book a Chair',
      'nav.menu': 'Menu', 'nav.close': 'Close', 'nav.home': 'Los Toros Barber Shop, Bronx NY: home',
      'hero.kicker': 'A barbería · Westchester Avenue',
      'hero.kickerLabel': 'A barbería on Westchester Avenue',
      'hero.title': 'Every client<br>leaves crowned.',
      'hero.lede': 'Skin fades, clean lineups, beard sculpting and hot-towel shaves, done by hand in the South Bronx.',
      'hero.book': 'Book a Chair', 'hero.services': 'See Services & Prices',
      'shop.title': 'The House of Los Toros',
      'shop.lede': 'Leather chairs, sharp steel and a crew that knows your name. Pull up, sit down, and let the barber take it from here.',
      'shop.alt1': 'Barber finishing a skin fade (placeholder photo)',
      'shop.alt2': 'Straight-razor shave (placeholder photo)',
      'shop.alt3': "Barber clipping a fade on the side of a client's head (placeholder photo)",
      'visit.title': 'Visit the Shop',
      'visit.lede': 'Walk-ins are always welcome. Book ahead and your chair is waiting when you arrive.',
      'visit.address': 'Address', 'visit.call': 'Call or text', 'visit.getting': 'Getting here',
      'visit.trains': '2 and 5 trains to Simpson St', 'visit.parking': 'Street parking on Westchester Ave',
      'hours.title': 'Hours', 'hours.to': 'to', 'hours.today': 'today',
      'hours.note': 'Appointments are seen first; walk-ins join the queue.',
      'day.1': 'Monday', 'day.2': 'Tuesday', 'day.3': 'Wednesday', 'day.4': 'Thursday', 'day.5': 'Friday', 'day.6': 'Saturday', 'day.0': 'Sunday',
      'map.label': 'Map showing Los Toros at 982 Westchester Ave',
      'map.directions': 'Get directions in Google Maps',
      'soon.text': 'Still to come in the full build: services and prices, reviews, booking guide, footer.',
      'status.badgeOpen': 'Open now', 'status.badgeClosed': 'Closed',
      'status.open': (t) => `Open now · until ${t}`,
      'status.opensToday': (t) => `Closed · opens ${t} today`,
      'status.opensTomorrow': (t) => `Closed · opens ${t} tomorrow`
    }
  };

  const KEY = 'lostoros-lang';
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: fine */ } };

  let lang = read() === 'en' ? 'en' : 'es';
  const t = (k) => (STR[lang][k] !== undefined ? STR[lang][k] : STR.es[k]);

  const apply = () => {
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    const md = document.querySelector('meta[name="description"]'); if (md) md.content = t('meta.desc');
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  };

  window.LT_I18N = { t: (k) => t(k), get lang() { return lang; } };

  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang; save(lang);
    document.body.classList.add('is-switching');
    setTimeout(() => { apply(); document.body.classList.remove('is-switching'); }, 160);
  }));

  apply();
})();
