const path = require('path');
const express = require('express');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'bloodlink-rwanda' });
});

app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

// Unknown API routes return JSON, everything else gets the 404 page.
app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html')));

module.exports = app;
