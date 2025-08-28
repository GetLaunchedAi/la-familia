// Tab behavior + hash deep-linking
(function () {
  const root = document.querySelector('#menu');
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('.tab'));
  const panels = Array.from(root.querySelectorAll('.panel'));

  function activate(id, focusTab = true) {
    tabs.forEach(t => {
      const on = t.dataset.panel === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(p => {
      const on = p.id === `panel-${id}`;
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    root.dataset.active = id;
    if (focusTab) tabs.find(t => t.dataset.panel === id)?.focus();
    // update hash (so links like #sides open that panel)
    if (location.hash !== `#${id}`) history.replaceState({}, '', `#${id}`);
  }

  // click
  root.addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    activate(btn.dataset.panel, false);
  });

  // keyboard nav (Left/Right/Home/End/Enter/Space)
  root.addEventListener('keydown', e => {
    const current = document.activeElement.closest('.tab');
    if (!current) return;
    const i = tabs.indexOf(current);
    let next = null;

    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft')  next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Home')       next = tabs[0];
    if (e.key === 'End')        next = tabs[tabs.length - 1];
    if (next) { next.focus(); e.preventDefault(); return; }

    if (e.key === 'Enter' || e.key === ' ') {
      activate(current.dataset.panel);
      e.preventDefault();
    }
  });

  // handle hash (e.g. /#sides)
  function initFromHash() {
    const id = (location.hash || '').replace('#', '');
    const valid = tabs.some(t => t.dataset.panel === id);
    activate(valid ? id : tabs[0].dataset.panel, false);
  }
  window.addEventListener('hashchange', initFromHash);
  initFromHash();
})();
