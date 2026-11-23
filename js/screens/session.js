// Sessão de treino: registro série a série, descanso, sugestão de carga, bi-sets.
import { t, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast, openSheet } from '../ui/feedback.js';
import { getSettings } from '../data/settings.js';
import { loadCatalog, getExercise, exerciseName } from '../data/catalog.js';
import {
  loadWorkouts, getOpen, saveSet, updateOpenExercises, finishWorkout, discardWorkout, lastSessions, bestWeights, streak
} from '../data/workouts.js';
import { suggest, repRange } from '../engine/progression.js';
import { weightToUser, weightFromUser, formatWeight, formatDuration } from '../utils/units.js';
import { openSwap } from '../ui/swap.js';
import { markDone } from '../data/hall.js';
import { logWorkoutPoints } from '../data/party.js';
import { getActivePlan } from '../data/account.js';
import { weekKey } from '../engine/hall.js';
import { coachTip } from '../ui/coach.js';
import { dayLabel, repsText } from '../data/labels.js';

let ctx = null;          // { workoutId, last: Map, best: Map, extra: {pos: n}, draft: {} }
let elapsedTimer = null;

/* ---------- Cronômetro de descanso (fica fora da tela, sobrevive a redesenhos) ---------- */
const rest = { end: 0, total: 0, timer: null };

function restRoot() {
  let r = document.getElementById('rest-root');
  if (!r) { r = document.createElement('div'); r.id = 'rest-root'; document.body.appendChild(r); }
  return r;
}

function stopRest() {
  clearInterval(rest.timer); rest.timer = null; rest.end = 0;
  restRoot().innerHTML = '';
}

function startRest(seconds) {
  if (!seconds) return;
  rest.total = seconds;
  rest.end = Date.now() + seconds * 1000;
  clearInterval(rest.timer);
  drawRest();
  rest.timer = setInterval(drawRest, 250);
}

function drawRest() {
  const left = Math.max(0, Math.ceil((rest.end - Date.now()) / 1000));
  const root = restRoot();
  if (left <= 0) {
    stopRest();
    try { navigator.vibrate && navigator.vibrate([180, 80, 180]); } catch (e) {}
    toast(t('session.restDone'), 'timer');
    return;
  }
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0');
  const pct = Math.min(100, (1 - left / rest.total) * 100);
  if (!root.firstElementChild) {
    root.innerHTML = `<div class="rest-bar" role="timer">
      <div class="rest-progress"><i></i></div>
      <div class="rest-row">
        <span class="rest-label">${icon('timer')}<span>${esc(t('session.rest'))}</span></span>
        <span class="rest-time num" aria-live="off"></span>
        <div class="rest-actions">
          <button type="button" class="btn btn-sm" data-r="-15">-15</button>
          <button type="button" class="btn btn-sm" data-r="15">+15</button>
          <button type="button" class="btn btn-sm btn-primary" data-r="skip">${esc(t('session.skip'))}</button>
        </div>
      </div></div>`;
    root.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.r;
      if (v === 'skip') return stopRest();
      rest.end += Number(v) * 1000; rest.total += Number(v);
      if (rest.end <= Date.now()) stopRest(); else drawRest();
    }));
  }
  root.querySelector('.rest-time').textContent = `${mm}:${ss}`;
  root.querySelector('.rest-progress i').style.width = pct + '%';
}

/* ---------- Ajudas ---------- */
const keyOf = (p, n) => `${p}-${n}`;
const setsAt = (w, p) => w.sets.filter((s) => s.position === p);
const findSet = (w, p, n) => w.sets.find((s) => s.position === p && s.set_number === n);

function rowCount(w, p) {
  const x = w.exercises[p];
  const saved = setsAt(w, p).reduce((m, s) => Math.max(m, s.set_number), 0);
  return Math.max(x.sets, saved, ctx.extra[p] || 0);
}

function groupInfo(list, i) {
  const x = list[i];
  if (!x.group) return { inGroup: false, first: false, last: true };
  const first = i === 0 || list[i - 1].group !== x.group;
  const last = i === list.length - 1 || list[i + 1].group !== x.group;
  return { inGroup: true, first, last };
}

function suggestionText(sug, unit, lang) {
  if (!sug) return '';
  if (sug.reason === 'first') return t('session.sugFirst');
  const last = `${formatWeight(sug.lastWeightKg, unit, lang)} × ${sug.lastReps.join(', ')}`;
  if (sug.reason === 'up') return t('session.sugUp', { w: formatWeight(sug.weightKg, unit, lang), last });
  if (sug.reason === 'hold') return t('session.sugHold', { w: formatWeight(sug.weightKg, unit, lang), last });
  return t('session.sugReps', { w: formatWeight(sug.weightKg, unit, lang), last });
}

/* ---------- Tela ---------- */
function render(el) {
  const w = getOpen();
  if (!w) { location.hash = '#hoje'; return; }
  const lang = getLanguage();
  const unit = getSettings().weightUnit;
  const list = w.exercises;
  const doneCount = w.sets.filter((s) => s.done).length;
  const totalRows = list.reduce((sum, _, p) => sum + rowCount(w, p), 0);

  el.innerHTML = `
    <section class="screen session">
      <header class="session-head">
        <div class="card-title">
          <span class="day-badge day-${esc(w.day_key)}">${esc(w.day_key)}</span>
          <div><span class="eyebrow">${esc(t('session.eyebrow'))} · <span class="num" data-elapsed></span></span>
            <h1>${esc(dayLabel(w.day_type))}</h1></div>
        </div>
        <button type="button" class="icon-btn" data-menu aria-label="${esc(t('plan.actions'))}">${icon('more')}</button>
      </header>
      <div class="progress" aria-hidden="true"><i style="width:${totalRows ? (doneCount / totalRows) * 100 : 0}%"></i></div>

      ${list.map((x, p) => {
        const e = getExercise(x.id);
        const g = groupInfo(list, p);
        const range = repRange(x.reps);
        const last = ctx.last.get(x.id);
        const sug = e ? suggest(e, x, last) : null;
        const rows = rowCount(w, p);
        const anyDone = setsAt(w, p).some((s) => s.done);
        const rowHtml = [];
        for (let n = 1; n <= rows; n++) {
          const s = findSet(w, p, n);
          const d = ctx.draft[keyOf(p, n)] || {};
          const lastSet = last && (last.sets[n - 1] || last.sets[last.sets.length - 1]);
          const phW = sug && sug.weightKg != null ? weightToUser(sug.weightKg, unit) : (lastSet ? weightToUser(Number(lastSet.weight_kg || 0), unit) : '');
          const phR = range ? range[0] : '';
          const wVal = s ? (s.weight_kg != null ? weightToUser(Number(s.weight_kg), unit) : '') : (d.w ?? '');
          const rVal = s ? (s.reps ?? '') : (d.r ?? '');
          const fail = s ? s.to_failure : !!d.f;
          const done = s && s.done;
          rowHtml.push(`
            <div class="set-row ${done ? 'done' : ''}" data-p="${p}" data-n="${n}">
              <span class="set-n num">${n}</span>
              <div class="input-unit"><input class="input input-sm num" data-f="w" type="number" inputmode="decimal" step="0.25" min="0"
                value="${esc(wVal)}" placeholder="${esc(phW)}" aria-label="${esc(t('session.weight'))} ${n}" ${done ? 'disabled' : ''}><span>${esc(unit)}</span></div>
              <div class="input-unit"><input class="input input-sm num" data-f="r" type="number" inputmode="numeric" step="1" min="0"
                value="${esc(rVal)}" placeholder="${esc(phR)}" aria-label="${esc(t('session.reps'))} ${n}" ${done ? 'disabled' : ''}><span></span></div>
              <button type="button" class="fail-btn" data-fail aria-pressed="${fail}" title="${esc(t('session.failureHint'))}" ${done ? 'disabled' : ''}>F</button>
              <button type="button" class="check-btn" data-done aria-pressed="${!!done}" aria-label="${esc(t('session.markDone'))} ${n}">${icon('check')}</button>
            </div>`);
        }
        return `
          ${g.first ? `<div class="group-label">${icon('plus')}${esc(t('session.bisetHint'))}</div>` : ''}
          <article class="card ex-card ${g.inGroup ? 'grouped' : ''} ${g.first ? 'g-first' : ''} ${g.last && g.inGroup ? 'g-last' : ''}" data-ex="${p}">
            <div class="ex-card-head">
              <div class="ex-main">
                <a class="ex-name ex-link" href="#ex-${esc(x.id)}">${esc(exerciseName(x.id, lang))}${icon('info')}</a>
                <span class="ex-meta">${esc(x.sets)} × ${esc(repsText(x.reps))}${x.restSec && g.last ? ' · ' + esc(t('plan.rest')) + ' ' + esc(formatDuration(x.restSec, lang)) : ''}${e && e.unilateral ? ' · ' + esc(t('session.perSide')) : ''}</span>
              </div>
              <button type="button" class="icon-btn" data-swap="${p}" aria-label="${esc(t('plan.swap'))}" title="${esc(t('plan.swap'))}" ${anyDone ? 'disabled' : ''}>${icon('dumbbell')}</button>
            </div>
            ${x.refKg ? `<div class="sug legend">${icon('trophy')}<span>${esc(t('hall.refLoad', { w: formatWeight(x.refKg, unit, lang) }))}</span></div>` : ''}
            ${sug ? `<div class="sug ${sug.reason}">${icon(sug.reason === 'up' ? 'sparkle' : 'info')}<span>${esc(suggestionText(sug, unit, lang))}</span></div>` : ''}
            <div class="set-head"><span>#</span><span>${esc(t('session.weight'))}</span><span>${esc(range ? t('session.reps') : t('session.time'))}</span><span></span><span></span></div>
            <div class="sets">${rowHtml.join('')}</div>
            <div class="ex-card-foot">
              <button type="button" class="btn btn-sm btn-ghost" data-add="${p}">${icon('plus')}${esc(t('session.addSet'))}</button>
              ${last ? `<button type="button" class="btn btn-sm btn-ghost" data-repeat="${p}">${icon('copy')}${esc(t('session.repeatLast'))}</button>` : ''}
            </div>
          </article>`;
      }).join('')}

      <button type="button" class="btn btn-primary btn-block" data-finish>${icon('check')}${esc(t('session.finish'))}</button>
    </section>`;

  // Cronômetro do treino
  const tick = () => {
    const sec = Math.round((Date.now() - new Date(w.started_at).getTime()) / 1000);
    const node = el.querySelector('[data-elapsed]');
    if (!node) return clearInterval(elapsedTimer);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    node.textContent = (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  };
  clearInterval(elapsedTimer); tick(); elapsedTimer = setInterval(tick, 1000);

  // Rascunho dos campos (sem redesenhar)
  el.querySelectorAll('.set-row input').forEach((inp) => inp.addEventListener('input', () => {
    const row = inp.closest('.set-row');
    const k = keyOf(row.dataset.p, row.dataset.n);
    ctx.draft[k] = { ...(ctx.draft[k] || {}), [inp.dataset.f]: inp.value };
  }));
  el.querySelectorAll('[data-fail]').forEach((b) => b.addEventListener('click', () => {
    const row = b.closest('.set-row');
    const k = keyOf(row.dataset.p, row.dataset.n);
    const v = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(v));
    ctx.draft[k] = { ...(ctx.draft[k] || {}), f: v };
  }));

  // Marcar série como feita
  el.querySelectorAll('[data-done]').forEach((b) => b.addEventListener('click', async () => {
    const row = b.closest('.set-row');
    const p = Number(row.dataset.p), n = Number(row.dataset.n);
    const x = list[p];
    const existing = findSet(w, p, n);
    b.disabled = true;
    try {
      if (existing && existing.done) {
        await saveSet({ exercise_id: existing.exercise_id, position: p, set_number: n, reps: existing.reps, weight_kg: existing.weight_kg, to_failure: existing.to_failure, done: false });
        ctx.draft[keyOf(p, n)] = { w: existing.weight_kg != null ? weightToUser(Number(existing.weight_kg), unit) : '', r: existing.reps ?? '', f: existing.to_failure };
        return render(el);
      }
      const wInp = row.querySelector('[data-f="w"]'), rInp = row.querySelector('[data-f="r"]');
      const wRaw = wInp.value !== '' ? wInp.value : wInp.placeholder;
      const rRaw = rInp.value !== '' ? rInp.value : rInp.placeholder;
      const range = repRange(x.reps);
      if (range && (rRaw === '' || !(Number(rRaw) >= 0))) { b.disabled = false; rInp.focus(); toast(t('session.needReps'), 'info'); return; }
      const weightKg = wRaw === '' ? null : Math.round(weightFromUser(wRaw, unit) * 100) / 100;
      await saveSet({
        exercise_id: x.id, position: p, set_number: n,
        reps: rRaw === '' ? null : Math.round(Number(rRaw)),
        weight_kg: weightKg, to_failure: row.querySelector('[data-fail]').getAttribute('aria-pressed') === 'true', done: true
      });
      delete ctx.draft[keyOf(p, n)];
      const g = groupInfo(list, p);
      // Bi-set: descanso só depois do último exercício do grupo
      if (!g.inGroup || g.last) startRest(x.restSec || getSettings().restSeconds);
      render(el);
    } catch (err) {
      b.disabled = false;
      toast(t('session.saveFail'), 'info');
    }
  }));

  el.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => {
    const p = Number(b.dataset.add);
    ctx.extra[p] = rowCount(w, p) + 1;
    render(el);
  }));

  el.querySelectorAll('[data-repeat]').forEach((b) => b.addEventListener('click', () => {
    const p = Number(b.dataset.repeat);
    const last = ctx.last.get(list[p].id);
    if (!last) return;
    for (let n = 1; n <= rowCount(w, p); n++) {
      if (findSet(w, p, n)?.done) continue;
      const ls = last.sets[n - 1] || last.sets[last.sets.length - 1];
      ctx.draft[keyOf(p, n)] = { ...(ctx.draft[keyOf(p, n)] || {}), w: ls.weight_kg != null ? weightToUser(Number(ls.weight_kg), unit) : '', r: ls.reps ?? '' };
    }
    render(el);
  }));

  el.querySelectorAll('[data-swap]').forEach((b) => b.addEventListener('click', () => {
    const p = Number(b.dataset.swap);
    openSwap({
      exerciseId: list[p].id, note: t('swap.sessionNote'),
      onPick: async (newId) => {
        const next = list.map((x, i) => (i === p ? { ...x, id: newId } : x));
        try {
          await updateOpenExercises(next);
          const ids = next.map((x) => x.id);
          ctx.last = await lastSessions(ids);
          ctx.best = await bestWeights(ids);
        } catch (e) { toast(t('auth.errGeneric'), 'info'); }
        render(el);
      }
    });
  }));

  el.querySelector('[data-menu]').addEventListener('click', () => {
    openSheet({
      title: t('session.menuTitle'),
      content: `<div class="more-menu">
        <button type="button" class="nav-item" data-a="discard">${icon('trash')}<span>${esc(t('session.discard'))}</span></button>
      </div>`,
      onMount(sheet, close) {
        sheet.querySelector('[data-a="discard"]').addEventListener('click', () => { close(); confirmDiscard(); });
      }
    });
  });

  el.querySelector('[data-finish]').addEventListener('click', () => openFinish(el));
}

function confirmDiscard() {
  openSheet({
    title: t('session.discardTitle'),
    content: `<p class="muted">${esc(t('session.discardText'))}</p>
      <div class="sheet-actions">
        <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
        <button type="button" class="btn btn-danger" data-ok>${icon('trash')}${esc(t('session.discard'))}</button>
      </div>`,
    onMount(sheet, close) {
      sheet.querySelector('[data-ok]').addEventListener('click', async () => {
        await discardWorkout(); stopRest(); close(); ctx = null; location.hash = '#hoje';
      });
    }
  });
}

function openFinish(el) {
  const w = getOpen();
  const lang = getLanguage();
  const unit = getSettings().weightUnit;
  const done = w.sets.filter((s) => s.done);
  if (!done.length) return confirmDiscard();
  const volume = done.reduce((sum, s) => sum + Number(s.weight_kg || 0) * Number(s.reps || 0), 0);
  const prs = [];
  const maxToday = new Map();
  for (const s of done) maxToday.set(s.exercise_id, Math.max(maxToday.get(s.exercise_id) || 0, Number(s.weight_kg || 0)));
  for (const [id, wt] of maxToday) {
    const prev = ctx.best.get(id);
    if (prev != null && prev > 0 && wt > prev) prs.push({ id, wt });
  }
  const totalRows = w.exercises.reduce((sum, _, p) => sum + rowCount(w, p), 0);
  const sec = Math.round((Date.now() - new Date(w.started_at).getTime()) / 1000);
  const kpi = (l, v) => `<div class="kpi"><span class="kpi-label">${esc(l)}</span><span class="kpi-value num">${esc(v)}</span></div>`;

  openSheet({
    title: t('session.summaryTitle'),
    content: `
      <div class="kpis" style="margin-bottom:14px">
        ${kpi(t('session.duration'), formatDuration(sec - (sec % 60) || sec, lang))}
        ${kpi(t('session.setsDone'), `${done.length}/${totalRows}`)}
        ${kpi(t('session.volume'), formatWeight(volume, unit, lang))}
      </div>
      ${prs.length ? `<div class="sug up">${icon('trophy')}<span>${esc(t('session.prs', { n: prs.length }))}: ${esc(prs.map((r) => `${exerciseName(r.id, lang)} ${formatWeight(r.wt, unit, lang)}`).join(' · '))}</span></div>` : ''}
      ${done.length < totalRows ? `<p class="setting-hint" style="margin-top:10px">${esc(t('session.incomplete'))}</p>` : ''}
      <div class="sheet-actions">
        <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('session.keepGoing'))}</button>
        <button type="button" class="btn btn-primary" data-ok>${icon('check')}${esc(t('session.finishConfirm'))}</button>
      </div>`,
    onMount(sheet, close) {
      const okBtn = sheet.querySelector('[data-ok]');
      okBtn.addEventListener('click', async () => {
        okBtn.disabled = true;
        try {
          const doneRow = await finishWorkout();
          if (doneRow.day_type && doneRow.day_type.startsWith('hall:')) {
            try { await markDone(doneRow.day_type.slice(5), doneRow.id); } catch (e) { /* o treino já está salvo */ }
          }
          stopRest(); close(); ctx = null;
          toast(t('session.finished'), 'trophy');
          // Pontos da Party em segundo plano (não atrasa o fim do treino)
          const plan = getActivePlan();
          logWorkoutPoints({ workout: doneRow, prs, streakDays: plan ? streak(plan.data.schedule) : 0, weekKey: weekKey() })
            .then((n) => { if (n > 0) setTimeout(() => toast(t('party.pointsToast', { n }), 'users'), 1600); });
          location.hash = '#hoje';
        } catch (err) {
          okBtn.disabled = false;
          toast(t('session.saveFail'), 'info');
        }
      });
    }
  });
}

export default {
  async render(el) {
    await Promise.all([loadCatalog(), loadWorkouts()]);
    const w = getOpen();
    if (!w) { location.hash = '#hoje'; return; }
    if (!ctx || ctx.workoutId !== w.id) {
      el.innerHTML = '<div class="center-state"><div class="spinner"></div></div>';
      const ids = w.exercises.map((x) => x.id);
      const [last, best] = await Promise.all([lastSessions(ids), bestWeights(ids)]);
      ctx = { workoutId: w.id, last, best, extra: {}, draft: {} };
    }
    render(el);
    if (rest.end > Date.now()) drawRest();
    coachTip('session', { delay: 900 });
  }
};
