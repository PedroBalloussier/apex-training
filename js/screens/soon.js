import { t } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';

/** Tela "em breve" com o que a etapa vai entregar. */
export function soonScreen({ key, ic, stage }) {
  return {
    render(el) {
      const k = (s) => t(`soon.${key}.${s}`);
      el.innerHTML = `
        <section class="screen">
          <header class="screen-head">
            <span class="eyebrow">${esc(t('soon.badge'))}</span>
            <h1>${esc(k('title'))}</h1>
          </header>
          <div class="card">
            <div class="empty">
              <div class="empty-icon">${icon(ic)}</div>
              <span class="chip chip-accent">${esc(t('soon.stage', { n: stage }))}</span>
              <p>${esc(k('text'))}</p>
              <ul class="feature-list">
                ${['f1', 'f2', 'f3'].map((f) => `<li>${icon('check')}<span>${esc(k(f))}</span></li>`).join('')}
              </ul>
            </div>
          </div>
        </section>`;
    }
  };
}
