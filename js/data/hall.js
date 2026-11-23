// Desafios concluídos e preferências do Hall da Fama.
import { supabase } from './supabase.js';
import { lastTriage } from './account.js';
import { weekKey } from '../engine/hall.js';

let runs = null;
let prefs = null;

export async function loadRuns(force = false) {
  if (runs && !force) return runs;
  const { data } = await supabase.from('challenge_runs').select('*').order('completed_at', { ascending: false }).limit(500);
  runs = data || [];
  return runs;
}

export function resetHall() { runs = null; prefs = null; }

export async function markDone(challengeId, workoutId) {
  const row = { challenge_id: challengeId, week_start: weekKey(), workout_id: workoutId, status: 'done' };
  await supabase.from('challenge_runs').upsert(row, { onConflict: 'user_id,challenge_id,week_start' });
  await loadRuns(true);
}

/** Preferências vindas da última triagem: modo (semanal, mensal, nenhum) e categorias. */
export async function loadPrefs() {
  if (prefs) return prefs;
  let a = null;
  try { a = (await lastTriage())?.answers || null; } catch (e) { a = null; }
  prefs = {
    mode: a?.challenges || 'weekly',
    categories: a?.challengeCategories || ['film', 'fight', 'athletes', 'bodybuilding', 'legends'],
    answers: a
  };
  return prefs;
}

const SHIFT_KEY = 'apex:v1:hall-shift';
export function getShift(key) { try { return JSON.parse(localStorage.getItem(SHIFT_KEY) || '{}')[key] || 0; } catch (e) { return 0; } }
export function bumpShift(key) {
  try { const m = JSON.parse(localStorage.getItem(SHIFT_KEY) || '{}'); m[key] = (m[key] || 0) + 1; localStorage.setItem(SHIFT_KEY, JSON.stringify(m)); } catch (e) {}
}
