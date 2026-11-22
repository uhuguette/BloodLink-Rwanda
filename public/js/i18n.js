// Translations for every word the user reads. Keys are used in HTML as
// data-i18n="key" (text) or data-i18n-placeholder="key" (placeholder).
window.I18N = {
  en: {
    brand_tag: 'Find a donor. Save a life.',
    nav_search: 'Find a donor',
    nav_register: 'Become a donor',
    nav_centres: 'Blood centres',
    nav_help: 'Help',
    footer_emergency: 'In an emergency call 912 (ambulance) or the RBC hotline 114.',
    footer_note: 'BloodLink Rwanda works alongside RBC / NCBT and does not replace it.',

    reg_title: 'Become a blood donor',
    reg_intro: 'Leave your details so a family in need can call you. It takes less than two minutes.',
    reg_name: 'Full name',
    reg_name_hint: 'Only your first name is shown in search results.',
    reg_blood: 'Your blood type',
    reg_district: 'District where you live',
    reg_district_pick: 'Choose your district',
    reg_phone: 'Phone number',
    reg_phone_hint: '10 digits starting with 07, for example 0788 123 456',
    reg_consent: 'I agree that people looking for blood can see my first name, blood type, district and phone number and call me.',
    reg_submit: 'Register as a donor',
    reg_created: 'Thank you! You are now on the donor list. Murakoze!',
    reg_updated: 'Welcome back! Your details are updated and confirmed for the next 90 days.',
    reg_again: 'Already registered? Register again with the same phone number every 3 months to stay visible.',

    err_name: 'Please enter your name (at least 2 letters).',
    err_blood_type: 'Please choose your blood type.',
    err_district: 'Please choose your district.',
    err_phone: 'Enter a valid Rwandan number: 10 digits starting with 07.',
    err_consent: 'You must tick the consent box to register.',
    err_generic: 'Something went wrong. Please try again.',
  },
};

(function () {
  const STORAGE_KEY = 'bloodlink-lang';

  function getLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && window.I18N[saved]) return saved;
    } catch (e) { /* storage blocked */ }
    return 'en';
  }

  function setLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    apply();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function t(key, vars) {
    const lang = getLang();
    let text = (window.I18N[lang] && window.I18N[lang][key]) || window.I18N.en[key] || key;
    if (vars) Object.keys(vars).forEach((k) => { text = text.replace(`{${k}}`, vars[k]); });
    return text;
  }

  function apply(root) {
    const scope = root || document;
    document.documentElement.lang = getLang() === 'rw' ? 'rw' : 'en';
    scope.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    scope.querySelectorAll('[data-i18n-title]').forEach((el) => { document.title = t(el.dataset.i18nTitle) + ' · BloodLink Rwanda'; });
  }

  window.i18n = { t, apply, getLang, setLang };
})();
