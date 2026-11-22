// NFR 1: only a logged-in admin can reach admin pages and admin APIs.
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  if (req.originalUrl.startsWith('/api/')) return res.status(401).json({ error: 'access_denied' });
  return res.redirect('/login?denied=1');
}

module.exports = requireAdmin;
