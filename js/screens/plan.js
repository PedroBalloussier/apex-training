import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { getActivePlan, updateActivePlanData } from '../data/account.js';
import { openSwap } from '../ui/swap.js';
import { dayLabel, repsText, dayTitle, planTitle } from '../data/labels.js';
import { toast } from '../ui/feedback.js';
import { startDay } from './start.js';
import { loadCatalog, getExercise, exerciseName, musclesLine } from '../data/catalog.js';
import { plannedText, groupSize, groupName } from '../data/techniques.js';
import { weekWarnings, dayOnWeekday, dayAtSlot, EDIT_MUSCLES, fillDay, typeForMuscles, computeFocus } from '../engine/generator.js';
import { startBuilder } from './builder.js';
import { lastTriage } from '../data/account.js';
import { warningText } from './plan-edit.js';
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
    const day = dayOnWeekday(plan, d);
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
    const areas = musclesLine(x.id);
    const meta = e ? `${areas || t('muscles.' + e.muscle)} · ${t('equip.' + e.equipment)}${e.unilateral ? ' · ' + t('session.perSide') : ''}` : '';
    const planned = plannedText(x);
    const inGroup = !!x.group;
    const first = inGroup && (i === 0 || ex[i - 1].group !== x.group);
    const last = inGroup && (i === ex.length - 1 || ex[i + 1].group !== x.group);
    return `<li class="ex-row ${inGroup ? 'grouped' : ''} ${first ? 'g-first' : ''} ${last ? 'g-last' : ''}">
      ${first ? `<span class="group-tag">${esc(groupName(groupSize(ex, i)))}</span>` : ''}
      <span class="ex-num num">${i + 1}</span>
      <div class="ex-main"><a class="ex-name ex-link" href="#ex-${esc(x.id)}">${esc(exerciseName(x.id, lang))}</a><span class="ex-meta">${esc(meta)}</span>${planned ? `<span class="ex-areas planned">${esc(planned)}</span>` : ''}</div>
      <div class="ex-dose num">${x.sets} × ${esc(repsText(x.reps))}${x.restSec && (!inGroup || last) ? `<small>${esc(t('plan.rest'))} ${esc(formatDuration(x.restSec, lang))}</small>` : ''}</div>
      ${actions ? `<button type="button" class="icon-btn" data-ex-menu="${i}" aria-label="${esc(t('plan.actions'))}">${icon('more')}</button>` : ''}
    </li>`;
  }).join('')}</ol>`;
}

const LETTERS = 'ABCDEF';
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const muscleLabel = (m) => (m === 'fullbody' ? t('dayTypes.conditioning') : t('muscles.' + m));

/** Cópia do plano com dayMap explícito (para poder repetir, adicionar e remover dias). */
function withMap(plan) {
  const data = structuredClone(plan);
  data.dayMap = data.schedule.map((_, i) => (dayAtSlot(plan, i) || plan.days[0]).key);
  return data;
}
const freeKey = (data) => [...LETTERS].find((k) => !data.days.some((d) => d.key === k));

async function savePlan(data, msg) {
  try { await updateActivePlanData(data); toast(msg, 'check'); return true; }
  catch (e) { toast(t('auth.errGeneric'), 'info'); return false; }
}

/** Folha para escolher os dias da semana e qual treino cai em cada um. */
function openWeekSheet(row, rerender, newKey) {
  const data = withMap(row.data);
  const assign = {};
  data.schedule.forEach((wd, i) => { assign[wd] = data.dayMap[i]; });
  // Um dia recém-criado ganha uma sugestão de lugar: o primeiro descanso, ou um treino repetido
  if (newKey && !Object.values(assign).includes(newKey)) {
    const rest = ORDER.find((wd) => !(wd in assign));
    const counts = {};
    Object.values(assign).forEach((k) => { counts[k] = (counts[k] || 0) + 1; });
    const dupWd = [...ORDER].reverse().find((wd) => wd in assign && counts[assign[wd]] > 1);
    const target = rest !== undefined ? rest : dupWd;
    if (target !== undefined) assign[target] = newKey;
  }
  const draw = (sheet) => {
    const box = sheet.querySelector('[data-weekbox]');
    box.innerHTML = ORDER.map((wd) => {
      const on = wd in assign;
      return `<div class="bweek-row ${on ? '' : 'off'}">
        <button type="button" class="chip-btn chip-sm" data-wd="${wd}" aria-pressed="${on}">${esc(tl('weekdays')[wd])}</button>
        ${on ? `<select class="input input-sm" data-as="${wd}" aria-label="${esc(tl('weekdaysLong')[wd])}">${data.days.map((d) => `<option value="${d.key}" ${assign[wd] === d.key ? 'selected' : ''}>${esc(d.key + ' · ' + dayTitle(d))}</option>`).join('')}</select>` : `<span class="muted">${esc(t('builder.rest'))}</span>`}
      </div>`;
    }).join('');
    box.querySelectorAll('[data-wd]').forEach((b) => b.addEventListener('click', () => {
      const wd = Number(b.dataset.wd);
      if (wd in assign) delete assign[wd];
      else { const used = new Set(Object.values(assign)); assign[wd] = (data.days.find((d) => !used.has(d.key)) || data.days[0]).key; }
      draw(sheet);
    }));
    box.querySelectorAll('[data-as]').forEach((sel) => sel.addEventListener('change', () => { assign[Number(sel.dataset.as)] = sel.value; }));
  };
  openSheet({
    title: t('manage.weekTitle'),
    content: `<p class="setting-hint">${esc(t('builder.weekHint'))}</p><div class="bweek" data-weekbox style="margin-top:10px"></div>
      <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
      <button type="button" class="btn btn-primary" data-ok>${icon('check')}${esc(t('edit.save'))}</button></div>`,
    onMount(sheet, close) {
      draw(sheet);
      sheet.querySelector('[data-ok]').addEventListener('click', async () => {
        const wds = Object.keys(assign).map(Number).sort((a, b) => a - b);
        if (!wds.length) { toast(t('builder.needWeekday'), 'info'); return; }
        data.schedule = wds;
        data.dayMap = wds.map((wd) => assign[wd]);
        data.daysPerWeek = wds.length;
        close();
        if (await savePlan(data, t('manage.weekSaved'))) rerender();
      });
    }
  });
}

function openNewDaySheet(row, rerender, onDone) {
  let muscles = [];
  openSheet({
    title: t('manage.newDayTitle'),
    content: `<p class="setting-hint">${esc(t('manage.newDayHint'))}</p>
      <div class="chips" style="margin-top:10px">${EDIT_MUSCLES.map((m) => `<button type="button" class="chip-btn chip-sm" data-m="${m}" aria-pressed="false">${esc(muscleLabel(m))}</button>`).join('')}</div>
      <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
      <button type="button" class="btn btn-primary" data-ok>${icon('plus')}${esc(t('manage.create'))}</button></div>`,
    onMount(sheet, close) {
      sheet.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => {
        const m = b.dataset.m;
        if (muscles.includes(m)) muscles = muscles.filter((x) => x !== m);
        else if (muscles.length >= 3) { toast(t('edit.max3'), 'info'); return; }
        else muscles = [...muscles, m];
        b.setAttribute('aria-pressed', String(muscles.includes(m)));
      }));
      sheet.querySelector('[data-ok]').addEventListener('click', async () => {
        if (!muscles.length) { toast(t('edit.pickOne'), 'info'); return; }
        const data = withMap(row.data);
        const key = freeKey(data);
        const cat = await loadCatalog();
        const triageRow = await lastTriage().catch(() => null);
        const size = Math.round(data.days.reduce((n, d) => n + d.exercises.length, 0) / data.days.length) || 6;
        const res = fillDay({ muscles, day: { key, exercises: [] }, plan: data, answers: triageRow && triageRow.answers, catalog: cat, size });
        data.days.push({ key, type: typeForMuscles(muscles), focusMuscles: muscles, focus: computeFocus(res.exercises, getExercise), exercises: res.exercises });
        close();
        if (await savePlan(data, t('manage.added', { k: key }))) { selectedKey = key; rerender(); onDone && onDone(key); }
      });
    }
  });
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
          <h1>${esc(planTitle(plan))}</h1>
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

        ${(() => { const ws = weekWarnings(plan, getExercise); return ws.length ? `<div class="card warn-card">
          <div class="card-head"><div class="card-title">${icon('info')}<h2>${esc(t('edit.warnings'))}</h2></div></div>
          <ul class="feature-list">${ws.map((w) => `<li>${icon('info')}<span>${esc(warningText(w))}</span></li>`).join('')}</ul></div>` : ''; })()}

        <div class="day-tabs" role="tablist">
          ${plan.days.map((d) => `<button type="button" class="day-tab" role="tab" data-day="${d.key}" aria-selected="${d.key === selectedKey}">
            <span class="day-badge day-${d.key}">${d.key}</span>${esc(dayTitle(d))}</button>`).join('')}
        </div>

        <div class="card plan-day">
          <div class="card-head">
            <div class="card-title"><span class="day-badge day-${day.key}">${day.key}</span><h2>${esc(dayTitle(day))}</h2></div>
            <span class="chip num">${esc(t('results.exercises', { n: day.exercises.length }))}</span>
          </div>
          <div class="diff-row">${diffBadge(difficultyOf(day.exercises), { label: true })}${day.edited ? `<span class="chip">${esc(t('edit.edited'))}</span>` : ''}</div>
          ${exerciseList(day, lang, { actions: true })}
          <a class="btn btn-block" href="#editar-${esc(day.key)}" style="margin-top:12px">${icon('plan')}${esc(t('edit.button'))}</a>
          <button type="button" class="btn btn-primary btn-block" data-start style="margin-top:14px">${icon('dumbbell')}${esc(t('plan.startDay', { k: day.key }))}</button>
        </div>

        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('manage.title'))}</span></div>
          <div class="manage-grid">
            <button type="button" class="btn" data-m-week>${icon('calendar')}${esc(t('manage.week'))}</button>
            <button type="button" class="btn" data-m-dup ${plan.days.length >= 6 ? 'disabled' : ''}>${icon('plus')}${esc(t('manage.dup', { k: day.key }))}</button>
            <button type="button" class="btn" data-m-add ${plan.days.length >= 6 ? 'disabled' : ''}>${icon('plus')}${esc(t('manage.add'))}</button>
            <button type="button" class="btn btn-ghost danger-text" data-m-rm ${plan.days.length <= 1 ? 'disabled' : ''}>${icon('trash')}${esc(t('manage.remove', { k: day.key }))}</button>
          </div>
        </div>

        <div class="plan-bottom">
          <button type="button" class="btn btn-ghost" data-redo>${icon('sparkle')}${esc(t('plan.redo'))}</button>
          <button type="button" class="btn btn-ghost" data-custom>${icon('plan')}${esc(t('builder.newPlan'))}</button>
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
    el.querySelector('[data-custom]').addEventListener('click', () => startBuilder());
    el.querySelector('[data-m-week]').addEventListener('click', () => openWeekSheet(getActivePlan(), rerender));
    el.querySelector('[data-m-add]').addEventListener('click', () => openNewDaySheet(row, rerender, (k) => openWeekSheet(getActivePlan(), rerender, k)));
    el.querySelector('[data-m-dup]').addEventListener('click', async () => {
      const data = withMap(plan);
      const key = freeKey(data);
      if (!key) { toast(t('manage.maxDays'), 'info'); return; }
      const copy = structuredClone(day);
      delete copy.original; delete copy.edited;
      copy.key = key;
      copy.name = (dayTitle(day) + ' (' + t('manage.copy') + ')').slice(0, 30);
      data.days.push(copy);
      if (await savePlan(data, t('manage.duplicated', { k: key }))) { selectedKey = key; rerender(); openWeekSheet(getActivePlan(), rerender, key); }
    });
    el.querySelector('[data-m-rm]').addEventListener('click', () => {
      if (plan.days.length <= 1) { toast(t('manage.lastDay'), 'info'); return; }
      openSheet({
        title: t('manage.removeTitle', { k: day.key }),
        content: `<p class="muted">${esc(t('manage.removeText'))}</p><div class="sheet-actions">
          <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
          <button type="button" class="btn btn-danger" data-ok>${esc(t('edit.remove'))}</button></div>`,
        onMount(sheet, close) {
          sheet.querySelector('[data-ok]').addEventListener('click', async () => {
            const data = withMap(plan);
            data.days = data.days.filter((d) => d.key !== day.key);
            const used = new Set(data.dayMap.filter((k) => k !== day.key));
            const fallback = (data.days.find((d) => !used.has(d.key)) || data.days[0]).key;
            data.dayMap = data.dayMap.map((k) => (k === day.key ? fallback : k));
            close();
            if (await savePlan(data, t('manage.removed'))) { selectedKey = data.days[0].key; rerender(); }
          });
        }
      });
    });
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
