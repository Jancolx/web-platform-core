/* ============================================================
   routes/auth.js — Register & Login endpoints
   ============================================================ */

'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { UserStore } = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET     = process.env.JWT_SECRET     || 'dev_fallback_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const BCRYPT_ROUNDS  = 12;

/* ─── Helpers ────────────────────────────────── */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ──────────────────────────────────────────────
   POST /api/auth/register
   Body: { firstName, lastName, email, password, role }
   ────────────────────────────────────────────── */
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    /* ── Input validation ── */
    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ message: 'First and last name are required.' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number.' });
    }
    const allowedRoles = ['student', 'teacher', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(', ')}.` });
    }

    /* ── Check duplicate ── */
    if (UserStore.findByEmail(email)) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    /* ── Hash password ── */
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    /* ── Persist ── */
    const user  = UserStore.create({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
    });

    const token = signToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: UserStore.sanitize(user),
    });

  } catch (err) {
    next(err);
  }
});

/* ──────────────────────────────────────────────
   POST /api/auth/login
   Body: { email, password }
   ────────────────────────────────────────────── */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email) || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = UserStore.findByEmail(email);

    /* Constant-time failure to prevent user enumeration */
    const dummyHash = '$2a$12$invalidhashforcomparisonpurposesonly1234567890abcdefgh';
    const isMatch   = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);

    if (!user || !isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    return res.json({
      message: 'Login successful.',
      token,
      user: UserStore.sanitize(user),
    });

  } catch (err) {
    next(err);
  }
});

/* ──────────────────────────────────────────────
   GET /api/auth/me  (protected)
   Returns: current logged-in user profile
   ────────────────────────────────────────────── */
router.get('/me', requireAuth, (req, res) => {
  const user = UserStore.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: UserStore.sanitize(user) });
});

/* ──────────────────────────────────────────────
   POST /api/auth/logout  (client-side token drop)
   JWT is stateless — client discards the token.
   Server-side blacklist can be added for production.
   ────────────────────────────────────────────── */
router.post('/logout', requireAuth, (_req, res) => {
  res.json({ message: 'Logged out. Please discard your token.' });
});

module.exports = router;
