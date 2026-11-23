import { icon } from './icons.js';
import { esc } from '../utils/dom.js';

export function toast(message, ic = 'check') {
  const root = document.getElementById('toast-root');
  if (!root) return;
  root.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icon(ic)}<span>${esc(message)}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 260);
  }, 2200);
}

let lastFocus = null;

/** Abre um sheet. `content` é HTML; `onMount(sheetEl, close)` liga eventos. */
export function openSheet({ title, content, onMount, label }) {
  const root = document.getElementById('sheet-root');
  lastFocus = document.activeElement;
  root.innerHTML = `
    <div class="sheet-backdrop" data-close>
      <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label || title || '')}">
        <div class="sheet-grip"></div>
        ${title ? `<div class="sheet-head"><h2>${esc(title)}</h2></div>` : ''}
        ${content}
      </div>
    </div>`;
  const backdrop = root.firstElementChild;
  const sheet = backdrop.firstElementChild;
  const close = () => {
    root.innerHTML = '';
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop || e.target.closest('[data-dismiss]')) close(); });
  document.addEventListener('keydown', onKey);
  if (onMount) onMount(sheet, close);
  const first = sheet.querySelector('button, [href], input, select, textarea');
  if (first) first.focus();
  return close;
}
