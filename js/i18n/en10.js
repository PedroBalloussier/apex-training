// Muscles worked, set techniques and plan editing — English
export default {
  areas: {
    pec_upper: 'Upper chest', pec_mid: 'Mid chest', pec_lower: 'Lower chest', serratus: 'Serratus anterior',
    lats: 'Latissimus dorsi', teres: 'Teres major', traps_upper: 'Upper traps', traps_mid: 'Mid and lower traps',
    rhomboids: 'Rhomboids', erectors: 'Spinal erectors (lower back)', delt_front: 'Front delts', delt_side: 'Side delts',
    delt_rear: 'Rear delts', rotator_cuff: 'Rotator cuff', biceps_long: 'Biceps, long head', biceps_short: 'Biceps, short head',
    brachialis: 'Brachialis', brachioradialis: 'Brachioradialis', triceps_long: 'Triceps, long head', triceps_lateral: 'Triceps, lateral head',
    triceps_medial: 'Triceps, medial head', forearm_flexors: 'Forearm flexors', forearm_extensors: 'Forearm extensors', grip: 'Grip',
    quads: 'Quadriceps', adductors: 'Adductors', hamstrings: 'Hamstrings', glutes_max: 'Gluteus maximus', glutes_med: 'Gluteus medius',
    hip_flexors: 'Hip flexors', gastrocnemius: 'Calves (gastrocnemius)', soleus: 'Soleus', abs: 'Rectus abdominis',
    lower_abs: 'Lower abs', obliques: 'Obliques', transverse: 'Transverse abdominis', cardio: 'Cardiovascular system'
  },
  areasShort: {
    pec_upper: 'upper chest', pec_mid: 'chest', pec_lower: 'lower chest', serratus: 'serratus', lats: 'lats', teres: 'teres major',
    traps_upper: 'upper traps', traps_mid: 'mid traps', rhomboids: 'rhomboids', erectors: 'lower back', delt_front: 'front delts',
    delt_side: 'side delts', delt_rear: 'rear delts', rotator_cuff: 'rotator cuff', biceps_long: 'biceps', biceps_short: 'biceps',
    brachialis: 'brachialis', brachioradialis: 'brachioradialis', triceps_long: 'triceps', triceps_lateral: 'triceps', triceps_medial: 'triceps',
    forearm_flexors: 'forearms', forearm_extensors: 'forearms', grip: 'grip', quads: 'quads', adductors: 'adductors',
    hamstrings: 'hamstrings', glutes_max: 'glutes', glutes_med: 'glute medius', hip_flexors: 'hip flexors', gastrocnemius: 'calves',
    soleus: 'soleus', abs: 'abs', lower_abs: 'lower abs', obliques: 'obliques', transverse: 'transverse', cardio: 'cardio'
  },
  exercise: {
    musclesWorked: 'Muscles worked', primary: 'Main', secondary: 'Assisting',
    musclesHint: 'Main muscles do most of the work; assisting muscles stabilize and help complete the movement.'
  },
  tech: {
    label: 'Technique', choose: 'Set technique',
    names: { normal: 'Normal', warmup: 'Warm-up', failure: 'To failure', drop: 'Drop set', rest_pause: 'Rest-pause', myo: 'Myo-reps', partials: 'Partials', amrap: 'AMRAP', tempo: 'Tempo' },
    hints: {
      normal: 'A regular set.',
      warmup: "A light set to get ready. It doesn't count for volume, records or load suggestions.",
      failure: 'Go until no more clean reps come out. Log how many you got.',
      drop: 'At failure, drop the load (about 20-30%) and keep going with no rest. Log each drop as a block.',
      rest_pause: 'Near failure, rest 10-20 seconds and continue with the same load. Log each restart as a block.',
      myo: 'One activation set near failure, then mini-sets of 3-5 reps with 5 breaths of rest. Each mini-set is a block.',
      partials: 'At the end of the set, when full reps stop coming, do partial-range reps.',
      amrap: 'As many reps as possible with the load, keeping good form.',
      tempo: 'Control the time of each phase. E.g. 3-1-1 = 3 s down, 1 s pause, 1 s up.'
    },
    addBlock: { drop: 'Drop', rest_pause: 'Pause', myo: 'Mini-set' },
    removeBlock: 'Remove block', tempoLabel: 'Tempo', tempoPh: 'e.g. 3-1-1',
    plannedLast: 'last set: {t}', plannedAll: 'every set: {t}',
    group: { 2: 'Superset', 3: 'Tri-set', many: 'Giant set' },
    groupHint: { 2: 'Superset: do both exercises back to back, then rest.', 3: 'Tri-set: do all three back to back, then rest.', many: 'Giant set: do them all back to back, then rest.' }
  },
  csv: { blocks: 'Blocks (load x reps)' },
  edit: {
    button: 'Edit day', title: 'Edit workout {k}', focus: 'Muscle groups of the day',
    focusHint: 'Pick 1 to 3. The app keeps the exercises that still fit and fills the rest.',
    apply: 'Apply focus', preview: 'Preview', kept: 'Kept', added: 'New', removed: 'Out', usePreview: 'Use this version',
    exercises: 'Exercises', add: 'Add exercise', search: 'Search exercise', allMuscles: 'All', onlyMine: 'Only my equipment',
    sets: 'Sets', reps: 'Reps', rest: 'Rest (s)', technique: 'Planned technique', techOn: { last: 'Last set', all: 'All sets' },
    remove: 'Remove', save: 'Save day', saved: 'Day updated', restore: 'Restore original',
    restoreTitle: 'Restore the original day?', restoreText: "Goes back to the workout from your screening. Your history doesn't change.", restored: 'Day restored',
    edited: 'Edited', trains: 'Trains: {m}', empty: 'Add at least one exercise.', pickOne: 'Pick at least one group.',
    max3: 'Up to 3 groups.', discardTitle: 'Leave without saving?', discardText: "This day's changes will be lost.", discard: 'Leave without saving',
    noResults: 'No exercise found.', inDay: 'already in the day', nothingChanged: 'Nothing changes with this focus.',
    warnings: 'Week warnings',
    warn: {
      tooMany: 'Workout {k} has {n} sets. Above about 30, quality tends to drop.',
      backToBack: '{m} trained on back-to-back days ({a} and {b}). Aim for 48 h of rest for the same muscle.',
      missing: 'No work this week for: {m}.'
    },
    and: ' & '
  }
};
