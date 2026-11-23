// Modo demonstração: um "Supabase" local, só no aparelho, para explorar o app
// com dados simulados sem tocar na conta real.

const FLAG = 'apex:v1:demo';
const DB_KEY = 'apex:v1:demo-db';

export function demoActive() {
  try { return localStorage.getItem(FLAG) === '1'; } catch (e) { return false; }
}

const DAY = 864e5;
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36));

/** Converte o arquivo de demonstração (datas relativas) em tabelas com datas reais. */
function materialize(file) {
  const now = new Date();
  const at = (daysAgo, hhmm = '18:00') => {
    const d = new Date(now); d.setDate(d.getDate() - daysAgo);
    const [h, m] = hhmm.split(':').map(Number); d.setHours(h, m, 0, 0);
    return d;
  };
  const userId = 'demo-user';
  const db = { profiles: [], triages: [], plans: [], workouts: [], workout_sets: [], body_measurements: [] };
  db.profiles.push({ id: userId, ...file.profile, settings: {} });
  for (const p of file.plans) {
    db.plans.push({
      id: p.id, user_id: userId, triage_id: null, name: p.data.split, split: p.data.split, goal: p.data.goal,
      cycle_weeks: p.data.cycleWeeks, data: p.data, status: p.status,
      started_at: at(p.startedDaysAgo, '08:00').toISOString(),
      ended_at: p.endedDaysAgo != null ? at(p.endedDaysAgo, '20:00').toISOString() : null,
      created_at: at(p.startedDaysAgo, '08:00').toISOString()
    });
  }
  for (const w of file.workouts) {
    const start = at(w.daysAgo, w.time);
    db.workouts.push({
      id: w.id, user_id: userId, plan_id: w.planId, day_key: w.dayKey, day_type: w.dayType, status: 'done',
      started_at: start.toISOString(), finished_at: new Date(start.getTime() + w.durationSec * 1000).toISOString(),
      duration_sec: w.durationSec, exercises: w.exercises || [], created_at: start.toISOString()
    });
    w.sets.forEach((s, i) => {
      db.workout_sets.push({
        id: uid(), user_id: userId, workout_id: w.id, exercise_id: s.e, position: s.p, set_number: s.n,
        reps: s.r, weight_kg: s.w, to_failure: !!s.f, technique: s.k || (s.f ? 'failure' : 'normal'), blocks: s.b || null, technique_detail: null, done: true,
        created_at: new Date(start.getTime() + (i + 1) * 150000).toISOString()
      });
    });
  }
  for (const b of file.body) {
    const d = at(b.daysAgo, '08:00');
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    const { daysAgo, ...vals } = b;
    db.body_measurements.push({ id: uid(), user_id: userId, measured_on: iso, ...vals, created_at: d.toISOString() });
  }
  seedParties(db, now);
  return db;
}

/* ---------- Party simulada: amigos fictícios e pontos ---------- */
const isoDay = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const seasonEnd = (period, start) => (period === 'weekly' ? addDays(start, 6) : addDays(new Date(start.getFullYear(), start.getMonth() + 1, start.getDate()), -1));
const PTS = { workout: 10, challenge: 25, record: 5, streak: 15 };
const CAP = 50;

function seedParties(db, now) {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const me = 'demo-user';
  const myName = (db.profiles[0]?.name || 'Pedro').split(' ')[0];
  const friends = [
    { id: 'f-ana', name: 'Ana', days: 4, p: 0.62 }, { id: 'f-joao', name: 'João', days: 3, p: 0.42 },
    { id: 'f-bia', name: 'Bia', days: 5, p: 0.7 }, { id: 'f-rafa', name: 'Rafa', days: 3, p: 0.3 }
  ];
  db.parties = []; db.party_members = []; db.party_events = [];
  const today = new Date(now); today.setHours(12, 0, 0, 0);
  const myWorkoutDays = new Map();
  for (const w of db.workouts) { const k = isoDay(new Date(w.started_at)); if (!myWorkoutDays.has(k)) myWorkoutDays.set(k, w.id); }

  const make = ({ name, format, period, season, startAgo, challenge, members, code }) => {
    const start = addDays(today, -startAgo);
    const p = {
      id: uid(), code, name, format, period, categories: ['film', 'fight', 'athletes', 'bodybuilding', 'legends'], hall_bonus: true,
      challenge_id: challenge || null, season, season_start: isoDay(start), season_end: isoDay(seasonEnd(period, start)),
      owner_id: me, created_at: addDays(start, -20).toISOString()
    };
    db.parties.push(p);
    const end = new Date(p.season_end + 'T12:00:00');
    for (const m of members) {
      db.party_members.push({ party_id: p.id, user_id: m.id, display_name: m.name, days_per_week: m.days, joined_at: start.toISOString() });
      db.party_events.push({ id: uid(), party_id: p.id, user_id: m.id, kind: 'join', ref: m.id === me ? '' : String(season), points: 0, day: p.season_start, created_at: start.toISOString() });
      let doneChallenge = false;
      for (let d = new Date(start); d <= today && d <= end; d = addDays(d, 1)) {
        const day = isoDay(d);
        let total = 0;
        const push = (kind, ref, pts) => {
          const v = Math.min(pts, CAP - total); if (v <= 0) return;
          total += v;
          db.party_events.push({ id: uid(), party_id: p.id, user_id: m.id, kind, ref, points: v, day, created_at: new Date(d.getTime() + 3600e3 * (7 + Math.floor(rnd() * 12))).toISOString() });
        };
        if (m.id === me) {
          if (!myWorkoutDays.has(day)) continue;
          push('workout', myWorkoutDays.get(day), PTS.workout);
          if (rnd() < 0.3) push('record', `bb_bench_press:${myWorkoutDays.get(day)}`, PTS.record);
        } else {
          if (rnd() > m.p) continue;
          if (format === 'hall' && !doneChallenge && challenge && rnd() < 0.25) { doneChallenge = true; push('challenge', `${challenge}:${day}`, PTS.challenge); }
          else push('workout', `${m.id}-${day}`, PTS.workout);
          if (rnd() < 0.25) push('record', `${['bb_back_squat', 'bb_deadlift', 'pull_up', 'db_shoulder_press'][Math.floor(rnd() * 4)]}:${m.id}-${day}`, PTS.record);
        }
      }
    }
  };
  const meM = { id: me, name: myName, days: 4 };
  make({ name: 'Monstros da Ericeira', format: 'hall', period: 'monthly', season: 2, startAgo: 12, challenge: 'chris-evans-legs', code: 'APX7K2', members: [meM, ...friends] });
  make({ name: 'Duelo com o João', format: 'duel', period: 'weekly', season: 1, startAgo: 9, code: 'DUEL4J', members: [meM, friends[1]] });
  make({ name: 'Constância 2026', format: 'consistency', period: 'monthly', season: 1, startAgo: 18, code: 'CNST26', members: [meM, friends[0], friends[2], friends[3]] });
}

export function validateDemo(file) {
  return !!(file && file.app === 'apex-demo' && Array.isArray(file.plans) && Array.isArray(file.workouts));
}

/** Liga o modo demonstração com o arquivo e recarrega o app. */
export function enterDemo(file) {
  const db = materialize(file);
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  localStorage.setItem(FLAG, '1');
  location.hash = '#progresso';
  location.reload();
}

export function exitDemo() {
  try { localStorage.removeItem(FLAG); localStorage.removeItem(DB_KEY); } catch (e) {}
  location.hash = '#hoje';
  location.reload();
}

/* ---------- Cliente local com a mesma interface usada pelo app ---------- */
let db = null;
const load = () => { if (!db) { try { db = JSON.parse(localStorage.getItem(DB_KEY)) || null; } catch (e) { db = null; } } return db; };
const persist = () => { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {} };
const USER = { id: 'demo-user', email: 'demo@apex.app' };
const SESSION = { user: USER, access_token: 'demo' };

class Query {
  constructor(table) { this.t = table; this.f = []; this.op = 'select'; this.one = null; this.ord = []; this.lim = null; }
  select() { return this; }
  eq(c, v) { this.f.push((r) => r[c] === v); return this; }
  in(c, vs) { this.f.push((r) => vs.includes(r[c])); return this; }
  gte(c, v) { this.f.push((r) => r[c] >= v); return this; }
  lt(c, v) { this.f.push((r) => r[c] < v); return this; }
  order(c, o = {}) { this.ord.push([c, o.ascending !== false]); return this; }
  limit(n) { this.lim = n; return this; }
  maybeSingle() { this.one = 'maybe'; return this; }
  single() { this.one = 'single'; return this; }
  insert(row) { this.op = 'insert'; this.row = row; return this; }
  upsert(row, o) { this.op = 'upsert'; this.row = row; this.conf = o && o.onConflict; return this; }
  update(row) { this.op = 'update'; this.row = row; return this; }
  delete() { this.op = 'delete'; return this; }
  then(res, rej) { try { res(this.run()); } catch (e) { rej(e); } }
  run() {
    const data = load();
    if (!data[this.t]) data[this.t] = [];
    const T = data[this.t];
    const now = new Date().toISOString();
    let rows;
    if (this.op === 'insert') {
      if (this.t === 'workouts' && T.some((w) => w.status === 'in_progress')) return { data: null, error: { message: 'duplicate key' } };
      const r = { id: uid(), user_id: USER.id, created_at: now, ...(this.t === 'workouts' ? { started_at: now, status: 'in_progress' } : {}), ...this.row };
      T.push(r); rows = [r];
    } else if (this.op === 'upsert') {
      const row = { user_id: USER.id, ...this.row };
      const keys = this.conf ? this.conf.split(',') : ['id'];
      let r = T.find((x) => keys.every((k) => x[k] === row[k]));
      if (r) Object.assign(r, row); else { r = { id: uid(), created_at: now, ...row }; T.push(r); }
      rows = [r];
    } else {
      rows = T.filter((r) => this.f.every((fn) => fn(r)));
      if (this.op === 'update') rows.forEach((r) => Object.assign(r, this.row));
      if (this.op === 'delete') {
        data[this.t] = T.filter((r) => !rows.includes(r));
        if (this.t === 'workouts') { const ids = new Set(rows.map((r) => r.id)); data.workout_sets = data.workout_sets.filter((s) => !ids.has(s.workout_id)); }
        if (this.t === 'parties') { const ids = new Set(rows.map((r) => r.id)); data.party_members = (data.party_members || []).filter((m) => !ids.has(m.party_id)); data.party_events = (data.party_events || []).filter((e) => !ids.has(e.party_id)); }
        persist();
        return { data: null, error: null };
      }
      for (const [c, asc] of [...this.ord].reverse()) {
        rows = [...rows].sort((a, b) => ((a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * (asc ? 1 : -1)));
      }
      if (this.lim) rows = rows.slice(0, this.lim);
    }
    if (this.op !== 'select') persist();
    rows = rows.map((r) => JSON.parse(JSON.stringify(r)));
    if (this.one) return { data: rows[0] || null, error: this.one === 'single' && !rows[0] ? { message: 'no rows' } : null };
    return { data: rows, error: null };
  }
}

function partyRpc(name, a) {
  const data = load();
  data.parties = data.parties || []; data.party_members = data.party_members || []; data.party_events = data.party_events || [];
  const me = USER.id;
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const todayIso = isoDay(today);
  const out = (v) => { persist(); return { data: v, error: null }; };
  if (name === 'party_create') {
    const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const code = Array.from({ length: 6 }, () => alpha[Math.floor(Math.random() * alpha.length)]).join('');
    const p = { id: uid(), code, name: a.p_name.trim(), format: a.p_format, period: a.p_period, categories: a.p_categories || [], hall_bonus: a.p_hall_bonus !== false,
      challenge_id: a.p_challenge || null, season: 1, season_start: todayIso, season_end: isoDay(seasonEnd(a.p_period, today)), owner_id: me, created_at: new Date().toISOString() };
    data.parties.push(p);
    data.party_members.push({ party_id: p.id, user_id: me, display_name: a.p_display_name, days_per_week: a.p_days || 3, joined_at: new Date().toISOString() });
    data.party_events.push({ id: uid(), party_id: p.id, user_id: me, kind: 'join', ref: '', points: 0, day: todayIso, created_at: new Date().toISOString() });
    return out(p);
  }
  if (name === 'party_join') {
    const p = data.parties.find((x) => x.code === String(a.p_code || '').toUpperCase().trim());
    if (!p) return { data: null, error: { message: 'party_not_found' } };
    return out(p.id);
  }
  if (name === 'party_new_season') {
    const p = data.parties.find((x) => x.id === a.p_party && x.owner_id === me);
    if (!p) return { data: null, error: { message: 'not_owner' } };
    Object.assign(p, { season: p.season + 1, season_start: todayIso, season_end: isoDay(seasonEnd(p.period, today)), challenge_id: a.p_challenge || p.challenge_id });
    return out(p);
  }
  if (name === 'party_log') {
    const base = PTS[a.p_kind] || 0;
    let total = 0;
    if (!base) return out(0);
    for (const p of data.parties) {
      if (!data.party_members.some((m) => m.party_id === p.id && m.user_id === me)) continue;
      if (todayIso < p.season_start || todayIso > p.season_end) continue;
      let pts = base;
      if (a.p_kind === 'challenge') {
        if (p.format === 'hall') { if (p.challenge_id && p.challenge_id !== String(a.p_ref).split(':')[0]) pts = 0; }
        else if (!p.hall_bonus) pts = 0;
      }
      if (!pts) continue;
      const used = data.party_events.filter((e) => e.party_id === p.id && e.user_id === me && e.day === todayIso).reduce((x, e) => x + e.points, 0);
      pts = Math.min(pts, CAP - used);
      if (pts <= 0) continue;
      if (data.party_events.some((e) => e.party_id === p.id && e.user_id === me && e.kind === a.p_kind && e.ref === a.p_ref)) continue;
      data.party_events.push({ id: uid(), party_id: p.id, user_id: me, kind: a.p_kind, ref: a.p_ref, points: pts, day: todayIso, created_at: new Date().toISOString() });
      total += pts;
    }
    return out(total);
  }
  return { data: null, error: { message: 'unknown rpc' } };
}

export function demoClient() {
  return {
    auth: {
      async getSession() { return { data: { session: load() ? SESSION : null } }; },
      onAuthStateChange(fn) { setTimeout(() => fn('INITIAL_SESSION', load() ? SESSION : null)); return { data: { subscription: { unsubscribe() {} } } }; },
      async signUp() { return { error: { message: 'demo' } }; },
      async signInWithPassword() { return { error: { message: 'demo' } }; },
      async signOut() { exitDemo(); return { error: null }; }
    },
    from: (t) => new Query(t),
    async rpc(name, args) {
      if (name.startsWith('party_')) return partyRpc(name, args);
      const { p_plan, p_triage } = args;
      const data = load();
      data.plans.filter((p) => p.status === 'active').forEach((p) => { p.status = 'archived'; p.ended_at = new Date().toISOString(); });
      const id = uid();
      const now = new Date().toISOString();
      data.plans.push({ id, user_id: USER.id, triage_id: p_triage, name: p_plan.name, split: p_plan.split, goal: p_plan.goal, cycle_weeks: p_plan.cycleWeeks || 12, data: p_plan, status: 'active', started_at: now, created_at: now });
      persist();
      return { data: id, error: null };
    }
  };
}
