// Construtor de plano personalizado: estrutura (dias, grupos, semana), exercícios e revisão.
import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast, openSheet } from '../ui/feedback.js';
import { getActivePlan, activatePlan, lastTriage } from '../data/account.js';
import { loadCatalog, getExercise } from '../data/catalog.js';
import { EDIT_MUSCLES, BUILDER_PRESETS, EXERCISES_FOR, fillDay, computeFocus, typeForMuscles, weekWarnings, weeklySets, dayAtSlot } from '../engine/generator.js';
import { exerciseList } from './plan.js';
import { warningText } from './plan-edit.js';
import { dayTitle } from '../data/labels.js';
import { coachTip } from '../ui/coach.js';
import { diffBadge } from '../ui/difficulty.js';
import { difficultyOf } from '../engine/difficulty.js';

const LETTERS = 'ABCDEF';
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const GOALS = ['hypertrophy', 'strength', 'endurance', 'fat_loss', 'general'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const DURATIONS = [30, 45, 60, 75, 90];
const muscleLabel = (m) => (m === 'fullbody' ? t('dayTypes.conditioning') : t('muscles.' + m));

let st = null;

/* ---------- Estado compartilhado com o editor de dia ---------- */
function planFrom(s) {
  const weekdays = [...s.weekdays].sort((a, b) => a - b);
  return {
    split: 'custom', name: 'custom', customName: s.name.trim() || undefined, custom: true,
    goal: s.goal, level: s.level, cycleWeeks: s.cycleWeeks, daysPerWeek: weekdays.length,
    schedule: weekdays, dayMap: weekdays.map((wd) => s.assign[wd] || s.days[0].key),
    hybrid: false, recommended: false, createdWith: 2,
    days: s.days.map((d) => ({
      key: d.key, name: d.name.trim() || undefined,
      type: d.type || typeForMuscles(d.muscles.length ? d.muscles : computeFocus(d.exercises, getExercise)),
      focus: computeFocus(d.exercises, getExercise).length ? computeFocus(d.exercises, getExercise) : [...d.muscles],
      focusMuscles: [...d.muscles],
      exercises: d.exercises
    }))
  };
}

export function getBuilderPlan() { return st && st.days.length ? planFrom(st) : null; }
export function builderAnswers() { return st ? st.answers : null; }
export function setBuilderDay(key, day) {
  if (!st) return;
  const d = st.days.find((x) => x.key === key);
  if (!d) return;
  d.exercises = day.exercises;
  if (day.focusMuscles) { d.muscles = [...day.focusMuscles]; d.type = day.type; }
  d.genFor = d.muscles.join('+');
  st.dirty = true;
}

function freshState(answers, prev) {
  const a = answers || {};
  const weekdays = (a.weekdays && a.weekdays.length ? a.weekdays : [1, 3, 5]).slice();
  const s = {
    step: 1, name: '', dirty: false, answers: a,
    goal: (prev && prev.goal) || a.goal || 'hypertrophy',
    level: (prev && prev.level) || a.level || 'beginner',
    cycleWeeks: (prev && prev.cycleWeeks) || (a.cycleWeeks === 8 ? 8 : 12),
    duration: a.duration || 60,
    weekdays, days: [], assign: {}
  };
  applyPreset(s, weekdays.length >= 5 ? 'bro' : weekdays.length >= 3 ? 'ppl' : weekdays.length === 2 ? 'upper_lower' : 'full');
  return s;
}

function newDay(s, muscles = []) {
  const used = new Set(s.days.map((d) => d.key));
  const key = [...LETTERS].find((k) => !used.has(k));
  return { key, name: '', muscles, exercises: [], genFor: null };
}

function applyPreset(s, id) {
  s.days = [];
  for (const ms of BUILDER_PRESETS[id].slice(0, 6)) s.days.push(newDay(s, [...ms]));
  reassign(s, true);
  s.dirty = true;
}

/** Distribui os dias pela semana: em ordem, repetindo quando há mais dias de treino que treinos. */
function reassign(s, all = false) {
  const keys = s.days.map((d) => d.key);
  const wds = ORDER.filter((wd) => s.weekdays.includes(wd));
  wds.forEach((wd, i) => { if (all || !keys.includes(s.assign[wd])) s.assign[wd] = keys[i % keys.length]; });
  for (const wd of Object.keys(s.assign)) if (!s.weekdays.includes(Number(wd))) delete s.assign[wd];
}

/* ---------- Validação ---------- */
function structureErrors(s) {
  const out = [];
  if (!s.weekdays.length) out.push(t('builder.needWeekday'));
  for (const d of s.days) if (!d.muscles.length && !d.exercises.length) out.push(t('builder.needMuscles', { k: d.key }));
  const usedKeys = new Set(s.weekdays.map((wd) => s.assign[wd]));
  for (const d of s.days) if (!usedKeys.has(d.key)) out.push(t('builder.unused', { k: d.key }));
  return out;
}

async function generateMissing(s) {
  const cat = await loadCatalog();
  for (const d of s.days) {
    const sig = d.muscles.join('+');
    if (d.genFor === sig || !d.muscles.length) continue;
    const plan = planFrom(s);
    const res = fillDay({ muscles: d.muscles, day: { key: d.key, exercises: [] }, plan, answers: s.answers, catalog: cat, size: EXERCISES_FOR(s.duration) });
    d.exercises = res.exercises;
    d.type = typeForMuscles(d.muscles);
    d.genFor = sig;
  }
}

/* ---------- Telas ---------- */
function stepper(n) {
  const names = tl('builder.stepNames');
  return `<div class="builder-steps">${names.map((nm, i) => `<span class="bstep ${i + 1 === n ? 'on' : ''} ${i + 1 < n ? 'done' : ''}"><b class="num">${i + 1 < n ? icon('check') : i + 1}</b>${esc(nm)}</span>`).join('')}</div>`;
}

function stepStructure(s) {
  const names = tl('weekdays');
  const opt = (v, cur, label) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(label)}</option>`;
  return `
    <div class="card">
      <div class="card-head"><span class="eyebrow">${esc(t('builder.basics'))}</span></div>
      <div class="field"><label for="b-name">${esc(t('builder.name'))}</label>
        <input class="input" id="b-name" data-name maxlength="40" placeholder="${esc(t('builder.namePh'))}" value="${esc(s.name)}"></div>
      <div class="builder-basics">
        <div class="field"><label for="b-goal">${esc(t('builder.goal'))}</label><select class="input" id="b-goal" data-goal>${GOALS.map((g) => opt(g, s.goal, t('goals.' + g))).join('')}</select></div>
        <div class="field"><label for="b-level">${esc(t('builder.level'))}</label><select class="input" id="b-level" data-level>${LEVELS.map((l) => opt(l, s.level, t('triage.level.' + l))).join('')}</select></div>
        <div class="field"><label for="b-cycle">${esc(t('builder.cycle'))}</label><select class="input" id="b-cycle" data-cycle>${[8, 12].map((w) => opt(w, s.cycleWeeks, t('results.weeks', { w }))).join('')}</select></div>
        <div class="field"><label for="b-dur">${esc(t('builder.duration'))}</label><select class="input" id="b-dur" data-dur>${DURATIONS.map((m) => opt(m, s.duration, m + ' min')).join('')}</select></div>
      </div>
      <p class="setting-hint">${esc(t('builder.basicsHint'))}</p>
    </div>

    <div class="card">
      <div class="card-head"><span class="eyebrow">${esc(t('builder.weekdays'))}</span></div>
      <div class="weekdays">${ORDER.map((d) => `<button type="button" class="chip-btn" data-wd="${d}" aria-pressed="${s.weekdays.includes(d)}">${esc(names[d])}</button>`).join('')}</div>
      <p class="setting-hint">${esc(t('builder.weekdaysHint'))}</p>
    </div>

    <div class="card">
      <div class="card-head"><span class="eyebrow">${esc(t('builder.presets'))}</span></div>
      <div class="chips">${Object.keys(BUILDER_PRESETS).map((p) => `<button type="button" class="chip-btn" data-preset="${p}">${esc(t('builder.preset.' + p))}</button>`).join('')}</div>
      <p class="setting-hint">${esc(t('builder.presetsHint'))}</p>
    </div>

    <div class="card">
      <div class="card-head"><span class="eyebrow">${esc(t('builder.days'))}</span><span class="chip num">${s.days.length}/6</span></div>
      <p class="setting-hint">${esc(t('builder.daysHint'))}</p>
      <div class="bdays">${s.days.map((d, i) => `
        <div class="bday" data-di="${i}">
          <div class="bday-head">
            <span class="day-badge day-${d.key}">${d.key}</span>
            <input class="input input-sm" data-dname maxlength="30" placeholder="${esc(t('builder.dayName'))}" value="${esc(d.name)}" aria-label="${esc(t('builder.dayName'))}">
            <button type="button" class="icon-btn danger-text" data-drm aria-label="${esc(t('builder.removeDay'))}" ${s.days.length <= 1 ? 'disabled' : ''}>${icon('trash')}</button>
          </div>
          <div class="chips">${EDIT_MUSCLES.map((m) => `<button type="button" class="chip-btn chip-sm" data-dm="${m}" aria-pressed="${d.muscles.includes(m)}">${esc(muscleLabel(m))}</button>`).join('')}</div>
        </div>`).join('')}</div>
      <button type="button" class="btn btn-block" data-dadd style="margin-top:12px" ${s.days.length >= 6 ? 'disabled' : ''}>${icon('plus')}${esc(t('builder.addDay'))}</button>
    </div>

    <div class="card">
      <div class="card-head"><span class="eyebrow">${esc(t('builder.week'))}</span></div>
      <p class="setting-hint">${esc(t('builder.weekHint'))}</p>
      <div class="bweek">${ORDER.map((wd) => {
        const on = s.weekdays.includes(wd);
        return `<div class="bweek-row ${on ? '' : 'off'}"><span class="bweek-day">${esc(tl('weekdaysLong')[wd])}</span>
          ${on ? `<select class="input input-sm" data-assign="${wd}" aria-label="${esc(tl('weekdaysLong')[wd])}">${s.days.map((d) => `<option value="${d.key}" ${s.assign[wd] === d.key ? 'selected' : ''}>${esc(d.key + ' · ' + (d.name || (d.muscles.length ? d.muscles.map(muscleLabel).join(', ') : '—')))}</option>`).join('')}</select>`
            : `<span class="muted">${esc(t('builder.rest'))}</span>`}</div>`;
      }).join('')}</div>
    </div>`;
}

function stepExercises(s, lang) {
  return `
    <p class="muted">${esc(t('builder.exHint'))}</p>
    ${s.days.map((d) => {
      const day = planFrom(s).days.find((x) => x.key === d.key);
      return `<div class="card plan-day">
        <div class="card-head">
          <div class="card-title"><span class="day-badge day-${d.key}">${d.key}</span><h2>${esc(dayTitle(day))}</h2></div>
          <span class="chip num">${esc(t('results.exercises', { n: d.exercises.length }))}</span>
        </div>
        ${d.exercises.length ? `<div class="diff-row">${diffBadge(difficultyOf(d.exercises), { label: true })}</div>${exerciseList(day, lang)}` : `<p class="muted">${esc(t('builder.noEx'))}</p>`}
        <div class="bday-actions">
          <a class="btn btn-primary" href="#editar-novo-${d.key}">${icon('plan')}${esc(t('builder.editDay'))}</a>
          ${d.muscles.length ? `<button type="button" class="btn" data-regen="${d.key}">${icon('sparkle')}${esc(t('builder.regen'))}</button>` : ''}
          ${d.exercises.length ? `<button type="button" class="btn btn-ghost" data-clear="${d.key}">${icon('trash')}${esc(t('builder.empty'))}</button>` : ''}
        </div>
      </div>`;
    }).join('')}`;
}

function stepReview(s) {
  const plan = planFrom(s);
  const ws = weekWarnings(plan, getExercise);
  const sets = weeklySets(plan, getExercise);
  const rows = EDIT_MUSCLES.filter((m) => sets.get(m)).map((m) => [m, sets.get(m)]);
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const names = tl('weekdays');
  return `
    <div class="card">
      <div class="card-head"><span class="eyebrow">${esc(t('plan.schedule'))}</span></div>
      <div class="week-strip">${ORDER.map((wd) => {
        const day = dayAtSlot(plan, plan.schedule.indexOf(wd));
        return `<div class="week-day"><span>${esc(names[wd])}</span>${day ? `<span class="dot day-${day.key}">${day.key}</span>` : `<span class="dot rest">${icon('minus')}</span>`}</div>`;
      }).join('')}</div>
      <div class="plan-meta" style="margin-top:12px">
        <span class="chip">${esc(t('goals.' + plan.goal))}</span>
        <span class="chip">${esc(t('results.perWeek', { d: plan.daysPerWeek }))}</span>
        <span class="chip">${esc(t('results.weeks', { w: plan.cycleWeeks }))}</span>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><span class="eyebrow">${esc(t('builder.weekly'))}</span></div>
      <p class="setting-hint">${esc(t('builder.weeklyHint'))}</p>
      <ul class="vol-bars">${rows.map(([m, n]) => `<li><span class="vb-name">${esc(muscleLabel(m))}</span>
        <span class="vb-bar"><i style="width:${Math.round((n / max) * 100)}%" class="${plan.goal === 'hypertrophy' && n < 10 && !['core', 'forearms', 'calves', 'biceps', 'triceps', 'fullbody'].includes(m) ? 'low' : ''}"></i></span>
        <span class="vb-n num">${n}</span></li>`).join('')}</ul>
    </div>
    <div class="card ${ws.length ? 'warn-card' : ''}">
      <div class="card-head"><div class="card-title">${icon(ws.length ? 'info' : 'check')}<h2>${esc(t('edit.warnings'))}</h2></div></div>
      ${ws.length ? `<ul class="feature-list">${ws.map((w) => `<li>${icon('info')}<span>${esc(warningText(w))}</span></li>`).join('')}</ul>` : `<p class="muted">${esc(t('builder.noWarnings'))}</p>`}
    </div>`;
}

async function draw(el) {
  const lang = getLanguage();
  const s = st;
  await loadCatalog();
  if (s.step >= 2) await generateMissing(s);
  const body = s.step === 1 ? stepStructure(s) : s.step === 2 ? stepExercises(s, lang) : stepReview(s);
  el.innerHTML = `
    <section class="screen builder">
      <a class="btn btn-sm btn-ghost back-link" href="#plano" data-leave>${icon('chevron')}${esc(t('nav.plan'))}</a>
      <header class="screen-head">
        <span class="eyebrow">${esc(t('builder.eyebrow'))} · ${esc(t('builder.stepOf', { n: s.step }))}</span>
        <h1>${esc(t('builder.title'))}</h1>
      </header>
      ${stepper(s.step)}
      ${body}
      <div class="edit-footer">
        ${s.step < 3 ? `<button type="button" class="btn btn-primary btn-block" data-next>${esc(t('builder.next'))}${icon('chevron')}</button>`
          : `<button type="button" class="btn btn-primary btn-block" data-activate>${icon('check')}${esc(t('builder.activate'))}</button>`}
        ${s.step > 1 ? `<div class="edit-footer-row"><button type="button" class="btn btn-ghost" data-back>${esc(t('builder.back'))}</button></div>` : ''}
      </div>
    </section>`;
  bind(el);
  if (s.step === 1) coachTip('builder');
}

function bind(el) {
  const s = st;
  const redraw = () => draw(el);
  const keepScroll = (fn) => () => { const y = window.scrollY; fn(); draw(el).then(() => window.scrollTo({ top: y })); };

  // Passo 1
  el.querySelector('[data-name]')?.addEventListener('input', (e) => { s.name = e.target.value; s.dirty = true; });
  el.querySelector('[data-goal]')?.addEventListener('change', (e) => { s.goal = e.target.value; s.days.forEach((d) => { d.genFor = null; }); s.dirty = true; });
  el.querySelector('[data-level]')?.addEventListener('change', (e) => { s.level = e.target.value; s.days.forEach((d) => { d.genFor = null; }); s.dirty = true; });
  el.querySelector('[data-cycle]')?.addEventListener('change', (e) => { s.cycleWeeks = Number(e.target.value); s.dirty = true; });
  el.querySelector('[data-dur]')?.addEventListener('change', (e) => { s.duration = Number(e.target.value); s.days.forEach((d) => { d.genFor = null; }); s.dirty = true; });
  el.querySelectorAll('[data-wd]').forEach((b) => b.addEventListener('click', keepScroll(() => {
    const wd = Number(b.dataset.wd);
    s.weekdays = s.weekdays.includes(wd) ? s.weekdays.filter((x) => x !== wd) : [...s.weekdays, wd];
    reassign(s); s.dirty = true;
  })));
  el.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', keepScroll(() => applyPreset(s, b.dataset.preset))));
  el.querySelectorAll('[data-dname]').forEach((inp) => inp.addEventListener('input', () => {
    s.days[Number(inp.closest('.bday').dataset.di)].name = inp.value; s.dirty = true;
  }));
  el.querySelectorAll('[data-dm]').forEach((b) => b.addEventListener('click', () => {
    const d = s.days[Number(b.closest('.bday').dataset.di)];
    const m = b.dataset.dm;
    if (d.muscles.includes(m)) d.muscles = d.muscles.filter((x) => x !== m);
    else if (d.muscles.length >= 3) { toast(t('edit.max3'), 'info'); return; }
    else d.muscles = [...d.muscles, m];
    d.type = null; s.dirty = true;
    keepScroll(() => {})();
  }));
  el.querySelectorAll('[data-drm]').forEach((b) => b.addEventListener('click', keepScroll(() => {
    s.days.splice(Number(b.closest('.bday').dataset.di), 1); reassign(s); s.dirty = true;
  })));
  el.querySelector('[data-dadd]')?.addEventListener('click', keepScroll(() => {
    if (s.days.length >= 6) { toast(t('builder.maxDays'), 'info'); return; }
    s.days.push(newDay(s)); s.dirty = true;
  }));
  el.querySelectorAll('[data-assign]').forEach((sel) => sel.addEventListener('change', keepScroll(() => { s.assign[Number(sel.dataset.assign)] = sel.value; s.dirty = true; })));

  // Passo 2
  el.querySelectorAll('[data-regen]').forEach((b) => b.addEventListener('click', keepScroll(() => { const d = s.days.find((x) => x.key === b.dataset.regen); d.genFor = null; s.dirty = true; })));
  el.querySelectorAll('[data-clear]').forEach((b) => b.addEventListener('click', keepScroll(() => {
    const d = s.days.find((x) => x.key === b.dataset.clear); d.exercises = []; d.genFor = d.muscles.join('+'); s.dirty = true;
  })));

  // Navegação
  el.querySelector('[data-next]')?.addEventListener('click', () => {
    if (s.step === 1) {
      const errs = structureErrors(s);
      if (errs.length) { toast(errs[0], 'info'); return; }
    }
    if (s.step === 2) {
      const empty = s.days.find((d) => !d.exercises.length);
      if (empty) { toast(t('builder.emptyErr', { k: empty.key }), 'info'); return; }
    }
    s.step++; window.scrollTo({ top: 0 }); redraw();
  });
  el.querySelector('[data-back]')?.addEventListener('click', () => { s.step--; window.scrollTo({ top: 0 }); redraw(); });
  el.querySelector('[data-activate]')?.addEventListener('click', (e) => {
    const go = async (btn) => {
      btn.disabled = true; btn.textContent = t('builder.activating');
      try {
        await activatePlan(planFrom(s), null);
        st = null; toast(t('builder.done'), 'check'); location.hash = '#plano';
      } catch (err) { btn.disabled = false; btn.textContent = t('builder.activate'); toast(t('results.errSave'), 'info'); }
    };
    if (!getActivePlan()) return go(e.currentTarget);
    const btn = e.currentTarget;
    openSheet({
      title: t('builder.replaceTitle'),
      content: `<p class="muted">${esc(t('builder.replaceText'))}</p><div class="sheet-actions">
        <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
        <button type="button" class="btn btn-primary" data-ok>${esc(t('builder.replace'))}</button></div>`,
      onMount(sheet, close) { sheet.querySelector('[data-ok]').addEventListener('click', () => { close(); go(btn); }); }
    });
  });
  el.querySelectorAll('[data-leave]').forEach((a) => a.addEventListener('click', (e) => {
    if (!s.dirty) { st = null; return; }
    e.preventDefault();
    openSheet({
      title: t('builder.discardTitle'),
      content: `<p class="muted">${esc(t('builder.discardText'))}</p><div class="sheet-actions">
        <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
        <button type="button" class="btn btn-danger" data-ok>${esc(t('builder.discard'))}</button></div>`,
      onMount(sheet, close) { sheet.querySelector('[data-ok]').addEventListener('click', () => { st = null; close(); location.hash = '#plano'; }); }
    });
  }));
}

/** Começa um construtor novo (opcionalmente com as respostas da triagem que acabou de ser feita). */
export function startBuilder(answers) {
  st = null;
  pendingAnswers = answers || null;
  location.hash = '#criar-plano';
}
let pendingAnswers = null;

export default {
  async render(el) {
    if (!st) {
      let answers = pendingAnswers;
      pendingAnswers = null;
      if (!answers) { const last = await lastTriage().catch(() => null); answers = last && last.answers; }
      const cur = getActivePlan();
      st = freshState(answers, cur && cur.data);
    }
    return draw(el);
  }
};
