// Renders RCBT cards. Used on the results page (no match) and the centres page.
window.renderCentres = function renderCentres(list, centres) {
  const t = window.i18n.t;
  list.innerHTML = '';
  centres.forEach((c) => {
    const li = document.createElement('li');
    li.className = 'centre' + (c.nearest ? ' nearest' : '');
    li.innerHTML = `
      ${c.nearest ? `<span class="tag">${t('centre_nearest')}</span>` : ''}
      <h3></h3>
      <p class="muted"></p>
      <a class="btn small" href="tel:${encodeURIComponent(c.phone)}">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>
        <span></span>
      </a>`;
    li.querySelector('h3').textContent = c.name;
    li.querySelector('p').textContent = `${c.city} · ${t('province_' + c.province.replace(/\s/g, '_').toLowerCase())}`;
    li.querySelector('a span').textContent = `${t('centre_call')} ${c.phone}`;
    list.appendChild(li);
  });
};
