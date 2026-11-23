import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { getActivePlan, updateActivePlanData } from '../data/account.js';
import { openSwap } from '../ui/swap.js';
import { dayLabel, repsText } from '../data/labels.js';
import { toast } from '../ui/feedback.js';
import { startDay } from './start.js';
import { loadCatalog, getExercise, exerciseName } from '../data/catalog.js';
import { formatDuration } from '../utils/units.js';
import { openSheet } from '../ui/feedback.js';
import triage from './triage.js';
import { diffBadge } from '../ui/difficulty.js';
import { difficultyOf } from '../engine/difficulty.js';

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

export function exerciseList(day, lang, { actions = false } = {}) {
  const ex = day.exercises;
  return `<ol class="ex-list">${ex.map((x, i) => {
    const e = getExercise(x.id);
    const meta = e ? `${t('muscles.' + e.muscle)} · ${t('equip.' + e.equipment)}${e.unilateral ? ' · ' + t('session.perSide') : ''}` : '';
    const inGroup = !!x.group;
    const first = inGroup && (i === 0 || ex[i - 1].group !== x.group);
    const last = inGroup && (i === ex.length - 1 || ex[i + 1].group !== x.group);
    return `<li class="ex-row ${inGroup ? 'grouped' : ''} ${first ? 'g-first' : ''} ${last ? 'g-last' : ''}">
      ${first ? `<span class="group-tag">${esc(t('session.biset'))}</span>` : ''}
      <span class="ex-num num">${i + 1}</span>
      <div class="ex-main"><a class="ex-name ex-link" href="#ex-${esc(x.id)}">${esc(exerciseName(x.id, lang))}</a><span class="ex-meta">${esc(meta)}</span></div>
      <div class="ex-dose num">${x.sets} × ${esc(repsText(x.reps))}${x.restSec && (!inGroup || last) ? `<small>${esc(t('plan.rest'))} ${esc(formatDuration(x.restSec, lang))}</small>` : ''}</div>
      ${actions ? `<button type="button" class="icon-btn" data-ex-menu="${i}" aria-label="${esc(t('plan.actions'))}">${icon('more')}</button>` : ''}
    </li>`;
  }).join('')}</ol>`;
}

function cleanGroups(list) {
  // Remove grupos que ficaram com um exercício só ou não são vizinhos
  return list.map((x, i) => {
    if (!x.group) return x;
    const prev = list[i - 1], next = list[i + 1];
    const ok = (prev && prev.group === x.group) || (next && next.group === x.group);
    if (ok) return x;
    const { group, ...rest } = x;
    return rest;
  });
}

async function editDay(row, dayKey, fn) {
  const data = structuredClone(row.data);
  const day = data.days.find((d) => d.key === dayKey);
  day.exercises = cleanGroups(fn(day.exercises));
  try { await updateActivePlanData(data); toast(t('plan.updated')); }
  catch (e) { toast(t('auth.errGeneric'), 'info'); }
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
          <div class="diff-row">${diffBadge(difficultyOf(day.exercises), { label: true })}</div>
          ${exerciseList(day, lang, { actions: true })}
          <button type="button" class="btn btn-primary btn-block" data-start style="margin-top:14px">${icon('dumbbell')}${esc(t('plan.startDay', { k: day.key }))}</button>
        </div>

        <div style="display:flex;justify-content:center">
          <button type="button" class="btn btn-ghost" data-redo>${icon('sparkle')}${esc(t('plan.redo'))}</button>
        </div>
      </section>`;

    el.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => { selectedKey = b.dataset.day; this.render(el); }));
    el.querySelector('[data-start]').addEventListener('click', () => startDay(day));
    const rerender = () => this.render(el);
    el.querySelectorAll('[data-ex-menu]').forEach((b) => b.addEventListener('click', () => {
      const i = Number(b.dataset.exMenu);
      const list = day.exercises;
      const x = list[i];
      const grouped = !!x.group;
      const canJoin = i < list.length - 1;
      openSheet({
        title: exerciseName(x.id, lang),
        content: `<div class="more-menu">
          <button type="button" class="nav-item" data-a="swap">${icon('dumbbell')}<span>${esc(t('plan.swap'))}</span></button>
          ${grouped ? `<button type="button" class="nav-item" data-a="split">${icon('minus')}<span>${esc(t('plan.unlink'))}</span></button>`
            : canJoin ? `<button type="button" class="nav-item" data-a="join">${icon('plus')}<span>${esc(t('plan.link'))}</span></button>` : ''}
          ${i > 0 ? `<button type="button" class="nav-item" data-a="up">${icon('upload')}<span>${esc(t('plan.moveUp'))}</span></button>` : ''}
          ${i < list.length - 1 ? `<button type="button" class="nav-item" data-a="down">${icon('download')}<span>${esc(t('plan.moveDown'))}</span></button>` : ''}
        </div>`,
        onMount(sheet, close) {
          sheet.querySelectorAll('[data-a]').forEach((btn) => btn.addEventListener('click', async () => {
            const a = btn.dataset.a;
            close();
            if (a === 'swap') {
              return openSwap({
                exerciseId: x.id, note: t('swap.planNote'),
                onPick: (newId) => editDay(row, day.key, (l) => l.map((e, j) => (j === i ? { ...e, id: newId } : e))).then(rerender)
              });
            }
            await editDay(row, day.key, (l) => {
              const c = l.map((e) => ({ ...e }));
              if (a === 'join') { const g = c[i].group || c[i + 1].group || 'g' + Date.now().toString(36); c[i].group = g; c[i + 1].group = g; }
              if (a === 'split') delete c[i].group;
              if (a === 'up') [c[i - 1], c[i]] = [c[i], c[i - 1]];
              if (a === 'down') [c[i + 1], c[i]] = [c[i], c[i + 1]];
              return c;
            });
            rerender();
          }));
        }
      });
    }));
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
