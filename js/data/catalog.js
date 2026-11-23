// Catálogo de exercícios (arquivo estático data/exercises.json).
import { t } from '../i18n/index.js';
let cache = null;
let byId = null;

export async function loadCatalog() {
  if (cache) return cache;
  const res = await fetch('data/exercises.json');
  const json = await res.json();
  cache = json.exercises;
  byId = new Map(cache.map((e) => [e.id, e]));
  return cache;
}

export const getExercise = (id) => (byId ? byId.get(id) : null);

export function exerciseName(id, lang) {
  const e = getExercise(id);
  return e ? (e.name[lang] || e.name.pt) : id;
}

/** Exercícios equivalentes (mesmo músculo, região, padrão e tipo). Se não houver, mesmo músculo e região. */
export function equivalents(id) {
  const e = getExercise(id);
  if (!e) return [];
  const same = cache.filter((x) => x.id !== id && x.muscle === e.muscle && x.region === e.region && x.pattern === e.pattern && x.type === e.type);
  if (same.length) return same;
  return cache.filter((x) => x.id !== id && x.muscle === e.muscle && x.region === e.region);
}

/** Linha curta com as áreas principais (ex.: "dorsal · trapézio médio · romboides"). */
export function musclesLine(id, max = 3) {
  const e = getExercise(id);
  if (!e || !e.primary) return '';
  const names = [...new Set(e.primary.map((a) => t('areasShort.' + a)))];
  return names.slice(0, max).join(' · ');
}
