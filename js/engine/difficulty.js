// Dificuldade de 1 a 5 para um dia do plano ou um desafio (pela carga de trabalho da sessão).
import { getExercise } from '../data/catalog.js';

export function workload(exercises) {
  let score = 0;
  for (const x of exercises || []) {
    const e = getExercise(x.id) || {};
    let w = 1;
    if (e.type === 'compound') w += 0.35;
    w += ((e.level || 1) - 1) * 0.25;
    if (e.equipment === 'barbell') w += 0.15;
    if (String(x.reps).includes('falha')) w += 0.3;
    if (x.restSec != null && x.restSec < 45) w += 0.1;
    score += (Number(x.sets) || 3) * w;
  }
  return score;
}

export function difficultyOf(exercises) {
  const s = workload(exercises);
  if (s < 18) return 1;
  if (s < 26) return 2;
  if (s < 34) return 3;
  if (s < 44) return 4;
  return 5;
}

/** Desafios têm nota curada (`difficulty`); sem ela, calcula. */
export const challengeDifficulty = (c) => c.difficulty || difficultyOf(c.exercises);
