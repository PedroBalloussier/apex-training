// Sugestão de carga a partir da última sessão do exercício (dupla progressão).

export function repRange(reps) {
  const m = String(reps).match(/^(\d+)\s*-\s*(\d+)$/);
  if (m) return [Number(m[1]), Number(m[2])];
  const n = String(reps).match(/^(\d+)$/);
  return n ? [Number(n[1]), Number(n[1])] : null; // tempo ("30-45 s", "10 min") não tem faixa
}

function increment(ex) {
  if (!ex) return 2.5;
  if (['bodyweight', 'band', 'pullup_bar', 'dip_bars'].includes(ex.equipment)) return 0;
  const heavyLegs = ['squat', 'hinge', 'hip_thrust'].includes(ex.pattern) && ['barbell', 'machine', 'smith'].includes(ex.equipment);
  if (heavyLegs) return 5;
  if (['dumbbell', 'kettlebell'].includes(ex.equipment)) return 2;
  return ex.type === 'isolation' ? 1.25 : 2.5;
}

/**
 * ex: exercício do catálogo; presc: { sets, reps }; last: { sets: [{reps, weight_kg}] } | undefined
 * Retorna { reason, weightKg, lastWeightKg, lastReps } ou null.
 * reason: 'up' (subir carga), 'hold' (manter), 'reps' (manter e buscar mais repetições), 'first' (sem histórico)
 */
export function suggest(ex, presc, last) {
  const range = repRange(presc.reps);
  if (!range) return null;
  if (!last || !last.sets.length) return { reason: 'first', weightKg: null };
  const [lo, hi] = range;
  const sets = last.sets.filter((s) => s.reps != null);
  if (!sets.length) return { reason: 'first', weightKg: null };
  const lastWeightKg = Math.max(...sets.map((s) => Number(s.weight_kg || 0)));
  const working = sets.filter((s) => Number(s.weight_kg || 0) === lastWeightKg);
  const lastReps = working.map((s) => s.reps);
  const inc = increment(ex);
  const allTop = working.length >= Math.min(presc.sets, sets.length) && working.every((s) => s.reps >= hi);
  if (allTop) {
    if (inc === 0) return { reason: 'reps', weightKg: lastWeightKg, lastWeightKg, lastReps };
    return { reason: 'up', weightKg: lastWeightKg + inc, lastWeightKg, lastReps, inc };
  }
  if (working.some((s) => s.reps < lo)) return { reason: 'hold', weightKg: lastWeightKg, lastWeightKg, lastReps };
  return { reason: 'reps', weightKg: lastWeightKg, lastWeightKg, lastReps };
}
