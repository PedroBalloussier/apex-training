// Party: competição entre amigos (Supabase). Os pontos são calculados no servidor (party_log).
import { supabase } from './supabase.js';
import { getProfile, getActivePlan } from './account.js';

export const FORMATS = ['hall', 'consistency', 'duel'];
export const DAILY_CAP = 50;
export const POINTS = { workout: 10, challenge: 25, record: 5, streak: 15 };

let cache = null;

export function resetParty() { cache = null; }

const myName = () => (getProfile()?.name || '').trim().split(/\s+/)[0] || 'Atleta';
const myDays = () => getActivePlan()?.data?.daysPerWeek || 3;

/** Parties de que faço parte, com membros (o RLS só devolve as minhas). */
export async function listParties(force = false) {
  if (cache && !force) return cache;
  const { data: parties } = await supabase.from('parties').select('*').order('created_at', { ascending: false });
  const list = parties || [];
  if (!list.length) { cache = []; return cache; }
  const ids = list.map((p) => p.id);
  const [{ data: members }, { data: events }] = await Promise.all([
    supabase.from('party_members').select('*').in('party_id', ids),
    supabase.from('party_events').select('party_id, user_id, kind, points, day').in('party_id', ids)
  ]);
  cache = list.map((p) => ({ ...p, members: (members || []).filter((m) => m.party_id === p.id), events: (events || []).filter((e) => e.party_id === p.id) }));
  return cache;
}

export async function getParty(id) {
  const list = await listParties(true);
  const p = list.find((x) => x.id === id);
  if (!p) return null;
  const { data: events } = await supabase.from('party_events').select('*').eq('party_id', id).order('created_at', { ascending: false }).limit(400);
  return { ...p, events: events || [] };
}

export async function createParty({ name, format, period, categories, hallBonus, challengeId }) {
  const { data, error } = await supabase.rpc('party_create', {
    p_name: name, p_format: format, p_period: period, p_categories: categories || [],
    p_hall_bonus: hallBonus, p_challenge: challengeId || null, p_display_name: myName(), p_days: myDays()
  });
  if (error) throw error;
  resetParty();
  return Array.isArray(data) ? data[0] : data;
}

export async function joinParty(code) {
  const { data, error } = await supabase.rpc('party_join', { p_code: code, p_display_name: myName(), p_days: myDays() });
  if (error) throw error;
  resetParty();
  return data;
}

export async function leaveParty(partyId, userId) {
  const { error } = await supabase.from('party_members').delete().eq('party_id', partyId).eq('user_id', userId);
  if (error) throw error;
  resetParty();
}

export async function deleteParty(partyId) {
  const { error } = await supabase.from('parties').delete().eq('id', partyId);
  if (error) throw error;
  resetParty();
}

export async function newSeason(partyId, challengeId) {
  const { error } = await supabase.rpc('party_new_season', { p_party: partyId, p_challenge: challengeId || null });
  if (error) throw error;
  resetParty();
}

/** Registra pontos em todas as parties ativas. Retorna o total ganho (já com o limite diário). */
export async function logPoints(kind, ref) {
  try {
    const { data, error } = await supabase.rpc('party_log', { p_kind: kind, p_ref: String(ref) });
    if (error) return 0;
    if (data) resetParty();
    return Number(data) || 0;
  } catch (e) { return 0; }
}

/** Chamado ao concluir um treino: treino ou desafio, recordes e sequência de 7 dias. */
export async function logWorkoutPoints({ workout, prs = [], streakDays = 0, weekKey }) {
  let total = 0;
  if (workout.day_type && workout.day_type.startsWith('hall:')) total += await logPoints('challenge', `${workout.day_type.slice(5)}:${weekKey}`);
  else total += await logPoints('workout', workout.id);
  for (const r of prs.slice(0, 3)) total += await logPoints('record', `${r.id}:${workout.id}`);
  if (streakDays > 0 && streakDays % 7 === 0) total += await logPoints('streak', `${streakDays}:${new Date().toISOString().slice(0, 10)}`);
  return total;
}

/* ---------- Cálculos de ranking (no aparelho) ---------- */

export function inSeason(e, p) { return e.day >= p.season_start && e.day <= p.season_end; }

export function seasonInfo(p, now = new Date()) {
  const start = new Date(p.season_start + 'T00:00:00');
  const end = new Date(p.season_end + 'T23:59:59');
  const total = Math.round((end - start) / 864e5);
  const daysLeft = Math.max(0, Math.ceil((end - now) / 864e5));
  const elapsedDays = Math.min(total, Math.max(1, Math.ceil((now - start) / 864e5)));
  return { start, end, total, daysLeft, elapsedDays, ended: now > end };
}

/** Ranking da temporada atual. Consistência: % do próprio plano cumprido; outros formatos: pontos. */
export function ranking(p) {
  const info = seasonInfo(p);
  const weeks = info.elapsedDays / 7;
  const rows = p.members.map((m) => {
    const ev = p.events.filter((e) => e.user_id === m.user_id && inSeason(e, p));
    const points = ev.reduce((s, e) => s + (e.points || 0), 0);
    const workouts = ev.filter((e) => e.kind === 'workout' || e.kind === 'challenge').length;
    const expected = Math.max(1, Math.round(m.days_per_week * weeks));
    const adherence = Math.min(100, Math.round((workouts / expected) * 100));
    const today = new Date().toISOString().slice(0, 10);
    const todayPts = ev.filter((e) => e.day === today).reduce((s, e) => s + (e.points || 0), 0);
    return { ...m, points, workouts, adherence, todayPts, records: ev.filter((e) => e.kind === 'record').length };
  });
  const key = p.format === 'consistency' ? 'adherence' : 'points';
  rows.sort((a, b) => b[key] - a[key] || b.points - a.points || a.display_name.localeCompare(b.display_name));
  rows.forEach((r, i) => { r.rank = i > 0 && rows[i - 1][key] === r[key] ? rows[i - 1].rank : i + 1; r.score = r[key]; });
  return rows;
}
