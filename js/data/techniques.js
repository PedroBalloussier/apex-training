// Técnicas de série: tipos, rótulos curtos e regras de volume, recordes e progressão.
import { t } from '../i18n/index.js';

export const TECHNIQUES = ['normal', 'warmup', 'failure', 'drop', 'rest_pause', 'myo', 'partials', 'amrap', 'tempo'];
export const CODES = { normal: '', warmup: 'W', failure: 'F', drop: 'D', rest_pause: 'RP', myo: 'MR', partials: 'P', amrap: 'A', tempo: 'T' };
/** Técnicas que registram blocos extras (quedas, pausas, mini-séries) na mesma série. */
export const WITH_BLOCKS = new Set(['drop', 'rest_pause', 'myo']);

/** Técnica de uma série salva (registros antigos só tinham to_failure). */
export function techOf(s) {
  if (!s) return 'normal';
  if (s.technique && s.technique !== 'normal') return s.technique;
  return s.to_failure ? 'failure' : 'normal';
}

export const isWarmup = (s) => techOf(s) === 'warmup';
/** Séries que contam para volume, recordes, progressão e contagem por músculo. */
export const countable = (sets) => (sets || []).filter((s) => !isWarmup(s));

export function blocksOf(s) {
  const b = s && s.blocks;
  if (!b) return [];
  if (Array.isArray(b)) return b;
  try { const v = JSON.parse(b); return Array.isArray(v) ? v : []; } catch (e) { return []; }
}

/** Volume (kg × reps) de uma série, somando quedas e pausas. Aquecimento vale zero. */
export function setVolume(s) {
  if (isWarmup(s)) return 0;
  const main = Number(s.weight_kg || 0) * Number(s.reps || 0);
  return main + blocksOf(s).reduce((sum, b) => sum + Number(b.weight_kg ?? s.weight_kg ?? 0) * Number(b.reps || 0), 0);
}

export const techName = (k) => t('tech.names.' + k);

/** Texto curto de uma série: "60 × 8 D (45 × 6, 30 × 5)". fmtW recebe kg e devolve o peso formatado. */
export function setText(s, fmtW) {
  const k = techOf(s);
  const w = s.weight_kg != null ? fmtW(Number(s.weight_kg)) : '—';
  let txt = `${w} × ${s.reps ?? '—'}`;
  if (CODES[k]) txt += ' ' + CODES[k];
  const blocks = blocksOf(s);
  if (blocks.length) txt += ' (' + blocks.map((b) => `${b.weight_kg != null ? fmtW(Number(b.weight_kg)) : w} × ${b.reps ?? '—'}`).join(', ') + ')';
  if (k === 'tempo' && s.technique_detail) txt += ' ' + s.technique_detail;
  return txt;
}

/** Técnica planejada para a série n de um exercício do plano ({ type, on: 'last' | 'all' }). */
export function plannedTech(x, n) {
  const p = x && x.technique;
  if (!p || !p.type || p.type === 'normal') return null;
  if (p.on === 'all') return p.type;
  return n === Number(x.sets) ? p.type : null;
}

export function plannedText(x) {
  const p = x && x.technique;
  if (!p || !p.type || p.type === 'normal') return '';
  return t(p.on === 'all' ? 'tech.plannedAll' : 'tech.plannedLast', { t: techName(p.type) });
}

/** Nome do grupo pelo tamanho: bi-set, tri-set ou série gigante. */
export function groupSize(list, i) {
  const g = list[i] && list[i].group;
  if (!g) return 0;
  let a = i, b = i;
  while (a > 0 && list[a - 1].group === g) a--;
  while (b < list.length - 1 && list[b + 1].group === g) b++;
  return b - a + 1;
}
export const groupName = (n) => t('tech.group.' + (n >= 4 ? 'many' : n));
export const groupHint = (n) => t('tech.groupHint.' + (n >= 4 ? 'many' : n));
