// Hall da Fama: desafio da semana, catálogo por categoria, detalhes e conquistas.
import { t, getLanguage, tl } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { getSettings } from '../data/settings.js';
import { getActivePlan } from '../data/account.js';
import { loadCatalog, getExercise, exerciseName } from '../data/catalog.js';
import { CHALLENGES, CATEGORIES, getChallenge } from '../data/challenges.js';
import { loadRuns, loadPrefs, getShift, bumpShift } from '../data/hall.js';
import { eligible, currentChallenge, placement, weekKey, monthKey } from '../engine/hall.js';
import { equipmentFor } from '../engine/generator.js';
import { repsText, dayTitle } from '../data/labels.js';
import { formatWeight, formatDuration } from '../utils/units.js';
import { startChallenge } from './start.js';
import { diffBadge } from '../ui/difficulty.js';
import { quotesFor } from '../data/quotes.js';
import { coachTip } from '../ui/coach.js';
import { dayLabel } from '../data/labels.js';
import { challengeDifficulty } from '../engine/difficulty.js';

let filter = 'all';

const L = (o) => (o ? o[getLanguage()] || o.pt : '');
const initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('');

function placementText(pl, lang) {
  if (!pl) return '';
  const day = tl('weekdaysLong')[pl.date.getDay()];
  const isToday = new Date().toDateString() === pl.date.toDateString();
  const when = isToday ? t('hall.today') : day;
  return pl.mode === 'replace'
    ? t('hall.replaces', { k: pl.day.key, day: dayTitle(pl.day), when })
    : t('hall.extraDay', { when });
}

/** Estado do desafio atual (usado também pela tela Hoje). */
export async function hallState() {
  const row = getActivePlan();
  const [prefs, runs] = await Promise.all([loadPrefs(), loadRuns(), loadCatalog()]);
  const level = row?.data?.level || 'beginner';
  const equipment = prefs.answers ? equipmentFor(prefs.answers) : null;
  const pool = eligible({ categories: prefs.categories, level, equipment, getExercise });
  const mode = prefs.mode === 'monthly' ? 'monthly' : 'weekly';
  const key = mode === 'monthly' ? monthKey() : weekKey();
  const current = prefs.mode === 'none' ? null : currentChallenge(pool.length ? pool : CHALLENGES, { mode, shift: getShift(key) });
  const pl = current && row ? placement(current, row.data) : null;
  const doneThisWeek = current ? runs.some((r) => r.challenge_id === current.id && r.week_start === weekKey()) : false;
  return { row, prefs, runs, pool, mode, key, current, pl, doneThisWeek };
}

function workoutList(c, lang, unit) {
  return `<ol class="ex-list">${c.exercises.map((x, i) => {
    const e = getExercise(x.id);
    const first = x.group && (i === 0 || c.exercises[i - 1].group !== x.group);
    const last = x.group && (i === c.exercises.length - 1 || c.exercises[i + 1].group !== x.group);
    return `<li class="ex-row ${x.group ? 'grouped' : ''} ${first ? 'g-first' : ''} ${last ? 'g-last' : ''}">
      ${first ? `<span class="group-tag">${esc(c.exercises.filter((y) => y.group === x.group).length > 2 ? t('hall.circuit') : t('session.biset'))}</span>` : ''}
      <span class="ex-num num">${i + 1}</span>
      <div class="ex-main"><a class="ex-name ex-link" href="#ex-${esc(x.id)}">${esc(exerciseName(x.id, lang))}</a>
        <span class="ex-meta">${esc(e ? t('equip.' + e.equipment) : '')}${x.refKg ? ' · ' + esc(t('hall.refShort', { w: formatWeight(x.refKg, unit, lang) })) : ''}</span></div>
      <div class="ex-dose num">${x.sets} × ${esc(repsText(x.reps))}${x.restSec && (!x.group || last) ? `<small>${esc(t('plan.rest'))} ${esc(formatDuration(x.restSec, lang))}</small>` : ''}</div>
    </li>`;
  }).join('')}</ol>`;
}

function detail(el, c) {
  const lang = getLanguage();
  const unit = getSettings().weightUnit;
  const row = getActivePlan();
  const pl = row ? placement(c, row.data) : null;
  el.innerHTML = `
    <section class="screen">
      <a class="btn btn-sm btn-ghost back-link" href="#hall">${icon('chevron')}${esc(t('nav.hall'))}</a>
      <header class="hall-hero card">
        <div class="avatar cat-${esc(c.category)}">${esc(initials(c.person))}</div>
        <div class="hall-hero-text">
          <span class="eyebrow">${esc(t('triage.challenges.' + c.category))}</span>
          <h1>${esc(c.person)}</h1>
          <p class="hall-title">${esc(L(c.title))}</p>
          <div class="plan-meta">
            <span class="chip">${esc(c.kind === 'replace' ? t('hall.kindReplace') : t('hall.kindExtra'))}</span>
            ${diffBadge(challengeDifficulty(c), { label: true })}
            <span class="chip">${esc(t('results.exercises', { n: c.exercises.length }))}</span>
            <span class="chip src-${c.sourceType === 'inspired' ? 'inspired' : 'doc'}" title="${esc(t(c.sourceType === 'inspired' ? 'hall.inspiredHint' : 'hall.documentedHint'))}">${icon(c.sourceType === 'inspired' ? 'sparkle' : 'check')}${esc(t(c.sourceType === 'inspired' ? 'hall.inspired' : 'hall.documented'))}</span>
          </div>
        </div>
      </header>

      <div class="card">
        <div class="card-head"><div class="card-title">${icon('info')}<h2>${esc(t('hall.whoIs'))}</h2></div></div>
        <p>${esc(L(c.who))}</p>
        <p class="muted" style="margin-top:10px"><strong>${esc(t('hall.whyRef'))}</strong> ${esc(L(c.why))}</p>
        <div class="sug legend" style="margin-top:12px">${icon('sparkle')}<span><strong>${esc(t('hall.funFact'))}</strong> ${esc(L(c.fact))}</span></div>
        <p class="setting-hint" style="margin-top:10px">${esc(t(c.sourceType === 'inspired' ? 'hall.inspiredHint' : 'hall.documentedHint'))}</p>
        ${c.source ? `<a class="btn btn-sm btn-ghost" href="${esc(c.source)}" target="_blank" rel="noopener" style="margin-top:6px">${esc(t('hall.source'))}</a>` : ''}
        ${quotesFor(c.person).length ? `<div class="legend-quotes">${quotesFor(c.person).map((q) => `<blockquote><p>“${esc(L(q.text))}”</p><cite>${esc(c.person)} · ${esc(L(q.src))}</cite></blockquote>`).join('')}</div>` : ''}
      </div>

      <div class="card">
        <div class="card-head"><span class="eyebrow">${esc(t('hall.workout'))}</span></div>
        ${c.note ? `<p class="setting-hint" style="margin-bottom:8px">${esc(L(c.note))}</p>` : ''}
        ${workoutList(c, lang, unit)}
        ${pl ? `<p class="setting-hint" style="margin-top:12px">${icon('calendar')} ${esc(placementText(pl, lang))}</p>` : ''}
        <button type="button" class="btn btn-primary btn-block" data-start style="margin-top:12px">${icon('trophy')}${esc(t('hall.start'))}</button>
      </div>
      <p class="setting-hint" style="text-align:center">${esc(t('hall.disclaimer'))}</p>
    </section>`;
  el.querySelector('[data-start]').addEventListener('click', () => startChallenge(c));
  coachTip('hall');
}

export default {
  async render(el, param) {
    await loadCatalog();
    if (param) {
      const c = getChallenge(param);
      if (c) return detail(el, c);
    }
    el.innerHTML = '<section class="screen"><div class="center-state"><div class="spinner"></div></div></section>';
    const st = await hallState();
    if (!el.isConnected) return;
    const lang = getLanguage();
    const doneIds = new Set(st.runs.map((r) => r.challenge_id));
    const list = CHALLENGES.filter((c) => filter === 'all' || c.category === filter);
    const c = st.current;

    el.innerHTML = `
      <section class="screen">
        <header class="screen-head">
          <span class="eyebrow">${esc(t('nav.hall'))}</span>
          <h1>${esc(t('hall.title'))}</h1>
          <p class="muted">${esc(t('hall.subtitle'))}</p>
        </header>

        ${c ? `
        <div class="card hall-current">
          <div class="card-head">
            <span class="eyebrow">${esc(st.mode === 'monthly' ? t('hall.monthly') : t('hall.weekly'))}</span>
            ${st.doneThisWeek ? `<span class="chip chip-accent">${icon('check')}${esc(t('hall.doneWeek'))}</span>` : ''}
          </div>
          <div class="hall-row">
            <div class="avatar big cat-${esc(c.category)}">${esc(initials(c.person))}</div>
            <div>
              <h2>${esc(c.person)}</h2>
              <p class="hall-title">${esc(L(c.title))}</p>
              <div class="diff-row">${diffBadge(challengeDifficulty(c), { label: true })}</div>
              <p class="setting-hint">${esc(st.pl ? placementText(st.pl, lang) : t('hall.noPlan'))}</p>
            </div>
          </div>
          <div class="hall-actions">
            <button type="button" class="btn btn-primary" data-start ${st.doneThisWeek ? 'disabled' : ''}>${icon('trophy')}${esc(t('hall.start'))}</button>
            <a class="btn" href="#hall-${esc(c.id)}">${icon('info')}${esc(t('hall.details'))}</a>
            <button type="button" class="btn btn-ghost" data-shift>${esc(t('hall.shuffle'))}</button>
          </div>
        </div>` : `
        <div class="card"><div class="empty"><div class="empty-icon">${icon('trophy')}</div>
          <p>${esc(t('hall.disabled'))}</p></div></div>`}

        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('hall.achievements'))}</span><span class="chip num">${doneIds.size}/${CHALLENGES.length}</span></div>
          <div class="progress big"><i style="width:${(doneIds.size / CHALLENGES.length) * 100}%"></i></div>
          <p class="setting-hint" style="margin-top:8px">${esc(doneIds.size ? t('hall.achievementsText', { n: doneIds.size }) : t('hall.achievementsEmpty'))}</p>
        </div>

        <div class="chips" role="tablist">
          ${['all', ...CATEGORIES].map((k) => `<button type="button" class="chip-btn" data-filter="${k}" aria-pressed="${filter === k}">${esc(k === 'all' ? t('hall.all') : t('triage.challenges.' + k))}</button>`).join('')}
        </div>

        <div class="grid grid-3 hall-grid">
          ${list.map((x) => `
            <a class="card hall-card" href="#hall-${esc(x.id)}">
              <div class="hall-row">
                <div class="avatar cat-${esc(x.category)}">${esc(initials(x.person))}</div>
                <div style="min-width:0">
                  <h3>${esc(x.person)}</h3>
                  <p class="hall-title sm">${esc(L(x.title))}</p>
                </div>
                ${doneIds.has(x.id) ? `<span class="done-badge" title="${esc(t('hall.done'))}">${icon('check')}</span>` : ''}
              </div>
              <div class="plan-meta">
                <span class="chip">${esc(t('triage.challenges.' + x.category))}</span>
                <span class="chip">${esc(x.kind === 'replace' ? t('hall.kindReplace') : t('hall.kindExtra'))}</span>
                ${diffBadge(challengeDifficulty(x), { compact: true })}
              </div>
            </a>`).join('')}
        </div>
        <p class="setting-hint" style="text-align:center">${esc(t('hall.moreSoon'))}</p>
      </section>`;

    const start = el.querySelector('[data-start]');
    if (start && c) start.addEventListener('click', () => startChallenge(c));
    const shift = el.querySelector('[data-shift]');
    if (shift) shift.addEventListener('click', () => { bumpShift(st.key); this.render(el); });
    el.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.filter; this.render(el); }));
  }
};
