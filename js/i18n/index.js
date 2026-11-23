import pt from './pt.js';
import en from './en.js';

const DICTS = { pt, en };
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
