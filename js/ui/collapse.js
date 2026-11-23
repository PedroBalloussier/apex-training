// Cards recolhíveis (<details>). Começam fechados; o estado aberto vale até fechar o app.
import { icon } from './icons.js';

const KEY = 'apex:v1:open:';
const isOpen = (key, dflt) => {
  try { const v = sessionStorage.getItem(KEY + key); return v == null ? dflt : v === '1'; } catch { return dflt; }
};

export function collapsible({ key, head, extra = '', body, open = false, cls = '' }) {
  return `<details class="card collapsible ${cls}" data-collapse="${key}" ${isOpen(key, open) ? 'open' : ''}>
    <summary class="card-head"><div class="collapse-head">${head}</div>
      <span class="collapse-right">${extra}<span class="collapse-chev">${icon('chevron')}</span></span></summary>
    <div class="collapse-body">${body}</div>
  </details>`;
}

export function bindCollapsibles(root) {
  root.querySelectorAll('details[data-collapse]').forEach((d) => d.addEventListener('toggle', () => {
    try { sessionStorage.setItem(KEY + d.dataset.collapse, d.open ? '1' : '0'); } catch { /* sem armazenamento */ }
  }));
}
