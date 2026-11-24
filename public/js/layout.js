// Shared header and footer, so every page looks and feels the same (SRS 3.1).
(function () {
  const path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const links = [
    ['/', 'nav_search'],
    ['/register', 'nav_register'],
    ['/centres', 'nav_centres'],
    ['/help', 'nav_help'],
  ];

  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `
      <div class="wrap">
        <a class="brand" href="/">
          <span class="brand-drop" aria-hidden="true"></span>
          <span>BloodLink Rwanda<small data-i18n="brand_tag"></small></span>
        </a>
        <nav class="nav" aria-label="Main">
          ${links.map(([href, key]) => `<a href="${href}" data-i18n="${key}"${href === path ? ' aria-current="page"' : ''}></a>`).join('')}
          <span id="lang-slot"></span>
        </nav>
      </div>
      <div class="band" aria-hidden="true"></div>`;
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="band flip" aria-hidden="true"></div>
      <div class="wrap footer-grid">
        <div class="footer-about">
          <a class="brand" href="/">
            <span class="brand-drop" aria-hidden="true"></span>
            <span>BloodLink Rwanda</span>
          </a>
          <p class="emergency" data-i18n="footer_emergency"></p>
        </div>
        <nav class="footer-links" aria-label="Footer">
          ${links.map(([href, key]) => `<a href="${href}" data-i18n="${key}"></a>`).join('')}
        </nav>
      </div>
      <div class="wrap footer-bottom">
        <p>&copy; ${new Date().getFullYear()} BloodLink Rwanda · Uwase Huguette, African Leadership University</p>
        <a class="footer-admin" href="/login" data-i18n="footer_admin">Admin login</a>
      </div>`;
  }

  // NFR 11: one button on every page switches English <-> Kinyarwanda.
  const slot = document.getElementById('lang-slot');
  if (slot) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lang-btn';
    button.id = 'lang-toggle';
    const label = () => {
      button.textContent = window.i18n.t('lang_switch');
      button.setAttribute('aria-label', window.i18n.t('lang_switch_label'));
    };
    button.addEventListener('click', () => {
      window.i18n.setLang(window.i18n.getLang() === 'en' ? 'rw' : 'en');
      label();
    });
    slot.replaceWith(button);
    label();
  }

  window.i18n.apply();
})();
