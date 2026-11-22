// Shared form helpers: blood type drops, district list and error messages.
window.forms = {
  async loadMeta() {
    if (this._meta) return this._meta;
    const { ok, data } = await window.api('/api/meta');
    this._meta = ok ? data : { bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], districts: [] };
    return this._meta;
  },

  renderDrops(container, name, selected) {
    container.innerHTML = this._meta.bloodTypes.map((bt) => `
      <label class="drop" title="${bt}">
        <input type="radio" name="${name}" value="${bt}"${bt === selected ? ' checked' : ''} required>
        <span><b>${bt}</b></span>
      </label>`).join('');
  },

  renderDistricts(select, selected) {
    const first = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (first) select.appendChild(first);
    this._meta.districts.forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (d === selected) opt.selected = true;
      select.appendChild(opt);
    });
  },

  showErrors(form, errors) {
    form.querySelectorAll('[data-field]').forEach((field) => {
      const key = errors[field.dataset.field];
      field.classList.toggle('has-error', Boolean(key));
      const box = field.querySelector('.error-text');
      if (box) {
        if (key) box.dataset.i18n = key; else delete box.dataset.i18n;
        box.textContent = key ? window.i18n.t(key) : '';
      }
    });
    const firstBad = form.querySelector('.has-error input, .has-error select');
    if (firstBad) firstBad.focus();
  },
};
