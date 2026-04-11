/* ============================================================
   auth.js — Login & Registration logic
   ============================================================ */

/* ─── Toggle password visibility ────────────── */
function bindTogglePassword(btnId, inputId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    // Swap icon
    btn.innerHTML = isPassword
      ? `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
           <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
         </svg>`
      : `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
           <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
           <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
         </svg>`;
  });
}

/* ─── Social login / signup placeholder ─────── */
function bindSocialBtn(id, provider) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', () => {
    Toast.info(`${provider} OAuth coming soon.`, 'OAuth');
  });
}

/* ══════════════════════════════════════════════
   LOGIN FORM
   ══════════════════════════════════════════════ */
(function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  bindTogglePassword('toggleLoginPass', 'loginPassword');
  bindSocialBtn('googleLoginBtn', 'Google');
  bindSocialBtn('githubLoginBtn', 'GitHub');

  /* If already logged in, skip to dashboard */
  if (Auth.isLoggedIn()) { window.location.href = 'dashboard.html'; return; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const alertEl  = document.getElementById('loginAlert');
    const alertMsg = document.getElementById('loginAlertMsg');
    const btnText  = document.getElementById('loginBtnText');
    const spinner  = document.getElementById('loginSpinner');

    /* Clear previous errors */
    alertEl.classList.add('hidden');
    Validate.clearAll('loginEmailErr', 'loginPasswordErr');

    /* Validate */
    let valid = true;
    if (!Validate.email(email)) {
      Validate.showErr('loginEmailErr'); valid = false;
    }
    if (!Validate.notEmpty(password)) {
      Validate.showErr('loginPasswordErr'); valid = false;
    }
    if (!valid) return;

    /* Show loading */
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
      // ── Try real API first ──────────────────────
      const data = await API.post('/api/auth/login', { email, password });
      Auth.save(data.token, data.user);
      Toast.success('Logged in successfully!');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);

    } catch {
      // ── Demo fallback (no backend running) ──────
      const demoUsers = JSON.parse(localStorage.getItem('ee_users') || '[]');
      const found = demoUsers.find(u => u.email === email && u.password === password);

      if (found) {
        const fakeToken = btoa(JSON.stringify({ id: found.id, exp: Date.now() + 3600000 }));
        Auth.save(fakeToken, { id: found.id, email: found.email, name: found.name, role: found.role });
        Toast.success('Welcome back, ' + found.name.split(' ')[0] + '!');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
      } else {
        alertMsg.textContent = 'Invalid email or password.';
        alertEl.classList.remove('hidden');
      }
    } finally {
      btnText.classList.remove('hidden');
      spinner.classList.add('hidden');
    }
  });
})();

/* ══════════════════════════════════════════════
   SIGNUP FORM
   ══════════════════════════════════════════════ */
(function initSignup() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  bindTogglePassword('toggleSignupPass', 'signupPassword');
  bindSocialBtn('googleSignupBtn', 'Google');
  bindSocialBtn('githubSignupBtn', 'GitHub');

  /* Password strength meter */
  const pwInput = document.getElementById('signupPassword');
  const bar     = document.getElementById('pwStrengthBar');
  const label   = document.getElementById('pwStrengthLabel');
  if (pwInput && bar && label) {
    pwInput.addEventListener('input', () => {
      const strength = checkPasswordStrength(pwInput.value);
      bar.style.width      = strength.pct;
      bar.style.background = strength.color;
      label.textContent    = strength.label;
      label.style.color    = strength.color;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName  = document.getElementById('signupLastName').value.trim();
    const email     = document.getElementById('signupEmail').value.trim();
    const password  = document.getElementById('signupPassword').value;
    const role      = document.getElementById('signupRole').value;
    const terms     = document.getElementById('signupTerms').checked;
    const alertEl   = document.getElementById('signupAlert');
    const alertMsg  = document.getElementById('signupAlertMsg');
    const btnText   = document.getElementById('signupBtnText');
    const spinner   = document.getElementById('signupSpinner');

    alertEl.classList.add('hidden');
    Validate.clearAll('signupFirstNameErr','signupLastNameErr','signupEmailErr','signupPasswordErr','signupRoleErr','signupTermsErr');

    let valid = true;
    if (!Validate.notEmpty(firstName)) { Validate.showErr('signupFirstNameErr'); valid = false; }
    if (!Validate.notEmpty(lastName))  { Validate.showErr('signupLastNameErr');  valid = false; }
    if (!Validate.email(email))        { Validate.showErr('signupEmailErr');     valid = false; }
    if (!Validate.minLen(password, 8) || !/[0-9]/.test(password)) {
      Validate.showErr('signupPasswordErr'); valid = false;
    }
    if (!role)  { Validate.showErr('signupRoleErr',  'Please choose a role.'); valid = false; }
    if (!terms) { Validate.showErr('signupTermsErr', 'You must accept the terms.'); valid = false; }
    if (!valid) return;

    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
      const data = await API.post('/api/auth/register', { firstName, lastName, email, password, role });
      Auth.save(data.token, data.user);
      Toast.success('Account created! Redirecting…');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);

    } catch {
      /* Demo offline fallback */
      const users = JSON.parse(localStorage.getItem('ee_users') || '[]');
      if (users.find(u => u.email === email)) {
        alertMsg.textContent = 'An account with this email already exists.';
        alertEl.classList.remove('hidden');
      } else {
        const newUser = {
          id: `u_${Date.now()}`,
          name: `${firstName} ${lastName}`,
          email, password, role,
        };
        users.push(newUser);
        localStorage.setItem('ee_users', JSON.stringify(users));
        const fakeToken = btoa(JSON.stringify({ id: newUser.id, exp: Date.now() + 3600000 }));
        Auth.save(fakeToken, { id: newUser.id, email, name: newUser.name, role });
        Toast.success('Welcome to ExamEdge, ' + firstName + '!');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
      }
    } finally {
      btnText.classList.remove('hidden');
      spinner.classList.add('hidden');
    }
  });
})();
