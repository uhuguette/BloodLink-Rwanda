(async function () {
  const form = document.getElementById('register-form');
  const message = document.getElementById('reg-message');

  await window.forms.loadMeta();
  window.forms.renderDrops(document.getElementById('blood-drops'), 'bloodType');
  window.forms.renderDistricts(document.getElementById('district'));
  window.i18n.apply(form);

  function showMessage(type, key) {
    message.className = `alert ${type}`;
    message.dataset.i18n = key;
    message.textContent = window.i18n.t(key);
    message.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Quick checks in the browser; the server checks everything again.
  function localErrors(body) {
    const errors = {};
    if (body.fullName.trim().length < 2) errors.fullName = 'err_name';
    if (!body.bloodType) errors.bloodType = 'err_blood_type';
    if (!body.district) errors.district = 'err_district';
    const phone = body.phone.replace(/[\s\-().]/g, '').replace(/^\+?250/, '0');
    if (!/^07\d{8}$/.test(phone)) errors.phone = 'err_phone';
    if (!body.consent) errors.consent = 'err_consent';
    return errors;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const body = {
      fullName: fd.get('fullName') || '',
      bloodType: fd.get('bloodType') || '',
      district: fd.get('district') || '',
      phone: fd.get('phone') || '',
      consent: form.consent.checked,
    };

    const errors = localErrors(body);
    window.forms.showErrors(form, errors);
    if (Object.keys(errors).length) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    const { ok, data } = await window.api('/api/donors', { method: 'POST', body });
    button.disabled = false;

    if (ok) {
      form.reset();
      window.forms.showErrors(form, {});
      showMessage('ok', data.status === 'updated' ? 'reg_updated' : 'reg_created');
    } else if (data.errors) {
      window.forms.showErrors(form, data.errors);
    } else {
      showMessage('error', 'err_generic');
    }
  });
})();
