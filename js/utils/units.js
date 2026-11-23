// Armazenamento interno sempre em kg e cm. Conversão só na exibição e na entrada.
const LB_PER_KG = 2.2046226218;
const IN_PER_CM = 0.3937007874;

export const kgToLb = (kg) => kg * LB_PER_KG;
export const lbToKg = (lb) => lb / LB_PER_KG;
export const cmToIn = (cm) => cm * IN_PER_CM;
export const inToCm = (inch) => inch / IN_PER_CM;

function round(n, step) {
  return Math.round(n / step) * step;
}

function fmtNumber(n, lang, maxDigits = 1) {
  return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'pt-BR', { maximumFractionDigits: maxDigits }).format(n);
}

/** Converte kg armazenado para a unidade do usuário (número). */
export function weightToUser(kg, unit) {
  return unit === 'lb' ? round(kgToLb(kg), 0.5) : round(kg, 0.25);
}

/** Converte o valor digitado pelo usuário para kg (armazenamento). */
export function weightFromUser(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return unit === 'lb' ? lbToKg(n) : n;
}

export function formatWeight(kg, unit, lang) {
  return `${fmtNumber(weightToUser(kg, unit), lang)} ${unit}`;
}

export function lengthToUser(cm, unit) {
  return unit === 'in' ? round(cmToIn(cm), 0.1) : round(cm, 0.5);
}

export function lengthFromUser(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return unit === 'in' ? inToCm(n) : n;
}

export function formatLength(cm, unit, lang) {
  return `${fmtNumber(lengthToUser(cm, unit), lang)} ${unit}`;
}

export function formatDuration(seconds, lang) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} s`;
  if (s === 0) return `${m} min`;
  return `${m} min ${String(s).padStart(2, '0')} s`;
}
