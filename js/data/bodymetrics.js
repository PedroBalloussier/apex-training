// Indicadores corporais calculados: IMC, relação cintura/altura, % de gordura estimada, massa magra.

export function ageOn(birth, on = new Date()) {
  if (!birth) return null;
  const b = new Date(birth + 'T12:00:00');
  let a = on.getFullYear() - b.getFullYear();
  if (on.getMonth() < b.getMonth() || (on.getMonth() === b.getMonth() && on.getDate() < b.getDate())) a--;
  return a;
}

export function bmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

/** Faixas da OMS para adultos. */
export function bmiBand(v) {
  if (v == null) return null;
  if (v < 18.5) return 'under';
  if (v < 25) return 'normal';
  if (v < 30) return 'over';
  return 'obese';
}

export function whtr(waistCm, heightCm) {
  if (!waistCm || !heightCm) return null;
  return waistCm / heightCm;
}

export function whtrBand(v) {
  if (v == null) return null;
  if (v < 0.5) return 'good';
  if (v < 0.6) return 'watch';
  return 'high';
}

/** Método da Marinha americana (medidas em cm). Só para sexo masculino ou feminino. */
export function navyBodyFat({ sex, heightCm, waistCm, neckCm, hipCm }) {
  if (!heightCm || !waistCm || !neckCm) return null;
  let v = null;
  if (sex === 'male') {
    if (waistCm - neckCm <= 0) return null;
    v = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else if (sex === 'female') {
    if (!hipCm || waistCm + hipCm - neckCm <= 0) return null;
    v = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
  }
  if (v == null || !Number.isFinite(v) || v < 3 || v > 60) return null;
  return Math.round(v * 10) / 10;
}

/**
 * Junta registros esparsos numa linha por data, com os valores derivados.
 * Cada medida usa o último valor conhecido até aquela data (peso de hoje + cintura da semana passada).
 */
export function deriveRows(rows, profile = {}) {
  const heightCm = Number(profile.height_cm) || null;
  const sex = profile.sex;
  const known = {};
  return rows.map((r) => {
    for (const [k, v] of Object.entries(r)) if (k.endsWith('_kg') || k.endsWith('_cm') || k.endsWith('_pct')) { if (v != null) known[k] = Number(v); }
    const weight = known.weight_kg ?? (Number(profile.weight_kg) || null);
    const estFat = navyBodyFat({ sex, heightCm, waistCm: known.waist_cm, neckCm: known.neck_cm, hipCm: known.hip_cm });
    // Registro do dia vence; senão a estimativa pelas medidas; senão o último registro.
    const fat = r.body_fat_pct != null ? Number(r.body_fat_pct) : (estFat ?? known.body_fat_pct ?? null);
    const fatSource = r.body_fat_pct != null ? 'logged' : estFat != null ? 'navy' : known.body_fat_pct != null ? 'logged' : null;
    const b = bmi(weight, heightCm);
    const w = whtr(known.waist_cm, heightCm);
    return {
      date: r.measured_on,
      raw: r,
      weight, bmi: b, whtr: w, fat, fatSource,
      lean: weight != null && fat != null ? weight * (1 - fat / 100) : null,
      fatMass: weight != null && fat != null ? weight * (fat / 100) : null
    };
  });
}

/** Média dos registros dos últimos `days` dias até cada ponto. */
export function movingAverage(points, dates, days = 14) {
  return points.map((_, i) => {
    const end = new Date(dates[i] + 'T12:00:00');
    let sum = 0, n = 0;
    for (let j = i; j >= 0; j--) {
      if ((end - new Date(dates[j] + 'T12:00:00')) / 864e5 > days) break;
      sum += points[j]; n++;
    }
    return n ? sum / n : points[i];
  });
}
