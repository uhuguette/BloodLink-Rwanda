const path = require('path');
const express = require('express');

const { forceHttps, securityHeaders, sessions } = require('./middleware/security');

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
app.use('/api', require('./routes/search'));

app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

// Unknown API routes return JSON, everything else gets the 404 page.
app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html')));

module.exports = app;
