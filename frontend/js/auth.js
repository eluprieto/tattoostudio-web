/* ================================================================
   TATTOOSTUDIO – AUTH
   JWT guardado en localStorage. Actualiza navbar según estado.
   ================================================================ */

(function () {
  'use strict';

  const TOKEN_KEY = 'ts_token';
  const USER_KEY  = 'ts_user';

  const Auth = {
    getToken()   { return localStorage.getItem(TOKEN_KEY); },
    getUser()    { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
    isLoggedIn() { return !!this.getToken(); },

    login(token, user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      document.dispatchEvent(new CustomEvent('auth:changed', { detail: { loggedIn: true, user } }));
    },

    logout() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.dispatchEvent(new CustomEvent('auth:changed', { detail: { loggedIn: false } }));
      window.location.href = '/';
    }
  };

  window.Auth = Auth;

  /* ── Update navbar auth button ────────────────────────────────── */
  function updateNavAuth() {
    const btn = document.getElementById('auth-btn');
    if (!btn) return;
    if (Auth.isLoggedIn()) {
      const user = Auth.getUser();
      btn.textContent = user?.name?.split(' ')[0] || 'Mi cuenta';
      btn.href = 'pages/account.html';
    } else {
      btn.textContent = 'Ingresar';
      btn.href = 'pages/login.html';
    }
  }

  document.addEventListener('auth:changed', updateNavAuth);

  /* ── LOGIN form ───────────────────────────────────────────────── */
  function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!Utils.validateForm(form)) return;

      const btn = form.querySelector('button[type="submit"]');
      const err = document.getElementById('login-error');
      btn.disabled = true;
      btn.classList.add('btn-loading');
      if (err) err.classList.remove('visible');

      try {
        const { token, user } = await Utils.fetchJSON(`${API_BASE}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({
            email:    form.querySelector('#login-email')?.value.trim(),
            password: form.querySelector('#login-password')?.value
          })
        });
        Auth.login(token, user);
        const redirect = new URLSearchParams(window.location.search).get('redirect') || '../index.html';
        window.location.href = redirect;
      } catch (error) {
        if (err) { err.textContent = error.message || 'Email o contraseña incorrectos.'; err.classList.add('visible'); }
      } finally {
        btn.disabled = false;
        btn.classList.remove('btn-loading');
      }
    });
  }

  /* ── REGISTER form ────────────────────────────────────────────── */
  function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!Utils.validateForm(form)) return;

      const pw  = form.querySelector('#reg-password')?.value;
      const pw2 = form.querySelector('#reg-password2')?.value;
      const err = document.getElementById('register-error');

      if (pw !== pw2) {
        if (err) { err.textContent = 'Las contraseñas no coinciden.'; err.classList.add('visible'); }
        return;
      }
      if (pw.length < 6) {
        if (err) { err.textContent = 'La contraseña debe tener al menos 6 caracteres.'; err.classList.add('visible'); }
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.classList.add('btn-loading');
      if (err) err.classList.remove('visible');

      try {
        const { token, user } = await Utils.fetchJSON(`${API_BASE}/auth/register`, {
          method: 'POST',
          body: JSON.stringify({
            name:          form.querySelector('#reg-name')?.value.trim(),
            email:         form.querySelector('#reg-email')?.value.trim(),
            password:      pw,
            acceptsOffers: form.querySelector('#reg-newsletter')?.checked || false
          })
        });
        Auth.login(token, user);
        window.location.href = '../index.html';
      } catch (error) {
        if (err) { err.textContent = error.message || 'No se pudo crear la cuenta.'; err.classList.add('visible'); }
      } finally {
        btn.disabled = false;
        btn.classList.remove('btn-loading');
      }
    });
  }

  /* ── Password visibility toggle ──────────────────────────────── */
  function initPasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.closest('.password-toggle')?.querySelector('input');
        if (!input) return;
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        btn.textContent = isPass ? 'Ocultar' : 'Mostrar';
      });
    });
  }

  /* ── Logout button ────────────────────────────────────────────── */
  function initLogoutBtn() {
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
    });
  }

  /* ── Protect pages that require auth ─────────────────────────── */
  function guardPage() {
    if (document.body.dataset.requiresAuth === 'true' && !Auth.isLoggedIn()) {
      const redirect = encodeURIComponent(window.location.href);
      window.location.href = `login.html?redirect=${redirect}`;
    }
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function boot() {
    updateNavAuth();
    initLoginForm();
    initRegisterForm();
    initPasswordToggles();
    initLogoutBtn();
    guardPage();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
