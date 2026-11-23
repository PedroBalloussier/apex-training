import { t } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { signIn, signUp, errorKey } from '../data/account.js';
import { getSettings, updateSettings } from '../data/settings.js';

let mode = 'signin';

export function renderAuth(root) {
  const s = getSettings();
  root.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="brand"><div class="brand-mark">${icon('logo')}</div><span class="brand-name">${esc(t('app.name'))}</span></div>
          <div class="seg" role="group" aria-label="${esc(t('settings.language'))}">
            <button type="button" data-lang="pt" aria-pressed="${s.language === 'pt'}">PT</button>
            <button type="button" data-lang="en" aria-pressed="${s.language === 'en'}">EN</button>
          </div>
        </div>
        <div class="auth-head">
          <h1>${esc(t('auth.title'))}</h1>
          <p class="muted">${esc(t('auth.subtitle'))}</p>
        </div>
        <div class="card">
          <div class="seg seg-block" role="tablist" style="margin-bottom:18px">
            <button type="button" role="tab" data-mode="signin" aria-pressed="${mode === 'signin'}">${esc(t('auth.tabSignIn'))}</button>
            <button type="button" role="tab" data-mode="signup" aria-pressed="${mode === 'signup'}">${esc(t('auth.tabSignUp'))}</button>
          </div>
          <form class="form" novalidate>
            ${mode === 'signup' ? `
            <div class="field"><label for="a-name">${esc(t('auth.name'))}</label>
              <input class="input" id="a-name" name="name" autocomplete="given-name" required></div>` : ''}
            <div class="field"><label for="a-email">${esc(t('auth.email'))}</label>
              <input class="input" id="a-email" name="email" type="email" inputmode="email" autocomplete="email" required></div>
            <div class="field"><label for="a-pass">${esc(t('auth.password'))}</label>
              <input class="input" id="a-pass" name="password" type="password" minlength="8"
                autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" required>
              ${mode === 'signup' ? `<span class="setting-hint">${esc(t('auth.passwordHint'))}</span>` : ''}</div>
            <div class="form-error" hidden></div>
            <button class="btn btn-primary btn-block" type="submit">${esc(mode === 'signup' ? t('auth.submitSignUp') : t('auth.submitSignIn'))}</button>
            ${mode === 'signin' ? `<p class="form-note">${esc(t('auth.forgot'))}</p>` : ''}
          </form>
        </div>
      </div>
    </div>`;

  root.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => updateSettings({ language: b.dataset.lang })));
  root.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; renderAuth(root); }));

  const form = root.querySelector('form');
  const errBox = root.querySelector('.form-error');
  const btn = form.querySelector('button[type="submit"]');
  const showErr = (key) => { errBox.textContent = t(key); errBox.hidden = false; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.hidden = true;
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const name = String(fd.get('name') || '').trim();
    if (!email || !password || (mode === 'signup' && !name)) return showErr('auth.errRequired');
    if (mode === 'signup' && password.length < 8) return showErr('auth.errWeak');

    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = t('auth.loading');
    try {
      if (mode === 'signup') await signUp({ name, email, password });
      else await signIn({ email, password });
      // A troca de tela acontece pelo evento de sessão
    } catch (err) {
      showErr(errorKey(err));
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}
