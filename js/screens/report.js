// Relatório do ciclo: destaques, consistência, força, corpo, exportar e nova triagem.
import { t, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast, openSheet } from '../ui/feedback.js';
import { getSettings } from '../data/settings.js';
import { getActivePlan, getPlan, listPlans, getProfile } from '../data/account.js';
import { loadCatalog, exerciseName } from '../data/catalog.js';
import { loadBody } from '../data/body.js';
import { setsSince, workoutsSince, buildReport, perExerciseSessions } from '../data/stats.js';
import { formatWeight, formatLength } from '../utils/units.js';
import triage from './triage.js';
import { lineChart, weekBars } from '../ui/charts.js';
import { deriveRows } from '../data/bodymetrics.js';
import { weightToUser } from '../utils/units.js';

const DAY = 864e5;

function fmtDate(d, lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}

function bodyText(f, c, s, lang) {
  const val = (v) => f === 'weight_kg' ? formatWeight(v, s.weightUnit, lang) : f === 'body_fat_pct' ? `${v.toFixed(1)}%` : formatLength(v, s.lengthUnit, lang);
  return `${val(c.first)} → ${val(c.last)}`;
}

function highlights(r, lang, unit) {
  const out = [];
  if (r.adherence !== null) {
    if (r.adherence >= 80) out.push(t('report.hlConsistency', { p: r.adherence, d: r.done, s: r.scheduled }));
    else if (r.adherence >= 60) out.push(t('report.hlConsistencyMid', { p: r.adherence }));
    else out.push(t('report.hlConsistencyLow', { p: r.adherence }));
  }
  const top = r.improved[0];
  if (top) {
    out.push(top.kind === 'load'
      ? t('report.hlStrength', { ex: exerciseName(top.id, lang), a: formatWeight(top.first, unit, lang), b: formatWeight(top.last, unit, lang), p: top.pct })
      : t('report.hlReps', { ex: exerciseName(top.id, lang), a: top.first, b: top.last }));
  }
  if (r.improved.length >= 2) out.push(t('report.hlImproved', { n: r.improved.length }));
  if (r.volumeTrend !== null && r.volumeTrend > 0) out.push(t('report.hlVolume', { p: r.volumeTrend }));
  if (r.streak >= 3) out.push(t('report.hlStreak', { n: r.streak }));
  if (r.bodyChanges.weight_kg) {
    const d = r.bodyChanges.weight_kg.delta;
    if (Math.abs(d) >= 0.5) out.push(t(d < 0 ? 'report.hlWeightDown' : 'report.hlWeightUp', { v: formatWeight(Math.abs(d), unit, lang) }));
  }
  if (r.bodyChanges.waist_cm && r.bodyChanges.waist_cm.delta <= -1) out.push(t('report.hlWaist', { v: formatLength(Math.abs(r.bodyChanges.waist_cm.delta), getSettings().lengthUnit, lang) }));
  if (!out.length) out.push(t('report.hlEmpty'));
  return out;
}

/** Imagem do relatório para compartilhar (1080 x 1350). */
async function shareImage(r, lang, unit, hl) {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#0B0F14'); bg.addColorStop(1, '#0E1A1A');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(180, 120, 20, 180, 120, 700); glow.addColorStop(0, 'rgba(20,184,166,.45)'); glow.addColorStop(1, 'rgba(20,184,166,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  const font = (w, s) => `${w} ${s}px -apple-system, "Segoe UI", Inter, Roboto, sans-serif`;
  const grad = g.createLinearGradient(80, 0, 400, 0); grad.addColorStop(0, '#14B8A6'); grad.addColorStop(1, '#34D399');
  // Marca
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'icons/icon-192.png'; });
    g.save(); g.beginPath(); g.roundRect(80, 80, 72, 72, 20); g.clip(); g.drawImage(img, 80, 80, 72, 72); g.restore();
  } catch (e) { g.fillStyle = grad; g.beginPath(); g.roundRect(80, 80, 72, 72, 20); g.fill(); }
  g.fillStyle = '#F8FAFC'; g.font = font(700, 40); g.fillText('Apex', 172, 130);
  // Título
  g.fillStyle = '#7A8798'; g.font = font(600, 28); g.fillText(t('report.eyebrow').toUpperCase(), 80, 250);
  g.fillStyle = '#F8FAFC'; g.font = font(700, 68); g.fillText(t('splits.' + r.plan.split), 80, 330);
  g.fillStyle = '#9DACBF'; g.font = font(500, 32); g.fillText(`${fmtDate(r.from, lang)} – ${fmtDate(r.to, lang)}`, 80, 385);
  // KPIs
  const k = [
    [t('dash.workouts'), String(r.done)],
    [t('dash.adherence'), r.adherence === null ? '—' : r.adherence + '%'],
    [t('dash.volume'), formatWeight(r.volume, unit, lang)],
    [t('dash.improved'), String(r.improved.length)]
  ];
  k.forEach(([label, value], i) => {
    const x = 80 + (i % 2) * 470, y = 450 + Math.floor(i / 2) * 200;
    g.fillStyle = 'rgba(22,27,34,.9)'; g.beginPath(); g.roundRect(x, y, 450, 180, 28); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#7A8798'; g.font = font(600, 24); g.fillText(label.toUpperCase(), x + 32, y + 56);
    g.fillStyle = '#F8FAFC'; g.font = font(700, 60); g.fillText(value, x + 32, y + 136);
  });
  // Destaques
  g.fillStyle = '#34D399'; g.font = font(700, 28); g.fillText(t('report.highlights').toUpperCase(), 80, 920);
  g.fillStyle = '#F8FAFC'; g.font = font(500, 32);
  let y = 975;
  const wrap = (text) => {
    const words = text.split(' '); let line = '';
    const lines = [];
    for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > 880) { lines.push(line); line = w; } else line = test; }
    if (line) lines.push(line);
    return lines;
  };
  for (const h of hl.slice(0, 4)) {
    const lines = wrap(h);
    g.fillStyle = '#14B8A6'; g.beginPath(); g.arc(92, y - 11, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#F8FAFC';
    for (const ln of lines) { if (y > H - 110) break; g.fillText(ln, 116, y); y += 44; }
    y += 14;
  }
  g.fillStyle = '#7A8798'; g.font = font(500, 26); g.fillText('pedroballoussier.github.io/apex-training', 80, H - 60);

  const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
  const file = new File([blob], 'apex-relatorio.png', { type: 'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: t('report.title') });
      return;
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'apex-relatorio.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast(t('report.imageSaved'));
}

const numFmt = (v, lang, d = 1) => Number(v).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const shortDate = (d, lang) => new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short' }).format(new Date(d));

/** Treinos por semana do ciclo (semana 1 = semana do início). */
function cycleWeeks(workouts, from, to) {
  const out = [];
  const start = new Date(from); start.setHours(0, 0, 0, 0);
  for (let a = new Date(start), i = 1; a <= to && i <= 16; i++) {
    const b = new Date(a); b.setDate(a.getDate() + 7);
    out.push({ label: t('report.weekShort', { n: i }), value: workouts.filter((w) => { const d = new Date(w.started_at); return d >= a && d < b; }).length });
    a = b;
  }
  return out;
}

/** Seção do corpo no ciclo: tabela início/fim e gráfico do peso com massa magra e gorda. */
function bodySection(body, profile, from, to, s, lang) {
  const lo = new Date(from.getTime() - 7 * DAY), hi = new Date(to.getTime() + DAY);
  const all = deriveRows(body, profile);
  const rows = all.filter((d) => { const x = new Date(d.date + 'T12:00:00'); return x >= lo && x <= hi; });
  const metrics = [
    ['weight_kg', (d) => d.weight, (v) => formatWeight(v, s.weightUnit, lang)],
    ['bmi', (d) => d.bmi, (v) => numFmt(v, lang)],
    ['fat', (d) => d.fat, (v) => `${numFmt(v, lang)}%`],
    ['lean', (d) => d.lean, (v) => formatWeight(v, s.weightUnit, lang)],
    ['fatMass', (d) => d.fatMass, (v) => formatWeight(v, s.weightUnit, lang)],
    ['whtr', (d) => d.whtr, (v) => numFmt(v, lang, 2)],
    ...['waist_cm', 'hip_cm', 'chest_cm', 'arm_cm', 'thigh_cm', 'neck_cm'].map((f) => [f, (d) => (d.raw[f] != null ? Number(d.raw[f]) : null), (v) => formatLength(v, s.lengthUnit, lang)])
  ];
  const lines = metrics.map(([k, get, fmt]) => {
    const list = rows.filter((d) => get(d) != null);
    if (list.length < 2) return '';
    const a = get(list[0]), b = get(list[list.length - 1]);
    const d = b - a;
    const delta = Math.abs(d) < 0.005 ? '—' : (d > 0 ? '+' : '−') + fmt(Math.abs(d));
    return `<tr><td>${esc(t('body.' + k))}</td><td class="num">${esc(fmt(a))}</td><td class="num">${esc(fmt(b))}</td><td class="num">${esc(delta)}</td></tr>`;
  }).filter(Boolean);
  if (!lines.length) return '';
  const chart = (get, color, height = 160, conv = (v) => weightToUser(v, s.weightUnit)) => {
    const list = rows.filter((d) => get(d) != null);
    if (list.length < 2) return '';
    return lineChart(list.map((d) => ({ label: shortDate(d.date + 'T12:00:00', lang), value: conv(get(d)) })),
      { color, height, labels: height > 130, format: (v) => `${numFmt(v, lang)} ${s.weightUnit}` });
  };
  const w = chart((d) => d.weight, 'var(--primary)');
  const lean = chart((d) => d.lean, '#38BDF8', 120);
  const fatM = chart((d) => d.fatMass, '#FBBF24', 120);
  return `
    <div class="card report-body">
      <div class="card-head"><div class="card-title">${icon('scale')}<h2>${esc(t('report.bodyCycle'))}</h2></div></div>
      <div class="table-wrap"><table class="rtable">
        <thead><tr><th></th><th>${esc(t('report.bodyStart'))}</th><th>${esc(t('report.bodyEnd'))}</th><th>${esc(t('report.bodyChange'))}</th></tr></thead>
        <tbody>${lines.join('')}</tbody></table></div>
      ${w ? `<div class="chart-sub" style="margin-top:14px">${esc(t('report.weightComp'))}</div>${w}` : ''}
      ${lean || fatM ? `<div class="comp-grid">
        ${lean ? `<div class="comp-mini"><div class="comp-mini-head"><span>${esc(t('body.lean'))}</span></div>${lean}</div>` : ''}
        ${fatM ? `<div class="comp-mini"><div class="comp-mini-head"><span>${esc(t('body.fatMass'))}</span></div>${fatM}</div>` : ''}
      </div>` : ''}
    </div>`;
}

export default {
  async render(el, planId) {
    const lang = getLanguage();
    const s = getSettings();
    const unit = s.weightUnit;
    el.innerHTML = '<section class="screen"><div class="center-state"><div class="spinner"></div></div></section>';
    const row = planId ? await getPlan(planId) : getActivePlan();
    if (!row) { location.hash = '#progresso'; return; }
    const isActive = row.status === 'active';
    const start = new Date(row.started_at || row.created_at);
    const endLimit = row.ended_at ? new Date(row.ended_at) : new Date(Date.now() + DAY);
    const [sets, workouts, body, plans] = await Promise.all([
      setsSince(start, new Date(endLimit.getTime() + DAY)), workoutsSince(start, new Date(endLimit.getTime() + DAY)), loadBody(), listPlans(), loadCatalog()
    ]);
    if (!el.isConnected) return;
    const planWorkouts = workouts.filter((w) => !w.plan_id || w.plan_id === row.id);
    const ids = new Set(planWorkouts.map((w) => w.id));
    const planSets = sets.filter((x) => ids.has(x.workout_id));
    const r = buildReport(row, planWorkouts, planSets, body);
    const hl = highlights(r, lang, unit);
    const name = getProfile()?.name?.split(' ')[0] || '';
    const topLifts = [...perExerciseSessions(planSets)].filter(([, sess]) => sess.length >= 3 && sess.some((x) => x.best > 0))
      .sort((a, b) => b[1].length - a[1].length).slice(0, 4);
    const bodyHtml = bodySection(body, getProfile() || {}, r.from, r.to, s, lang);
    const past = plans.filter((p) => p.id !== row.id && p.status === 'archived');

    el.innerHTML = `
      <section class="screen report">
        <header class="screen-head">
          <span class="eyebrow">${esc(t('report.eyebrow'))}${isActive && !r.info.ended ? ' · ' + esc(t('report.partial')) : ''}</span>
          <h1>${esc(t('splits.' + r.plan.split))}</h1>
          <p class="muted">${esc(fmtDate(r.from, lang))} – ${esc(fmtDate(r.to, lang))} · ${esc(t('plan.week', { n: r.info.week, w: r.info.weeks }))}</p>
        </header>

        <div class="card hl-card">
          <div class="card-head"><div class="card-title">${icon('sparkle')}<h2>${esc(name ? t('report.hlTitleName', { name }) : t('report.highlights'))}</h2></div></div>
          <ul class="feature-list">${hl.map((h) => `<li>${icon('check')}<span>${esc(h)}</span></li>`).join('')}</ul>
        </div>

        <div class="kpis kpis-4">
          <div class="kpi"><span class="kpi-label">${esc(t('dash.workouts'))}</span><span class="kpi-value num">${r.done}</span><span class="kpi-sub">${esc(t('report.ofScheduled', { n: r.scheduled }))}</span></div>
          <div class="kpi"><span class="kpi-label">${esc(t('dash.adherence'))}</span><span class="kpi-value num">${r.adherence === null ? '—' : r.adherence + '%'}</span><span class="kpi-sub">${esc(t('report.bestStreak', { n: r.streak }))}</span></div>
          <div class="kpi"><span class="kpi-label">${esc(t('dash.volume'))}</span><span class="kpi-value num">${esc(formatWeight(r.volume, unit, lang))}</span><span class="kpi-sub">${esc(t('report.sets', { n: r.totalSets }))}</span></div>
          <div class="kpi"><span class="kpi-label">${esc(t('dash.improved'))}</span><span class="kpi-value num">${r.improved.length}</span><span class="kpi-sub">${esc(t('dash.exercises'))}</span></div>
        </div>

        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('report.strength'))}</span></div>
          ${r.exercises.length ? `<div class="table-wrap"><table class="rtable">
            <thead><tr><th>${esc(t('report.exercise'))}</th><th>${esc(t('report.start'))}</th><th>${esc(t('report.end'))}</th><th>${esc(t('report.change'))}</th></tr></thead>
            <tbody>${r.exercises.slice(0, 10).map((x) => `<tr>
              <td><a class="ex-link" href="#ex-${esc(x.id)}">${esc(exerciseName(x.id, lang))}</a></td>
              <td class="num">${esc(x.kind === 'load' ? formatWeight(x.first, unit, lang) : x.first + ' reps')}</td>
              <td class="num">${esc(x.kind === 'load' ? formatWeight(x.last, unit, lang) : x.last + ' reps')}</td>
              <td class="num ${x.delta > 0 ? 'gain' : x.delta < 0 ? 'loss' : ''}">${x.delta > 0 ? '+' : ''}${x.pct}%</td></tr>`).join('')}</tbody></table></div>`
            : `<p class="muted">${esc(t('report.noStrength'))}</p>`}
        </div>

        <div class="card">
          <div class="card-head"><div class="card-title">${icon('chart')}<h2>${esc(t('report.charts'))}</h2></div></div>
          <div class="chart-sub">${esc(t('report.weekly'))}</div>
          ${weekBars(cycleWeeks(planWorkouts, r.from, r.to), r.plan.daysPerWeek)}
          <p class="setting-hint">${esc(t('dash.goalLine', { n: r.plan.daysPerWeek }))}</p>
          ${topLifts.length ? `<div class="chart-sub" style="margin-top:16px">${esc(t('report.topLifts'))}</div>
            <p class="setting-hint">${esc(t('report.topLiftsHint'))}</p>
            <div class="lift-grid">${topLifts.map(([id, sess]) => `<div class="comp-mini"><div class="comp-mini-head"><a class="ex-link" href="#ex-${esc(id)}">${esc(exerciseName(id, lang))}</a></div>
              ${lineChart(sess.map((x) => ({ label: shortDate(x.date, lang), value: weightToUser(x.best, unit) })), { height: 120, labels: false, format: (v) => `${numFmt(v, lang)} ${unit}` })}</div>`).join('')}</div>` : ''}
        </div>

        ${bodyHtml || `<div class="card"><div class="card-head"><span class="eyebrow">${esc(t('report.body'))}</span></div>
          <p class="muted">${esc(t('report.noBody'))}</p><a class="btn btn-sm" href="#corpo" style="margin-top:10px">${icon('plus')}${esc(t('body.add'))}</a></div>`}

        <div class="report-actions no-print">
          <button type="button" class="btn" data-share>${icon('upload')}${esc(t('report.shareImage'))}</button>
          <button type="button" class="btn" data-print>${icon('download')}${esc(t('report.pdf'))}</button>
        </div>

        ${isActive ? `
        <div class="card next-card no-print">
          <div class="card-head"><div class="card-title">${icon('sparkle')}<h2>${esc(t('report.nextTitle'))}</h2></div></div>
          <p class="muted">${esc(r.info.ended ? t('report.nextEnded') : t('report.nextEarly'))}</p>
          ${r.levelHint ? `<div class="sug up" style="margin-top:10px">${icon('trophy')}<span>${esc(t('report.levelHint', { level: t('triage.level.' + r.levelHint) }))}</span></div>` : ''}
          <button type="button" class="btn ${r.info.ended ? 'btn-primary' : ''} btn-block" data-next style="margin-top:12px">${esc(r.info.ended ? t('report.newTriage') : t('report.endEarly'))}</button>
        </div>` : ''}

        ${past.length ? `
        <div class="card no-print">
          <div class="card-head"><span class="eyebrow">${esc(t('report.pastCycles'))}</span></div>
          <ul class="hist-list">${past.map((p) => `<li><a class="hist-date" href="#rel-${esc(p.id)}">${esc(t('splits.' + p.data.split))}</a>
            <span class="hist-sets">${esc(fmtDate(new Date(p.started_at), lang))} – ${esc(p.ended_at ? fmtDate(new Date(p.ended_at), lang) : '')}</span></li>`).join('')}</ul>
        </div>` : ''}
      </section>`;

    const shareBtn = el.querySelector('[data-share]');
    shareBtn.addEventListener('click', async () => {
      shareBtn.disabled = true;
      try { await shareImage(r, lang, unit, hl); } catch (err) { toast(t('auth.errGeneric'), 'info'); }
      shareBtn.disabled = false;
    });
    el.querySelector('[data-print]').addEventListener('click', () => { try { window.print(); } catch (e) {} });

    const next = el.querySelector('[data-next]');
    if (next) next.addEventListener('click', () => {
      const go = () => {
        try { sessionStorage.setItem('apex:levelHint', r.levelHint || ''); } catch (e) {}
        triage.reset(); location.hash = '#triagem';
      };
      if (r.info.ended) return go();
      openSheet({
        title: t('report.endEarlyTitle'),
        content: `<p class="muted">${esc(t('report.endEarlyText'))}</p><div class="sheet-actions">
          <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
          <button type="button" class="btn btn-primary" data-ok>${esc(t('report.newTriage'))}</button></div>`,
        onMount: (sheet, close) => sheet.querySelector('[data-ok]').addEventListener('click', () => { close(); go(); })
      });
    });
  }
};
