(async function () {
  const form = document.getElementById('search-form');
  const params = new URLSearchParams(location.search);

  await window.forms.loadMeta();
  window.forms.renderDrops(document.getElementById('blood-drops'), 'bloodType', params.get('bloodType'));
  window.forms.renderDistricts(document.getElementById('district'), params.get('district'));
  window.i18n.apply(form);

  // NFR 10: three actions - blood type, district, search.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bloodType = (form.querySelector('input[name="bloodType"]:checked') || {}).value;
    const district = form.district.value;
    const errors = {};
    if (!bloodType) errors.bloodType = 'err_blood_type';
    if (!district) errors.district = 'err_district';
    window.forms.showErrors(form, errors);
    if (Object.keys(errors).length) return;

    location.href = '/results?' + new URLSearchParams({ bloodType, district }).toString();
  });
})();
