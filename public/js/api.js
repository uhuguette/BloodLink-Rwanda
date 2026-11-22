// Small fetch helper that always returns { ok, status, data }.
window.api = async function api(url, options = {}) {
  const opts = { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', ...options };
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  try {
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'network' } };
  }
};
