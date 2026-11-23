// Corpo: medidas, evolução e histórico.
import { t, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast, openSheet } from '../ui/feedback.js';
import { getSettings } from '../data/settings.js';
import { loadBody, saveMeasurement, deleteMeasurement, BODY_FIELDS } from '../data/body.js';
import { weightToUser, weightFromUser, lengthToUser, lengthFromUser, formatWeight, formatLength } from '../utils/units.js';
import { lineChart } from '../ui/charts.js';

const isLength = (f) => f.endsWith('_cm');
const fmtDate = (d, lang) => new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short' }).format(new Date(d + 'T12:00:00'));

function display(f, v, s, lang) {
  if (v == null) return '—';
  if (f === 'weight_kg') return formatWeight(Number(v), s.weightUnit, lang);
  if (f === 'body_fat_pct') return `${Number(v).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')}%`;
  return formatLength(Number(v), s.lengthUnit, lang);
}

function delta(f, a, b, s, lang) {
  const d = b - a;
  if (Math.abs(d) < 0.05) return t('body.noChange');
  const sign = d > 0 ? '+' : '−';
  const abs = Math.abs(d);
  const txt = f === 'weight_kg' ? formatWeight(abs, s.weightUnit, lang) : f === 'body_fat_pct' ? `${abs.toFixed(1)} p.p.` : formatLength(abs, s.lengthUnit, lang);
  return sign + txt;
}

export default {
  async render(el) {
    const lang = getLanguage();
    const s = getSettings();
    el.innerHTML = '<section class="screen"><div class="center-state"><div class="spinner"></div></div></section>';
    const rows = await loadBody();
    if (!el.isConnected) return;
    const last = rows[rows.length - 1] || {};
    const firstOf = (f) => rows.find((r) => r[f] != null);
    const lastOf = (f) => [...rows].reverse().find((r) => r[f] != null);
    const today = new Date();
    const todayIso = new Date(today.getTime() - today.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

    const kpi = (f) => {
      const a = firstOf(f), b = lastOf(f);
      return `<div class="kpi"><span class="kpi-label">${esc(t('body.' + f))}</span>
        <span class="kpi-value num">${esc(b ? display(f, b[f], s, lang) : '—')}</span>
        <span class="kpi-sub">${esc(a && b && a !== b ? delta(f, Number(a[f]), Number(b[f]), s, lang) + ' ' + t('body.sinceStart') : t('body.noData'))}</span></div>`;
    };
    const field = (f) => {
      const unit = f === 'weight_kg' ? s.weightUnit : f === 'body_fat_pct' ? '%' : s.lengthUnit;
      return `<div class="field"><label for="b-${f}">${esc(t('body.' + f))}</label>
        <div class="input-unit"><input class="input num" id="b-${f}" name="${f}" type="number" inputmode="decimal" step="0.1" min="0"><span>${esc(unit)}</span></div></div>`;
    };
    const series = (f) => rows.filter((r) => r[f] != null).slice(-20).map((r) => ({
      label: fmtDate(r.measured_on, lang),
      value: f === 'weight_kg' ? weightToUser(Number(r[f]), s.weightUnit) : isLength(f) ? lengthToUser(Number(r[f]), s.lengthUnit) : Number(r[f])
    }));
    const wSeries = series('weight_kg');
    const waistSeries = series('waist_cm');

    el.innerHTML = `
      <section class="screen">
        <header class="screen-head">
          <span class="eyebrow">${esc(t('nav.dashboard'))}</span>
          <h1>${esc(t('body.title'))}</h1>
          <p class="muted">${esc(t('body.subtitle'))}</p>
        </header>

        <div class="kpis">${kpi('weight_kg')}${kpi('body_fat_pct')}${kpi('waist_cm')}</div>

        ${wSeries.length >= 2 || waistSeries.length >= 2 ? `
        <div class="grid grid-2">
          ${wSeries.length >= 2 ? `<div class="card"><div class="card-head"><span class="eyebrow">${esc(t('body.weight_kg'))}</span></div>
            ${lineChart(wSeries, { format: (v) => `${v.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')} ${s.weightUnit}` })}</div>` : ''}
          ${waistSeries.length >= 2 ? `<div class="card"><div class="card-head"><span class="eyebrow">${esc(t('body.waist_cm'))}</span></div>
            ${lineChart(waistSeries, { format: (v) => `${v.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')} ${s.lengthUnit}`, color: 'var(--accent)' })}</div>` : ''}
        </div>` : ''}

        <div class="card">
          <div class="card-head"><div class="card-title">${icon('plus')}<h2>${esc(t('body.add'))}</h2></div></div>
          <form class="form" novalidate>
            <div class="field"><label for="b-date">${esc(t('body.date'))}</label>
              <input class="input" id="b-date" name="measured_on" type="date" value="${todayIso}" max="${todayIso}"></div>
            <div class="form-row">${field('weight_kg')}${field('body_fat_pct')}</div>
            <div class="form-row">${field('waist_cm')}${field('hip_cm')}</div>
            <div class="form-row">${field('chest_cm')}${field('arm_cm')}</div>
            <div class="form-row">${field('thigh_cm')}<div></div></div>
            <p class="setting-hint">${esc(t('body.hint'))}</p>
            <div class="form-error" hidden></div>
            <button class="btn btn-primary btn-block" type="submit">${esc(t('body.save'))}</button>
          </form>
        </div>

        ${rows.length ? `
        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('body.history'))}</span></div>
          <ul class="hist-list">${[...rows].reverse().slice(0, 20).map((r) => `
            <li><span class="hist-date">${esc(fmtDate(r.measured_on, lang))}</span>
              <span class="hist-sets num">${esc(BODY_FIELDS.filter((f) => r[f] != null).map((f) => display(f, r[f], s, lang)).join('  ·  '))}</span>
              <button type="button" class="icon-btn" data-del="${esc(r.id)}" aria-label="${esc(t('body.delete'))}">${icon('trash')}</button></li>`).join('')}
          </ul>
        </div>` : ''}
      </section>`;

    const form = el.querySelector('form');
    const errBox = el.querySelector('.form-error');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errBox.hidden = true;
      const fd = new FormData(form);
      const row = { measured_on: fd.get('measured_on') || todayIso };
      let any = false;
      for (const f of BODY_FIELDS) {
        const raw = fd.get(f);
        if (raw === '' || raw == null) continue;
        let v = f === 'weight_kg' ? weightFromUser(raw, s.weightUnit) : isLength(f) ? lengthFromUser(raw, s.lengthUnit) : Number(raw);
        if (!Number.isFinite(v) || v <= 0) continue;
        row[f] = Math.round(v * 10) / 10; any = true;
      }
      if (!any) { errBox.textContent = t('body.errEmpty'); errBox.hidden = false; return; }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try { await saveMeasurement(row); toast(t('body.saved')); this.render(el); }
      catch (err) { errBox.textContent = t('body.errRange'); errBox.hidden = false; btn.disabled = false; }
    });

    el.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
      openSheet({
        title: t('body.deleteTitle'),
        content: `<p class="muted">${esc(t('body.deleteText'))}</p><div class="sheet-actions">
          <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
          <button type="button" class="btn btn-danger" data-ok>${icon('trash')}${esc(t('body.delete'))}</button></div>`,
        onMount: (sheet, close) => sheet.querySelector('[data-ok]').addEventListener('click', async () => {
          await deleteMeasurement(b.dataset.del); close(); this.render(el);
        })
      });
    }));
  }
};
