// Motor de geração de planos: triagem -> 2 ou 3 opções de plano, uma recomendada.
// Puro (sem DOM, sem rede): recebe as respostas e o catálogo, devolve objetos de plano.

/* ---------- Equipamentos por local de treino ---------- */
export const EQUIPMENT_PRESETS = {
  full_gym: ['barbell', 'dumbbell', 'machine', 'cable', 'smith', 'ez_bar', 'kettlebell', 'band', 'bodyweight', 'pullup_bar', 'dip_bars'],
  basic_gym: ['barbell', 'dumbbell', 'machine', 'cable', 'ez_bar', 'bodyweight', 'pullup_bar', 'dip_bars'],
  home: ['bodyweight'],      // + extras escolhidos (halteres, kettlebell, elástico, barra fixa)
  bodyweight: ['bodyweight']
};
export const HOME_EXTRAS = ['dumbbell', 'kettlebell', 'band', 'pullup_bar'];

const LEVEL_NUM = { beginner: 1, intermediate: 2, advanced: 3 };

/* ---------- Slots: o que cada dia precisa ---------- */
// m = músculo, r = região, p = padrão, t = tipo (c composto / i isolado)
const S = {
  chestMain:   { m: 'chest', r: 'middle', p: 'horizontal_push', t: 'c' },
  chestUpper:  { m: 'chest', r: 'upper', p: 'horizontal_push', t: 'c' },
  chestFly:    { m: 'chest', p: 'fly', t: 'i' },
  chestLower:  { m: 'chest', r: 'lower', t: 'c' },
  backVert:    { m: 'back', r: 'lats', p: 'vertical_pull', t: 'c' },
  backHoriz:   { m: 'back', r: 'upper', p: 'horizontal_pull', t: 'c' },
  backIso:     { m: 'back', r: 'lats', p: 'pullover', t: 'i' },
  traps:       { m: 'back', r: 'traps', t: 'i' },
  lowBack:     { m: 'back', r: 'lower', t: 'i' },
  shPress:     { m: 'shoulders', p: 'vertical_push', t: 'c' },
  shLateral:   { m: 'shoulders', r: 'side', p: 'lateral_raise', t: 'i' },
  shRear:      { m: 'shoulders', r: 'rear', p: 'rear_fly', t: 'i' },
  shFront:     { m: 'shoulders', r: 'front', p: 'front_raise', t: 'i' },
  biLong:      { m: 'biceps', p: 'elbow_flexion', t: 'i' },
  biStretch:   { m: 'biceps', p: 'elbow_flexion_stretch', t: 'i' },
  biShort:     { m: 'biceps', p: 'elbow_flexion_short', t: 'i' },
  biHammer:    { m: 'biceps', p: 'hammer_curl', t: 'i' },
  triCompound: { m: 'triceps', p: 'elbow_extension_compound', t: 'c' },
  triPush:     { m: 'triceps', p: 'elbow_extension', t: 'i' },
  triOver:     { m: 'triceps', p: 'elbow_extension_overhead', t: 'i' },
  forearm:     { m: 'forearms', r: 'flexors', t: 'i' },
  forearmExt:  { m: 'forearms', r: 'extensors', p: 'reverse_curl', t: 'i' },
  squat:       { m: 'quads', p: 'squat', t: 'c' },
  lunge:       { m: 'quads', p: 'lunge', t: 'c' },
  quadIso:     { m: 'quads', p: 'knee_extension', t: 'i' },
  hinge:       { m: 'hamstrings', p: 'hinge', t: 'c' },
  hamCurl:     { m: 'hamstrings', p: 'knee_flexion', t: 'i' },
  hipThrust:   { m: 'glutes', r: 'max', p: 'hip_thrust', t: 'c' },
  gluteIso:    { m: 'glutes', r: 'max', p: 'hip_extension', t: 'i' },
  abduction:   { m: 'glutes', r: 'medius', p: 'hip_abduction', t: 'i' },
  calf:        { m: 'calves', p: 'calf_raise', t: 'i' },
  calfSeated:  { m: 'calves', p: 'seated_calf_raise', t: 'i' },
  coreFlex:    { m: 'core', p: 'core_flexion', t: 'i' },
  coreLeg:     { m: 'core', p: 'leg_raise', t: 'i' },
  coreHold:    { m: 'core', p: 'anti_extension', t: 'i' },
  coreRot:     { m: 'core', r: 'obliques', t: 'i' },
  power:       { m: 'fullbody', r: 'power', t: 'c' },
  condition:   { m: 'fullbody', p: 'conditioning', t: 'c' },
  cardio:      { m: 'fullbody', p: 'cardio', t: 'c' },
  plyo:        { m: 'quads', p: 'plyometric', t: 'c' }
};

/* ---------- Tipos de dia (ordem = prioridade quando o tempo é curto) ---------- */
const DAY_TYPES = {
  full_a:    { focus: ['quads', 'chest', 'back'], slots: ['squat', 'chestMain', 'backHoriz', 'shPress', 'hamCurl', 'biLong', 'triPush', 'coreHold'] },
  full_b:    { focus: ['hamstrings', 'back', 'shoulders'], slots: ['hinge', 'backVert', 'chestUpper', 'lunge', 'shLateral', 'triOver', 'biHammer', 'coreFlex'] },
  full_c:    { focus: ['glutes', 'chest', 'back'], slots: ['hipThrust', 'chestMain', 'backVert', 'quadIso', 'shRear', 'biStretch', 'triCompound', 'coreLeg'] },
  upper_a:   { focus: ['chest', 'back', 'shoulders'], slots: ['chestMain', 'backHoriz', 'shPress', 'backVert', 'chestFly', 'shLateral', 'biLong', 'triPush'] },
  upper_b:   { focus: ['back', 'chest', 'shoulders'], slots: ['backVert', 'chestUpper', 'backHoriz', 'shLateral', 'shRear', 'triOver', 'biStretch', 'chestFly'] },
  lower_a:   { focus: ['quads', 'hamstrings', 'glutes'], slots: ['squat', 'hinge', 'lunge', 'quadIso', 'hamCurl', 'calf', 'coreHold', 'abduction'] },
  lower_b:   { focus: ['hamstrings', 'glutes', 'quads'], slots: ['hinge', 'hipThrust', 'squat', 'hamCurl', 'lunge', 'calfSeated', 'coreLeg', 'gluteIso'] },
  push:      { focus: ['chest', 'shoulders', 'triceps'], slots: ['chestMain', 'shPress', 'chestUpper', 'shLateral', 'chestFly', 'triPush', 'triOver', 'shFront'] },
  pull:      { focus: ['back', 'biceps'], slots: ['backVert', 'backHoriz', 'backIso', 'shRear', 'biLong', 'biHammer', 'traps', 'forearm'] },
  legs:      { focus: ['quads', 'hamstrings', 'glutes', 'calves'], slots: ['squat', 'hinge', 'lunge', 'quadIso', 'hamCurl', 'calf', 'hipThrust', 'coreHold'] },
  chest_tri: { focus: ['chest', 'triceps'], slots: ['chestMain', 'chestUpper', 'chestFly', 'chestLower', 'triCompound', 'triPush', 'triOver', 'coreFlex'] },
  back_bi:   { focus: ['back', 'biceps'], slots: ['backVert', 'backHoriz', 'backIso', 'traps', 'biLong', 'biStretch', 'biHammer', 'lowBack'] },
  legs_sh:   { focus: ['quads', 'hamstrings', 'shoulders'], slots: ['squat', 'shPress', 'hinge', 'shLateral', 'lunge', 'hamCurl', 'shRear', 'calf'] },
  chest:     { focus: ['chest'], slots: ['chestMain', 'chestUpper', 'chestFly', 'chestLower', 'chestFly', 'coreFlex', 'coreHold', 'coreLeg'] },
  back:      { focus: ['back'], slots: ['backVert', 'backHoriz', 'backHoriz', 'backIso', 'traps', 'lowBack', 'shRear', 'forearm'] },
  shoulders: { focus: ['shoulders'], slots: ['shPress', 'shLateral', 'shRear', 'shFront', 'shLateral', 'traps', 'coreRot', 'coreHold'] },
  arms:      { focus: ['biceps', 'triceps', 'forearms'], slots: ['triCompound', 'biLong', 'triOver', 'biStretch', 'triPush', 'biHammer', 'forearm', 'forearmExt'] },
  sh_arms:   { focus: ['shoulders', 'biceps', 'triceps'], slots: ['shPress', 'shLateral', 'triCompound', 'biLong', 'shRear', 'triOver', 'biHammer', 'forearm'] },
  chest_back:{ focus: ['chest', 'back'], slots: ['chestMain', 'backVert', 'chestUpper', 'backHoriz', 'chestFly', 'backIso', 'coreHold', 'coreFlex'] },
  conditioning: { focus: ['fullbody'], slots: ['cardio', 'condition', 'power', 'plyo', 'condition', 'coreRot', 'coreHold', 'cardio'] }
};

/* ---------- Divisões disponíveis por número de dias ---------- */
const SPLITS = {
  full_body_2: { days: 2, rotation: ['full_a', 'full_b'] },
  upper_lower_2: { days: 2, rotation: ['upper_a', 'lower_a'] },
  full_body_3: { days: 3, rotation: ['full_a', 'full_b', 'full_c'] },
  ppl_3: { days: 3, rotation: ['push', 'pull', 'legs'] },
  abc_3: { days: 3, rotation: ['chest_tri', 'back_bi', 'legs_sh'] },
  arnold_3: { days: 3, rotation: ['chest_back', 'sh_arms', 'legs'] },
  upper_lower_4: { days: 4, rotation: ['upper_a', 'lower_a', 'upper_b', 'lower_b'] },
  abcd_4: { days: 4, rotation: ['chest_tri', 'back_bi', 'legs', 'sh_arms'] },
  full_body_4: { days: 4, rotation: ['full_a', 'full_b', 'full_c', 'full_a'] },
  abcde_5: { days: 5, rotation: ['chest', 'back', 'legs', 'shoulders', 'arms'] },
  ppl_ul_5: { days: 5, rotation: ['push', 'pull', 'legs', 'upper_a', 'lower_b'] },
  upper_lower_5: { days: 5, rotation: ['upper_a', 'lower_a', 'upper_b', 'lower_b', 'full_c'] },
  ppl_6: { days: 6, rotation: ['push', 'pull', 'legs', 'push', 'pull', 'legs'] },
  arnold_6: { days: 6, rotation: ['chest_back', 'sh_arms', 'legs', 'chest_back', 'sh_arms', 'legs'] },
  abcde_fb_6: { days: 6, rotation: ['chest', 'back', 'legs', 'shoulders', 'arms', 'full_b'] }
};

// Ordem de preferência das opções (a primeira é a recomendada) por nível e dias
const CANDIDATES = {
  2: { beginner: ['full_body_2', 'upper_lower_2'], intermediate: ['full_body_2', 'upper_lower_2'], advanced: ['upper_lower_2', 'full_body_2'] },
  3: { beginner: ['full_body_3', 'abc_3', 'ppl_3'], intermediate: ['ppl_3', 'full_body_3', 'arnold_3'], advanced: ['ppl_3', 'arnold_3', 'full_body_3'] },
  4: { beginner: ['upper_lower_4', 'full_body_4', 'abcd_4'], intermediate: ['upper_lower_4', 'abcd_4', 'full_body_4'], advanced: ['upper_lower_4', 'abcd_4', 'full_body_4'] },
  5: { beginner: ['upper_lower_5', 'ppl_ul_5', 'abcde_5'], intermediate: ['ppl_ul_5', 'abcde_5', 'upper_lower_5'], advanced: ['ppl_ul_5', 'abcde_5', 'upper_lower_5'] },
  6: { beginner: ['ppl_6', 'arnold_6', 'abcde_fb_6'], intermediate: ['ppl_6', 'arnold_6', 'abcde_fb_6'], advanced: ['ppl_6', 'arnold_6', 'abcde_fb_6'] }
};

const EXERCISES_BY_DURATION = { 30: 4, 45: 5, 60: 6, 75: 7, 90: 8 };

// Mapeia o foco escolhido na triagem para slots extras
const FOCUS_SLOTS = {
  chest: ['chestUpper', 'chestFly'], back: ['backVert', 'backHoriz'], shoulders: ['shLateral', 'shRear'],
  arms: ['biLong', 'triPush'], legs: ['squat', 'quadIso'], glutes: ['hipThrust', 'abduction'], core: ['coreHold', 'coreLeg']
};
const FOCUS_MUSCLES = {
  chest: ['chest'], back: ['back'], shoulders: ['shoulders'], arms: ['biceps', 'triceps', 'forearms'],
  legs: ['quads', 'hamstrings', 'calves'], glutes: ['glutes'], core: ['core']
};

/* ---------- Prescrição (séries, reps, descanso) ---------- */
function prescription(goal, ex, isMain, level) {
  const hold = ['anti_extension', 'anti_lateral', 'anti_rotation', 'grip_hold'].includes(ex.pattern);
  const timed = ['cardio', 'conditioning'].includes(ex.pattern) || ex.pattern === 'carry';
  const compound = ex.type === 'compound';
  let sets, reps, rest;

  switch (goal) {
    case 'strength':
      if (isMain) { sets = 5; reps = '3-5'; rest = 180; }
      else if (compound) { sets = 4; reps = '5-6'; rest = 150; }
      else { sets = 3; reps = '8-10'; rest = 90; }
      break;
    case 'endurance':
      sets = 3; reps = compound ? '12-15' : '15-20'; rest = compound ? 60 : 45;
      break;
    case 'fat_loss':
      sets = 3; reps = compound ? '10-12' : '12-15'; rest = 45;
      break;
    case 'general':
      sets = 3; reps = compound ? '8-12' : '10-15'; rest = compound ? 90 : 60;
      break;
    default: // hypertrophy
      if (compound) { sets = 4; reps = '8-10'; rest = 90; }
      else { sets = 3; reps = '10-12'; rest = 60; }
  }
  if (level === 'beginner' && sets > 3) sets -= 1;
  if (hold) { reps = goal === 'endurance' ? '45-60 s' : '30-45 s'; rest = 45; }
  if (timed) { sets = ex.pattern === 'cardio' ? 1 : 3; reps = ex.pattern === 'cardio' ? '10 min' : '40 s'; rest = ex.pattern === 'cardio' ? 0 : 30; }
  return { sets, reps, restSec: rest };
}

/* ---------- Seleção de exercícios ---------- */
function matches(ex, slot) {
  return ex.muscle === slot.m &&
    (!slot.r || ex.region === slot.r) &&
    (!slot.p || ex.pattern === slot.p) &&
    (!slot.t || ex.type === (slot.t === 'c' ? 'compound' : 'isolation'));
}

function equipmentRank(ex, level, slot) {
  // Iniciante: máquinas e polias primeiro. Intermediário/avançado: pesos livres nos compostos.
  const free = { barbell: 0, dumbbell: 1, ez_bar: 1, kettlebell: 2, pullup_bar: 1, dip_bars: 2, smith: 3, cable: 3, machine: 4, bodyweight: 5, band: 6 };
  const guided = { machine: 0, cable: 1, smith: 2, dumbbell: 3, ez_bar: 3, pullup_bar: 4, barbell: 5, kettlebell: 5, dip_bars: 5, bodyweight: 6, band: 7 };
  const table = level === 'beginner' || slot.t === 'i' ? guided : free;
  return table[ex.equipment] ?? 9;
}

function pickExercise(catalog, slotKey, ctx, variant) {
  const slot = S[slotKey] || { m: ctx.anyMuscle };
  const lv = LEVEL_NUM[ctx.level] || 1;
  const ok = (ex) =>
    ctx.equipment.has(ex.equipment) &&
    ex.level <= lv &&
    !ex.contra.some((c) => ctx.limitations.has(c)) &&
    !ctx.dayUsed.has(ex.id);

  const tiers = [
    (ex) => matches(ex, slot),
    (ex) => matches(ex, { m: slot.m, p: slot.p }),
    (ex) => matches(ex, { m: slot.m, r: slot.r }),
    (ex) => ex.muscle === slot.m
  ];
  for (const tier of tiers) {
    let pool = catalog.filter((ex) => tier(ex) && ok(ex));
    if (!pool.length) continue;
    pool.sort((a, b) =>
      (ctx.planUsed.get(a.id) || 0) - (ctx.planUsed.get(b.id) || 0) ||
      equipmentRank(a, ctx.level, slot) - equipmentRank(b, ctx.level, slot) ||
      a.id.localeCompare(b.id));
    // A variante (opção de plano 2 e 3) desloca a escolha entre as melhores, para as opções não serem idênticas.
    // O exercício principal do dia é sempre o melhor da lista.
    const top = pool.slice(0, Math.min(3, pool.length));
    return ctx.isMainSlot ? top[0] : top[variant % top.length];
  }
  return null;
}

function buildDay(dayTypeKey, ctx, catalog, variant, dayIndex) {
  const type = DAY_TYPES[dayTypeKey];
  const max = ctx.maxExercises;
  let slots = [...type.slots];

  // Foco: puxa slots extras para dentro do limite nos dias que já treinam aquele grupo
  for (const f of ctx.focus) {
    const muscles = FOCUS_MUSCLES[f] || [];
    if (type.focus.some((m) => muscles.includes(m)) || dayTypeKey.startsWith('full')) {
      const extra = FOCUS_SLOTS[f][dayIndex % FOCUS_SLOTS[f].length];
      slots.splice(Math.min(2, slots.length), 0, extra);
    }
  }
  const finisher = ctx.cardio === 'finisher' && dayTypeKey !== 'conditioning';
  const limit = finisher ? max - 1 : max;

  ctx.dayUsed = new Set();
  const exercises = [];
  const add = (ex) => {
    ctx.dayUsed.add(ex.id);
    ctx.planUsed.set(ex.id, (ctx.planUsed.get(ex.id) || 0) + 1);
    const isMain = exercises.length === 0 && !['bodyweight', 'band'].includes(ex.equipment);
    exercises.push({ id: ex.id, ...prescription(ctx.goal, ex, isMain, ctx.level) });
  };
  for (const sk of slots) {
    if (exercises.length >= limit) break;
    ctx.isMainSlot = exercises.length === 0;
    const ex = pickExercise(catalog, sk, ctx, variant);
    if (ex) add(ex);
  }
  // Completa dias curtos (ex.: só peso corporal) com outros exercícios dos músculos do dia
  if (exercises.length < Math.min(limit, 4)) {
    ctx.isMainSlot = false;
    for (const m of [...type.focus, 'core']) {
      while (exercises.length < Math.min(limit, 4)) {
        const ex = pickExercise(catalog, '__any_' + m, { ...ctx, anyMuscle: m }, variant);
        if (!ex) break;
        add(ex);
      }
    }
  }
  if (finisher) {
    ctx.isMainSlot = false;
    const ex = pickExercise(catalog, 'condition', ctx, variant);
    if (ex) add(ex);
  }
  return { type: dayTypeKey, focus: type.focus, exercises };
}

/* ---------- API ---------- */
export function defaultSchedule(days) {
  // 0 = domingo ... 6 = sábado
  return { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6] }[days] || [1, 3, 5];
}

export function equipmentFor(answers) {
  const base = EQUIPMENT_PRESETS[answers.location] || EQUIPMENT_PRESETS.full_gym;
  const extras = answers.location === 'home' ? (answers.homeEquipment || []) : [];
  return new Set([...base, ...extras]);
}

/**
 * Gera 2 ou 3 planos.
 * answers: { goal, level, weekdays:[0-6], duration, location, homeEquipment:[], focus:[], limitations:[], cardio, cycleWeeks }
 */
export function generatePlans(answers, catalog) {
  const weekdays = [...(answers.weekdays || [])].sort((a, b) => a - b);
  const days = Math.min(6, Math.max(2, weekdays.length || 3));
  const level = answers.level || 'beginner';
  const list = (CANDIDATES[days] && CANDIDATES[days][level]) || CANDIDATES[3].beginner;

  const plans = list.slice(0, 3).map((splitKey, i) => {
    const split = SPLITS[splitKey];
    let rotation = [...split.rotation];
    // Híbrido: troca o último dia por condicionamento quando há 3 dias ou mais
    if (answers.cardio === 'hybrid' && days >= 3) rotation[rotation.length - 1] = 'conditioning';

    const ctx = {
      goal: answers.goal || 'hypertrophy',
      level,
      equipment: equipmentFor(answers),
      limitations: new Set((answers.limitations || []).filter((l) => l !== 'none')),
      focus: (answers.focus || []).slice(0, 2),
      cardio: answers.cardio || 'none',
      maxExercises: EXERCISES_BY_DURATION[answers.duration] || 6,
      planUsed: new Map(),
      dayUsed: new Set()
    };
    const letters = 'ABCDEF';
    const dayPlans = rotation.map((dt, idx) => ({ key: letters[idx], ...buildDay(dt, ctx, catalog, i, idx) }));

    return {
      split: splitKey,
      goal: ctx.goal,
      level,
      cycleWeeks: answers.cycleWeeks === 8 ? 8 : 12,
      daysPerWeek: days,
      schedule: weekdays.length === days ? weekdays : defaultSchedule(days),
      hybrid: answers.cardio === 'hybrid' && days >= 3,
      recommended: i === 0,
      days: dayPlans,
      createdWith: 1
    };
  });
  return plans;
}

/** Qual dia do plano cai numa data (ou null se for descanso). */
export function dayForDate(plan, date = new Date()) {
  const wd = date.getDay();
  const idx = plan.schedule.indexOf(wd);
  return idx === -1 ? null : plan.days[idx % plan.days.length];
}

/** Próximo dia de treino a partir de amanhã. */
export function nextTraining(plan, from = new Date()) {
  for (let i = 1; i <= 7; i++) {
    const d = new Date(from); d.setDate(d.getDate() + i);
    const day = dayForDate(plan, d);
    if (day) return { date: d, day };
  }
  return null;
}

export const SPLIT_KEYS = Object.keys(SPLITS);
export const DAY_TYPE_KEYS = Object.keys(DAY_TYPES);
