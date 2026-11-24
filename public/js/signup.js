// Admin sign-up (FR 5.0). The very first admin account is created here.
// Once an admin exists the form is closed and the page sends people to /login.
(function () {
  const t = (k) => window.i18n.t(k);
  const form = document.getElementById('signup-form');
  const intro = document.getElementById('signup-intro');
  const message = document.getElementById('signup-message');
  const loginLink = document.getElementById('signup-login-link');

  function show(key, type) {
    message.className = 'alert ' + (type || 'error');
    message.dataset.i18n = key;
    message.textContent = t(key);
  }

  async function start() {
    const { ok, data } = await window.api('/api/admin/setup');
    if (!ok) { show('err_generic'); return; }

    if (data.needsSetup) {
      form.classList.remove('hidden');
      return;
    }

    // An admin already exists: a signed-in admin may still add a colleague.
    const me = await window.api('/api/admin/me');
    if (me.ok) {
      intro.dataset.i18n = 'signup_intro_extra';
      intro.textContent = t('signup_intro_extra');
      form.classList.remove('hidden');
      return;
    }

    intro.classList.add('hidden');
    show('signup_closed', 'warn');
    loginLink.classList.remove('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.classList.add('hidden');

    const username = form.username.value.trim();
    const password = form.password.value;
    const confirm = form.confirm.value;

    if (password !== confirm) { show('signup_err_match'); return; }

    const button = form.querySelector('button');
    button.disabled = true;
    const { ok, status, data } = await window.api('/api/admin/signup', {
      method: 'POST',
      body: { username, password, confirm },
    });
    button.disabled = false;

    if (ok) {
      if (data.signedIn) { location.href = '/admin'; return; }
      form.reset();
      show('signup_added', 'ok');
      return;
    }

    form.password.value = '';
    form.confirm.value = '';
    if (status === 429) { show('login_locked'); return; }
    show(window.I18N.en[data.error] ? data.error : 'err_generic');
  });

  start();
})();
