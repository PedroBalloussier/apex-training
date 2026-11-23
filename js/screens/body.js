// Corpo: indicadores, evolução por medida, variação no período e histórico.
import { t, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast, openSheet } from '../ui/feedback.js';
import { getSettings } from '../data/settings.js';
import { getProfile, getActivePlan } from '../data/account.js';
import { loadBody, saveMeasurement, deleteMeasurement, BODY_FIELDS } from '../data/body.js';
import { deriveRows, bmiBand, whtrBand, movingAverage } from '../data/bodymetrics.js';
import { cycleInfo } from '../data/stats.js';
import { weightToUser, weightFromUser, lengthToUser, lengthFromUser, formatWeight, formatLength } from '../utils/units.js';
import { lineChart } from '../ui/charts.js';
import { coachTip } from '../ui/coach.js';
import { collapsible, bindCollapsibles } from '../ui/collapse.js';

const isLength = (f) => f.endsWith('_cm');
const fmtDate = (d, lang) => new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short' }).format(new Date(d + 'T12:00:00'));
const num = (v, lang, digits = 1) => Number(v).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

// Medidas do seletor do gráfico, na ordem dos chips.
const METRICS = ['weight', 'bmi', 'fat', 'waist_cm', 'whtr', 'hip_cm', 'chest_cm', 'arm_cm', 'thigh_cm', 'neck_cm'];
const view = { metric: 'weight', period: null };

function display(f, v, s, lang) {
  if (v == null) return '—';
  if (f === 'weight_kg') return formatWeight(Number(v), s.weightUnit, lang);
  if (f === 'body_fat_pct') return `${num(v, lang)}%`;
  return formatLength(Number(v), s.lengthUnit, lang);
}

function metricLabel(m) {
  if (m === 'weight') return t('body.weight_kg');
  if (m.endsWith('_cm')) return t('body.' + m);
  return t('body.' + m);
}

/** Valor de uma medida numa linha derivada, já na unidade do usuário. */
function valueOf(m, d, s) {
  if (m === 'weight') return d.weight != null ? weightToUser(d.weight, s.weightUnit) : null;
  if (m === 'bmi') return d.bmi;
  if (m === 'whtr') return d.whtr;
  if (m === 'fat') return d.fat;
  if (m === 'lean') return d.lean != null ? weightToUser(d.lean, s.weightUnit) : null;
  if (m === 'fatMass') return d.fatMass != null ? weightToUser(d.fatMass, s.weightUnit) : null;
  const v = d.raw[m];
  return v != null ? lengthToUser(Number(v), s.lengthUnit) : null;
}

function formatter(m, s, lang) {
  if (m === 'bmi') return (v) => num(v, lang);
  if (m === 'whtr') return (v) => num(v, lang, 2);
  if (m === 'fat') return (v) => `${num(v, lang)}%`;
  if (m === 'weight' || m === 'lean' || m === 'fatMass') return (v) => `${num(v, lang)} ${s.weightUnit}`;
  return (v) => `${num(v, lang)} ${s.lengthUnit}`;
}

function signed(d, fmt) {
  if (Math.abs(d) < 0.05) return t('body.noChange');
  return (d > 0 ? '+' : '−') + fmt(Math.abs(d));
}

export default {
  async render(el) {
    const lang = getLanguage();
    const s = getSettings();
    const profile = getProfile() || {};
    el.innerHTML = '<section class="screen"><div class="center-state"><div class="spinner"></div></div></section>';
    const rows = await loadBody();
    if (!el.isConnected) return;
    const derived = deriveRows(rows, profile);
    const latest = derived[derived.length - 1] || null;
    const today = new Date();
    const todayIso = new Date(today.getTime() - today.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

    const plan = getActivePlan();
    const cycleStart = plan ? cycleInfo(plan).start : null;
    if (!view.period) view.period = cycleStart ? 'cycle' : 'all';
    if (view.period === 'cycle' && !cycleStart) view.period = 'all';

    const inPeriod = () => {
      let from = null;
      if (view.period === 'w4') { from = new Date(); from.setDate(from.getDate() - 28); from.setHours(0, 0, 0, 0); }
      if (view.period === 'cycle') from = cycleStart;
      return from ? derived.filter((d) => new Date(d.date + 'T12:00:00') >= from) : derived;
    };

    // ---------- KPIs ----------
    const firstLast = (list, m) => {
      const withV = list.filter((d) => valueOf(m, d, s) != null);
      return withV.length ? [withV[0], withV[withV.length - 1]] : [null, null];
    };
    const kpiDelta = (m) => {
      const [a, b] = firstLast(inPeriod(), m);
      if (!a || !b || a === b) return null;
      return signed(valueOf(m, b, s) - valueOf(m, a, s), formatter(m, s, lang));
    };
    const kpi = (label, value, sub, cls = '') => `<div class="kpi ${cls}"><span class="kpi-label">${esc(label)}</span>
      <span class="kpi-value num">${esc(value)}</span><span class="kpi-sub">${esc(sub)}</span></div>`;
    const lastWith = (m) => [...derived].reverse().find((d) => valueOf(m, d, s) != null);
    const periodWord = t('body.period.' + view.period).toLowerCase();

    const wRow = lastWith('weight');
    const bRow = lastWith('bmi');
    const hRow = lastWith('whtr');
    const fRow = lastWith('fat');
    const lRow = lastWith('lean');
    const waistRow = lastWith('waist_cm');
    const withPeriod = (d) => (d ? `${d} · ${periodWord}` : t('body.noData'));

    const kpis = [
      kpi(t('body.weight_kg'), wRow ? formatter('weight', s, lang)(valueOf('weight', wRow, s)) : '—', withPeriod(kpiDelta('weight'))),
      kpi(t('body.bmi'), bRow ? num(bRow.bmi, lang) : '—',
        bRow ? t('body.bmiBand.' + bmiBand(bRow.bmi)) : (profile.height_cm ? t('body.noData') : t('body.needHeight'))),
      kpi(t('body.whtr'), hRow ? num(hRow.whtr, lang, 2) : '—',
        hRow ? t('body.whtrBand.' + whtrBand(hRow.whtr)) : (profile.height_cm ? t('body.needWaist') : t('body.needHeight')),
        hRow ? 'kpi-' + whtrBand(hRow.whtr) : ''),
      kpi(t('body.fat'), fRow ? `${num(fRow.fat, lang)}%` : '—',
        fRow ? (kpiDelta('fat') ? `${kpiDelta('fat')} · ${periodWord}` : t(fRow.fatSource === 'navy' ? 'body.fatEstimated' : 'body.fatLogged')) : t('body.fatNeed')),
      kpi(t('body.lean'), lRow ? formatter('lean', s, lang)(valueOf('lean', lRow, s)) : '—', lRow ? withPeriod(kpiDelta('lean')) : t('body.fatNeed')),
      kpi(t('body.waist_cm'), waistRow ? formatter('waist_cm', s, lang)(valueOf('waist_cm', waistRow, s)) : '—', withPeriod(kpiDelta('waist_cm')))
    ].join('');

    const usesNavy = derived.some((d) => d.fatSource === 'navy');

    // ---------- Formulário e histórico ----------
    const field = (f) => {
      const unit = f === 'weight_kg' ? s.weightUnit : f === 'body_fat_pct' ? '%' : s.lengthUnit;
      return `<div class="field"><label for="b-${f}">${esc(t('body.' + f))}</label>
        <div class="input-unit"><input class="input num" id="b-${f}" name="${f}" type="number" inputmode="decimal" step="0.1" min="0"><span>${esc(unit)}</span></div></div>`;
    };

    el.innerHTML = `
      <section class="screen">
        <header class="screen-head">
          <span class="eyebrow">${esc(t('nav.dashboard'))}</span>
          <h1>${esc(t('body.title'))}</h1>
          <p class="muted">${esc(t('body.subtitle'))}</p>
        </header>

        <div class="seg seg-block" role="group" aria-label="${esc(t('body.evolution'))}">
          ${['w4', 'cycle', 'all'].filter((p) => p !== 'cycle' || cycleStart).map((p) => `<button type="button" data-period="${p}" aria-pressed="${view.period === p}">${esc(t('body.period.' + p))}</button>`).join('')}
        </div>

        <div class="kpis">${kpis}</div>
        ${bRow ? `<p class="setting-hint body-note">${icon('info')}<span>${esc(t('body.bmiNote'))}</span></p>` : ''}

        ${derived.length ? `
        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('body.evolution'))}</span></div>
          <div class="chips metric-chips">${METRICS.map((m) => `<button type="button" class="chip-btn" data-metric="${m}" aria-pressed="${view.metric === m}">${esc(metricLabel(m))}</button>`).join('')}</div>
          <div class="body-chart"></div>
        </div>

        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('body.changes'))}</span></div>
          <div class="body-changes"></div>
        </div>` : ''}

        ${collapsible({ key: 'body-add', head: `<div class="card-title">${icon('plus')}<h2>${esc(t('body.add'))}</h2></div>`, body: `
          <form class="form" novalidate>
            <div class="field"><label for="b-date">${esc(t('body.date'))}</label>
              <input class="input" id="b-date" name="measured_on" type="date" value="${todayIso}" max="${todayIso}"></div>
            <div class="form-row">${field('weight_kg')}${field('body_fat_pct')}</div>
            <div class="form-row">${field('waist_cm')}${field('neck_cm')}</div>
            <div class="form-row">${field('hip_cm')}${field('chest_cm')}</div>
            <div class="form-row">${field('arm_cm')}${field('thigh_cm')}</div>
            <p class="setting-hint">${esc(t('body.hint'))}</p>
            <div class="form-error" hidden></div>
            <button class="btn btn-primary btn-block" type="submit">${esc(t('body.save'))}</button>
          </form>` })}

        ${rows.length ? `
        ${collapsible({ key: 'body-hist', head: `<span class="eyebrow">${esc(t('body.history'))}</span>`, extra: `<span class="chip num">${rows.length}</span>`, body: `
          <ul class="hist-list">${[...rows].reverse().slice(0, 20).map((r) => `
            <li><span class="hist-date">${esc(fmtDate(r.measured_on, lang))}</span>
              <span class="hist-sets num">${esc(BODY_FIELDS.filter((f) => r[f] != null).map((f) => display(f, r[f], s, lang)).join('  ·  '))}</span>
              <button type="button" class="icon-btn" data-del="${esc(r.id)}" aria-label="${esc(t('body.delete'))}">${icon('trash')}</button></li>`).join('')}
          </ul>` })}` : ''}
      </section>`;
    bindCollapsibles(el);
    coachTip('body');

    // ---------- Gráfico e variação (re-render parcial) ----------
    const chartBox = el.querySelector('.body-chart');
    const changesBox = el.querySelector('.body-changes');

    const chartFor = (m, list, opts = {}) => {
      const pts = list.filter((d) => valueOf(m, d, s) != null);
      if (pts.length < 2) return null;
      const points = pts.slice(-40).map((d) => ({ label: fmtDate(d.date, lang), value: valueOf(m, d, s) }));
      const dates = pts.slice(-40).map((d) => d.date);
      const o = { format: formatter(m, s, lang), ...opts };
      if (m === 'weight' && points.length >= 4) o.overlay = movingAverage(points.map((p) => p.value), dates, 14);
      if (m === 'bmi') o.band = [18.5, 24.9];
      if (m === 'whtr') o.band = [0.4, 0.5];
      return lineChart(points, o);
    };

    const drawChart = () => {
      if (!chartBox) return;
      const list = inPeriod();
      const m = view.metric;
      let html = '';
      html = chartFor(m, list) || '';
      const legend = [];
      const hasComp = m === 'weight' && list.filter((d) => d.lean != null).length >= 2;
      if (m === 'weight' && html) legend.push(`<span class="legend-item"><i class="lg-dash"></i>${esc(t('body.avg'))}</span>`);
      // Peso = massa magra + massa gorda: cada uma com a própria escala, para a variação aparecer.
      let comp = '';
      if (hasComp && html) {
        const mini = (k, color) => {
          const [a, b] = firstLast(list, k);
          const fmt = formatter(k, s, lang);
          return `<div class="comp-mini"><div class="comp-mini-head"><span>${esc(t('body.' + k))}</span>
            <b class="num">${esc(signed(valueOf(k, b, s) - valueOf(k, a, s), fmt))}</b></div>${chartFor(k, list, { color, height: 120, labels: false }) || ''}</div>`;
        };
        comp = `<div class="comp-grid">${mini('lean', '#38BDF8')}${mini('fatMass', '#FBBF24')}</div>`;
      }
      if ((m === 'bmi' || m === 'whtr') && html) legend.push(`<span class="legend-item"><i class="lg-band"></i>${esc(t('body.healthy'))}</span>`);
      const note = (m === 'fat' || (m === 'weight' && hasComp)) && usesNavy
        ? `<p class="setting-hint">${esc(t('body.fatNote', { hip: profile.sex === 'female' ? t('body.fatNoteHip') : '' }))}</p>` : '';
      chartBox.innerHTML = html
        ? `${html}${legend.length ? `<div class="chart-legend">${legend.join('')}</div>` : ''}${comp}${note}`
        : `<p class="muted">${esc(t('body.needTwo'))}</p>`;
    };

    const drawChanges = () => {
      if (!changesBox) return;
      const list = inPeriod();
      const items = ['weight', 'fat', 'lean', 'waist_cm', 'hip_cm', 'chest_cm', 'arm_cm', 'thigh_cm', 'neck_cm'].map((m) => {
        const [a, b] = firstLast(list, m);
        if (!a || !b || a === b) return '';
        const fmt = formatter(m, s, lang);
        const d = valueOf(m, b, s) - valueOf(m, a, s);
        return `<li><span class="chg-label">${esc(metricLabel(m))}</span>
          <span class="chg-vals num">${esc(fmt(valueOf(m, a, s)))} → ${esc(fmt(valueOf(m, b, s)))}</span>
          <span class="chg-delta num ${d > 0.05 ? 'up' : d < -0.05 ? 'down' : ''}">${esc(signed(d, fmt))}</span></li>`;
      }).filter(Boolean);
      changesBox.innerHTML = items.length ? `<ul class="chg-list">${items.join('')}</ul>` : `<p class="muted">${esc(t('body.needTwo'))}</p>`;
    };

    drawChart();
    drawChanges();

    el.querySelectorAll('[data-metric]').forEach((b) => b.addEventListener('click', () => {
      view.metric = b.dataset.metric;
      el.querySelectorAll('[data-metric]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      drawChart();
    }));
    el.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => {
      view.period = b.dataset.period;
      this.render(el);
    }));

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
        const v = f === 'weight_kg' ? weightFromUser(raw, s.weightUnit) : isLength(f) ? lengthFromUser(raw, s.lengthUnit) : Number(raw);
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
