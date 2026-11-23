import { store } from './store.js';

export const DEFAULT_SETTINGS = {
  language: 'pt',      // 'pt' | 'en'
  weightUnit: 'kg',    // 'kg' | 'lb'
  lengthUnit: 'cm',    // 'cm' | 'in'
  palette: 'emerald',  // 'emerald' | 'sunset'
  mode: 'dark',        // 'dark' | 'light'
  restSeconds: 90,     // descanso padrão entre séries
  sidebarCollapsed: false
};

let current = { ...DEFAULT_SETTINGS };
const subs = new Set();

export async function loadSettings() {
  const saved = await store.get('settings');
  current = { ...DEFAULT_SETTINGS, ...(saved || {}) };
  applyTheme();
  return current;
}

export function getSettings() { return current; }

export async function updateSettings(patch) {
  const prev = current;
  current = { ...current, ...patch };
  await store.set('settings', current);
  if (patch.palette !== undefined || patch.mode !== undefined) applyTheme();
  subs.forEach((fn) => fn(current, prev));
}

export function onSettings(fn) { subs.add(fn); return () => subs.delete(fn); }

export function themeName(s = current) {
  if (s.palette === 'sunset') return s.mode === 'light' ? 'sunset-light' : 'sunset';
  return s.mode === 'light' ? 'light' : 'dark';
}

function applyTheme() {
  const t = themeName();
  document.documentElement.setAttribute('data-theme', t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0B0F14');
}
