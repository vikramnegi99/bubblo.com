'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../../db');
const { signToken, requireAdmin } = require('../../middleware/auth');
const { loginLimiter } = require('../../middleware/rateLimit');
const { validateBody } = require('../../middleware/validate');
const { loginSchema } = require('../../validation/schemas');

const router = express.Router();

/** POST /api/admin/login — email + password → JWT. */
router.post('/login', loginLimiter, validateBody(loginSchema), (req, res) => {
  const { email, password } = req.body;
  const admin = getDb().prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase());
  // Constant-ish response regardless of which part failed.
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'Incorrect email or password.' });
  }
  const token = signToken(admin);
  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  });
});

/** GET /api/admin/me — verify the current session. */
router.get('/me', requireAdmin, (req, res) => {
  const admin = getDb()
    .prepare('SELECT id, email, name, role FROM admins WHERE id = ?')
    .get(req.admin.sub);
  if (!admin) return res.status(401).json({ error: 'unauthorized', message: 'Please sign in.' });
  res.json({ admin });
});

module.exports = router;
