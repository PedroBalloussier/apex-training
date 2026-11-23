import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { getActivePlan } from '../data/account.js';
import { loadCatalog, getExercise, exerciseName } from '../data/catalog.js';
import { formatDuration } from '../utils/units.js';
import { openSheet } from '../ui/feedback.js';
import triage from './triage.js';

let selectedKey = null;

export function cycleWeek(planRow) {
  const start = new Date(planRow.started_at || planRow.created_at || Date.now());
  const weeks = planRow.cycle_weeks || planRow.data.cycleWeeks || 12;
  const n = Math.floor((Date.now() - start.getTime()) / (7 * 864e5)) + 1;
  return { n: Math.min(Math.max(n, 1), weeks), w: weeks };
}

export function weekStrip(plan) {
  const names = tl('weekdays');
  const today = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return `<div class="week-strip">${order.map((d) => {
    const idx = plan.schedule.indexOf(d);
    const day = idx === -1 ? null : plan.days[idx % plan.days.length];
    return `<div class="week-day ${d === today ? 'today' : ''}">
      <span>${esc(names[d])}</span>
      ${day ? `<span class="dot day-${day.key}">${day.key}</span>` : `<span class="dot rest">${icon('minus')}</span>`}
    </div>`;
  }).join('')}</div>`;
}

export function exerciseList(day, lang) {
  return `<ol class="ex-list">${day.exercises.map((x, i) => {
    const e = getExercise(x.id);
    const meta = e ? `${t('muscles.' + e.muscle)} · ${t('equip.' + e.equipment)}` : '';
    return `<li class="ex-row">
      <span class="ex-num num">${i + 1}</span>
      <div class="ex-main"><span class="ex-name">${esc(exerciseName(x.id, lang))}</span><span class="ex-meta">${esc(meta)}</span></div>
      <div class="ex-dose num">${x.sets} × ${esc(x.reps)}${x.restSec ? `<small>${esc(t('plan.rest'))} ${esc(formatDuration(x.restSec, lang))}</small>` : ''}</div>
    </li>`;
  }).join('')}</ol>`;
}

export default {
  async render(el) {
    const row = getActivePlan();
    if (!row) {
      el.innerHTML = `
        <section class="screen">
          <header class="screen-head"><span class="eyebrow">${esc(t('plan.eyebrow'))}</span><h1>${esc(t('nav.plan'))}</h1></header>
          <div class="card"><div class="empty">
            <div class="empty-icon">${icon('plan')}</div>
            <h3>${esc(t('plan.noPlan'))}</h3><p>${esc(t('plan.noPlanText'))}</p>
            <a class="btn btn-primary" href="#triagem">${icon('sparkle')}${esc(t('plan.startTriage'))}</a>
          </div></div>
        </section>`;
      return;
    }
    await loadCatalog();
    const lang = getLanguage();
    const plan = row.data;
    const { n, w } = cycleWeek(row);
    if (!plan.days.some((d) => d.key === selectedKey)) selectedKey = plan.days[0].key;
    const day = plan.days.find((d) => d.key === selectedKey);

    el.innerHTML = `
      <section class="screen">
        <header class="screen-head">
          <span class="eyebrow">${esc(t('plan.eyebrow'))} · ${esc(t('plan.week', { n, w }))}</span>
          <h1>${esc(t('splits.' + plan.split))}</h1>
          <div class="plan-meta" style="margin-top:8px">
            <span class="chip">${esc(t('goals.' + plan.goal))}</span>
            <span class="chip">${esc(t('results.perWeek', { d: plan.daysPerWeek }))}</span>
            <span class="chip">${esc(t('results.weeks', { w }))}</span>
          </div>
        </header>

        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('plan.schedule'))}</span></div>
          ${weekStrip(plan)}
        </div>

        <div class="day-tabs" role="tablist">
          ${plan.days.map((d) => `<button type="button" class="day-tab" role="tab" data-day="${d.key}" aria-selected="${d.key === selectedKey}">
            <span class="day-badge day-${d.key}">${d.key}</span>${esc(t('dayTypes.' + d.type))}</button>`).join('')}
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-title"><span class="day-badge day-${day.key}">${day.key}</span><h2>${esc(t('dayTypes.' + day.type))}</h2></div>
            <span class="chip num">${esc(t('results.exercises', { n: day.exercises.length }))}</span>
          </div>
          ${exerciseList(day, lang)}
          <p class="setting-hint" style="margin-top:10px">${icon('info')} ${esc(t('plan.swapSoon'))}</p>
        </div>

        <div style="display:flex;justify-content:center">
          <button type="button" class="btn btn-ghost" data-redo>${icon('sparkle')}${esc(t('plan.redo'))}</button>
        </div>
      </section>`;

    el.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => { selectedKey = b.dataset.day; this.render(el); }));
    el.querySelector('[data-redo]').addEventListener('click', () => {
      openSheet({
        title: t('plan.redoConfirmTitle'),
        content: `<p class="muted">${esc(t('plan.redoConfirmText'))}</p>
          <div class="sheet-actions">
            <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
            <button type="button" class="btn btn-primary" data-ok>${esc(t('plan.redoConfirm'))}</button>
          </div>`,
        onMount(sheet, close) {
          sheet.querySelector('[data-ok]').addEventListener('click', () => { close(); triage.reset(); location.hash = '#triagem'; });
        }
      });
    });
  }
};
