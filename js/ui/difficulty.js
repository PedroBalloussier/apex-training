// Selo de dificuldade: 5 halteres (cheios até o nível). Versão compacta: 1 haltere + "4/5".
import { t } from '../i18n/index.js';
import { icon } from './icons.js';
import { esc } from '../utils/dom.js';

export function diffBadge(n, { compact = false, label = false } = {}) {
  const name = t('diff.levels')[n] || '';
  const title = `${t('diff.label')}: ${n}/5 · ${name}`;
  if (compact) return `<span class="diff diff-compact" title="${esc(title)}" aria-label="${esc(title)}">${icon('dumbbell')}<b class="num">${n}/5</b></span>`;
  const dots = [1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}">${icon('dumbbell')}</i>`).join('');
  return `<span class="diff diff-${n}" title="${esc(title)}" aria-label="${esc(title)}"><span class="diff-icons" aria-hidden="true">${dots}</span>${label ? `<span class="diff-name">${esc(name)}</span>` : ''}</span>`;
}
