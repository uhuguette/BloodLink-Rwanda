const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Load the browser translation file in Node.
global.window = {};
global.document = {};
require('../public/js/i18n.js');
const { en, rw } = global.window.I18N;

test('every English text has a Kinyarwanda version and the other way round', () => {
  assert.deepStrictEqual(Object.keys(rw).sort(), Object.keys(en).sort());
});

test('every data-i18n key used in the pages exists', () => {
  const files = [
    ...fs.readdirSync(path.join(__dirname, '..', 'public')).filter((f) => f.endsWith('.html')).map((f) => path.join('public', f)),
    path.join('views', 'admin.html'),
    path.join('public', 'js', 'layout.js'),
  ];
  const missing = [];
  files.forEach((file) => {
    const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    for (const m of html.matchAll(/data-i18n(?:-placeholder|-title)?="([a-z0-9_]+)"/g)) {
      if (!en[m[1]]) missing.push(`${file}: ${m[1]}`);
    }
  });
  assert.deepStrictEqual(missing, []);
});
