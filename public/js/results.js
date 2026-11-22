(function () {
  const params = new URLSearchParams(location.search);
  const bloodType = params.get('bloodType') || '';
  const district = params.get('district') || '';
  const t = (k, v) => window.i18n.t(k, v);

  const list = document.getElementById('donor-list');
  const summary = document.getElementById('results-summary');
  const loading = document.getElementById('results-loading');
  const message = document.getElementById('results-message');
  const noResults = document.getElementById('no-results');
  document.getElementById('change-search').href = '/?' + params.toString();

  let lastData = null;

  // "2025-11-20 08:15:00" (UTC from SQLite) -> "3 days ago"
  function daysAgo(sqlDate) {
    const then = new Date(sqlDate.replace(' ', 'T') + 'Z');
    const days = Math.max(0, Math.floor((Date.now() - then.getTime()) / 86400000));
    if (days === 0) return t('time_today');
    if (days === 1) return t('time_yesterday');
    return t('time_days', { n: days });
  }

  function donorCard(d) {
    const li = document.createElement('li');
    li.className = 'donor';
    li.innerHTML = `
      <div class="donor-drop" aria-hidden="true"><b></b></div>
      <div class="donor-info">
        <h3 class="donor-name"></h3>
        <p class="donor-meta"><span class="donor-district"></span> · <span class="donor-confirmed"></span></p>
      </div>
      <div class="donor-actions">
        <a class="btn small call"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg><span></span></a>
      </div>`;
    li.querySelector('.donor-drop b').textContent = d.bloodType;
    li.querySelector('.donor-name').textContent = d.firstName;
    li.querySelector('.donor-district').textContent = d.district;
    li.querySelector('.donor-confirmed').textContent = `${t('res_confirmed')} ${daysAgo(d.lastConfirmed)}`;
    const call = li.querySelector('.call');
    call.href = 'tel:' + d.phone;
    call.querySelector('span').textContent = d.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    li.dataset.id = d.id;
    return li;
  }

  function render() {
    if (!lastData) return;
    const { donors, centres } = lastData;
    summary.textContent = donors.length
      ? t('res_summary', { n: donors.length, type: bloodType, district })
      : t('res_summary_none', { type: bloodType, district });

    list.innerHTML = '';
    donors.forEach((d) => list.appendChild(donorCard(d)));
    noResults.classList.toggle('hidden', donors.length > 0);
    if (!donors.length) window.renderCentres(document.getElementById('centre-list'), centres);
    document.dispatchEvent(new CustomEvent('results:rendered'));
  }

  async function load() {
    const query = new URLSearchParams({ bloodType, district }).toString();
    const { ok, data } = await window.api('/api/search?' + query);
    loading.classList.add('hidden');
    if (!ok) {
      message.className = 'alert error';
      message.textContent = t(data.errors ? 'res_bad_search' : 'err_generic');
      return;
    }
    lastData = data;
    render();
  }

  document.addEventListener('langchange', render);
  load();
})();
