const test = require('node:test');
const assert = require('node:assert');
const { normalizePhone, isValidRwandanPhone, validateDonor } = require('../src/validators');

const good = { fullName: 'Aline Uwimana', bloodType: 'O+', district: 'Gasabo', phone: '0788123456', consent: true };

test('normalizes common phone formats', () => {
  assert.strictEqual(normalizePhone('+250 788 123 456'), '0788123456');
  assert.strictEqual(normalizePhone('250788123456'), '0788123456');
  assert.strictEqual(normalizePhone('0788-123-456'), '0788123456');
});

test('accepts only 10 digit numbers starting with 07', () => {
  assert.ok(isValidRwandanPhone('0788123456'));
  assert.ok(!isValidRwandanPhone('078812345'));
  assert.ok(!isValidRwandanPhone('0688123456'));
  assert.ok(!isValidRwandanPhone('07881234567'));
});

test('a complete donor passes validation', () => {
  assert.strictEqual(validateDonor(good).ok, true);
});

test('no consent means no sign up', () => {
  const r = validateDonor({ ...good, consent: false });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.errors.consent, 'err_consent');
});

test('rejects bad phone, unknown blood type and unknown district', () => {
  const r = validateDonor({ ...good, phone: '12345', bloodType: 'C+', district: 'Paris' });
  assert.deepStrictEqual(Object.keys(r.errors).sort(), ['bloodType', 'district', 'phone']);
});
