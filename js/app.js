import { t, setLanguage } from './i18n/index.js';
import { icon } from './ui/icons.js';
import { esc } from './utils/dom.js';
import { loadSettings, getSettings, updateSettings, onSettings } from './data/settings.js';
import { toast, openSheet } from './ui/feedback.js';
import today from './screens/today.js';
import settingsScreen from './screens/settings.js';
import planScreen from './screens/plan.js';
import profileScreen from './screens/profile.js';
import triageScreen from './screens/triage.js';
import sessionScreen from './screens/session.js';
import { quickStart } from './screens/start.js';
import calendarScreen from './screens/calendar.js';
import exerciseScreen from './screens/exercise.js';
import dashboardScreen from './screens/dashboard.js';
import bodyScreen from './screens/body.js';
import reportScreen from './screens/report.js';
import hallScreen from './screens/hall.js';
import { resetHall } from './data/hall.js';
import { resetBody } from './data/body.js';
import { demoBar, bindDemoBar } from './ui/demo-ui.js';
import { demoActive } from './data/demo.js';
import { resetWorkouts } from './data/workouts.js';
import partyScreen, { inviteScreen } from './screens/party.js';
import planEditScreen from './screens/plan-edit.js';
import builderScreen from './screens/builder.js';
import printPlanScreen from './screens/print-plan.js';
import { resetParty } from './data/party.js';
import { coachAuto } from './ui/coach.js';

// Rotas: o hash é o nome em português (sem "settings", reservado em alguns ambientes)
const ROUTES = [
  { id: 'today', hash: 'hoje', ic: 'home', screen: today, tab: true },
  { id: 'plan', hash: 'plano', ic: 'plan', screen: planScreen, tab: true },
  { id: 'plan', hash: 'editar-', prefix: true, ic: 'plan', screen: planEditScreen, hidden: true },
  { id: 'builder', hash: 'criar-plano', ic: 'plan', screen: builderScreen, hidden: true },
  { id: 'pdf', hash: 'pdf-', prefix: true, ic: 'download', screen: printPlanScreen, hidden: true },
  { id: 'calendar', hash: 'calendario', ic: 'calendar', screen: calendarScreen, tab: true },
  { id: 'dashboard', hash: 'progresso', ic: 'chart', screen: dashboardScreen, tab: true },
  { id: 'body', hash: 'corpo', ic: 'scale', screen: bodyScreen, group: 'progress' },
  { id: 'hall', hash: 'hall', ic: 'trophy', screen: hallScreen, group: 'social' },
  { id: 'hall', hash: 'hall-', prefix: true, ic: 'trophy', screen: hallScreen, hidden: true },
  { id: 'party', hash: 'party', ic: 'users', screen: partyScreen, group: 'social' },
  { id: 'party', hash: 'party-', prefix: true, ic: 'users', screen: partyScreen, hidden: true },
  { id: 'invite', hash: 'convite-', prefix: true, ic: 'users', screen: inviteScreen, hidden: true },
  { id: 'settings', hash: 'config', ic: 'gear', screen: settingsScreen, group: 'bottom' },
  { id: 'profile', hash: 'perfil', ic: 'users', screen: profileScreen, hidden: true },
  { id: 'triage', hash: 'triagem', ic: 'sparkle', screen: triageScreen, hidden: true },
  { id: 'session', hash: 'treino', ic: 'dumbbell', screen: sessionScreen, hidden: true },
  { id: 'exercise', hash: 'ex-', prefix: true, ic: 'dumbbell', screen: exerciseScreen, hidden: true },
  { id: 'report', hash: 'relatorio', ic: 'chart', screen: reportScreen, hidden: true },
  { id: 'report', hash: 'rel-', prefix: true, ic: 'chart', screen: reportScreen, hidden: true }
];

const app = document.getElementById('app');
let currentId = 'today';
let currentParam = null;
let currentRoute = null;
let account = null;          // módulo de conta (carregado sob demanda)
let mode = 'loading';        // loading | error | auth | app

function routeFromHash() {
  const h = decodeURIComponent((location.hash || '').replace('#', ''));
  const pre = ROUTES.find((r) => r.prefix && h.startsWith(r.hash) && h.length > r.hash.length);
  if (pre) { currentParam = h.slice(pre.hash.length); currentRoute = pre; return pre; }
  currentParam = null;
  currentRoute = ROUTES.find((r) => r.hash === h) || ROUTES[0];
  return currentRoute;
}

function navLink(r, cls = 'nav-item') {
  return `<a class="${cls}" href="#${r.hash}" data-route="${r.id}" ${r.id === currentId ? 'aria-current="page"' : ''}>
    ${icon(r.ic)}<span class="nav-label">${esc(t('nav.' + r.id))}</span></a>`;
}

function renderShell() {
  const s = getSettings();
  const route = ROUTES.find((r) => r.id === currentId);
  const isLight = s.mode === 'light';
  const tabRoutes = ROUTES.filter((r) => r.tab);
  const moreActive = !route.tab;

  app.classList.toggle('side-collapsed', !!s.sidebarCollapsed);
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <img class="brand-img" src="icons/icon-192.png" alt="" width="30" height="30">
        <span class="brand-name">${esc(t('app.name'))}</span>
        <span class="badge-version num">${esc(t('app.version'))}</span>
      </div>
      <div class="topbar-title">${esc(t('nav.' + currentId))}</div>
      <div class="topbar-actions">
        <button class="icon-btn" data-act="theme" aria-label="${esc(isLight ? t('top.themeToDark') : t('top.themeToLight'))}" title="${esc(isLight ? t('top.themeToDark') : t('top.themeToLight'))}">${icon(isLight ? 'moon' : 'sun')}</button>
        <a class="icon-btn hide-sm" href="#config" aria-label="${esc(t('top.settings'))}" title="${esc(t('top.settings'))}">${icon('gear')}</a>
        <button class="icon-btn plus" data-act="log" aria-label="${esc(t('top.log'))}" title="${esc(t('top.log'))}">${icon('plus')}</button>
      </div>
    </header>

    <nav class="sidebar" aria-label="Menu">
      ${ROUTES.filter((r) => r.tab || r.group === 'progress').map((r) => navLink(r)).join('')}
      <div class="nav-sep"></div>
      ${ROUTES.filter((r) => r.group === 'social').map((r) => navLink(r)).join('')}
      <div class="spacer"></div>
      ${ROUTES.filter((r) => r.group === 'bottom').map((r) => navLink(r)).join('')}
      <button class="nav-item sidebar-collapse" data-act="collapse" aria-label="${esc(s.sidebarCollapsed ? t('nav.expand') : t('nav.collapse'))}">
        ${icon('sidebar')}<span class="nav-label">${esc(s.sidebarCollapsed ? t('nav.expand') : t('nav.collapse'))}</span>
      </button>
    </nav>

    ${demoBar()}
    <main class="main" id="main"></main>

    <nav class="tabbar" aria-label="Menu">
      ${tabRoutes.map((r) => navLink(r, 'tab')).join('')}
      <button class="tab" data-act="more" ${moreActive ? 'aria-current="page"' : ''}>${icon('more')}<span>${esc(t('nav.more'))}</span></button>
    </nav>`;

  app.querySelector('[data-act="theme"]').addEventListener('click', () => {
    updateSettings({ mode: getSettings().mode === 'light' ? 'dark' : 'light' });
  });
  app.querySelector('[data-act="log"]').addEventListener('click', () => quickStart());
  app.querySelector('[data-act="collapse"]').addEventListener('click', () => {
    updateSettings({ sidebarCollapsed: !getSettings().sidebarCollapsed });
  });
  app.querySelector('[data-act="more"]').addEventListener('click', openMore);
  bindDemoBar(app);
  document.body.classList.toggle('demo', demoActive());
}

function openMore() {
  const items = ROUTES.filter((r) => !r.tab && !r.hidden);
  openSheet({
    title: t('nav.more'),
    content: `<div class="more-menu">${items.map((r) => navLink(r)).join('')}</div>`,
    onMount(sheet, close) {
      sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    }
  });
}

async function renderScreen() {
  const main = document.getElementById('main');
  const route = currentRoute && currentRoute.id === currentId ? currentRoute : ROUTES.find((r) => r.id === currentId);
  document.title = `${t('nav.' + currentId)} · ${t('app.name')}`;
  try {
    await route.screen.render(main, currentParam);
    if (!currentParam || currentId === 'today') coachAuto(currentId);
  } catch (err) {
    console.error('[Apex]', err);
    main.innerHTML = `<div class="center-state"><div><p class="muted">${esc(t('auth.errGeneric'))}</p></div></div>`;
  }
}

function renderState(kind) {
  app.classList.remove('side-collapsed');
  if (kind === 'loading') {
    app.innerHTML = '<div class="center-state"><div class="spinner" aria-label="..."></div></div>';
  } else {
    app.innerHTML = `<div class="center-state"><div style="display:grid;gap:14px;justify-items:center">
      <p class="muted" style="max-width:360px">${esc(t('auth.loadError'))}</p>
      <button class="btn" data-retry>${esc(t('auth.retry'))}</button></div></div>`;
    app.querySelector('[data-retry]').addEventListener('click', () => location.reload());
  }
}

/** Regras de acesso às telas: sem conta → entrar; perfil incompleto → perfil. */
const INVITE_KEY = 'apex:invite';
function guardRoute() {
  // Convite aberto antes de criar a conta ou completar o perfil: guarda e retoma depois
  if (currentId === 'invite' && currentParam) { try { sessionStorage.setItem(INVITE_KEY, currentParam); } catch (e) {} }
  if (account.profileComplete()) {
    let pending = null;
    try { pending = sessionStorage.getItem(INVITE_KEY); } catch (e) {}
    if (pending) {
      try { sessionStorage.removeItem(INVITE_KEY); } catch (e) {}
      if (currentId !== 'invite') { location.hash = '#convite-' + pending; }
    }
    return;
  }
  if (currentId !== 'profile' && currentId !== 'settings') {
    currentId = 'profile';
    history.replaceState(null, '', '#perfil');
  }
}

async function render() {
  if (mode === 'loading' || mode === 'error') return renderState(mode);
  if (!account.getSession()) {
    mode = 'auth';
    const { renderAuth } = await import('./screens/auth.js');
    return renderAuth(app);
  }
  mode = 'app';
  guardRoute();
  renderShell();
  await renderScreen();
}

let lastHash = location.hash;
function onRoute() {
  const r = routeFromHash();
  const changed = r.id !== currentId || location.hash !== lastHash;
  lastHash = location.hash;
  currentId = r.id;
  render();
  if (changed) window.scrollTo({ top: 0 });
}

async function init() {
  const s = await loadSettings();
  setLanguage(s.language);
  currentId = routeFromHash().id;
  renderState('loading');

  try {
    account = await import('./data/account.js');
    await account.initAccount();
    mode = 'app';
  } catch (err) {
    console.error('[Apex] init', err);
    mode = 'error';
  }
  await render();

  window.addEventListener('hashchange', onRoute);
  if (account) {
    let hadSession = !!account.getSession();
    account.onAccount(({ session }) => {
      // Só redesenha quando a pessoa entra ou sai; as telas cuidam do resto
      if (!!session !== hadSession) { hadSession = !!session; resetWorkouts(); resetBody(); resetHall(); resetParty(); render(); }
    });
  }

  onSettings((next, prev) => {
    if (next.language !== prev.language) {
      setLanguage(next.language);
      render();
    } else if (mode === 'app' && (next.mode !== prev.mode || next.sidebarCollapsed !== prev.sidebarCollapsed)) {
      renderShell();
      renderScreen();
    }
  });

  // PWA: só onde o navegador permite (GitHub Pages); ignorado em ambientes restritos
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    try {
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
      // Quando uma versão nova assume, recarrega uma vez para usar os arquivos novos
      let reloaded = false;
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded || !hadController || document.querySelector('input:focus')) return;
        reloaded = true;
        if (!document.querySelector('.sheet') && !location.hash.startsWith('#treino')) location.reload();
      });
    } catch (e) {}
  }
}

init();
