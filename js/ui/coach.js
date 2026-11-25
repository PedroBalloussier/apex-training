// Apex Coach: boas-vindas, tour guiado pelas telas e dicas na primeira visita.
import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from './icons.js';
import { esc } from '../utils/dom.js';
import { getSettings } from '../data/settings.js';
import { getActivePlan } from '../data/account.js';
import { coachSeen, markCoach } from '../data/coach-state.js';

const HEAD = 'icons/icon-192.png';
const FULL = 'icons/coach.jpg';
const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let active = null; // só um diálogo do coach por vez

/* ---------- Voz (opcional, desligada por padrão) ---------- */
function speak(text) {
  if (getSettings().coachVoice !== 'on' || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = getLanguage() === 'en' ? 'en-US' : 'pt-BR';
    u.rate = 1.04;
    speechSynthesis.speak(u);
  } catch (e) { /* sem voz */ }
}
const hush = () => { try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* nada */ } };

/* ---------- Texto digitado ---------- */
function typeInto(el, text) {
  if (el._typing) clearInterval(el._typing);
  if (reduced()) { el.textContent = text; return () => {}; }
  el.textContent = '';
  el.classList.add('typing');
  let i = 0;
  const step = Math.max(1, Math.round(text.length / 70));
  el._typing = setInterval(() => {
    i += step;
    el.textContent = text.slice(0, i);
    if (i >= text.length) { clearInterval(el._typing); el._typing = null; el.classList.remove('typing'); }
  }, 18);
  return () => { if (el._typing) { clearInterval(el._typing); el._typing = null; el.textContent = text; el.classList.remove('typing'); } };
}

function waitFor(sel, timeout = 3000) {
  return new Promise((res) => {
    const t0 = Date.now();
    const tick = () => {
      const el = sel && document.querySelector(sel);
      if (el && el.getBoundingClientRect().height > 0) return res(el);
      if (Date.now() - t0 > timeout) return res(null);
      setTimeout(tick, 80);
    };
    tick();
  });
}

function close() {
  hush();
  if (active) { active.cleanup?.(); active.root.remove(); active = null; }
  document.body.classList.remove('coach-open');
}

/* ---------- 1. Boas-vindas ---------- */
export function showWelcome() {
  if (active) return;
  const lines = tl('coach.welcome');
  const hasPlan = !!getActivePlan();
  let i = 0;
  const root = document.createElement('div');
  root.className = 'coach-welcome';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', t('coach.name'));
  root.innerHTML = `
    <div class="cw-card">
      <img class="cw-img" src="${FULL}" alt="${esc(t('coach.name'))}">
      <div class="cw-body">
        <span class="eyebrow">${esc(t('coach.name'))}</span>
        <p class="cw-text" aria-live="polite"></p>
        <div class="cw-dots">${lines.map(() => '<i></i>').join('')}</div>
        <div class="cw-actions">
          <button type="button" class="btn btn-ghost" data-skip>${esc(t('coach.skip'))}</button>
          <button type="button" class="btn btn-primary" data-next></button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(root);
  document.body.classList.add('coach-open');
  const text = root.querySelector('.cw-text');
  const next = root.querySelector('[data-next]');
  let finish = () => {};
  const draw = () => {
    finish = typeInto(text, lines[i]);
    speak(lines[i]);
    root.querySelectorAll('.cw-dots i').forEach((d, k) => d.classList.toggle('on', k === i));
    const last = i === lines.length - 1;
    next.innerHTML = last ? `${icon(hasPlan ? 'sparkle' : 'plan')}${esc(t(hasPlan ? 'coach.showAround' : 'coach.buildPlan'))}` : `${esc(t('coach.next'))}${icon('chevron')}`;
  };
  const done = (goTour) => {
    markCoach('welcome');
    close();
    if (!hasPlan) { location.hash = '#triagem'; return; }
    if (goTour) startTour();
  };
  text.addEventListener('click', () => finish());
  next.addEventListener('click', () => { if (i < lines.length - 1) { i++; draw(); } else done(true); });
  root.querySelector('[data-skip]').addEventListener('click', () => { markCoach('welcome'); if (hasPlan) markCoach('tour'); close(); });
  const onKey = (e) => { if (e.key === 'Escape') root.querySelector('[data-skip]').click(); if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next.click(); } };
  document.addEventListener('keydown', onKey);
  active = { root, cleanup: () => document.removeEventListener('keydown', onKey) };
  draw();
  setTimeout(() => next.focus(), 50);
}

/* ---------- 2. Tour guiado ---------- */
const STEPS = [
  { route: 'hoje', sel: '.screen > .hero', key: 'today' },
  { route: 'hoje', sel: '.today-workout, [data-start]', key: 'start' },
  { route: 'plano', sel: '.plan-day, .screen .card', key: 'plan' },
  { route: 'calendario', sel: '.cal-grid, .screen .card', key: 'calendar' },
  { route: 'progresso', sel: '.kpis, .screen .card', key: 'progress' },
  { route: 'corpo', sel: '.kpis, .screen .card', key: 'body' },
  { route: 'hall', sel: '.hall-current, .screen .card', key: 'hall' },
  { route: 'party', sel: '.party-actions, .screen .card', key: 'party' },
  { route: 'hoje', sel: null, key: 'end' }
];

export function startTour(from = 0) {
  if (active) close();
  const root = document.createElement('div');
  root.className = 'coach-tour';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', t('coach.tourLabel'));
  root.innerHTML = `
    <div class="ct-spot" hidden></div>
    <div class="ct-shade"></div>
    <div class="ct-bubble">
      <div class="ct-head"><img src="${HEAD}" alt="" width="40" height="40"><div><strong>${esc(t('coach.name'))}</strong><span class="ct-count num"></span></div>
        <button type="button" class="icon-btn ct-x" data-skip aria-label="${esc(t('coach.skip'))}">${icon('x')}</button></div>
      <p class="ct-text" aria-live="polite"></p>
      <div class="ct-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-back>${esc(t('coach.back'))}</button>
        <button type="button" class="btn btn-primary btn-sm" data-next></button>
      </div>
    </div>`;
  document.body.appendChild(root);
  document.body.classList.add('coach-open');
  const spot = root.querySelector('.ct-spot');
  const shade = root.querySelector('.ct-shade');
  const bubble = root.querySelector('.ct-bubble');
  const text = root.querySelector('.ct-text');
  const next = root.querySelector('[data-next]');
  const back = root.querySelector('[data-back]');
  let i = from, target = null, finish = () => {}, token = 0, sel = null;

  const place = () => {
    // A tela pode ter sido redesenhada: busca o elemento de novo
    if (sel && (!target || !target.isConnected)) {
      const again = document.querySelector(sel);
      if (again && again.getBoundingClientRect().height > 0) target = again;
    }
    if (!target || !target.isConnected) {
      spot.hidden = true; shade.hidden = false;
      bubble.dataset.pos = 'center';
      return;
    }
    const r = target.getBoundingClientRect();
    const pad = 8;
    const vh = window.innerHeight;
    const top = Math.max(6, r.top - pad);
    const h = Math.min(r.height + pad * 2, vh * 0.46);
    Object.assign(spot.style, { top: `${top}px`, left: `${Math.max(6, r.left - pad)}px`, width: `${Math.min(r.width + pad * 2, window.innerWidth - 12)}px`, height: `${h}px` });
    spot.hidden = false; shade.hidden = true;
    bubble.dataset.pos = top + h / 2 > vh * 0.5 ? 'top' : 'bottom';
  };

  const show = async () => {
    const my = ++token;
    const s = STEPS[i];
    hush();
    bubble.classList.add('ct-wait');
    sel = s.sel;
    if (location.hash !== '#' + s.route) {
      location.hash = '#' + s.route;
      await new Promise((r) => setTimeout(r, 450));
    }
    target = s.sel ? await waitFor(s.sel) : null;
    if (my !== token) return;
    if (target) {
      target.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
      await new Promise((r) => setTimeout(r, reduced() ? 0 : 350));
    }
    if (my !== token) return;
    place();
    bubble.classList.remove('ct-wait');
    const line = t('coach.tour.' + s.key);
    root.querySelector('.ct-count').textContent = `${i + 1}/${STEPS.length}`;
    finish = typeInto(text, line);
    speak(line);
    back.hidden = i === 0;
    const last = i === STEPS.length - 1;
    next.innerHTML = last ? `${icon('check')}${esc(t('coach.finish'))}` : `${esc(t('coach.next'))}${icon('chevron')}`;
    next.focus({ preventScroll: true });
  };

  const end = () => { markCoach('tour'); markCoach('welcome'); close(); if (location.hash !== '#hoje') location.hash = '#hoje'; };
  text.addEventListener('click', () => finish());
  next.addEventListener('click', () => { if (i < STEPS.length - 1) { i++; show(); } else end(); });
  back.addEventListener('click', () => { if (i > 0) { i--; show(); } });
  root.querySelector('[data-skip]').addEventListener('click', end);
  const onKey = (e) => {
    if (e.key === 'Escape') end();
    else if (e.key === 'ArrowRight') next.click();
    else if (e.key === 'ArrowLeft') back.click();
  };
  const onMove = () => place();
  const keeper = setInterval(() => { if (!bubble.classList.contains('ct-wait')) place(); }, 400);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', onMove);
  window.addEventListener('scroll', onMove, true);
  active = { root, cleanup: () => { document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onMove); window.removeEventListener('scroll', onMove, true); clearInterval(keeper); } };
  show();
}

/* ---------- 3. Dica na primeira visita ---------- */
export function coachTip(key, { delay = 600 } = {}) {
  const id = 'tip:' + key;
  if (coachSeen(id) || active || !coachSeen('welcome')) return;
  setTimeout(() => {
    if (active || coachSeen(id) || document.querySelector('.sheet-backdrop, .sheet')) return;
    const line = t('coach.tips.' + key);
    const root = document.createElement('div');
    root.className = 'coach-tip';
    root.setAttribute('role', 'status');
    root.innerHTML = `<img src="${HEAD}" alt="" width="40" height="40">
      <div class="tip-body"><strong>${esc(t('coach.name'))}</strong><p></p></div>
      <button type="button" class="btn btn-sm btn-primary" data-ok>${esc(t('coach.gotIt'))}</button>`;
    document.body.appendChild(root);
    const p = root.querySelector('p');
    typeInto(p, line);
    speak(line);
    const dismiss = () => { markCoach(id); hush(); root.classList.add('out'); setTimeout(() => root.remove(), 200); window.removeEventListener('hashchange', dismiss); if (active && active.root === root) active = null; };
    root.querySelector('[data-ok]').addEventListener('click', dismiss);
    window.addEventListener('hashchange', dismiss);
    active = { root, cleanup: () => window.removeEventListener('hashchange', dismiss) };
  }, delay);
}

/** Chamado depois de cada tela: boas-vindas na primeira vez; tour depois do primeiro plano. */
const SKIP_ROUTES = new Set(['session', 'profile', 'invite', 'builder', 'pdf']);
let pending = null;
export function coachAuto(routeId) {
  if (active || pending || SKIP_ROUTES.has(routeId)) return;
  // Na triagem só cabe a boas-vindas (antes do primeiro plano); o tour espera o plano ficar pronto.
  const want = !coachSeen('welcome') ? 'welcome' : (routeId !== 'triage' && getActivePlan() && !coachSeen('tour') ? 'tour' : null);
  if (!want) return;
  pending = setTimeout(() => {
    pending = null;
    if (active || document.querySelector('.sheet-backdrop')) return;
    if (want === 'welcome' && !coachSeen('welcome')) showWelcome();
    else if (want === 'tour' && !coachSeen('tour')) startTour(0);
  }, 700);
}
