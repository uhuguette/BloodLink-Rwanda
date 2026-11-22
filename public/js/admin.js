(function () {
  const t = (k, v) => window.i18n.t(k, v);
  const donorBody = document.querySelector('#donor-table tbody');
  const logBody = document.querySelector('#log-table tbody');
  const onlyFlagged = document.getElementById('only-flagged');
  const message = document.getElementById('admin-message');
  let donors = [];
  let log = [];

  // Any 401 means the 15-minute session ran out.
  async function call(url, options) {
    const r = await window.api(url, options);
    if (r.status === 401) location.href = '/login?expired=1';
    return r;
  }

  function show(key, type) {
    message.className = 'alert ' + (type || 'ok');
    message.textContent = t(key);
    setTimeout(() => message.classList.add('hidden'), 4000);
  }

  const fmt = (sql) => new Date(sql.replace(' ', 'T') + 'Z').toLocaleString();

  function cell(text) {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
  }

  function renderDonors() {
    const flagged = donors.filter((d) => d.status === 'hidden');
    document.getElementById('stat-total').textContent = donors.length;
    document.getElementById('stat-active').textContent = donors.length - flagged.length;
    document.getElementById('stat-flagged').textContent = flagged.length;

    const rows = onlyFlagged.checked ? flagged : donors;
    donorBody.innerHTML = '';
    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = cell(t('admin_empty'));
      td.colSpan = 7;
      td.className = 'muted';
      tr.appendChild(td);
      donorBody.appendChild(tr);
    }
    rows.forEach((d) => {
      const tr = document.createElement('tr');
      if (d.status === 'hidden') tr.className = 'is-flagged';
      tr.append(cell(d.fullName), cell(d.bloodType), cell(d.district), cell(d.phone), cell(fmt(d.lastConfirmed)));

      const status = document.createElement('td');
      const pill = document.createElement('span');
      pill.className = 'pill ' + (d.status === 'hidden' ? 'pill-flag' : 'pill-ok');
      pill.textContent = d.status === 'hidden' ? t('admin_hidden') : t('admin_active');
      status.appendChild(pill);
      const reasons = [];
      if (d.stale) reasons.push(t('admin_flag_stale'));
      if (d.reports > 0) reasons.push(t('admin_flag_reports', { n: d.reports }));
      if (reasons.length) {
        const small = document.createElement('small');
        small.className = 'flag-reason';
        small.textContent = reasons.join(' · ');
        status.appendChild(small);
      }
      tr.appendChild(status);

      const actions = document.createElement('td');
      actions.className = 'row-actions';
      const remove = document.createElement('button');
      remove.className = 'btn small';
      remove.textContent = t('admin_remove');
      remove.addEventListener('click', () => removeDonor(d));
      actions.appendChild(remove);
      if (d.status === 'hidden') {
        const keep = document.createElement('button');
        keep.className = 'btn ghost small';
        keep.textContent = t('admin_keep');
        keep.addEventListener('click', () => keepDonor(d));
        actions.appendChild(keep);
      }
      tr.appendChild(actions);
      donorBody.appendChild(tr);
    });
  }

  function renderLog() {
    logBody.innerHTML = '';
    if (!log.length) {
      const tr = document.createElement('tr');
      const td = cell(t('admin_log_empty'));
      td.colSpan = 4;
      td.className = 'muted';
      tr.appendChild(td);
      logBody.appendChild(tr);
    }
    log.forEach((e) => {
      const tr = document.createElement('tr');
      tr.append(cell(fmt(e.removedAt)), cell(e.adminUsername), cell('#' + e.donorId), cell(e.donor + (e.reason ? ` - ${e.reason}` : '')));
      logBody.appendChild(tr);
    });
  }

  async function load() {
    const [d, l] = await Promise.all([call('/api/admin/donors'), call('/api/admin/log')]);
    donors = d.data.donors || [];
    log = l.data.log || [];
    renderDonors();
    renderLog();
  }

  async function removeDonor(d) {
    if (!confirm(t('admin_confirm_remove', { name: d.fullName }))) return;
    const reason = d.flags.length ? d.flags.join(', ') : 'manual review';
    const { ok } = await call(`/api/admin/donors/${d.id}`, { method: 'DELETE', body: { reason } });
    show(ok ? 'admin_removed' : 'err_generic', ok ? 'ok' : 'error');
    load();
  }

  async function keepDonor(d) {
    const { ok } = await call(`/api/admin/donors/${d.id}/keep`, { method: 'POST' });
    show(ok ? (d.stale ? 'admin_kept_stale' : 'admin_kept') : 'err_generic', ok ? 'ok' : 'error');
    load();
  }

  document.getElementById('logout').addEventListener('click', async () => {
    await window.api('/api/admin/logout', { method: 'POST' });
    location.href = '/login';
  });
  onlyFlagged.addEventListener('change', renderDonors);
  document.addEventListener('langchange', () => { renderDonors(); renderLog(); });

  call('/api/admin/me').then(({ ok, data }) => {
    if (ok) document.getElementById('admin-name').textContent = data.username;
  });
  load();
})();
