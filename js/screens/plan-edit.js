// Editar um dia do plano: foco por grupos (com prévia), exercícios, séries, reps, descanso e técnica planejada.
import { t, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast, openSheet } from '../ui/feedback.js';
import { getActivePlan, updateActivePlanData, lastTriage } from '../data/account.js';
import { getBuilderPlan, setBuilderDay, builderAnswers } from './builder.js';
import { loadCatalog, getExercise, exerciseName, musclesLine } from '../data/catalog.js';
import { EDIT_MUSCLES, fillDay, computeFocus, typeForMuscles, defaultPrescription, weekWarnings, equipmentFor } from '../engine/generator.js';
import { dayLabel, dayTitle } from '../data/labels.js';
import { TECHNIQUES, techName, groupSize, groupName } from '../data/techniques.js';
import { diffBadge } from '../ui/difficulty.js';
import { difficultyOf } from '../engine/difficulty.js';

let st = null; // { key, draft, muscles, focusApplied, preview, answers, dirty }

const muscleLabel = (m) => (m === 'fullbody' ? t('dayTypes.conditioning') : t('muscles.' + m));
const PLANNED = TECHNIQUES.filter((k) => !['normal', 'warmup'].includes(k));

function cleanGroups(list) {
  return list.map((x, i) => {
    if (!x.group) return x;
    const prev = list[i - 1], next = list[i + 1];
    if ((prev && prev.group === x.group) || (next && next.group === x.group)) return x;
    const { group, ...rest } = x;
    return rest;
  });
}

export function warningText(w) {
  const p = { ...w.p };
  if (p.m) p.m = Array.isArray(p.m) ? p.m.map(muscleLabel).join(', ') : muscleLabel(p.m);
  return t('edit.warn.' + w.key, p);
}

function openPicker(el, rerender, plan) {
  const lang = getLanguage();
  const equip = st.answers && st.answers.location ? equipmentFor(st.answers) : null;
  const f = { q: '', m: st.muscles[0] || 'all', mine: !!equip };
  openSheet({
    title: t('edit.add'),
    content: `<div class="picker">
      <input class="input" type="search" data-q placeholder="${esc(t('edit.search'))}" autocomplete="off">
      <div class="chips picker-chips">${['all', ...EDIT_MUSCLES].map((m) => `<button type="button" class="chip-btn" data-m="${m}" aria-pressed="${f.m === m}">${esc(m === 'all' ? t('edit.allMuscles') : muscleLabel(m))}</button>`).join('')}</div>
      ${equip ? `<label class="toggle-row"><span>${esc(t('edit.onlyMine'))}</span><input type="checkbox" data-mine checked></label>` : ''}
      <ul class="picker-list"></ul></div>`,
    onMount(sheet, close) {
      const ul = sheet.querySelector('.picker-list');
      const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const draw = async () => {
        const cat = await loadCatalog();
        const inDay = new Set(st.draft.exercises.map((x) => x.id));
        const q = norm(f.q);
        const list = cat.filter((e) => (q || f.m === 'all' || e.muscle === f.m) && (!f.mine || !equip || equip.has(e.equipment))
          && (!q || norm(e.name.pt).includes(q) || norm(e.name.en).includes(q))).slice(0, 60);
        ul.innerHTML = list.length ? list.map((e) => `<li><button type="button" class="pick-row" data-id="${esc(e.id)}" ${inDay.has(e.id) ? 'disabled' : ''}>
            <span><strong>${esc(e.name[lang] || e.name.pt)}</strong><small>${esc(musclesLine(e.id))} · ${esc(t('equip.' + e.equipment))}${inDay.has(e.id) ? ' · ' + esc(t('edit.inDay')) : ''}</small></span>${icon('plus')}</button></li>`).join('')
          : `<li class="muted" style="padding:12px 4px">${esc(t('edit.noResults'))}</li>`;
        ul.querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => {
          const ex = getExercise(b.dataset.id);
          st.draft.exercises.push({ id: ex.id, ...defaultPrescription(plan, ex) });
          st.dirty = true;
          close(); rerender();
        }));
      };
      sheet.querySelector('[data-q]').addEventListener('input', (e) => { f.q = e.target.value; draw(); });
      sheet.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => {
        f.m = b.dataset.m;
        sheet.querySelectorAll('[data-m]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      }));
      const mine = sheet.querySelector('[data-mine]');
      if (mine) mine.addEventListener('change', () => { f.mine = mine.checked; draw(); });
      draw();
    }
  });
}

async function render(el, routeKey) {
  const lang = getLanguage();
  // "novo-A" edita um dia do plano que está sendo montado no construtor (ainda não salvo)
  const builder = routeKey.startsWith('novo-');
  const key = builder ? routeKey.slice(5) : routeKey;
  const back = builder ? '#criar-plano' : '#plano';
  const bp = builder ? getBuilderPlan() : null;
  const row = builder ? (bp && { id: 'builder', data: bp }) : getActivePlan();
  if (!row) { location.hash = back; return; }
  const plan = row.data;
  const day = plan.days.find((d) => d.key === key);
  if (!day) { location.hash = back; return; }
  await loadCatalog();
  if (!st || st.key !== routeKey || st.planId !== row.id) {
    const triage = builder ? null : await lastTriage().catch(() => null);
    st = {
      key: routeKey, planId: row.id, draft: structuredClone(day), dirty: false, focusApplied: null, preview: null,
      muscles: (day.focusMuscles || computeFocus(day.exercises, getExercise)).filter((m) => EDIT_MUSCLES.includes(m)).slice(0, 3),
      answers: builder ? builderAnswers() : (triage && triage.answers)
    };
  }
  const d = st.draft;
  const rerender = () => render(el, routeKey);
  const planDraft = { ...plan, days: plan.days.map((x) => (x.key === key ? d : x)) };
  const warns = weekWarnings(planDraft, getExercise);
  const totalSets = d.exercises.reduce((n, x) => n + (Number(x.sets) || 0), 0);
  const nameOf = (id) => exerciseName(id, lang);

  el.innerHTML = `
    <section class="screen plan-edit">
      <a class="btn btn-sm btn-ghost back-link" href="${back}" data-leave>${icon('chevron')}${esc(builder ? t('builder.title') : t('nav.plan'))}</a>
      <header class="screen-head">
        <span class="eyebrow">${esc(dayTitle(day))}${day.edited && !builder ? ' · ' + esc(t('edit.edited')) : ''}</span>
        <h1>${esc(t('edit.title', { k: key }))}</h1>
      </header>

      <div class="card">
        <div class="card-head"><span class="eyebrow">${esc(t('edit.focus'))}</span></div>
        <p class="setting-hint">${esc(t('edit.focusHint'))}</p>
        <div class="chips" style="margin-top:10px">${EDIT_MUSCLES.map((m) => `<button type="button" class="chip-btn" data-mus="${m}" aria-pressed="${st.muscles.includes(m)}">${esc(muscleLabel(m))}</button>`).join('')}</div>
        <button type="button" class="btn btn-block" data-apply style="margin-top:12px">${icon('sparkle')}${esc(t('edit.apply'))}</button>
        ${st.preview ? `
        <div class="preview">
          <span class="eyebrow">${esc(t('edit.preview'))}</span>
          ${[['kept', st.preview.kept], ['added', st.preview.added], ['removed', st.preview.removed]].filter(([, l]) => l.length).map(([k, l]) => `
            <div class="pv-group pv-${k}"><strong>${esc(t('edit.' + k))}</strong>
              <ul>${l.map((id) => `<li>${icon(k === 'removed' ? 'minus' : k === 'added' ? 'plus' : 'check')}<span>${esc(nameOf(id))}</span></li>`).join('')}</ul></div>`).join('')}
          <div class="sheet-actions">
            <button type="button" class="btn btn-ghost" data-pv-cancel>${esc(t('sheet.cancel'))}</button>
            <button type="button" class="btn btn-primary" data-pv-ok>${icon('check')}${esc(t('edit.usePreview'))}</button>
          </div>
        </div>` : ''}
      </div>

      <div class="card">
        <div class="card-head"><span class="eyebrow">${esc(t('edit.exercises'))}</span>
          <span class="chip num">${esc(t('results.exercises', { n: d.exercises.length }))} · ${totalSets} ${esc(t('plan.sets'))}</span></div>
        <div class="diff-row">${diffBadge(difficultyOf(d.exercises), { label: true })}</div>
        <ol class="edit-list">${d.exercises.map((x, i) => {
          const gs = groupSize(d.exercises, i);
          const first = gs && (i === 0 || d.exercises[i - 1].group !== x.group);
          return `
          <li class="edit-row ${x.group ? 'grouped' : ''}" data-i="${i}">
            ${first ? `<span class="group-tag">${esc(groupName(gs))}</span>` : ''}
            <div class="edit-top">
              <span class="ex-num num">${i + 1}</span>
              <div class="ex-main"><span class="ex-name">${esc(nameOf(x.id))}</span><span class="ex-areas">${esc(musclesLine(x.id))}</span></div>
              <div class="edit-actions">
                <button type="button" class="icon-btn" data-up aria-label="${esc(t('plan.moveUp'))}" ${i === 0 ? 'disabled' : ''}>${icon('chevron')}</button>
                <button type="button" class="icon-btn" data-down aria-label="${esc(t('plan.moveDown'))}" ${i === d.exercises.length - 1 ? 'disabled' : ''}>${icon('chevron')}</button>
                <button type="button" class="icon-btn" data-link aria-pressed="${!!(x.group && d.exercises[i + 1] && d.exercises[i + 1].group === x.group)}" aria-label="${esc(t('plan.link'))}" title="${esc(t('plan.link'))}" ${i === d.exercises.length - 1 ? 'disabled' : ''}>${icon('plus')}</button>
                <button type="button" class="icon-btn danger-text" data-rm aria-label="${esc(t('edit.remove'))}">${icon('trash')}</button>
              </div>
            </div>
            <div class="edit-fields">
              <label><span>${esc(t('edit.sets'))}</span><div class="set-stepper">
                <button type="button" class="icon-btn" data-sets="-1" aria-label="-1">${icon('minus')}</button>
                <span class="num">${x.sets}</span>
                <button type="button" class="icon-btn" data-sets="1" aria-label="+1">${icon('plus')}</button></div></label>
              <label><span>${esc(t('edit.reps'))}</span><input class="input input-sm" data-reps value="${esc(x.reps)}" maxlength="12"></label>
              <label><span>${esc(t('edit.rest'))}</span><input class="input input-sm num" data-rest type="number" min="0" max="600" step="15" value="${x.restSec ?? ''}"></label>
              <label class="span2"><span>${esc(t('edit.technique'))}</span><div class="tech-pick">
                <select class="input input-sm" data-tech><option value="">—</option>${PLANNED.map((k) => `<option value="${k}" ${x.technique && x.technique.type === k ? 'selected' : ''}>${esc(techName(k))}</option>`).join('')}</select>
                <select class="input input-sm" data-tech-on ${x.technique ? '' : 'disabled'}>${['last', 'all'].map((o) => `<option value="${o}" ${(x.technique && x.technique.on || 'last') === o ? 'selected' : ''}>${esc(t('edit.techOn.' + o))}</option>`).join('')}</select>
              </div></label>
            </div>
          </li>`;
        }).join('')}</ol>
        <button type="button" class="btn btn-block" data-add style="margin-top:10px">${icon('plus')}${esc(t('edit.add'))}</button>
      </div>

      ${warns.length ? `<div class="card warn-card"><div class="card-head"><div class="card-title">${icon('info')}<h2>${esc(t('edit.warnings'))}</h2></div></div>
        <ul class="feature-list">${warns.map((w) => `<li>${icon('info')}<span>${esc(warningText(w))}</span></li>`).join('')}</ul></div>` : ''}

      <div class="edit-footer">
        <button type="button" class="btn btn-primary btn-block" data-save>${icon('check')}${esc(t('edit.save'))}</button>
        <div class="edit-footer-row">
          <a class="btn btn-ghost" href="${back}" data-leave>${esc(t('sheet.cancel'))}</a>
          ${day.original && !builder ? `<button type="button" class="btn btn-ghost" data-restore>${icon('sparkle')}${esc(t('edit.restore'))}</button>` : ''}
        </div>
      </div>
    </section>`;

  const at = (node) => Number(node.closest('.edit-row').dataset.i);
  const mark = () => { st.dirty = true; };

  // Foco
  el.querySelectorAll('[data-mus]').forEach((b) => b.addEventListener('click', () => {
    const m = b.dataset.mus;
    if (st.muscles.includes(m)) st.muscles = st.muscles.filter((x) => x !== m);
    else if (st.muscles.length >= 3) { toast(t('edit.max3'), 'info'); return; }
    else st.muscles = [...st.muscles, m];
    st.preview = null;
    rerender();
  }));
  el.querySelector('[data-apply]').addEventListener('click', async () => {
    if (!st.muscles.length) { toast(t('edit.pickOne'), 'info'); return; }
    const cat = await loadCatalog();
    const res = fillDay({ muscles: st.muscles, day: d, plan, answers: st.answers, catalog: cat });
    if (!res.added.length && !res.removed.length) {
      st.focusApplied = [...st.muscles];
      toast(t('edit.nothingChanged'), 'info');
      return;
    }
    st.preview = { ...res, muscles: [...st.muscles] };
    rerender();
    el.querySelector('.preview')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  el.querySelector('[data-pv-cancel]')?.addEventListener('click', () => { st.preview = null; rerender(); });
  el.querySelector('[data-pv-ok]')?.addEventListener('click', () => {
    // Exercícios mantidos guardam séries, reps, técnica e grupo que o usuário já tinha
    const prev = new Map(d.exercises.map((x) => [x.id, x]));
    d.exercises = cleanGroups(st.preview.exercises.map((x) => prev.get(x.id) || x));
    st.focusApplied = st.preview.muscles;
    st.preview = null; mark(); rerender();
  });

  // Exercícios
  el.querySelectorAll('[data-up]').forEach((b) => b.addEventListener('click', () => { const i = at(b); [d.exercises[i - 1], d.exercises[i]] = [d.exercises[i], d.exercises[i - 1]]; d.exercises = cleanGroups(d.exercises); mark(); rerender(); }));
  el.querySelectorAll('[data-down]').forEach((b) => b.addEventListener('click', () => { const i = at(b); [d.exercises[i + 1], d.exercises[i]] = [d.exercises[i], d.exercises[i + 1]]; d.exercises = cleanGroups(d.exercises); mark(); rerender(); }));
  el.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { d.exercises.splice(at(b), 1); d.exercises = cleanGroups(d.exercises); mark(); rerender(); }));
  el.querySelectorAll('[data-link]').forEach((b) => b.addEventListener('click', () => {
    const i = at(b), c = d.exercises;
    const linked = c[i].group && c[i + 1] && c[i + 1].group === c[i].group;
    if (linked) {
      // Separa: o próximo e os seguintes ganham outro grupo
      const g = c[i].group, ng = 'g' + Date.now().toString(36);
      for (let j = i + 1; j < c.length && c[j].group === g; j++) c[j] = { ...c[j], group: ng };
    } else {
      const g = c[i].group || c[i + 1].group || 'g' + Date.now().toString(36);
      const old = c[i + 1].group;
      c[i] = { ...c[i], group: g };
      for (let j = i + 1; j < c.length && (j === i + 1 || (old && c[j].group === old)); j++) c[j] = { ...c[j], group: g };
    }
    d.exercises = cleanGroups(c); mark(); rerender();
  }));
  el.querySelectorAll('[data-sets]').forEach((b) => b.addEventListener('click', () => {
    const x = d.exercises[at(b)];
    x.sets = Math.min(10, Math.max(1, (Number(x.sets) || 1) + Number(b.dataset.sets)));
    mark(); rerender();
  }));
  el.querySelectorAll('[data-reps]').forEach((inp) => inp.addEventListener('change', () => { const v = inp.value.trim(); if (v) { d.exercises[at(inp)].reps = v; mark(); } }));
  el.querySelectorAll('[data-rest]').forEach((inp) => inp.addEventListener('change', () => { d.exercises[at(inp)].restSec = Math.min(600, Math.max(0, Math.round(Number(inp.value) || 0))); mark(); }));
  el.querySelectorAll('[data-tech]').forEach((sel) => sel.addEventListener('change', () => {
    const x = d.exercises[at(sel)];
    if (!sel.value) delete x.technique; else x.technique = { type: sel.value, on: (x.technique && x.technique.on) || 'last' };
    mark(); rerender();
  }));
  el.querySelectorAll('[data-tech-on]').forEach((sel) => sel.addEventListener('change', () => {
    const x = d.exercises[at(sel)];
    if (x.technique) { x.technique.on = sel.value; mark(); }
  }));
  el.querySelector('[data-add]').addEventListener('click', () => openPicker(el, rerender, plan));

  // Salvar, restaurar, sair
  el.querySelector('[data-save]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (!d.exercises.length) { toast(t('edit.empty'), 'info'); return; }
    btn.disabled = true;
    if (builder) {
      const nd = { ...structuredClone(d), focus: computeFocus(d.exercises, getExercise) };
      if (st.focusApplied) { nd.focusMuscles = st.focusApplied; nd.type = typeForMuscles(st.focusApplied); }
      setBuilderDay(key, nd);
      st = null; toast(t('edit.saved'), 'check'); location.hash = back;
      return;
    }
    const data = structuredClone(plan);
    const idx = data.days.findIndex((x) => x.key === key);
    const orig = day.original || (({ original, edited, focusMuscles, ...rest }) => rest)(structuredClone(day));
    const next = { ...structuredClone(d), edited: true, original: orig, focus: computeFocus(d.exercises, getExercise) };
    if (st.focusApplied) { next.focusMuscles = st.focusApplied; next.type = typeForMuscles(st.focusApplied); }
    data.days[idx] = next;
    try { await updateActivePlanData(data); st = null; toast(t('edit.saved'), 'check'); location.hash = '#plano'; }
    catch (err) { btn.disabled = false; toast(t('auth.errGeneric'), 'info'); }
  });
  el.querySelector('[data-restore]')?.addEventListener('click', () => {
    openSheet({
      title: t('edit.restoreTitle'),
      content: `<p class="muted">${esc(t('edit.restoreText'))}</p><div class="sheet-actions">
        <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
        <button type="button" class="btn btn-primary" data-ok>${esc(t('edit.restore'))}</button></div>`,
      onMount(sheet, close) {
        sheet.querySelector('[data-ok]').addEventListener('click', async () => {
          const data = structuredClone(plan);
          const idx = data.days.findIndex((x) => x.key === key);
          data.days[idx] = { ...structuredClone(day.original), key };
          try { await updateActivePlanData(data); st = null; close(); toast(t('edit.restored'), 'check'); location.hash = '#plano'; }
          catch (err) { toast(t('auth.errGeneric'), 'info'); }
        });
      }
    });
  });
  el.querySelectorAll('[data-leave]').forEach((a) => a.addEventListener('click', (e) => {
    if (!st || !st.dirty) { st = null; return; }
    e.preventDefault();
    openSheet({
      title: t('edit.discardTitle'),
      content: `<p class="muted">${esc(t('edit.discardText'))}</p><div class="sheet-actions">
        <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
        <button type="button" class="btn btn-danger" data-ok>${esc(t('edit.discard'))}</button></div>`,
      onMount(sheet, close) { sheet.querySelector('[data-ok]').addEventListener('click', () => { st = null; close(); location.hash = back; }); }
    });
  }));
}

export default {
  render(el, key) {
    // Ao abrir pela navegação, só mantém o rascunho se houver mudanças não salvas do mesmo dia
    if (st && (st.key !== key || !st.dirty)) st = null;
    return render(el, key);
  }
};
