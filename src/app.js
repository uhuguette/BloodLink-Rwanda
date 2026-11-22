const path = require('path');
const express = require('express');

const { forceHttps, securityHeaders, sessions } = require('./middleware/security');
const requireAdmin = require('./middleware/requireAdmin');
const { ensureAdmin } = require('./services/adminService');

ensureAdmin();

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(forceHttps);
app.use(securityHeaders);
app.use(express.json({ limit: '20kb' }));
app.use(sessions);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'bloodlink-rwanda' });
});

app.use('/api/meta', require('./routes/meta'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/search'));

// The admin page lives outside /public so it can only be opened after login (NFR 1).
app.get(['/admin', '/admin.html'], requireAdmin, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
});

app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

// Unknown API routes return JSON, everything else gets the 404 page.
app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html')));

module.exports = app;
