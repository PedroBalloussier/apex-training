// Sheet de troca de exercício por equivalentes.
import { t, getLanguage } from '../i18n/index.js';
import { icon } from './icons.js';
import { esc } from '../utils/dom.js';
import { openSheet } from './feedback.js';
import { getExercise, equivalents, exerciseName } from '../data/catalog.js';
import { loadCatalog } from '../data/catalog.js';

export async function openSwap({ exerciseId, title, note, onPick }) {
  await loadCatalog();
  const lang = getLanguage();
  const cur = getExercise(exerciseId);
  const eq = equivalents(exerciseId);
  const exact = eq.filter((x) => cur && x.pattern === cur.pattern && x.type === cur.type);
  const similar = eq.filter((x) => !exact.includes(x));
  const row = (x) => `
    <button type="button" class="option" data-pick="${x.id}">
      <span class="option-text"><span class="option-title">${esc(exerciseName(x.id, lang))}</span>
      <span class="option-desc">${esc(t('equip.' + x.equipment))}${x.unilateral ? ' · ' + esc(t('session.perSide')) : ''}</span></span>
      ${icon('chevron')}
    </button>`;
  openSheet({
    title: title || t('swap.title'),
    content: `
      <p class="muted" style="margin-bottom:12px">${esc(t('swap.current'))}: <strong>${esc(exerciseName(exerciseId, lang))}</strong>${note ? '<br>' + esc(note) : ''}</p>
      ${exact.length ? `<span class="eyebrow">${esc(t('swap.same'))}</span><div class="options" style="margin:8px 0 16px">${exact.map(row).join('')}</div>` : ''}
      ${similar.length ? `<span class="eyebrow">${esc(t('swap.similar'))}</span><div class="options" style="margin-top:8px">${similar.map(row).join('')}</div>` : ''}
      ${!eq.length ? `<p class="muted">${esc(t('swap.none'))}</p>` : ''}
      <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button></div>`,
    onMount(sheet, close) {
      sheet.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', async () => {
        b.disabled = true;
        await onPick(b.dataset.pick);
        close();
      }));
    }
  });
}
