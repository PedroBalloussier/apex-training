// Service worker: guarda os arquivos do app para abrir offline.
// Ao publicar uma versão nova, altere VERSION para renovar o cache.
const VERSION = 'apex-v0.5.2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './js/app.js',
  './js/i18n/index.js',
  './js/i18n/pt.js',
  './js/i18n/en.js',
  './js/data/store.js',
  './js/data/settings.js',
  './js/utils/dom.js',
  './js/utils/units.js',
  './js/ui/icons.js',
  './js/ui/feedback.js',
  './js/screens/today.js',
  './js/screens/settings.js',
  './js/screens/soon.js',
  './js/screens/auth.js',
  './js/screens/profile.js',
  './js/screens/triage.js',
  './js/screens/plan.js',
  './js/i18n/pt2.js',
  './js/i18n/en2.js',
  './js/data/supabase.js',
  './js/data/account.js',
  './js/data/catalog.js',
  './js/engine/generator.js',
  './js/engine/progression.js',
  './js/data/workouts.js',
  './js/screens/session.js',
  './js/screens/start.js',
  './js/ui/swap.js',
  './js/i18n/pt3.js',
  './js/i18n/en3.js',
  './js/i18n/pt4.js',
  './js/i18n/en4.js',
  './js/screens/exercise.js',
  './js/screens/calendar.js',
  './js/data/guides.js',
  './js/data/videos.js',
  './js/data/body.js',
  './js/data/stats.js',
  './js/ui/charts.js',
  './js/screens/dashboard.js',
  './js/screens/body.js',
  './js/screens/report.js',
  './js/i18n/pt5.js',
  './js/i18n/en5.js',
  './js/data/demo.js',
  './js/ui/demo-ui.js',
  './data/exercises.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION)
    .then((c) => c.addAll(ASSETS.map((a) => new Request(a, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro para os arquivos do app (pega atualizações), cache como reserva offline.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // no-cache: sempre confere com o servidor se há versão nova (evita arquivos antigos do cache HTTP)
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
