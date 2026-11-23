// Gera data/demo-apex.json: dois ciclos de treino simulados com datas relativas.
// Uso: node tools/build_demo.mjs
import fs from 'fs';
import { generatePlans } from '../js/engine/generator.js';

const catalog = JSON.parse(fs.readFileSync(new URL('../data/exercises.json', import.meta.url))).exercises;
const byId = new Map(catalog.map((e) => [e.id, e]));

// Gerador pseudoaleatório determinístico (o arquivo sai sempre igual)
let seed = 42;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

function startWeight(ex) {
  const base = { barbell: 40, smith: 35, machine: 35, cable: 20, dumbbell: 12, ez_bar: 20, kettlebell: 12, band: 0, bodyweight: 0, pullup_bar: 0, dip_bars: 0 }[ex.equipment] ?? 10;
  const legs = ['squat', 'hinge', 'hip_thrust'].includes(ex.pattern) ? 1.6 : 1;
  const iso = ex.type === 'isolation' ? 0.6 : 1;
  return Math.round((base * legs * iso) / 2.5) * 2.5;
}
function inc(ex) {
  if (['bodyweight', 'band', 'pullup_bar', 'dip_bars'].includes(ex.equipment)) return 0;
  if (['squat', 'hinge', 'hip_thrust'].includes(ex.pattern) && ['barbell', 'machine', 'smith'].includes(ex.equipment)) return 5;
  if (['dumbbell', 'kettlebell'].includes(ex.equipment)) return 2;
  return ex.type === 'isolation' ? 1.25 : 2.5;
}
const range = (reps) => { const m = String(reps).match(/^(\d+)-(\d+)$/); return m ? [Number(m[1]), Number(m[2])] : null; };

function simulateCycle({ planId, plan, startedDaysAgo, endDaysAgo, skipRate, weeksOffsetStrength = 0, workouts }) {
  const state = new Map(); // exercício -> { w, reps }
  const today = new Date(); today.setHours(12, 0, 0, 0);
  for (let daysAgo = startedDaysAgo; daysAgo > endDaysAgo; daysAgo--) {
    const d = new Date(today); d.setDate(d.getDate() - daysAgo);
    const idx = plan.schedule.indexOf(d.getDay());
    if (idx === -1) continue;
    if (rnd() < skipRate) continue;
    const day = plan.days[idx % plan.days.length];
    const sets = [];
    day.exercises.forEach((x, p) => {
      const ex = byId.get(x.id);
      const r = range(x.reps);
      if (!state.has(x.id)) state.set(x.id, { w: startWeight(ex) + weeksOffsetStrength * inc(ex), top: false });
      const st = state.get(x.id);
      if (st.top) { st.w += inc(ex); st.top = false; }
      let allTop = true;
      for (let n = 1; n <= x.sets; n++) {
        let reps = r ? Math.max(r[0] - 1, Math.min(r[1], r[0] + Math.floor(rnd() * (r[1] - r[0] + 2)) - (n > 2 ? 1 : 0))) : null;
        if (r && reps < r[1]) allTop = false;
        sets.push({ e: x.id, p, n, r: reps, w: ex.equipment === 'bodyweight' || ex.equipment === 'band' ? null : st.w, ...(r && n === x.sets && rnd() < 0.15 ? { f: true } : {}) });
      }
      if (r && (allTop || rnd() < 0.35)) st.top = true;
    });
    const hh = 17 + Math.floor(rnd() * 3), mm = Math.floor(rnd() * 4) * 15;
    workouts.push({
      id: `w-${planId}-${daysAgo}`, planId, dayKey: day.key, dayType: day.type,
      daysAgo, time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
      durationSec: 2700 + Math.floor(rnd() * 1800), exercises: day.exercises, sets
    });
  }
}

// Ciclo anterior: iniciante, full body 3x, 8 semanas (terminou há ~3 dias da troca)
const [prev] = generatePlans({ goal: 'hypertrophy', level: 'beginner', weekdays: [1, 3, 5], duration: 60, location: 'full_gym', limitations: [], cardio: 'none', cycleWeeks: 8 }, catalog);
prev.name = prev.split;
// Ciclo atual: intermediário, superior/inferior 4x, 12 semanas, começou há 81 dias (faltam 3)
const [cur] = generatePlans({ goal: 'hypertrophy', level: 'intermediate', weekdays: [1, 2, 4, 5], duration: 60, location: 'full_gym', focus: ['glutes'], limitations: [], cardio: 'none', cycleWeeks: 12 }, catalog);
cur.name = cur.split;

const CUR_START = 81, PREV_START = CUR_START + 8 * 7 + 3, PREV_END = CUR_START + 1;
const workouts = [];
simulateCycle({ planId: 'demo-prev', plan: prev, startedDaysAgo: PREV_START, endDaysAgo: PREV_END, skipRate: 0.22, workouts });
simulateCycle({ planId: 'demo-cur', plan: cur, startedDaysAgo: CUR_START, endDaysAgo: 0, skipRate: 0.12, weeksOffsetStrength: 2, workouts });
workouts.sort((a, b) => b.daysAgo - a.daysAgo);

const body = [];
for (let daysAgo = PREV_START; daysAgo >= 1; daysAgo -= 14) {
  const t = 1 - daysAgo / PREV_START; // 0 -> 1 ao longo do tempo
  body.push({
    daysAgo,
    weight_kg: Math.round((84.2 - 4.4 * t + (rnd() - 0.5) * 0.6) * 10) / 10,
    body_fat_pct: Math.round((20.5 - 4.6 * t) * 10) / 10,
    waist_cm: Math.round((91 - 6 * t) * 10) / 10,
    arm_cm: Math.round((35 + 1.8 * t) * 10) / 10,
    chest_cm: Math.round((101 + 2 * t) * 10) / 10,
    thigh_cm: Math.round((57 + 1.5 * t) * 10) / 10
  });
}

const file = {
  app: 'apex-demo', version: 1,
  note: 'Dados simulados para o modo demonstração do Apex. As datas são relativas ao dia da importação.',
  profile: { name: 'Pedro (demo)', birth_date: '1994-02-02', sex: 'male', height_cm: 180, weight_kg: 80 },
  plans: [
    { id: 'demo-prev', status: 'archived', startedDaysAgo: PREV_START, endedDaysAgo: PREV_END, data: prev },
    { id: 'demo-cur', status: 'active', startedDaysAgo: CUR_START, data: cur }
  ],
  workouts, body
};
fs.writeFileSync(new URL('../data/demo-apex.json', import.meta.url), JSON.stringify(file));
console.log(`treinos: ${workouts.length}, séries: ${workouts.reduce((s, w) => s + w.sets.length, 0)}, medidas: ${body.length}, tamanho: ${(JSON.stringify(file).length / 1024).toFixed(0)} KB`);
