// Interface do modo demonstração: sheet de entrada e faixa de aviso.
import { t } from '../i18n/index.js';
import { icon } from './icons.js';
import { esc } from '../utils/dom.js';
import { openSheet, toast } from './feedback.js';
import { enterDemo, exitDemo, validateDemo, demoActive } from '../data/demo.js';

export function openDemoSheet() {
  openSheet({
    title: t('demo.title'),
    content: `
      <p class="muted" style="margin-bottom:14px">${esc(t('demo.text'))}</p>
      <div class="options">
        <button type="button" class="option" data-sample>
          <span class="option-text"><span class="option-title">${esc(t('demo.sample'))}</span></span>${icon('chevron')}</button>
        <label class="option" style="cursor:pointer">
          <span class="option-text"><span class="option-title">${esc(t('demo.import'))}</span><span class="option-desc">${esc(t('demo.importHint'))}</span></span>${icon('upload')}
          <input type="file" accept="application/json,.json" class="sr-only" data-file></label>
      </div>
      <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button></div>`,
    onMount(sheet) {
      sheet.querySelector('[data-sample]').addEventListener('click', async () => {
        try {
          const file = await (await fetch('data/demo-apex.json', { cache: 'no-store' })).json();
          if (!validateDemo(file)) throw new Error('invalid');
          enterDemo(file);
        } catch (e) { toast(t('demo.loadFail'), 'info'); }
      });
      sheet.querySelector('[data-file]').addEventListener('change', async (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        try {
          const file = JSON.parse(await f.text());
          if (!validateDemo(file)) throw new Error('invalid');
          enterDemo(file);
        } catch (err) { toast(t('demo.invalid'), 'info'); e.target.value = ''; }
      });
    }
  });
}

export function demoBar() {
  if (!demoActive()) return '';
  return `<div class="demo-bar" role="status"><span>${icon('info')}<span class="demo-short">${esc(t('demo.title'))}</span><span class="demo-long">${esc(t('demo.bar'))}</span></span>
    <button type="button" class="btn btn-sm" data-demo-exit>${esc(t('demo.exit'))}</button></div>`;
}

export function bindDemoBar(root) {
  const b = root.querySelector('[data-demo-exit]');
  if (b) b.addEventListener('click', () => exitDemo());
}
