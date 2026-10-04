'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/** Sign a short-lived admin JWT. */
function signToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

/** Require a valid Bearer token for /api/admin/* routes. */
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'unauthorized', message: 'Please sign in.' });
  }
  try {
    req.admin = jwt.verify(token, env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'unauthorized', message: 'Session expired. Please sign in again.' });
  }
}

module.exports = { signToken, requireAdmin };
