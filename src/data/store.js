/* ============================================================
   data/store.js — In-memory data store
   In production, replace with a real database (PostgreSQL, MongoDB…)
   ============================================================ */

'use strict';

const { v4: uuidv4 } = require('uuid');

/* ─── Users ──────────────────────────────────── */
// Passwords are bcrypt hashes (cost factor 12).
// The commented-out plaintext is for dev reference ONLY — never store plaintext in production.
const users = [
  {
    id:       'seed-u1',
    name:     'Alice Admin',
    email:    'admin@examedge.io',
    // password: 'Admin@1234'
    passwordHash: '$2a$12$LQV7h74.fwcxFR07fTZU8OypTKzHMBTrW5q1rJ57fIe6UPJxPr5Em',
    role:     'admin',
    createdAt: new Date('2025-01-01').toISOString(),
  },
  {
    id:       'seed-u2',
    name:     'Student Demo',
    email:    'student@examedge.io',
    // password: 'Student@1234'
    passwordHash: '$2a$12$cEv3MBVHpJ7czx9.O/5pWewAEJFHv/N/gDHPDHUz1C1W4oRiEa9Ry',
    role:     'student',
    createdAt: new Date('2025-01-15').toISOString(),
  },
];

/* ─── Exam Results ───────────────────────────── */
const results = [];

/* ─── User Store API ─────────────────────────── */
const UserStore = {
  findByEmail: (email) =>
    users.find(u => u.email.toLowerCase() === email.toLowerCase()),

  findById: (id) => users.find(u => u.id === id),

  create: ({ name, email, passwordHash, role }) => {
    const user = { id: uuidv4(), name, email, passwordHash, role, createdAt: new Date().toISOString() };
    users.push(user);
    return user;
  },

  // Safe projection — never send passwordHash to the client
  sanitize: (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role }),
};

/* ─── Result Store API ───────────────────────── */
const ResultStore = {
  addResult: (userId, examId, score, details) => {
    const r = { id: uuidv4(), userId, examId, score, details, takenAt: new Date().toISOString() };
    results.push(r);
    return r;
  },

  byUser: (userId) => results.filter(r => r.userId === userId).sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt)),
};

module.exports = { UserStore, ResultStore };
