import { t, setLanguage } from './i18n/index.js';
import { icon } from './ui/icons.js';
import { esc } from './utils/dom.js';
import { loadSettings, getSettings, updateSettings, onSettings } from './data/settings.js';
import { toast, openSheet } from './ui/feedback.js';
import today from './screens/today.js';
import settingsScreen from './screens/settings.js';
import { soonScreen } from './screens/soon.js';

// Rotas: o hash é o nome em português (sem "settings", reservado em alguns ambientes)
const ROUTES = [
  { id: 'today', hash: 'hoje', ic: 'home', screen: today, tab: true },
  { id: 'plan', hash: 'plano', ic: 'plan', screen: soonScreen({ key: 'plan', ic: 'plan', stage: 3 }), tab: true },
  { id: 'calendar', hash: 'calendario', ic: 'calendar', screen: soonScreen({ key: 'calendar', ic: 'calendar', stage: 4 }), tab: true },
  { id: 'dashboard', hash: 'progresso', ic: 'chart', screen: soonScreen({ key: 'dashboard', ic: 'chart', stage: 5 }), tab: true },
  { id: 'hall', hash: 'hall', ic: 'trophy', screen: soonScreen({ key: 'hall', ic: 'trophy', stage: 6 }), group: 'social' },
  { id: 'party', hash: 'party', ic: 'users', screen: soonScreen({ key: 'party', ic: 'users', stage: 7 }), group: 'social' },
  { id: 'settings', hash: 'config', ic: 'gear', screen: settingsScreen, group: 'bottom' }
];

const app = document.getElementById('app');
let currentId = 'today';

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
  app.querySelector('[data-act="log"]').addEventListener('click', () => toast(t('toast.soon'), 'info'));
  app.querySelector('[data-act="collapse"]').addEventListener('click', () => {
    updateSettings({ sidebarCollapsed: !getSettings().sidebarCollapsed });
  });
  app.querySelector('[data-act="more"]').addEventListener('click', openMore);
}

function openMore() {
  const items = ROUTES.filter((r) => !r.tab);
  openSheet({
    title: t('nav.more'),
    content: `<div class="more-menu">${items.map((r) => navLink(r)).join('')}</div>`,
    onMount(sheet, close) {
      sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    }
  });
}

function renderScreen() {
  const main = document.getElementById('main');
  const route = ROUTES.find((r) => r.id === currentId);
  route.screen.render(main);
  document.title = `${t('nav.' + currentId)} · ${t('app.name')}`;
}

function render() {
  renderShell();
  renderScreen();
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
  render();

  window.addEventListener('hashchange', onRoute);

  onSettings((next, prev) => {
    if (next.language !== prev.language) {
      setLanguage(next.language);
      render();
    } else if (next.mode !== prev.mode || next.sidebarCollapsed !== prev.sidebarCollapsed) {
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
