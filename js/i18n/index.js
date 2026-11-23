import pt1 from './pt.js';
import en1 from './en.js';
import pt2 from './pt2.js';
import en2 from './en2.js';

const DICTS = { pt: { ...pt1, ...pt2 }, en: { ...en1, ...en2 } };
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
