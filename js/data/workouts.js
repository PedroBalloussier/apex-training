// Treinos e séries (Supabase).
import { supabase } from './supabase.js';

let recent = [];        // treinos concluídos recentes (sem as séries)
let open = null;        // treino em andamento { ...workout, sets: [] }
let loaded = false;

export const getRecent = () => recent;
export const getOpen = () => open;

/** Carrega treinos recentes e o treino em andamento. */
export async function loadWorkouts(force = false) {
  if (loaded && !force) return;
  const since = new Date(Date.now() - 120 * 864e5).toISOString();
  const [done, inProg] = await Promise.all([
    supabase.from('workouts').select('id, plan_id, day_key, day_type, status, started_at, finished_at, duration_sec')
      .eq('status', 'done').gte('started_at', since).order('started_at', { ascending: false }).limit(300),
    supabase.from('workouts').select('*').eq('status', 'in_progress').maybeSingle()
  ]);
  recent = done.data || [];
  open = inProg.data ? { ...inProg.data, sets: await setsOf(inProg.data.id) } : null;
  loaded = true;
}

export function resetWorkouts() { recent = []; open = null; loaded = false; }

async function setsOf(workoutId) {
  const { data } = await supabase.from('workout_sets').select('*').eq('workout_id', workoutId)
    .order('position', { ascending: true }).order('set_number', { ascending: true });
  return data || [];
}

export async function startWorkout(planRow, day) {
  if (open) return open;
  const { data, error } = await supabase.from('workouts').insert({
    plan_id: planRow.id, day_key: day.key, day_type: day.type,
    exercises: day.exercises.map((x) => ({ ...x }))
  }).select().single();
  if (error) {
    // Já existe um treino aberto (outra aba ou aparelho): retoma
    await loadWorkouts(true);
    if (open) return open;
    throw error;
  }
  open = { ...data, sets: [] };
  return open;
}

export async function saveSet(row) {
  const { data, error } = await supabase.from('workout_sets')
    .upsert({ workout_id: open.id, ...row }, { onConflict: 'workout_id,position,set_number' })
    .select().single();
  if (error) throw error;
  const i = open.sets.findIndex((s) => s.position === data.position && s.set_number === data.set_number);
  if (i === -1) open.sets.push(data); else open.sets[i] = data;
  return data;
}

export async function deleteSet(position, setNumber) {
  await supabase.from('workout_sets').delete()
    .eq('workout_id', open.id).eq('position', position).eq('set_number', setNumber);
  open.sets = open.sets.filter((s) => !(s.position === position && s.set_number === setNumber));
}

export async function updateOpenExercises(exercises) {
  const { error } = await supabase.from('workouts').update({ exercises }).eq('id', open.id);
  if (error) throw error;
  open.exercises = exercises;
}

export async function finishWorkout() {
  const duration = Math.round((Date.now() - new Date(open.started_at).getTime()) / 1000);
  const finished = new Date().toISOString();
  const { error } = await supabase.from('workouts')
    .update({ status: 'done', finished_at: finished, duration_sec: duration }).eq('id', open.id);
  if (error) throw error;
  const doneRow = { ...open, status: 'done', finished_at: finished, duration_sec: duration };
  recent = [doneRow, ...recent];
  open = null;
  return doneRow;
}

export async function discardWorkout() {
  if (!open) return;
  await supabase.from('workouts').delete().eq('id', open.id);
  open = null;
}

/**
 * Última sessão de cada exercício (séries feitas), fora o treino aberto.
 * Retorna Map(exerciseId -> { sets: [...], date })
 */
export async function lastSessions(exerciseIds) {
  const out = new Map();
  if (!exerciseIds.length) return out;
  let q = supabase.from('workout_sets').select('exercise_id, workout_id, set_number, reps, weight_kg, to_failure, created_at')
    .eq('done', true).in('exercise_id', exerciseIds).order('created_at', { ascending: false }).limit(600);
  const { data } = await q;
  for (const s of data || []) {
    if (open && s.workout_id === open.id) continue;
    const cur = out.get(s.exercise_id);
    if (!cur) out.set(s.exercise_id, { workoutId: s.workout_id, date: s.created_at, sets: [s] });
    else if (cur.workoutId === s.workout_id) cur.sets.push(s);
  }
  for (const v of out.values()) v.sets.sort((a, b) => a.set_number - b.set_number);
  return out;
}

/** Maior carga já registrada por exercício (para detectar recordes). */
export async function bestWeights(exerciseIds) {
  const out = new Map();
  if (!exerciseIds.length) return out;
  const { data } = await supabase.from('workout_sets').select('exercise_id, workout_id, weight_kg')
    .eq('done', true).in('exercise_id', exerciseIds).order('weight_kg', { ascending: false }).limit(1000);
  for (const s of data || []) {
    if (open && s.workout_id === open.id) continue;
    const w = Number(s.weight_kg || 0);
    if (!out.has(s.exercise_id) || w > out.get(s.exercise_id)) out.set(s.exercise_id, w);
  }
  return out;
}

/* ---------- Indicadores ---------- */
const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`; };

export function doneToday() {
  const k = dayKey(Date.now());
  return recent.find((w) => dayKey(w.started_at) === k) || null;
}

export function workoutsThisWeek() {
  const now = new Date();
  const monday = new Date(now); monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return recent.filter((w) => new Date(w.started_at) >= monday).length;
}

/** Sequência: dias de treino previstos cumpridos em seguida (descanso não quebra). */
export function streak(schedule) {
  const doneDays = new Set(recent.map((w) => dayKey(w.started_at)));
  let count = 0;
  const d = new Date(); d.setHours(12, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const k = dayKey(d);
    if (doneDays.has(k)) count++;
    else if (schedule.includes(d.getDay()) && i > 0) break;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

/** Histórico de um exercício: sessões (mais recentes primeiro) com as séries feitas. */
export async function exerciseHistory(exerciseId) {
  const { data } = await supabase.from('workout_sets').select('workout_id, set_number, reps, weight_kg, to_failure, created_at')
    .eq('done', true).eq('exercise_id', exerciseId).order('created_at', { ascending: false }).limit(400);
  const map = new Map();
  for (const s of data || []) {
    if (!map.has(s.workout_id)) map.set(s.workout_id, { workoutId: s.workout_id, date: s.created_at, sets: [] });
    map.get(s.workout_id).sets.push(s);
  }
  const sessions = [...map.values()];
  sessions.forEach((x) => x.sets.sort((a, b) => a.set_number - b.set_number));
  return sessions;
}

/** Treinos concluídos num intervalo de datas. */
export async function workoutsBetween(start, end) {
  const { data } = await supabase.from('workouts').select('id, plan_id, day_key, day_type, status, started_at, finished_at, duration_sec, exercises')
    .eq('status', 'done').gte('started_at', start.toISOString()).lt('started_at', end.toISOString())
    .order('started_at', { ascending: true }).limit(200);
  return data || [];
}

/** Séries feitas de um treino. */
export async function workoutSets(workoutId) {
  const { data } = await supabase.from('workout_sets').select('*').eq('workout_id', workoutId).eq('done', true)
    .order('position', { ascending: true }).order('set_number', { ascending: true });
  return data || [];
}
