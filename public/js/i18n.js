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

    home_eyebrow: 'Emergency donor search',
    home_title: 'Find a blood donor near you, now.',
    home_lead: 'Pick the blood type and the district. Call a willing donor directly. No account needed.',
    step_1: 'Choose blood type',
    step_2: 'Choose district',
    step_3: 'Call a donor',
    search_blood: 'Blood type needed',
    search_district: 'District',
    search_district_pick: 'Choose a district',
    search_button: 'Search donors',
    home_donor_title: 'Can you give blood?',
    home_donor_text: 'Join the list in under two minutes. A family may call you on the day they need it most.',
    home_rbc_title: 'Works with RBC, not instead of it',
    home_rbc_text: 'BloodLink connects people directly. If no donor matches, we show you the nearest official blood centre (RCBT).',
    home_rbc_link: 'See blood centres',

    res_title: 'Donors',
    res_change: 'Change search',
    res_loading: 'Searching...',
    res_summary: '{n} donor(s) with blood type {type} in {district}',
    res_summary_none: 'Blood type {type} in {district}',
    res_bad_search: 'Please choose a blood type and a district first.',
    res_confirmed: 'Confirmed',
    res_none_title: 'No donor found yet',
    res_none_text: 'Nobody with this blood type is registered in this district right now. Please contact an official blood centre, they can help today.',
    res_privacy: 'Only first names are shown. Please call donors respectfully and only for a real need.',
    time_today: 'today',
    time_yesterday: 'yesterday',
    time_days: '{n} days ago',

    centres_title: 'Official blood centres',
    centres_intro: "Rwanda's blood supply is run by RBC through the National Centre for Blood Transfusion and its regional centres (RCBT). Hospitals request blood from them, and you can call them for help.",
    centres_pick: 'Show the nearest centre for my district',
    centre_nearest: 'Nearest',
    centre_call: 'Call',
    'province_kigali_city': 'Kigali City',
    province_southern: 'Southern Province',
    province_western: 'Western Province',
    province_northern: 'Northern Province',
    province_eastern: 'Eastern Province',
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
