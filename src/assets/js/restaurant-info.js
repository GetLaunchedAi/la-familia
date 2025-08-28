// Open/Closed badge + highlight today (uses data-* when available, falls back to text)
(() => {
  const root = document.querySelector('.ri');
  if (!root) return;

  const items = [...root.querySelectorAll('.ri__hours li')];
  const pill = root.querySelector('[data-pill]');
  if (!pill || items.length === 0) return;

  const dayMap = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const now = new Date();
  const todayKey = dayMap[now.getDay()];
  const today = items.find(li => li.getAttribute('data-day') === todayKey);
  if (today) today.classList.add('is-today');

  // helper: parse "8am", "8:30pm", "08:00", "21:15"
  function parseTime(str, base) {
    const s = String(str || '').trim().toLowerCase();
    const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$/);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const ampm = m[3];
    if (ampm) {
      if (ampm === 'am' && h === 12) h = 0;
      if (ampm === 'pm' && h !== 12) h += 12;
    }
    const d = new Date(base);
    d.setHours(h, min, 0, 0);
    return d;
  }

  if (!today) { pill.textContent = 'See posted hours'; pill.removeAttribute('data-open'); return; }

  // Prefer machine-readable attributes
  let openStr = today.getAttribute('data-open') || '';
  let closeStr = today.getAttribute('data-close') || '';

  // Fallback: parse visible text "8am–9pm" or "8:00 am - 9:00 pm"
  if (!openStr || !closeStr) {
    const raw = (today.querySelector('.ri__t')?.textContent || '').trim();
    const normalized = raw.replace(/[–—−]/g, '-').replace(/\s*-\s*/g, '-'); // unify dashes
    const parts = normalized.split('-');
    if (parts.length === 2) {
      openStr = openStr || parts[0].trim();
      closeStr = closeStr || parts[1].trim();
    }
  }

  if (!openStr || !closeStr) { pill.textContent = 'See posted hours'; pill.removeAttribute('data-open'); return; }

  const openAt = parseTime(openStr, now);
  let closeAt = parseTime(closeStr, now);
  if (!openAt || !closeAt) { pill.textContent = `See posted hours · ${openStr}–${closeStr}`; pill.removeAttribute('data-open'); return; }

  // Overnight: e.g., 6pm–2am
  if (closeAt <= openAt) closeAt = new Date(closeAt.getTime() + 24*60*60*1000);

  const isOpen = now >= openAt && now < closeAt;
  pill.dataset.open = String(isOpen);
  pill.textContent = `${isOpen ? 'Open now' : 'Closed'} · ${openStr}–${closeStr}`;
})();
