// Calendário mensal: dias previstos, treinos feitos, faltas e descanso.
import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { openSheet } from '../ui/feedback.js';
import { getSettings } from '../data/settings.js';
import { getActivePlan } from '../data/account.js';
import { loadCatalog, exerciseName } from '../data/catalog.js';
import { workoutsBetween, workoutSets } from '../data/workouts.js';
import { formatWeight, formatDuration, weightToUser } from '../utils/units.js';
import { exerciseList } from './plan.js';
import { startDay } from './start.js';
import { dayLabel } from '../data/labels.js';

let viewYear = null, viewMonth = null;

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

function scheduledDay(plan, date, planStart) {
  if (!plan || date < planStart) return null;
  const idx = plan.schedule.indexOf(date.getDay());
  return idx === -1 ? null : plan.days[idx % plan.days.length];
}

export default {
  async render(el) {
    const now = new Date();
    if (viewYear === null) { viewYear = now.getFullYear(); viewMonth = now.getMonth(); }
    const lang = getLanguage();
    const row = getActivePlan();
    const plan = row ? row.data : null;
    const planStart = row ? startOfDay(new Date(row.started_at || row.created_at)) : null;

    const first = new Date(viewYear, viewMonth, 1);
    const next = new Date(viewYear, viewMonth + 1, 1);
    el.innerHTML = `<section class="screen"><div class="center-state"><div class="spinner"></div></div></section>`;
    const [done] = await Promise.all([workoutsBetween(first, next), loadCatalog()]);
    if (!el.isConnected) return;

    const doneByDay = new Map();
    for (const w of done) {
      const k = dayKey(new Date(w.started_at));
      if (!doneByDay.has(k)) doneByDay.set(k, []);
      doneByDay.get(k).push(w);
    }

    const today = startOfDay(now);
    const rawMonth = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { month: 'long', year: 'numeric' }).format(first);
    const monthName = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
    const lead = (first.getDay() + 6) % 7; // semana começa na segunda
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const names = tl('weekdays');
    const headers = [1, 2, 3, 4, 5, 6, 0].map((d) => names[d]);

    let scheduledPast = 0, donePlanned = 0;
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push('<div class="cal-cell empty"></div>');
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const k = dayKey(date);
      const sched = scheduledDay(plan, date, planStart);
      const ws = doneByDay.get(k);
      const isToday = date.getTime() === today.getTime();
      const past = date < today;
      let state = 'rest', mark = '';
      if (ws) {
        state = 'done';
        mark = `<span class="cal-dot day-${esc(ws[0].day_key)}">${esc(ws[0].day_key)}</span>`;
      } else if (sched) {
        state = past ? 'missed' : 'planned';
        mark = `<span class="cal-dot ${past ? 'missed' : 'planned'} ${past ? '' : 'ring-' + sched.key}">${esc(sched.key)}</span>`;
      }
      if (sched && (past || isToday)) { if (past) scheduledPast++; if (ws) donePlanned++; }
      cells.push(`<button type="button" class="cal-cell ${state} ${isToday ? 'today' : ''}" data-date="${date.toISOString()}" aria-label="${esc(String(d))}">
        <span class="cal-num num">${d}</span>${mark}${ws ? `<span class="cal-check">${icon('check')}</span>` : ''}</button>`);
    }

    const total = done.length;
    const adherence = scheduledPast ? Math.round((Math.min(donePlanned, scheduledPast) / scheduledPast) * 100) : null;

    el.innerHTML = `
      <section class="screen">
        <header class="screen-head">
          <span class="eyebrow">${esc(t('nav.calendar'))}</span>
          <div class="cal-nav">
            <button type="button" class="icon-btn" data-nav="-1" aria-label="${esc(t('calendar.prev'))}"><span style="transform:rotate(180deg);display:grid">${icon('chevron')}</span></button>
            <h1 class="cal-title">${esc(monthName)}</h1>
            <button type="button" class="icon-btn" data-nav="1" aria-label="${esc(t('calendar.next'))}">${icon('chevron')}</button>
          </div>
        </header>

        <div class="kpis">
          <div class="kpi"><span class="kpi-label">${esc(t('calendar.done'))}</span><span class="kpi-value num">${total}</span><span class="kpi-sub">${esc(t('calendar.thisMonth'))}</span></div>
          <div class="kpi"><span class="kpi-label">${esc(t('calendar.adherence'))}</span><span class="kpi-value num">${adherence === null ? '—' : adherence + '%'}</span><span class="kpi-sub">${esc(t('calendar.ofPlanned'))}</span></div>
          <div class="kpi"><span class="kpi-label">${esc(t('calendar.missed'))}</span><span class="kpi-value num">${Math.max(0, scheduledPast - donePlanned)}</span><span class="kpi-sub">${esc(t('calendar.planned'))}</span></div>
        </div>

        <div class="card">
          <div class="cal-grid cal-head">${headers.map((h) => `<span>${esc(h)}</span>`).join('')}</div>
          <div class="cal-grid">${cells.join('')}</div>
          <div class="cal-legend">
            <span><i class="lg done"></i>${esc(t('calendar.legendDone'))}</span>
            <span><i class="lg planned"></i>${esc(t('calendar.legendPlanned'))}</span>
            <span><i class="lg missed"></i>${esc(t('calendar.legendMissed'))}</span>
            <span><i class="lg rest"></i>${esc(t('calendar.legendRest'))}</span>
          </div>
        </div>
        ${!plan ? `<p class="setting-hint" style="text-align:center">${esc(t('plan.noPlanText'))}</p>` : ''}
      </section>`;

    el.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => {
      viewMonth += Number(b.dataset.nav);
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      this.render(el);
    }));

    el.querySelectorAll('.cal-cell[data-date]').forEach((b) => b.addEventListener('click', async () => {
      const date = new Date(b.dataset.date);
      const ws = doneByDay.get(dayKey(date)) || [];
      const sched = scheduledDay(plan, date, planStart);
      const title = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
      const unit = getSettings().weightUnit;

      if (ws.length) {
        const blocks = [];
        for (const w of ws) {
          const sets = await workoutSets(w.id);
          const volume = sets.reduce((sum, s) => sum + Number(s.weight_kg || 0) * Number(s.reps || 0), 0);
          const byEx = new Map();
          for (const s of sets) { if (!byEx.has(s.exercise_id)) byEx.set(s.exercise_id, []); byEx.get(s.exercise_id).push(s); }
          blocks.push(`
            <div class="card-title" style="margin-bottom:10px"><span class="day-badge day-${esc(w.day_key)}">${esc(w.day_key)}</span><h3>${esc(dayLabel(w.day_type))}</h3></div>
            <div class="plan-meta" style="margin-bottom:10px">
              <span class="chip">${esc(formatDuration(Math.max(60, (w.duration_sec || 0) - ((w.duration_sec || 0) % 60)), lang))}</span>
              <span class="chip">${esc(t('session.setsDone'))}: ${sets.length}</span>
              <span class="chip">${esc(t('session.volume'))}: ${esc(formatWeight(volume, unit, lang))}</span>
            </div>
            <ul class="hist-list">${[...byEx.entries()].map(([id, ss]) => `
              <li><a class="hist-date" href="#ex-${esc(id)}" data-close-link>${esc(exerciseName(id, lang))}</a>
              <span class="hist-sets num">${esc(ss.map((x) => `${x.weight_kg != null ? weightToUser(Number(x.weight_kg), unit) : '—'}×${x.reps ?? '—'}`).join('  ·  '))}</span></li>`).join('')}</ul>`);
        }
        openSheet({ title, content: blocks.join('<hr class="sep">') + `<div class="sheet-actions"><button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.close'))}</button></div>`,
          onMount(sheet, close) { sheet.querySelectorAll('[data-close-link]').forEach((a) => a.addEventListener('click', close)); } });
      } else if (sched) {
        const past = date < today;
        const isToday = date.getTime() === today.getTime();
        openSheet({
          title,
          content: `
            <div class="card-title" style="margin-bottom:6px"><span class="day-badge day-${esc(sched.key)}">${esc(sched.key)}</span><h3>${esc(t('dayTypes.' + sched.type))}</h3></div>
            ${past ? `<p class="muted" style="margin-bottom:8px">${esc(t('calendar.missedText'))}</p>` : ''}
            ${exerciseList(sched, lang)}
            <div class="sheet-actions">
              <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.close'))}</button>
              ${isToday ? `<button type="button" class="btn btn-primary" data-start>${icon('dumbbell')}${esc(t('todayPlan.start'))}</button>` : ''}
            </div>`,
          onMount(sheet, close) {
            const s = sheet.querySelector('[data-start]');
            if (s) s.addEventListener('click', () => { close(); startDay(sched); });
          }
        });
      } else {
        openSheet({ title, content: `<p class="muted">${esc(t('calendar.restText'))}</p><div class="sheet-actions"><button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.close'))}</button></div>` });
      }
    }));
  }
};
