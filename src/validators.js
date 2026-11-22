const { BLOOD_TYPES, DISTRICTS } = require('./constants');

// Accepts "0788 123 456", "+250788123456", "250-788-123-456" and turns them into "0788123456".
function normalizePhone(raw) {
  let phone = String(raw || '').replace(/[\s\-().]/g, '');
  if (phone.startsWith('+250')) phone = '0' + phone.slice(4);
  else if (phone.startsWith('250') && phone.length === 12) phone = '0' + phone.slice(3);
  return phone;
}

// FR 1.2: a valid Rwandan mobile number is 10 digits starting with 07.
function isValidRwandanPhone(phone) {
  return /^07\d{8}$/.test(phone);
}

// Returns { ok, errors, value }. Error values are translation keys so the
// front end can show them in English or Kinyarwanda.
function validateDonor(input = {}) {
  const errors = {};
  const fullName = String(input.fullName || '').trim().replace(/\s+/g, ' ');
  const bloodType = String(input.bloodType || '').trim().toUpperCase();
  const district = String(input.district || '').trim();
  const phone = normalizePhone(input.phone);
  const consent = input.consent === true || input.consent === 'true' || input.consent === 'on';

  if (fullName.length < 2 || fullName.length > 80 || !/\p{L}/u.test(fullName)) {
    errors.fullName = 'err_name';
  }
  if (!BLOOD_TYPES.includes(bloodType)) errors.bloodType = 'err_blood_type';
  if (!DISTRICTS.includes(district)) errors.district = 'err_district';
  if (!isValidRwandanPhone(phone)) errors.phone = 'err_phone';
  if (!consent) errors.consent = 'err_consent';

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { fullName, bloodType, district, phone, consent },
  };
}

module.exports = { normalizePhone, isValidRwandanPhone, validateDonor };
