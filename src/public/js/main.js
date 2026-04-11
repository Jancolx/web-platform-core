/* ============================================================
   main.js — Shared utilities used across all pages
   ============================================================ */

/* ─── Toast System ──────────────────────────── */
const Toast = (() => {
  const wrap = () => document.getElementById('toastWrap');

  const show = ({ title = 'Notification', message = '', type = 'info', duration = 3500 } = {}) => {
    const el = document.createElement('div');
    el.className = 'toast';

    const icons = {
      success: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
      error:   `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
      warning: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3l9 15H3L12 3z"/></svg>`,
      info:    `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    };
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#6366f1' };
    const color  = colors[type] || colors.info;

    el.innerHTML = `
      <div class="toast-icon" style="background:${color}1a;color:${color}">${icons[type] || icons.info}</div>
      <div>
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-msg">${message}</div>` : ''}
      </div>
    `;

    wrap()?.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      el.addEventListener('animationend', () => el.remove());
    }, duration);
  };

  return {
    success: (msg, title = 'Success')   => show({ title, message: msg, type: 'success' }),
    error:   (msg, title = 'Error')     => show({ title, message: msg, type: 'error' }),
    warning: (msg, title = 'Warning')   => show({ title, message: msg, type: 'warning' }),
    info:    (msg, title = 'Info')      => show({ title, message: msg, type: 'info' }),
  };
})();

/* ─── Auth Helpers ──────────────────────────── */
const Auth = {
  TOKEN_KEY: 'ee_token',
  USER_KEY:  'ee_user',

  save(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  getToken() { return localStorage.getItem(this.TOKEN_KEY); },
  getUser()  {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY)); }
    catch { return null; }
  },
  isLoggedIn() { return !!this.getToken(); },
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = 'login.html';
  },
};

/* ─── Protect dashboard pages ───────────────── */
(function guardPages() {
  const protectedPages = ['dashboard.html', 'exam.html'];
  const page = window.location.pathname.split('/').pop();
  if (protectedPages.includes(page) && !Auth.isLoggedIn()) {
    window.location.href = 'login.html';
  }
})();

/* ─── Navbar Scroll Effect ──────────────────── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 1px 24px rgba(0,0,0,0.35)' : 'none';
  });
}

/* ─── Generic API helper ────────────────────── */
const API = {
  BASE: '',   // Same-origin; update if backend runs on different port
  async req(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const token = Auth.getToken();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body)  opts.body = JSON.stringify(body);

    const res = await fetch(this.BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  get:    (path)        => API.req('GET',    path),
  post:   (path, body)  => API.req('POST',   path, body),
  put:    (path, body)  => API.req('PUT',    path, body),
  delete: (path)        => API.req('DELETE', path),
};

/* ─── Form Validation Helpers ─────────────── */
const Validate = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  minLen: (v, n) => v.length >= n,
  notEmpty: (v) => v.trim() !== '',

  showErr(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg || el.textContent;
    el.classList.add('show');
    el.previousElementSibling?.classList?.add?.('error');
  },
  clearErr(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    el.previousElementSibling?.classList?.remove?.('error');
  },
  clearAll(...ids) { ids.forEach(id => this.clearErr(id)); },
};

/* ─── Password Strength ─────────────────────── */
function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: '', color: 'transparent', pct: '0%' },
    { label: 'Very weak',   color: '#ef4444', pct: '20%' },
    { label: 'Weak',        color: '#f97316', pct: '40%' },
    { label: 'Fair',        color: '#eab308', pct: '60%' },
    { label: 'Strong',      color: '#10b981', pct: '80%' },
    { label: 'Very strong', color: '#06b6d4', pct: '100%' },
  ];
  return levels[Math.min(score, 5)];
}

/* ─── Expose Globals ────────────────────────── */
window.Toast    = Toast;
window.Auth     = Auth;
window.API      = API;
window.Validate = Validate;
window.checkPasswordStrength = checkPasswordStrength;
