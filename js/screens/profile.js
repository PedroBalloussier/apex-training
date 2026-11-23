import { t } from '../i18n/index.js';
import { esc } from '../utils/dom.js';
import { getProfile, saveProfile, profileComplete, getActivePlan } from '../data/account.js';
import { getSettings } from '../data/settings.js';
import { weightToUser, weightFromUser, lengthToUser, lengthFromUser } from '../utils/units.js';
import { toast } from '../ui/feedback.js';

export default {
  render(el) {
    const p = getProfile() || {};
    const s = getSettings();
    const onboarding = !profileComplete(p);
    const h = p.height_cm ? lengthToUser(Number(p.height_cm), s.lengthUnit) : '';
    const w = p.weight_kg ? weightToUser(Number(p.weight_kg), s.weightUnit) : '';
    const sexOpt = (v) => `<button type="button" class="chip-btn" data-sex="${v}" aria-pressed="${p.sex === v}">${esc(t('profile.' + v))}</button>`;

    el.innerHTML = `
      <section class="screen wizard">
        <header class="screen-head">
          <span class="eyebrow">${esc(onboarding ? t('triage.step', { n: 1, t: 2 }) : t('profile.eyebrow'))}</span>
          <h1>${esc(t('profile.title'))}</h1>
          <p class="muted">${esc(t('profile.subtitle'))}</p>
        </header>
        <div class="card">
          <form class="form" novalidate>
            <div class="field"><label for="p-name">${esc(t('profile.name'))}</label>
              <input class="input" id="p-name" name="name" value="${esc(p.name || '')}" autocomplete="given-name"></div>
            <div class="field"><label for="p-birth">${esc(t('profile.birth'))}</label>
              <input class="input" id="p-birth" name="birth" type="date" value="${esc(p.birth_date || '')}" max="${new Date().toISOString().slice(0, 10)}"></div>
            <div class="field"><span class="label">${esc(t('profile.sex'))}</span>
              <div class="chips">${sexOpt('female')}${sexOpt('male')}${sexOpt('other')}</div></div>
            <div class="form-row">
              <div class="field"><label for="p-height">${esc(t('profile.height'))}</label>
                <div class="input-unit"><input class="input num" id="p-height" name="height" type="number" inputmode="decimal" step="0.1" value="${esc(h)}"><span>${esc(s.lengthUnit)}</span></div></div>
              <div class="field"><label for="p-weight">${esc(t('profile.weight'))}</label>
                <div class="input-unit"><input class="input num" id="p-weight" name="weight" type="number" inputmode="decimal" step="0.1" value="${esc(w)}"><span>${esc(s.weightUnit)}</span></div></div>
            </div>
            <div class="form-error" hidden></div>
            <button class="btn btn-primary btn-block" type="submit">${esc(onboarding ? t('profile.save') : t('profile.saveOnly'))}</button>
          </form>
        </div>
      </section>`;

    let sex = p.sex || null;
    el.querySelectorAll('[data-sex]').forEach((b) => b.addEventListener('click', () => {
      sex = b.dataset.sex;
      el.querySelectorAll('[data-sex]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));

    const form = el.querySelector('form');
    const errBox = el.querySelector('.form-error');
    const showErr = (k) => { errBox.textContent = t(k); errBox.hidden = false; };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errBox.hidden = true;
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const birth = String(fd.get('birth') || '');
      const heightCm = lengthFromUser(fd.get('height'), s.lengthUnit);
      const weightKg = weightFromUser(fd.get('weight'), s.weightUnit);
      if (!name || !birth || !sex || !fd.get('height') || !fd.get('weight')) return showErr('profile.errRequired');
      const age = (Date.now() - new Date(birth).getTime()) / (365.25 * 864e5);
      if (!(age >= 13 && age <= 100)) return showErr('profile.errAge');
      if (!(heightCm >= 100 && heightCm <= 250)) return showErr('profile.errHeight');
      if (!(weightKg >= 30 && weightKg <= 300)) return showErr('profile.errWeight');

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await saveProfile({
          name, birth_date: birth, sex,
          height_cm: Math.round(heightCm * 10) / 10,
          weight_kg: Math.round(weightKg * 10) / 10
        });
        toast(t('profile.saved'));
        location.hash = onboarding && !getActivePlan() ? '#triagem' : '#hoje';
      } catch (err) {
        showErr('auth.errGeneric');
        btn.disabled = false;
      }
    });
  }
};
