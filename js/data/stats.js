// Cálculos de progresso, ciclo e relatório (sem DOM).
import { supabase } from './supabase.js';
import { workoutsBetween } from './workouts.js';

const DAY = 864e5;
export const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`; };
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const e1rm = (w, r) => (r > 0 && w > 0 ? w * (1 + Math.min(r, 12) / 30) : 0);

/** Séries feitas desde uma data, com a data do treino. */
export async function setsSince(since, until = new Date(Date.now() + DAY)) {
  const { data } = await supabase.from('workout_sets')
    .select('exercise_id, reps, weight_kg, workout_id, created_at, to_failure')
    .eq('done', true).gte('created_at', since.toISOString()).lt('created_at', until.toISOString())
    .order('created_at', { ascending: true }).limit(8000);
  return data || [];
}

export async function workoutsSince(since, until = new Date(Date.now() + DAY)) {
  return workoutsBetween(since, until);
}

/** Informações do ciclo de um plano. */
export function cycleInfo(row, now = new Date()) {
  const start = startOfDay(row.started_at || row.created_at);
  const weeks = row.cycle_weeks || row.data.cycleWeeks || 12;
  const end = new Date(start.getTime() + weeks * 7 * DAY);
  const finished = row.ended_at ? new Date(row.ended_at) : null;
  const ref = finished && finished < now ? finished : now;
  const elapsed = Math.max(0, ref - start);
  const week = Math.min(weeks, Math.floor(elapsed / (7 * DAY)) + 1);
  const pct = Math.min(100, (elapsed / (end - start)) * 100);
  const daysLeft = Math.ceil((end - now) / DAY);
  return { start, end, weeks, week, pct, daysLeft, ended: now >= end, archived: !!finished, effectiveEnd: finished && finished < end ? finished : (now < end ? now : end) };
}

/** Dias de treino previstos entre duas datas (inclusive), pelo calendário do plano. */
export function scheduledCount(plan, from, to) {
  let n = 0;
  const d = startOfDay(from);
  const last = startOfDay(to);
  while (d <= last) { if (plan.schedule.includes(d.getDay())) n++; d.setDate(d.getDate() + 1); }
  return n;
}

/** Melhor carga por sessão para cada exercício: Map(id -> [{ date, best, e1 }]) em ordem cronológica. */
export function perExerciseSessions(sets) {
  const byEx = new Map();
  for (const s of sets) {
    if (!byEx.has(s.exercise_id)) byEx.set(s.exercise_id, new Map());
    const sess = byEx.get(s.exercise_id);
    if (!sess.has(s.workout_id)) sess.set(s.workout_id, { date: s.created_at, best: 0, e1: 0, reps: 0 });
    const x = sess.get(s.workout_id);
    const w = Number(s.weight_kg || 0), r = Number(s.reps || 0);
    if (w > x.best || (w === x.best && r > x.reps)) { x.best = w; x.reps = r; }
    x.e1 = Math.max(x.e1, e1rm(w, r));
  }
  const out = new Map();
  for (const [id, m] of byEx) out.set(id, [...m.values()].sort((a, b) => new Date(a.date) - new Date(b.date)));
  return out;
}

/** Séries por grupo muscular. */
export function setsByMuscle(sets, getExercise) {
  const m = new Map();
  for (const s of sets) {
    const e = getExercise(s.exercise_id);
    if (!e) continue;
    m.set(e.muscle, (m.get(e.muscle) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Treinos por semana (segunda a domingo) nas últimas N semanas. */
export function weeklyCounts(workouts, weeks) {
  const now = startOfDay(new Date());
  const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const a = new Date(monday); a.setDate(monday.getDate() - i * 7);
    const b = new Date(a); b.setDate(a.getDate() + 7);
    out.push({ start: a, value: workouts.filter((w) => { const d = new Date(w.started_at); return d >= a && d < b; }).length });
  }
  return out;
}

function bestStreak(workouts, plan, from, to) {
  const done = new Set(workouts.map((w) => dayKey(w.started_at)));
  let best = 0, cur = 0;
  const d = startOfDay(from);
  const last = startOfDay(to);
  while (d <= last) {
    if (done.has(dayKey(d))) { cur++; best = Math.max(best, cur); }
    else if (plan.schedule.includes(d.getDay())) cur = 0;
    d.setDate(d.getDate() + 1);
  }
  return best;
}

/**
 * Relatório de um ciclo.
 * row: linha do plano; workouts/sets: do período; body: todas as medidas.
 */
export function buildReport(row, workouts, sets, body) {
  const plan = row.data;
  const info = cycleInfo(row);
  const from = info.start;
  const to = info.effectiveEnd;
  const yesterday = new Date(startOfDay(new Date()).getTime() - DAY);
  const schedTo = to < yesterday ? to : yesterday;
  const scheduled = Math.max(scheduledCount(plan, from, schedTo), 0);
  const done = workouts.length;
  const adherence = scheduled ? Math.min(100, Math.round((done / scheduled) * 100)) : null;

  const volume = sets.reduce((s, x) => s + Number(x.weight_kg || 0) * Number(x.reps || 0), 0);
  const weeksSpan = Math.max(1, Math.ceil((to - from) / (7 * DAY)));
  const twoWeeks = 14 * DAY;
  const firstVol = sets.filter((x) => new Date(x.created_at) - from < twoWeeks).reduce((s, x) => s + Number(x.weight_kg || 0) * Number(x.reps || 0), 0);
  const lastVol = sets.filter((x) => to - new Date(x.created_at) < twoWeeks).reduce((s, x) => s + Number(x.weight_kg || 0) * Number(x.reps || 0), 0);
  const volumeTrend = weeksSpan >= 4 && firstVol > 0 ? Math.round(((lastVol - firstVol) / firstVol) * 100) : null;

  const perEx = perExerciseSessions(sets);
  const exercises = [];
  for (const [id, sess] of perEx) {
    if (sess.length < 2) continue;
    const a = sess[0], b = sess[sess.length - 1];
    const maxBest = Math.max(...sess.map((s) => s.best));
    if (a.best <= 0 && b.best <= 0) {
      // peso corporal: compara repetições
      if (b.reps > a.reps) exercises.push({ id, kind: 'reps', first: a.reps, last: b.reps, delta: b.reps - a.reps, pct: a.reps ? Math.round(((b.reps - a.reps) / a.reps) * 100) : 0, sessions: sess.length });
      continue;
    }
    exercises.push({ id, kind: 'load', first: a.best, last: b.best, max: maxBest, delta: b.best - a.best, pct: a.best ? Math.round(((b.best - a.best) / a.best) * 100) : 0, firstE1: a.e1, lastE1: b.e1, sessions: sess.length });
  }
  exercises.sort((x, y) => y.pct - x.pct);
  const improved = exercises.filter((x) => x.delta > 0);

  const bodyIn = (field) => {
    const rows = body.filter((r) => r[field] != null && new Date(r.measured_on) >= new Date(from.getTime() - 7 * DAY) && new Date(r.measured_on) <= new Date(to.getTime() + DAY));
    if (rows.length < 2) return null;
    const first = Number(rows[0][field]), last = Number(rows[rows.length - 1][field]);
    return { first, last, delta: last - first };
  };
  const bodyChanges = {};
  for (const f of ['weight_kg', 'body_fat_pct', 'waist_cm', 'chest_cm', 'arm_cm', 'thigh_cm', 'hip_cm']) {
    const c = bodyIn(f); if (c) bodyChanges[f] = c;
  }

  const streak = bestStreak(workouts, plan, from, to);

  // Sugestão de nível para a próxima triagem
  let levelHint = null;
  if (adherence !== null) {
    if (plan.level === 'beginner' && adherence >= 75 && info.week >= 6) levelHint = 'intermediate';
    else if (plan.level === 'intermediate' && adherence >= 85 && info.week >= 10 && improved.length >= 3) levelHint = 'advanced';
  }

  return {
    from, to, info, plan, scheduled, done, adherence, volume, volumeTrend, totalSets: sets.length,
    exercises, improved, bodyChanges, streak, levelHint
  };
}
