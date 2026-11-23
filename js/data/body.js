// Medidas corporais (Supabase).
import { supabase } from './supabase.js';

export const BODY_FIELDS = ['weight_kg', 'body_fat_pct', 'waist_cm', 'chest_cm', 'arm_cm', 'thigh_cm', 'hip_cm'];

let cache = null;

export async function loadBody(force = false) {
  if (cache && !force) return cache;
  const { data } = await supabase.from('body_measurements').select('*')
    .order('measured_on', { ascending: true }).limit(500);
  cache = data || [];
  return cache;
}

export function resetBody() { cache = null; }

export async function saveMeasurement(row) {
  const { data, error } = await supabase.from('body_measurements')
    .upsert(row, { onConflict: 'user_id,measured_on' }).select().single();
  if (error) throw error;
  await loadBody(true);
  return data;
}

export async function deleteMeasurement(id) {
  const { error } = await supabase.from('body_measurements').delete().eq('id', id);
  if (error) throw error;
  await loadBody(true);
}

/** Primeira e última medida de um campo dentro de um período. */
export function bodyChange(rows, field, from, to = new Date()) {
  const inRange = rows.filter((r) => r[field] != null && new Date(r.measured_on) >= from && new Date(r.measured_on) <= to);
  if (inRange.length < 2) return null;
  const a = Number(inRange[0][field]), b = Number(inRange[inRange.length - 1][field]);
  return { first: a, last: b, delta: b - a };
}
