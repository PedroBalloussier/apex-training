// Stage 6.5 texts (body, difficulty, heatmap, coach) — English
export default {
  body: {
    neck_cm: 'Neck',
    bmi: 'BMI', whtr: 'Waist / height', fat: 'Body fat', lean: 'Lean mass', fatMass: 'Fat mass', comp: 'Composition',
    bmiBand: { under: 'below normal', normal: 'normal range', over: 'above normal', obese: 'well above normal' },
    whtrBand: { good: 'healthy (under 0.5)', watch: 'watch (0.5 to 0.6)', high: 'high (over 0.6)' },
    fatEstimated: 'estimated from measurements', fatLogged: 'logged', fatNeed: 'log neck and waist',
    needHeight: 'add your height in the profile', needWaist: 'log your waist',
    bmiNote: 'BMI does not tell muscle from fat: for people who lift it tends to overstate. Waist-to-height and body fat say more.',
    fatNote: 'Estimated with the US Navy method (neck, waist{hip} and height). It can be off by a few points: use it for the trend.',
    fatNoteHip: ', hip',
    evolution: 'Progress', period: { w4: '4 weeks', cycle: 'Cycle', all: 'All' },
    avg: 'moving average', healthy: 'healthy range',
    needTwo: 'Log at least two measurements in this period to see the chart.',
    changes: 'Change in period', start: 'start', now: 'now'
  },
  diff: { label: 'Difficulty', levels: ['', 'Light', 'Moderate', 'Tough', 'Heavy', 'Legendary'] },
  heat: {
    less: 'less', more: 'more', missed: 'missed', hall: 'Hall of Fame',
    hint: 'Color = how much of the planned session you completed. Outline = a training day you missed.'
  },
  today: { quoteLegend: 'Quote of the challenge week' },
  todayPlan: { go: 'Start' },
  report: {
    charts: 'Cycle charts', topLifts: 'Main lifts', topLiftsHint: 'Best load per session on the exercises you did most.',
    weekShort: 'W{n}', bodyCycle: 'Body over the cycle', bodyStart: 'Start', bodyEnd: 'End', bodyChange: 'Change',
    weightComp: 'Weight over the cycle'
  },
  hall: {
    documented: 'Documented', inspired: 'Inspired by',
    documentedHint: 'Workout published by the person, their trainer or an original source (training card, book, interview).',
    inspiredHint: 'Inspired by what is known of their prep. The exact workout was not fully published, or the original volume was scaled.'
  },
  coach: { name: 'Apex Coach', says: 'Apex Coach says' }
};
