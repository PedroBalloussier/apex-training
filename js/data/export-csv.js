// Exportação em CSV (abre no Excel, Numbers e Google Sheets): treinos série a série e medidas.
import { supabase } from './supabase.js';
import { getSettings } from './settings.js';
import { getLanguage, t } from '../i18n/index.js';
import { loadCatalog, exerciseName } from './catalog.js';
import { dayLabel } from './labels.js';
import { weightToUser, lengthToUser } from '../utils/units.js';
import { BODY_FIELDS } from './body.js';

function csv(rows, lang) {
  // PT: ponto e vírgula e vírgula decimal (padrão do Excel em português); EN: vírgula e ponto.
  const sep = lang === 'en' ? ',' : ';';
  const cell = (v) => {
    if (v == null) return '';
    let s = typeof v === 'number' ? (lang === 'en' ? String(v) : String(v).replace('.', ',')) : String(v);
    if (s.includes(sep) || /["\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  return '﻿' + rows.map((r) => r.map(cell).join(sep)).join('\r\n');
}

function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const stamp = () => new Date().toISOString().slice(0, 10);
const round = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

export async function exportWorkoutsCsv() {
  const lang = getLanguage();
  const { weightUnit } = getSettings();
  await loadCatalog();
  const [{ data: workouts }, { data: sets }] = await Promise.all([
    supabase.from('workouts').select('id, day_key, day_type, started_at, duration_sec').eq('status', 'done').order('started_at', { ascending: true }).limit(5000),
    supabase.from('workout_sets').select('workout_id, exercise_id, position, set_number, reps, weight_kg, to_failure, done').eq('done', true).limit(50000)
  ]);
  const byW = new Map((workouts || []).map((w) => [w.id, w]));
  const rows = [[t('csv.date'), t('csv.time'), t('csv.workout'), t('csv.exercise'), t('csv.set'), t('csv.reps'), `${t('csv.load')} (${weightUnit})`, t('csv.failure'), t('csv.duration')]];
  const list = (sets || []).filter((s) => byW.has(s.workout_id))
    .sort((a, b) => (byW.get(a.workout_id).started_at.localeCompare(byW.get(b.workout_id).started_at)) || a.position - b.position || a.set_number - b.set_number);
  for (const s of list) {
    const w = byW.get(s.workout_id);
    const d = new Date(w.started_at);
    rows.push([
      d.toLocaleDateString(lang === 'en' ? 'en-CA' : 'pt-BR'), d.toLocaleTimeString(lang === 'en' ? 'en-GB' : 'pt-BR', { hour: '2-digit', minute: '2-digit' }),
      `${w.day_key} · ${dayLabel(w.day_type)}`, exerciseName(s.exercise_id, lang), s.set_number, s.reps,
      s.weight_kg != null ? round(weightToUser(Number(s.weight_kg), weightUnit)) : null,
      s.to_failure ? t('csv.yes') : '', w.duration_sec ? Math.round(w.duration_sec / 60) : null
    ]);
  }
  download(csv(rows, lang), `apex-treinos-${stamp()}.csv`);
  return rows.length - 1;
}

export async function exportBodyCsv() {
  const lang = getLanguage();
  const { weightUnit, lengthUnit } = getSettings();
  const { data } = await supabase.from('body_measurements').select('*').order('measured_on', { ascending: true }).limit(2000);
  const head = [t('csv.date'), ...BODY_FIELDS.map((f) => (f === 'body_fat_pct' ? t('body.' + f) : `${t('body.' + f)} (${f === 'weight_kg' ? weightUnit : lengthUnit})`))];
  const rows = [head];
  for (const r of data || []) {
    rows.push([new Date(r.measured_on + 'T12:00:00').toLocaleDateString(lang === 'en' ? 'en-CA' : 'pt-BR'), ...BODY_FIELDS.map((f) => {
      if (r[f] == null) return null;
      const v = Number(r[f]);
      return round(f === 'weight_kg' ? weightToUser(v, weightUnit) : f === 'body_fat_pct' ? v : lengthToUser(v, lengthUnit));
    })]);
  }
  download(csv(rows, lang), `apex-medidas-${stamp()}.csv`);
  return rows.length - 1;
}
