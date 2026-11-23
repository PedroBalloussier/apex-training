import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { loadCatalog, exerciseName } from '../data/catalog.js';
import { generatePlans, HOME_EXTRAS } from '../engine/generator.js';
import { saveTriage, activatePlan, lastTriage } from '../data/account.js';
import { dayLabel } from '../data/labels.js';
import { toast } from '../ui/feedback.js';

const DEFAULTS = {
  goal: null, level: null, weekdays: [], duration: 60, location: null, homeEquipment: [],
  focus: [], limitations: [], cardio: 'none', challenges: 'weekly',
  challengeCategories: ['film', 'fight', 'athletes', 'bodybuilding', 'legends'], cycleWeeks: 12
};

// Estado da triagem (sobrevive a trocas de idioma durante o preenchimento)
let state = null;

const STEPS = ['goal', 'level', 'days', 'duration', 'location', 'focus', 'limitations', 'cardio', 'challenges', 'cycle'];

function option(group, value, title, desc, selected, multi = false) {
  return `<button type="button" class="option" data-group="${group}" data-value="${value}" ${multi ? 'role="checkbox" aria-checked' : 'aria-pressed'}="${selected}">
    <span class="option-text"><span class="option-title">${esc(title)}</span>${desc ? `<span class="option-desc">${esc(desc)}</span>` : ''}</span>
    <span class="option-check">${icon('check')}</span>
  </button>`;
}
const chip = (group, value, label, selected) =>
  `<button type="button" class="chip-btn" data-group="${group}" data-value="${value}" aria-pressed="${selected}">${esc(label)}</button>`;

function stepBody(step, a) {
  const T = (k) => t(`triage.${step}.${k}`);
  switch (step) {
    case 'goal':
      return `<div class="options">${['hypertrophy', 'strength', 'endurance', 'fat_loss', 'general']
        .map((v) => option('goal', v, T(v), T(v + 'D'), a.goal === v)).join('')}</div>`;
    case 'level':
      return `<div class="options">${['beginner', 'intermediate', 'advanced']
        .map((v) => option('level', v, T(v), T(v + 'D'), a.level === v)).join('')}</div>`;
    case 'days': {
      const names = tl('weekdays');
      const order = [1, 2, 3, 4, 5, 6, 0];
      return `<div class="weekdays">${order.map((d) => chip('weekdays', d, names[d], a.weekdays.includes(d))).join('')}</div>
        <p class="setting-hint" data-days-count>${a.weekdays.length ? esc(t('triage.days.count', { n: a.weekdays.length })) : ''}</p>`;
    }
    case 'duration':
      return `<div class="chips">${[30, 45, 60, 75, 90].map((v) => chip('duration', v, `${v} ${T('unit')}`, a.duration === v)).join('')}</div>`;
    case 'location':
      return `<div class="options cols-2">${['full_gym', 'basic_gym', 'home', 'bodyweight']
        .map((v) => option('location', v, T(v), T(v + 'D'), a.location === v)).join('')}</div>
        ${a.location === 'home' ? `<div class="wizard-sub"><span class="label setting-label">${esc(T('extras'))}</span>
          <div class="chips">${HOME_EXTRAS.map((v) => chip('homeEquipment', v, T(v), a.homeEquipment.includes(v))).join('')}</div></div>` : ''}`;
    case 'focus':
      return `<div class="chips">${['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core']
        .map((v) => chip('focus', v, T(v), a.focus.includes(v))).join('')}</div>`;
    case 'limitations':
      return `<div class="chips">${['shoulder', 'lower_back', 'knee', 'wrist', 'elbow', 'none']
        .map((v) => chip('limitations', v, T(v), a.limitations.includes(v))).join('')}</div>`;
    case 'cardio':
      return `<div class="options">${['none', 'finisher', 'hybrid']
        .map((v) => option('cardio', v, T(v), T(v + 'D'), a.cardio === v)).join('')}</div>`;
    case 'challenges':
      return `<div class="chips">${['weekly', 'monthly', 'none'].map((v) => chip('challenges', v, T(v), a.challenges === v)).join('')}</div>
        ${a.challenges !== 'none' ? `<div class="wizard-sub"><span class="label setting-label">${esc(T('categories'))}</span>
          <div class="chips">${['film', 'fight', 'athletes', 'bodybuilding', 'legends']
            .map((v) => chip('challengeCategories', v, T(v), a.challengeCategories.includes(v))).join('')}</div></div>` : ''}`;
    case 'cycle':
      return `<div class="options">${option('cycleWeeks', 12, T('w12'), T('w12D'), a.cycleWeeks === 12)}${option('cycleWeeks', 8, T('w8'), T('w8D'), a.cycleWeeks === 8)}</div>`;
  }
  return '';
}

const HINTS = { days: 'triage.days.hint', focus: 'triage.focus.hint', limitations: 'triage.limitations.hint', challenges: 'triage.challenges.hint', cycle: 'triage.cycle.hint' };

function canAdvance(step, a) {
  switch (step) {
    case 'goal': return !!a.goal;
    case 'level': return !!a.level;
    case 'days': return a.weekdays.length >= 2 && a.weekdays.length <= 6;
    case 'location': return !!a.location;
    case 'limitations': return a.limitations.length > 0;
    default: return true;
  }
}

function toggle(arr, v) { return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]; }

function applyChoice(a, group, raw) {
  const num = ['weekdays', 'duration', 'cycleWeeks'].includes(group);
  const v = num ? Number(raw) : raw;
  switch (group) {
    case 'weekdays': a.weekdays = toggle(a.weekdays, v).slice(0, 7); break;
    case 'homeEquipment': a.homeEquipment = toggle(a.homeEquipment, v); break;
    case 'focus': {
      const next = toggle(a.focus, v);
      a.focus = next.length > 2 ? next.slice(-2) : next;
      break;
    }
    case 'limitations':
      if (v === 'none') a.limitations = a.limitations.includes('none') ? [] : ['none'];
      else a.limitations = toggle(a.limitations.filter((x) => x !== 'none'), v);
      break;
    case 'challengeCategories': a.challengeCategories = toggle(a.challengeCategories, v); break;
    default: a[group] = v;
  }
}

function renderStep(el) {
  const step = STEPS[state.step];
  const a = state.answers;
  const n = state.step + 1;
  const last = n === STEPS.length;

  el.innerHTML = `
    <section class="screen wizard">
      <div class="wizard-top">
        <span class="eyebrow">${esc(t('triage.eyebrow'))} · ${esc(t('triage.step', { n, t: STEPS.length }))}</span>
        ${['focus', 'cardio', 'challenges'].includes(step) ? `<span class="chip">${esc(t('triage.optional'))}</span>` : ''}
      </div>
      <div class="progress" aria-hidden="true"><i style="width:${(n / STEPS.length) * 100}%"></i></div>
      <div class="wizard-q">
        <h1>${esc(t(`triage.${step}.q`))}</h1>
        ${HINTS[step] ? `<p class="muted">${esc(t(HINTS[step]))}</p>` : ''}
        ${step === 'level' && state.levelHint ? `<div class="sug up">${icon('trophy')}<span>${esc(t('report.levelHint', { level: t('triage.level.' + state.levelHint) }))}</span></div>` : ''}
      </div>
      <div data-body>${stepBody(step, a)}</div>
      <div class="wizard-actions">
        ${state.step > 0 ? `<button type="button" class="btn btn-ghost" data-back>${esc(t('triage.back'))}</button>` : '<span></span>'}
        <button type="button" class="btn btn-primary" data-next ${canAdvance(step, a) ? '' : 'disabled'}>${esc(last ? t('triage.finish') : t('triage.next'))}</button>
      </div>
    </section>`;

  el.querySelector('[data-body]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-group]');
    if (!b) return;
    applyChoice(a, b.dataset.group, b.dataset.value);
    const single = ['goal', 'level', 'location', 'cardio', 'cycleWeeks'].includes(b.dataset.group);
    renderStep(el);
    // Escolha única avança sozinha (exceto quando abre sub-opções)
    if (single && !(b.dataset.group === 'location' && a.location === 'home')) {
      setTimeout(() => { if (STEPS[state.step] === step && canAdvance(step, a) && !last) { state.step++; renderStep(el); } }, 180);
    }
  });
  const back = el.querySelector('[data-back]');
  if (back) back.addEventListener('click', () => { state.step--; renderStep(el); });
  el.querySelector('[data-next]').addEventListener('click', () => {
    if (!canAdvance(step, a)) return;
    if (last) return showResults(el);
    state.step++;
    renderStep(el);
    window.scrollTo({ top: 0 });
  });
}

async function showResults(el) {
  el.innerHTML = `<div class="center-state"><div><div class="spinner"></div><p class="muted" style="margin-top:12px">${esc(t('triage.generating'))}</p></div></div>`;
  const catalog = await loadCatalog();
  state.plans = generatePlans(state.answers, catalog);
  state.view = 'results';
  renderResults(el);
}

function renderResults(el) {
  const lang = getLanguage();
  const plans = state.plans;
  el.innerHTML = `
    <section class="screen">
      <header class="screen-head">
        <span class="eyebrow">${esc(t('results.eyebrow'))}</span>
        <h1>${esc(t('results.title'))}</h1>
        <p class="muted">${esc(t('results.subtitle', { n: plans.length }))}</p>
      </header>
      <div class="grid ${plans.length === 3 ? 'grid-3' : 'grid-2'}">
        ${plans.map((p, i) => `
          <article class="card plan-card ${p.recommended ? 'rec' : ''}">
            <div>
              ${p.recommended ? `<span class="chip chip-accent" style="margin-bottom:10px">${icon('sparkle')}${esc(t('results.recommended'))}</span>` : ''}
              <h2>${esc(t('splits.' + p.split))}</h2>
              <p class="muted" style="margin-top:6px;font-size:14.5px">${esc(t('splitDesc.' + p.split))}</p>
            </div>
            <div class="plan-meta">
              <span class="chip">${esc(t('goals.' + p.goal))}</span>
              <span class="chip">${esc(t('results.perWeek', { d: p.daysPerWeek }))}</span>
              <span class="chip">${esc(t('results.weeks', { w: p.cycleWeeks }))}</span>
            </div>
            <div class="day-list">
              ${p.days.map((d) => `
                <div class="day-item">
                  <span class="day-badge day-${d.key}">${d.key}</span>
                  <div class="day-text">
                    <span class="day-title">${esc(dayLabel(d.type))}</span>
                    <span class="day-ex">${esc(d.exercises.slice(0, 3).map((x) => exerciseName(x.id, lang)).join(' · '))}${d.exercises.length > 3 ? ' · +' + (d.exercises.length - 3) : ''}</span>
                  </div>
                </div>`).join('')}
            </div>
            <p class="setting-hint">${esc(p.recommended ? t('results.reasonRec') : t('results.reasonAlt'))}</p>
            <button type="button" class="btn ${p.recommended ? 'btn-primary' : ''} btn-block" data-choose="${i}" style="margin-top:auto">${esc(t('results.choose'))}</button>
          </article>`).join('')}
      </div>
      <div style="display:flex;justify-content:center">
        <button type="button" class="btn btn-ghost" data-redo>${esc(t('results.redo'))}</button>
      </div>
    </section>`;

  el.querySelector('[data-redo]').addEventListener('click', () => { state.view = 'steps'; state.step = 0; renderStep(el); });
  el.querySelectorAll('[data-choose]').forEach((b) => b.addEventListener('click', async () => {
    const plan = { ...state.plans[Number(b.dataset.choose)], name: state.plans[Number(b.dataset.choose)].split };
    el.querySelectorAll('[data-choose]').forEach((x) => { x.disabled = true; });
    b.textContent = t('results.saving');
    try {
      if (!state.triageId) state.triageId = await saveTriage(state.answers);
      await activatePlan(plan, state.triageId);
      toast(t('results.chosen'));
      state = null;
      location.hash = '#plano';
    } catch (err) {
      toast(t('results.errSave'), 'info');
      el.querySelectorAll('[data-choose]').forEach((x) => { x.disabled = false; });
      b.textContent = t('results.choose');
    }
  }));
}

export default {
  async render(el) {
    if (!state) {
      state = { step: 0, view: 'steps', answers: structuredClone(DEFAULTS), plans: null, triageId: null };
      // Pré-preenche com a última triagem, quando existir
      try {
        const last = await lastTriage();
        if (last && last.answers) state.answers = { ...structuredClone(DEFAULTS), ...last.answers };
      } catch (e) { /* segue com os padrões */ }
      try {
        const hint = sessionStorage.getItem('apex:levelHint');
        sessionStorage.removeItem('apex:levelHint');
        if (hint) { state.answers.level = hint; state.levelHint = hint; }
      } catch (e) { /* sem sessionStorage */ }
    }
    if (state.view === 'results' && state.plans) renderResults(el);
    else renderStep(el);
  },
  reset() { state = null; }
};
