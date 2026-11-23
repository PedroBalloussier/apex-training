import { t } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { getSettings, updateSettings, DEFAULT_SETTINGS } from '../data/settings.js';
import { store } from '../data/store.js';
import { toast, openSheet } from '../ui/feedback.js';
import { formatDuration } from '../utils/units.js';
import { getLanguage } from '../i18n/index.js';
import { getUser, getProfile, signOut } from '../data/account.js';
import { demoActive, exitDemo } from '../data/demo.js';
import { openDemoSheet } from '../ui/demo-ui.js';

const REST_MIN = 30, REST_MAX = 300, REST_STEP = 15;

function seg(name, options, value) {
  return `<div class="seg" role="group" data-setting="${name}">
    ${options.map(([v, label]) => `<button type="button" data-value="${v}" aria-pressed="${v === value}">${esc(label)}</button>`).join('')}
  </div>`;
}

function row(ic, label, hint, control, stack = false) {
  return `<div class="setting-row ${stack ? 'stack' : ''}">
    <div class="setting-text">
      <span class="setting-label">${esc(label)}</span>
      ${hint ? `<span class="setting-hint">${esc(hint)}</span>` : ''}
    </div>
    ${control}
  </div>`;
}

export default {
  render(el) {
    const s = getSettings();
    const lang = getLanguage();

    el.innerHTML = `
      <section class="screen">
        <header class="screen-head">
          <span class="eyebrow">${esc(t('settings.eyebrow'))}</span>
          <h1>${esc(t('settings.title'))}</h1>
          <p class="muted">${esc(t('settings.subtitle'))}</p>
        </header>

        ${getUser() ? `
        <div class="card">
          <div class="card-head"><div class="card-title">${icon('users')}<h2>${esc(t('account.title'))}</h2></div></div>
          <div class="settings-group">
            ${row('users', (getProfile() && getProfile().name) || t('account.signedAs'), getUser().email,
              `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
                <a class="btn btn-sm" href="#perfil">${esc(t('account.editProfile'))}</a>
                <button type="button" class="btn btn-sm btn-ghost" data-act="signout">${esc(t('account.signOut'))}</button>
              </div>`)}
          </div>
        </div>` : ''}

        <div class="grid grid-2">
          <div class="card">
            <div class="card-head"><div class="card-title">${icon('globe')}<h2>${esc(t('settings.general'))}</h2></div></div>
            <div class="settings-group">
              ${row('globe', t('settings.language'), t('settings.languageHint'),
                seg('language', [['pt', 'Português'], ['en', 'English']], s.language))}
            </div>
            <div class="card-head" style="margin-top:12px"><div class="card-title">${icon('scale')}<h2>${esc(t('settings.units'))}</h2></div></div>
            <div class="settings-group">
              ${row('scale', t('settings.weight'), t('settings.weightHint'), seg('weightUnit', [['kg', 'kg'], ['lb', 'lb']], s.weightUnit))}
              ${row('ruler', t('settings.length'), t('settings.lengthHint'), seg('lengthUnit', [['cm', 'cm'], ['in', 'in']], s.lengthUnit))}
            </div>
          </div>

          <div class="card">
            <div class="card-head"><div class="card-title">${icon('palette')}<h2>${esc(t('settings.appearance'))}</h2></div></div>
            <div class="settings-group">
              ${row('palette', t('settings.palette'), t('settings.paletteHint'), `
                <div class="swatches" role="group" data-setting="palette">
                  <button type="button" class="swatch" data-value="emerald" aria-pressed="${s.palette === 'emerald'}"><i class="sw-emerald"></i>${esc(t('settings.emerald'))}</button>
                  <button type="button" class="swatch" data-value="sunset" aria-pressed="${s.palette === 'sunset'}"><i class="sw-sunset"></i>${esc(t('settings.sunset'))}</button>
                </div>`, true)}
              ${row('moon', t('settings.mode'), '', seg('mode', [['dark', t('settings.dark')], ['light', t('settings.light')]], s.mode))}
            </div>
            <div class="card-head" style="margin-top:12px"><div class="card-title">${icon('timer')}<h2>${esc(t('settings.training'))}</h2></div></div>
            <div class="settings-group">
              ${row('timer', t('settings.rest'), t('settings.restHint'), `
                <div class="stepper">
                  <button type="button" class="icon-btn" data-rest="-1" aria-label="-${REST_STEP} s">${icon('minus')}</button>
                  <output class="num" data-rest-out aria-live="polite">${esc(formatDuration(s.restSeconds, lang))}</output>
                  <button type="button" class="icon-btn" data-rest="1" aria-label="+${REST_STEP} s">${icon('plus')}</button>
                </div>`)}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><div class="card-title">${icon('database')}<h2>${esc(t('settings.data'))}</h2></div></div>
          <p class="setting-hint" style="margin-bottom:6px">${esc(store.persistent ? t('settings.storageLocal') : t('settings.storageMemory'))}</p>
          <div class="settings-group">
            ${row('download', t('settings.export'), t('settings.exportHint'),
              `<button type="button" class="btn btn-sm" data-act="export">${icon('download')}${esc(t('settings.export'))}</button>`)}
            ${row('upload', t('settings.import'), t('settings.importHint'),
              `<label class="btn btn-sm">${icon('upload')}${esc(t('settings.import'))}<input type="file" accept="application/json,.json" data-act="import" class="sr-only"></label>`)}
            ${row('chart', t('demo.settingsLabel'), t('demo.settingsHint'),
              demoActive() ? `<button type="button" class="btn btn-sm" data-act="demo-exit">${esc(t('demo.exit'))}</button>`
                : `<button type="button" class="btn btn-sm" data-act="demo">${icon('upload')}${esc(t('demo.import'))}</button>`)}
            ${row('trash', t('settings.reset'), t('settings.resetHint'),
              `<button type="button" class="btn btn-sm btn-danger" data-act="reset">${icon('trash')}${esc(t('settings.reset'))}</button>`)}
          </div>
        </div>

        <p class="faint" style="text-align:center;font-size:13px">${esc(t('app.name'))} · ${esc(t('settings.version'))} ${esc(t('app.version'))}</p>
      </section>`;

    const dm = el.querySelector('[data-act="demo"]');
    if (dm) dm.addEventListener('click', openDemoSheet);
    const dx = el.querySelector('[data-act="demo-exit"]');
    if (dx) dx.addEventListener('click', () => exitDemo());
    const so = el.querySelector('[data-act="signout"]');
    if (so) so.addEventListener('click', () => signOut());

    // Segmentados e swatches
    el.querySelectorAll('[data-setting]').forEach((group) => {
      group.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-value]');
        if (!btn) return;
        const key = group.dataset.setting;
        if (getSettings()[key] === btn.dataset.value) return;
        group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        await updateSettings({ [key]: btn.dataset.value });
        toast(t('toast.saved'));
      });
    });

    // Descanso
    el.querySelectorAll('[data-rest]').forEach((b) => b.addEventListener('click', async () => {
      const cur = getSettings().restSeconds;
      const next = Math.min(REST_MAX, Math.max(REST_MIN, cur + Number(b.dataset.rest) * REST_STEP));
      if (next === cur) return;
      await updateSettings({ restSeconds: next });
      el.querySelector('[data-rest-out]').textContent = formatDuration(next, getLanguage());
    }));

    // Exportar
    el.querySelector('[data-act="export"]').addEventListener('click', async () => {
      const payload = await store.exportAll();
      const json = JSON.stringify(payload, null, 2);
      const fileName = `apex-dados-${new Date().toISOString().slice(0, 10)}.json`;
      openSheet({
        title: t('sheet.exportTitle'),
        content: `
          <p class="muted" style="margin-bottom:12px">${esc(t('sheet.exportText'))}</p>
          <textarea readonly spellcheck="false">${esc(json)}</textarea>
          <div class="sheet-actions">
            <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.close'))}</button>
            <button type="button" class="btn" data-copy>${icon('copy')}${esc(t('sheet.copy'))}</button>
            <button type="button" class="btn btn-primary" data-download>${icon('download')}${esc(t('sheet.download'))}</button>
          </div>`,
        onMount(sheet) {
          sheet.querySelector('[data-download]').addEventListener('click', () => {
            try {
              const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
              const a = document.createElement('a');
              a.href = url; a.download = fileName;
              document.body.appendChild(a); a.click(); a.remove();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch (e) { /* sem download: o texto continua disponível */ }
          });
          sheet.querySelector('[data-copy]').addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(json); toast(t('toast.copied')); }
            catch (e) { sheet.querySelector('textarea').select(); toast(t('toast.copyFail'), 'info'); }
          });
        }
      });
    });

    // Importar
    el.querySelector('[data-act="import"]').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        await store.importAll(payload);
        const imported = (payload.data && payload.data.settings) || {};
        await updateSettings({ ...DEFAULT_SETTINGS, ...imported });
        toast(t('toast.imported'));
      } catch (err) {
        toast(t('toast.importFail'), 'info');
      }
      e.target.value = '';
    });

    // Apagar tudo
    el.querySelector('[data-act="reset"]').addEventListener('click', () => {
      openSheet({
        title: t('sheet.resetTitle'),
        content: `
          <p class="muted">${esc(t('sheet.resetText'))}</p>
          <div class="sheet-actions">
            <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
            <button type="button" class="btn btn-danger" data-confirm>${icon('trash')}${esc(t('sheet.resetConfirm'))}</button>
          </div>`,
        onMount(sheet, close) {
          sheet.querySelector('[data-confirm]').addEventListener('click', async () => {
            await store.clearAll();
            close();
            await updateSettings({ ...DEFAULT_SETTINGS });
            toast(t('toast.reset'));
          });
        }
      });
    });
  }
};
