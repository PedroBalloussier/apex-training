// Progresso: ciclo, consistência, volume, evolução por exercício, recordes e corpo.
import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { getSettings } from '../data/settings.js';
import { getActivePlan } from '../data/account.js';
import { loadCatalog, getExercise, exerciseName } from '../data/catalog.js';
import { loadBody } from '../data/body.js';
import { setsSince, workoutsSince, cycleInfo, buildReport, perExerciseSessions, setsByMuscle, weeklyCounts, dayKey } from '../data/stats.js';
import { formatWeight, weightToUser } from '../utils/units.js';
import { lineChart, weekBars, hBars, heatmap } from '../ui/charts.js';
import { dayForDate } from '../engine/generator.js';

let selectedEx = null;

export function cycleCard(row, lang, { compact = false } = {}) {
  const info = cycleInfo(row);
  const near = info.daysLeft <= 7;
  const fmt = (d) => new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short' }).format(d);
  return `
    <div class="card cycle-card ${near ? 'near' : ''}">
      <div class="card-head">
        <div><span class="eyebrow">${esc(t('dash.cycle'))}</span><h2>${esc(t('splits.' + row.data.split))}</h2></div>
        <span class="chip num">${esc(t('plan.week', { n: info.week, w: info.weeks }))}</span>
      </div>
      <div class="progress big"><i style="width:${info.pct.toFixed(1)}%"></i></div>
      <div class="cycle-dates"><span>${esc(fmt(info.start))}</span>
        <span>${esc(info.ended ? t('dash.ended') : t('dash.daysLeft', { n: info.daysLeft }))}</span><span>${esc(fmt(info.end))}</span></div>
      ${near ? `<div class="sug up" style="margin-top:12px">${icon('trophy')}<span>${esc(info.ended ? t('dash.endedText') : t('dash.nearText'))}</span></div>` : ''}
      ${!compact || near ? `<a class="btn ${near ? 'btn-primary' : ''} btn-block" href="#relatorio" style="margin-top:12px">${icon('chart')}${esc(near ? t('dash.seeReport') : t('dash.partialReport'))}</a>` : ''}
    </div>`;
}

export default {
  async render(el) {
    const row = getActivePlan();
    const lang = getLanguage();
    const unit = getSettings().weightUnit;
    if (!row) {
      el.innerHTML = `<section class="screen"><header class="screen-head"><span class="eyebrow">${esc(t('nav.dashboard'))}</span><h1>${esc(t('nav.dashboard'))}</h1></header>
        <div class="card"><div class="empty"><div class="empty-icon">${icon('chart')}</div><h3>${esc(t('plan.noPlan'))}</h3><p>${esc(t('dash.noPlanText'))}</p>
        <a class="btn btn-primary" href="#triagem">${icon('sparkle')}${esc(t('plan.startTriage'))}</a></div></div></section>`;
      return;
    }
    el.innerHTML = '<section class="screen"><div class="center-state"><div class="spinner"></div></div></section>';
    const info = cycleInfo(row);
    const since16 = new Date(Date.now() - 16 * 7 * 864e5);
    const from = info.start < since16 ? info.start : since16;
    const [sets, workouts, body] = await Promise.all([setsSince(from), workoutsSince(from), loadBody(), loadCatalog()]);
    if (!el.isConnected) return;

    const cycleSets = sets.filter((s) => new Date(s.created_at) >= info.start);
    const cycleWorkouts = workouts.filter((w) => new Date(w.started_at) >= info.start);
    const report = buildReport(row, cycleWorkouts, cycleSets, body);

    // Heatmap: % da sessão planejada cumprida por dia, Hall em dourado, faltas com contorno.
    const doneByWorkout = new Map();
    for (const st of sets) doneByWorkout.set(st.workout_id, (doneByWorkout.get(st.workout_id) || 0) + 1);
    const perDay = new Map();
    for (const w of workouts) {
      const k = dayKey(w.started_at);
      const planned = (w.exercises || []).reduce((n, x) => n + (Number(x.sets) || 0), 0);
      const done = doneByWorkout.get(w.id) || 0;
      const cur = perDay.get(k) || { planned: 0, done: 0, hall: false };
      cur.planned += planned; cur.done += done;
      if (String(w.day_type).startsWith('hall:')) cur.hall = true;
      perDay.set(k, cur);
    }
    const cells = new Map();
    for (const [k, v] of perDay) {
      const pct = v.planned ? Math.min(1, v.done / v.planned) : 1;
      const level = pct >= 0.999 ? 4 : pct >= 0.7 ? 3 : pct >= 0.4 ? 2 : 1;
      cells.set(k, { level, hall: v.hall, tip: v.hall ? t('heat.hall') : `${Math.round(pct * 100)}%` });
    }
    // Faltas: dias de treino do plano ativo, do início do ciclo até ontem, sem sessão.
    const yesterday = new Date(); yesterday.setHours(0, 0, 0, 0); yesterday.setDate(yesterday.getDate() - 1);
    for (let d = new Date(info.start); d <= yesterday; d.setDate(d.getDate() + 1)) {
      const k = dayKey(d);
      if (!cells.has(k) && dayForDate(row.data, d)) cells.set(k, { level: 0, missed: true, tip: t('heat.missed') });
    }
    const wdNames = tl('weekdays');
    const hm = heatmap(cells, 16, dayKey, [1, 2, 3, 4, 5, 6, 0].map((d) => wdNames[d]));

    // Meta semanal
    const weeks = weeklyCounts(workouts, 8).map((w) => ({ label: new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: '2-digit' }).format(w.start), value: w.value }));
    const goal = row.data.daysPerWeek;
    const hits = weeks.filter((w) => w.value >= goal).length;

    // Volume por grupo (últimos 28 dias)
    const last28 = sets.filter((s) => Date.now() - new Date(s.created_at) < 28 * 864e5);
    const muscles = setsByMuscle(last28, getExercise).slice(0, 8).map(([m, n]) => ({ label: t('muscles.' + m), value: n, sub: t('dash.setsN', { n }) }));

    // Evolução por exercício
    const perEx = perExerciseSessions(sets);
    const exOptions = [...perEx.entries()].filter(([, s]) => s.some((x) => x.best > 0)).sort((a, b) => b[1].length - a[1].length);
    if (!selectedEx || !perEx.has(selectedEx)) selectedEx = exOptions[0] ? exOptions[0][0] : null;
    const exSess = selectedEx ? perEx.get(selectedEx).slice(-16) : [];
    const exChart = exSess.length >= 2 ? lineChart(exSess.map((s) => ({
      label: new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(s.date)),
      value: weightToUser(s.best, unit)
    })), { format: (v) => `${v.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')} ${unit}` }) : `<p class="muted">${esc(t('dash.needTwo'))}</p>`;

    const lastW = [...body].reverse().find((r) => r.weight_kg != null);
    const firstW = body.find((r) => r.weight_kg != null);

    el.innerHTML = `
      <section class="screen">
        <header class="screen-head"><span class="eyebrow">${esc(t('nav.dashboard'))}</span><h1>${esc(t('dash.title'))}</h1></header>

        ${cycleCard(row, lang)}

        <div class="kpis kpis-4">
          <div class="kpi"><span class="kpi-label">${esc(t('dash.workouts'))}</span><span class="kpi-value num">${report.done}</span><span class="kpi-sub">${esc(t('dash.inCycle'))}</span></div>
          <div class="kpi"><span class="kpi-label">${esc(t('dash.adherence'))}</span><span class="kpi-value num">${report.adherence === null ? '—' : report.adherence + '%'}</span><span class="kpi-sub">${esc(t('dash.ofPlanned', { n: report.scheduled }))}</span></div>
          <div class="kpi"><span class="kpi-label">${esc(t('dash.volume'))}</span><span class="kpi-value num">${esc(formatWeight(report.volume, unit, lang))}</span><span class="kpi-sub">${esc(t('dash.inCycle'))}</span></div>
          <div class="kpi"><span class="kpi-label">${esc(t('dash.improved'))}</span><span class="kpi-value num">${report.improved.length}</span><span class="kpi-sub">${esc(t('dash.exercises'))}</span></div>
        </div>

        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('dash.consistency'))}</span><span class="chip">${esc(t('dash.weeks16'))}</span></div>
          ${hm}
          <div class="hm-legend"><span>${esc(t('dash.less'))}</span><i class="hm l0"></i><i class="hm l1"></i><i class="hm l2"></i><i class="hm l3"></i><i class="hm l4"></i><span>${esc(t('dash.more'))}</span>
            <span class="lg-sep"></span><i class="hm hall"></i><span>${esc(t('heat.hall'))}</span><span class="lg-sep"></span><i class="hm miss"></i><span>${esc(t('heat.missed'))}</span></div>
          <p class="setting-hint hm-hint">${esc(t('heat.hint'))}</p>
        </div>

        <div class="grid grid-2">
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('dash.weeklyGoal'))}</span><span class="chip num">${esc(t('dash.goalHits', { n: hits, t: weeks.length }))}</span></div>
            ${weekBars(weeks, goal)}
            <p class="setting-hint">${esc(t('dash.goalLine', { n: goal }))}</p>
          </div>
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('dash.byMuscle'))}</span><span class="chip">${esc(t('dash.last28'))}</span></div>
            ${muscles.length ? hBars(muscles) : `<p class="muted">${esc(t('dash.noData'))}</p>`}
          </div>
        </div>

        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('dash.exerciseProgress'))}</span>
            ${selectedEx ? `<a class="btn btn-sm btn-ghost" href="#ex-${esc(selectedEx)}">${esc(t('dash.details'))}${icon('chevron')}</a>` : ''}</div>
          ${exOptions.length ? `
            <select class="input" data-ex-select aria-label="${esc(t('dash.exerciseProgress'))}" style="margin-bottom:10px">
              ${exOptions.map(([id, s]) => `<option value="${esc(id)}" ${id === selectedEx ? 'selected' : ''}>${esc(exerciseName(id, lang))} (${s.length})</option>`).join('')}
            </select>${exChart}` : `<p class="muted">${esc(t('dash.noData'))}</p>`}
        </div>

        <div class="grid grid-2">
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('dash.topGains'))}</span></div>
            ${report.improved.length ? `<ul class="hist-list">${report.improved.slice(0, 6).map((x) => `
              <li><a class="hist-date" href="#ex-${esc(x.id)}">${esc(exerciseName(x.id, lang))}</a>
              <span class="hist-sets num">${esc(x.kind === 'load' ? `${formatWeight(x.first, unit, lang)} → ${formatWeight(x.last, unit, lang)}` : `${x.first} → ${x.last} reps`)} <span class="gain">+${x.pct}%</span></span></li>`).join('')}</ul>`
              : `<p class="muted">${esc(t('dash.noGains'))}</p>`}
          </div>
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('body.title'))}</span><a class="btn btn-sm btn-ghost" href="#corpo">${esc(t('dash.update'))}${icon('chevron')}</a></div>
            ${lastW ? `<div class="kpi" style="box-shadow:none"><span class="kpi-label">${esc(t('body.weight_kg'))}</span>
              <span class="kpi-value num">${esc(formatWeight(Number(lastW.weight_kg), unit, lang))}</span>
              <span class="kpi-sub">${esc(firstW && firstW !== lastW ? `${t('body.since')} ${formatWeight(Number(firstW.weight_kg), unit, lang)}` : t('body.firstEntry'))}</span></div>`
              : `<p class="muted">${esc(t('dash.noBody'))}</p><a class="btn btn-sm" href="#corpo" style="margin-top:10px">${icon('plus')}${esc(t('body.add'))}</a>`}
          </div>
        </div>
      </section>`;

    const sel = el.querySelector('[data-ex-select]');
    if (sel) sel.addEventListener('change', () => { selectedEx = sel.value; this.render(el); });
  }
};
