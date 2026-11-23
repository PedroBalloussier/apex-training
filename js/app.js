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
import { resetWorkouts } from './data/workouts.js';
import { soonScreen } from './screens/soon.js';

// Rotas: o hash é o nome em português (sem "settings", reservado em alguns ambientes)
const ROUTES = [
  { id: 'today', hash: 'hoje', ic: 'home', screen: today, tab: true },
  { id: 'plan', hash: 'plano', ic: 'plan', screen: planScreen, tab: true },
  { id: 'calendar', hash: 'calendario', ic: 'calendar', screen: soonScreen({ key: 'calendar', ic: 'calendar', stage: 4 }), tab: true },
  { id: 'dashboard', hash: 'progresso', ic: 'chart', screen: soonScreen({ key: 'dashboard', ic: 'chart', stage: 5 }), tab: true },
  { id: 'hall', hash: 'hall', ic: 'trophy', screen: soonScreen({ key: 'hall', ic: 'trophy', stage: 6 }), group: 'social' },
  { id: 'party', hash: 'party', ic: 'users', screen: soonScreen({ key: 'party', ic: 'users', stage: 7 }), group: 'social' },
  { id: 'settings', hash: 'config', ic: 'gear', screen: settingsScreen, group: 'bottom' },
  { id: 'profile', hash: 'perfil', ic: 'users', screen: profileScreen, hidden: true },
  { id: 'triage', hash: 'triagem', ic: 'sparkle', screen: triageScreen, hidden: true },
  { id: 'session', hash: 'treino', ic: 'dumbbell', screen: sessionScreen, hidden: true }
];

const app = document.getElementById('app');
let currentId = 'today';
let account = null;          // módulo de conta (carregado sob demanda)
let mode = 'loading';        // loading | error | auth | app

function routeFromHash() {
  const h = (location.hash || '').replace('#', '');
  return ROUTES.find((r) => r.hash === h) || ROUTES[0];
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
        <div class="brand-mark">${icon('logo')}</div>
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
      ${ROUTES.filter((r) => r.tab).map((r) => navLink(r)).join('')}
      <div class="nav-sep"></div>
      ${ROUTES.filter((r) => r.group === 'social').map((r) => navLink(r)).join('')}
      <div class="spacer"></div>
      ${ROUTES.filter((r) => r.group === 'bottom').map((r) => navLink(r)).join('')}
      <button class="nav-item sidebar-collapse" data-act="collapse" aria-label="${esc(s.sidebarCollapsed ? t('nav.expand') : t('nav.collapse'))}">
        ${icon('sidebar')}<span class="nav-label">${esc(s.sidebarCollapsed ? t('nav.expand') : t('nav.collapse'))}</span>
      </button>
    </nav>

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
  const route = ROUTES.find((r) => r.id === currentId);
  document.title = `${t('nav.' + currentId)} · ${t('app.name')}`;
  try {
    await route.screen.render(main);
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
function guardRoute() {
  if (account.profileComplete()) return;
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

function onRoute() {
  const r = routeFromHash();
  const changed = r.id !== currentId;
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
      if (!!session !== hadSession) { hadSession = !!session; resetWorkouts(); render(); }
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
    try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
  }
}

init();
