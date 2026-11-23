import pt1 from './pt.js';
import en1 from './en.js';
import pt2 from './pt2.js';
import en2 from './en2.js';
import pt3 from './pt3.js';
import en3 from './en3.js';
import pt4 from './pt4.js';
import en4 from './en4.js';
import pt5 from './pt5.js';
import en5 from './en5.js';
import pt6 from './pt6.js';
import en6 from './en6.js';
import pt7 from './pt7.js';
import en7 from './en7.js';

function merge(...parts) {
  const out = {};
  for (const part of parts) {
    for (const [k, v] of Object.entries(part)) {
      out[k] = v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' ? merge(out[k], v) : v;
    }
  }
  return out;
}

const DICTS = { pt: merge(pt1, pt2, pt3, pt4, pt5, pt6, pt7), en: merge(en1, en2, en3, en4, en5, en6, en7) };
let lang = 'pt';

export function setLanguage(l) {
  lang = DICTS[l] ? l : 'pt';
  document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
}

export function getLanguage() { return lang; }

/** t('settings.title') ou t('soon.stage', { n: 2 }). Cai no português se faltar a chave. */
export function t(key, vars) {
  const pick = (d) => key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), d);
  let s = pick(DICTS[lang]);
  if (s === undefined) s = pick(DICTS.pt);
  if (s === undefined) return key;
  if (vars) s = String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  return s;
}

/** Lista (ex.: dias da semana). */
export function tl(key) {
  const v = key.split('.').reduce((o, k) => (o ? o[k] : undefined), DICTS[lang]);
  return Array.isArray(v) ? v : [];
}
