// Motor do Hall da Fama: escolhe o desafio da semana (ou do mês) e onde ele encaixa no plano.
import { CHALLENGES } from '../data/challenges.js';
import { dayOnWeekday } from './generator.js';

const LEVEL = { beginner: 1, intermediate: 2, advanced: 3 };

export function weekKey(date = new Date()) {
  const d = new Date(date); d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // segunda-feira
  return d.toISOString().slice(0, 10);
}
export const monthKey = (date = new Date()) => date.toISOString().slice(0, 7);

function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); }

/** Desafios possíveis para a pessoa: categorias escolhidas, nível e equipamentos. */
export function eligible({ categories, level, equipment, getExercise }) {
  const lv = LEVEL[level] || 1;
  const cats = categories && categories.length ? categories : null;
  return CHALLENGES.filter((c) => {
    if (cats && !cats.includes(c.category)) return false;
    if (c.level > lv + 1) return false;
    if (!equipment || !getExercise) return true;
    const ok = c.exercises.filter((x) => { const e = getExercise(x.id); return e && equipment.has(e.equipment); }).length;
    return ok / c.exercises.length >= 0.75;
  });
}

/** Desafio atual (determinístico por semana ou mês, com opção de trocar). */
export function currentChallenge(pool, { mode = 'weekly', date = new Date(), shift = 0 } = {}) {
  if (!pool.length) return null;
  const key = mode === 'monthly' ? monthKey(date) : weekKey(date);
  return pool[(hash(key) + shift) % pool.length];
}

/**
 * Onde o desafio entra nesta semana.
 * Retorna { mode: 'replace' | 'extra', day (do plano, quando substitui), date }.
 */
export function placement(challenge, plan, from = new Date()) {
  const start = new Date(from); start.setHours(12, 0, 0, 0);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    if (i > 0 && d.getDay() === 1) break; // até domingo
    week.push(d);
  }
  const dayAt = (d) => dayOnWeekday(plan, d.getDay());
  const overlap = (day) => day ? day.focus.filter((m) => challenge.focus.includes(m)).length : 0;

  if (challenge.kind === 'replace') {
    let best = null;
    for (const d of week) {
      const day = dayAt(d);
      if (!day) continue;
      const sc = overlap(day);
      if (sc > 0 && (!best || sc > best.sc)) best = { sc, day, date: d };
    }
    if (best) return { mode: 'replace', day: best.day, date: best.date };
  }
  // Dia extra: um dia livre que não venha logo depois de treinar os mesmos músculos
  const free = week.filter((d) => !dayAt(d));
  const good = free.find((d) => { const prev = new Date(d); prev.setDate(d.getDate() - 1); return overlap(dayAt(prev)) === 0; });
  if (good || free[0]) return { mode: 'extra', day: null, date: good || free[0] };
  // Sem dia livre na semana: substitui o dia mais parecido
  let best = null;
  for (const d of week) { const day = dayAt(d); if (day && (!best || overlap(day) > best.sc)) best = { sc: overlap(day), day, date: d }; }
  return best ? { mode: 'replace', day: best.day, date: best.date } : { mode: 'extra', day: null, date: week[0] };
}
