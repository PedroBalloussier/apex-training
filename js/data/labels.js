// Rótulos que dependem de mais de um módulo (dias do plano e desafios).
import { t, getLanguage } from '../i18n/index.js';
import { getChallenge } from './challenges.js';

/** Nome de um tipo de dia: do plano ("push") ou de desafio ("hall:bruce-lee-1965"). */
export function dayLabel(type) {
  if (type && type.startsWith('hall:')) {
    const c = getChallenge(type.slice(5));
    const lang = getLanguage();
    return c ? `${c.person}: ${c.title[lang] || c.title.pt}` : t('nav.hall');
  }
  if (type && type.startsWith('custom:')) {
    const ms = type.slice(7).split('+').filter(Boolean);
    const name = (m) => (m === 'fullbody' ? t('dayTypes.conditioning') : t('muscles.' + m));
    if (ms.length <= 1) return ms.map(name).join('');
    return ms.slice(0, -1).map(name).join(', ') + t('edit.and') + name(ms[ms.length - 1]);
  }
  return t('dayTypes.' + type);
}

/** Texto das repetições ("falha" vira "até a falha" no idioma atual). */
export function repsText(reps) {
  return reps === 'falha' ? t('session.toFailure') : reps;
}
