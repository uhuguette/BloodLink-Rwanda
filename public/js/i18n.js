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

    res_report: 'Number not working?',
    res_report_hint: 'Tell us if this number is wrong or switched off',
    res_report_confirm: 'Report that the number for {name} does not work? After two reports the donor is hidden until an admin checks.',
    res_reported: 'Reported',
    res_report_thanks: 'Thank you. We will check this donor.',

    footer_admin: 'Admin',
    login_title: 'Admin login',
    login_intro: 'For BloodLink administrators only.',
    login_username: 'Username',
    login_password: 'Password',
    login_submit: 'Log in',
    login_failed: 'Access denied. Wrong username or password.',
    login_denied: 'Access denied. Please log in as an admin first.',
    login_expired: 'You were logged out after 15 minutes without activity. Please log in again.',
    login_locked: 'Too many wrong tries. Please wait 10 minutes.',

    admin_title: 'Donor review',
    admin_signed_in: 'Signed in as',
    admin_logout: 'Log out',
    admin_stat_total: 'Donors',
    admin_stat_active: 'Visible in search',
    admin_stat_flagged: 'Flagged for review',
    admin_only_flagged: 'Show flagged donors only',
    admin_col_name: 'Name',
    admin_col_type: 'Type',
    admin_col_district: 'District',
    admin_col_phone: 'Phone',
    admin_col_confirmed: 'Last confirmed',
    admin_col_status: 'Status',
    admin_col_actions: 'Actions',
    admin_active: 'Active',
    admin_hidden: 'Hidden',
    admin_flag_stale: 'Not reconfirmed in 90 days',
    admin_flag_reports: '{n} report(s)',
    admin_remove: 'Remove',
    admin_keep: 'Keep',
    admin_confirm_remove: 'Remove {name} from BloodLink? This cannot be undone and will be written in the removal log.',
    admin_removed: 'Donor removed and logged.',
    admin_kept: 'Donor kept and visible again.',
    admin_kept_stale: 'Reports cleared. This donor stays hidden until they reconfirm (register again).',
    admin_empty: 'Nothing to review. All donors are fine.',
    admin_log_title: 'Removal log',
    admin_log_when: 'Date and time',
    admin_log_admin: 'Admin',
    admin_log_donor: 'Donor ID',
    admin_log_details: 'Details',
    admin_log_empty: 'No donors removed yet.',

    lang_switch: 'Kinyarwanda',
    lang_switch_label: 'Hindura ururimi ujye mu Kinyarwanda',
  },
};

// Kinyarwanda. To be checked by two native speakers (Sprint 4).
window.I18N.rw = {
  brand_tag: 'Shaka utanga amaraso. Rokora ubuzima.',
  nav_search: 'Shaka utanga amaraso',
  nav_register: 'Tanga amaraso',
  nav_centres: "Ibigo by'amaraso",
  nav_help: 'Ubufasha',
  footer_emergency: "Mu gihe cy'ubutabazi hamagara 912 (imbangukiragutabara) cyangwa umurongo wa RBC 114.",
  footer_note: 'BloodLink Rwanda ikorana na RBC / NCBT, ntiyayisimbura.',

  reg_title: "Iyandikishe nk'utanga amaraso",
  reg_intro: 'Siga amakuru yawe kugira ngo umuryango ukeneye amaraso ubashe kuguhamagara. Bifata iminota itarenze ibiri.',
  reg_name: 'Amazina yombi',
  reg_name_hint: "Izina rya mbere ni ryo ryonyine rigaragara mu bisubizo by'ishakisha.",
  reg_blood: "Ubwoko bw'amaraso yawe",
  reg_district: 'Akarere utuyemo',
  reg_district_pick: 'Hitamo akarere kawe',
  reg_phone: 'Nimero ya telefoni',
  reg_phone_hint: 'Imibare 10 itangirwa na 07, urugero 0788 123 456',
  reg_consent: "Nemeye ko abashaka amaraso babona izina ryanjye rya mbere, ubwoko bw'amaraso yanjye, akarere na nimero ya telefoni, bakampamagara.",
  reg_submit: 'Iyandikishe',
  reg_created: "Murakoze! Ubu muri ku rutonde rw'abatanga amaraso.",
  reg_updated: 'Murakaza neza! Amakuru yawe yavuguruwe kandi yemejwe mu minsi 90 iri imbere.',
  reg_again: 'Wariyandikishije? Ongera wiyandikishe ukoresheje nimero imwe buri mezi 3 kugira ngo ukomeze kugaragara.',

  err_name: 'Andika izina ryawe (nibura inyuguti 2).',
  err_blood_type: "Hitamo ubwoko bw'amaraso.",
  err_district: 'Hitamo akarere.',
  err_phone: "Andika nimero y'u Rwanda yemewe: imibare 10 itangirwa na 07.",
  err_consent: 'Ugomba kwemeza (kanda ku kazu) kugira ngo wiyandikishe.',
  err_generic: 'Habaye ikibazo. Ongera ugerageze.',

  home_eyebrow: 'Gushaka amaraso byihutirwa',
  home_title: 'Shaka utanga amaraso hafi yawe, ubu nonaha.',
  home_lead: "Hitamo ubwoko bw'amaraso n'akarere. Hamagara utanga amaraso ku bushake. Nta konti ikenewe.",
  step_1: "Hitamo ubwoko bw'amaraso",
  step_2: 'Hitamo akarere',
  step_3: 'Hamagara utanga amaraso',
  search_blood: "Ubwoko bw'amaraso bukenewe",
  search_district: 'Akarere',
  search_district_pick: 'Hitamo akarere',
  search_button: 'Shakisha',
  home_donor_title: 'Ushobora gutanga amaraso?',
  home_donor_text: 'Jya ku rutonde mu minota itarenze ibiri. Umuryango ushobora kuguhamagara ku munsi ukeneye ubufasha cyane.',
  home_rbc_title: 'Ikorana na RBC, ntiyayisimbura',
  home_rbc_text: "BloodLink ihuza abantu ku buryo butaziguye. Niba nta utanga amaraso uboneka, tukwereka ikigo cy'amaraso (RCBT) kiri hafi yawe.",
  home_rbc_link: "Reba ibigo by'amaraso",

  res_title: 'Abatanga amaraso',
  res_change: 'Hindura ishakisha',
  res_loading: 'Turashakisha...',
  res_summary: 'Abatanga amaraso {n} bafite ubwoko {type} mu karere ka {district}',
  res_summary_none: 'Ubwoko {type} mu karere ka {district}',
  res_bad_search: "Banza uhitemo ubwoko bw'amaraso n'akarere.",
  res_confirmed: 'Yemejwe',
  res_none_title: 'Nta utanga amaraso wabonetse',
  res_none_text: "Nta muntu ufite ubu bwoko bw'amaraso wiyandikishije muri aka karere ubu. Vugana n'ikigo cy'amaraso cyemewe, barashobora kugufasha uyu munsi.",
  res_privacy: "Amazina ya mbere ni yo yonyine agaragara. Hamagara abatanga amaraso mu kinyabupfura kandi ari uko ubikeneye koko.",
  time_today: 'uyu munsi',
  time_yesterday: 'ejo hashize',
  time_days: 'hashize iminsi {n}',

  centres_title: "Ibigo by'amaraso byemewe",
  centres_intro: "Amaraso mu Rwanda atangwa na RBC binyuze mu Kigo cy'Igihugu gishinzwe gutanga amaraso (NCBT) n'amashami yacyo mu ntara (RCBT). Ibitaro bisaba amaraso muri ibi bigo, nawe ushobora kubihamagara bakagufasha.",
  centres_pick: "Erekana ikigo kiri hafi y'akarere kanjye",
  centre_nearest: 'Hafi yawe',
  centre_call: 'Hamagara',
  province_kigali_city: 'Umujyi wa Kigali',
  province_southern: "Intara y'Amajyepfo",
  province_western: "Intara y'Iburengerazuba",
  province_northern: "Intara y'Amajyaruguru",
  province_eastern: "Intara y'Iburasirazuba",

  res_report: 'Nimero ntikora?',
  res_report_hint: 'Tubwire niba iyi nimero itari yo cyangwa itariho',
  res_report_confirm: "Wemeza ko nimero ya {name} idakora? Nyuma y'amatangazo abiri, uyu muntu ahishwa kugeza umuyobozi abigenzuye.",
  res_reported: 'Byatangajwe',
  res_report_thanks: 'Murakoze. Tuzagenzura uyu muntu.',

  footer_admin: 'Umuyobozi',
  login_title: "Kwinjira k'umuyobozi",
  login_intro: "Ni iy'abayobozi ba BloodLink gusa.",
  login_username: 'Izina ukoresha',
  login_password: "Ijambo ry'ibanga",
  login_submit: 'Injira',
  login_failed: "Ntibyemewe. Izina cyangwa ijambo ry'ibanga si byo.",
  login_denied: "Ntibyemewe. Banza winjire nk'umuyobozi.",
  login_expired: "Wasohowe nyuma y'iminota 15 udakora. Ongera winjire.",
  login_locked: 'Wagerageje kenshi bitari byo. Tegereza iminota 10.',

  admin_title: "Igenzura ry'abatanga amaraso",
  admin_signed_in: 'Winjiye nka',
  admin_logout: 'Sohoka',
  admin_stat_total: 'Abatanga amaraso',
  admin_stat_active: 'Bagaragara mu ishakisha',
  admin_stat_flagged: 'Bakeneye kugenzurwa',
  admin_only_flagged: 'Erekana abakeneye kugenzurwa gusa',
  admin_col_name: 'Amazina',
  admin_col_type: 'Ubwoko',
  admin_col_district: 'Akarere',
  admin_col_phone: 'Telefoni',
  admin_col_confirmed: 'Byemejwe bwa nyuma',
  admin_col_status: 'Uko ahagaze',
  admin_col_actions: 'Ibikorwa',
  admin_active: 'Aragaragara',
  admin_hidden: 'Yahishwe',
  admin_flag_stale: 'Ntiyongeye kwemeza mu minsi 90',
  admin_flag_reports: 'Amatangazo {n}',
  admin_remove: 'Kuraho',
  admin_keep: 'Mugumishe',
  admin_confirm_remove: "Kuraho {name} kuri BloodLink? Ntibisubirwaho kandi bizandikwa mu gitabo cy'ibyakuweho.",
  admin_removed: 'Yakuweho kandi byanditswe.',
  admin_kept: 'Yagumishijwe kandi yongeye kugaragara.',
  admin_kept_stale: 'Amatangazo yasibwe. Azakomeza guhishwa kugeza yongeye kwiyandikisha.',
  admin_empty: 'Nta kintu cyo kugenzura. Bose bameze neza.',
  admin_log_title: "Igitabo cy'ibyakuweho",
  admin_log_when: "Itariki n'isaha",
  admin_log_admin: 'Umuyobozi',
  admin_log_donor: "Nimero y'utanga",
  admin_log_details: 'Ibisobanuro',
  admin_log_empty: 'Nta muntu urakurwaho.',

  lang_switch: 'English',
  lang_switch_label: 'Change the language to English',
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
