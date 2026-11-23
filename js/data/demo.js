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
        reps: s.r, weight_kg: s.w, to_failure: !!s.f, done: true,
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
  return db;
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
    async rpc(name, { p_plan, p_triage }) {
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
