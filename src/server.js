/* ============================================================
   server.js — ExamEdge Express API Server
   Secure, production-ready configuration
   ============================================================ */

'use strict';

const path    = require('path');
const fs      = require('fs');

/* Load .env only in development */
if (fs.existsSync(path.join(__dirname, '.env'))) {
  require('dotenv').config();
}

const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');

const authRoutes  = require('./routes/auth');
const examRoutes  = require('./routes/exams');

const app  = express();
const PORT = process.env.PORT || 3000;
const ENV  = process.env.NODE_ENV || 'development';

/* ─── Security Headers (helmet) ─────────────── */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'",
                     'https://fonts.googleapis.com',
                     'https://www.svgrepo.com'],
        styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
        imgSrc:     ["'self'", 'data:', 'https://i.pravatar.cc', 'https://www.svgrepo.com'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

/* ─── CORS ───────────────────────────────────── */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin requests (e.g. serving static files) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

/* ─── Body Parsing ───────────────────────────── */
app.use(express.json({ limit: '50kb' }));          // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

/* ─── Global Rate Limiter ────────────────────── */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

/* ─── Strict Auth Rate Limiter ───────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: 429, message: 'Too many auth attempts, please try again in 15 minutes.' },
});
app.use('/api/auth/', authLimiter);

/* ─── Request Logger (dev only) ─────────────── */
if (ENV === 'development') {
  app.use((req, _res, next) => {
    process.stdout.write(`[${new Date().toISOString()}] ${req.method} ${req.url}\n`);
    next();
  });
}

/* ─── API Routes ─────────────────────────────── */
app.use('/api/auth',  authRoutes);
app.use('/api/exams', examRoutes);

/* ─── Health Check ───────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'examedge-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/* ─── Serve Static Frontend ──────────────────── */
const publicDir = path.join(__dirname, 'public');
app.use(
  express.static(publicDir, {
    etag: true,
    lastModified: true,
    maxAge: ENV === 'production' ? '1d' : 0,
    index: 'index.html',
  })
);

/* Catch-all: SPA fallback */
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

/* ─── Global Error Handler ───────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status  = err.status  || 500;
  const message = err.message || 'Internal Server Error';
  if (ENV !== 'production') console.error(err);
  res.status(status).json({ status, message });
});

/* ─── Start ──────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  🚀  ExamEdge API running`);
  console.log(`  ├─ Environment : ${ENV}`);
  console.log(`  ├─ Port        : ${PORT}`);
  console.log(`  └─ URL         : http://localhost:${PORT}\n`);
});

module.exports = app;   // for testing
