const session = require('express-session');
const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';
const FIFTEEN_MINUTES = 15 * 60 * 1000;

// NFR 6: on the live site every http request is sent to https.
// Hosts like Render put the original protocol in x-forwarded-proto.
function forceHttps(req, res, next) {
  if (isProduction && req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=15552000');
  next();
}

if (isProduction && !process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET is not set. Using a random secret, so sessions reset on every restart.');
}

// NFR 2: the session ends after 15 minutes without activity (rolling cookie).
const sessions = session({
  name: 'bloodlink.sid',
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: FIFTEEN_MINUTES,
  },
});

module.exports = { forceHttps, securityHeaders, sessions, FIFTEEN_MINUTES };
