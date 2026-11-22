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
      <div class="wrap">
        <p class="emergency" data-i18n="footer_emergency"></p>
        <p data-i18n="footer_note"></p>
        <p>&copy; ${new Date().getFullYear()} BloodLink Rwanda · Uwase Huguette, African Leadership University</p>
      </div>`;
  }

  window.i18n.apply();
})();
