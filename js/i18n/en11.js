// Custom plan builder and plan organization texts — English
export default {
  nav: { builder: 'Build plan' },
  splits: { custom: 'Custom plan' },
  splitDesc: { custom: 'You choose the days, the muscle groups for each day and the exercises.' },
  results: {
    customTitle: 'Build my own', customText: 'Prefer your own structure? Choose the days, the muscle groups for each day and the exercises.',
    customBtn: 'Build a custom plan'
  },
  builder: {
    eyebrow: 'Custom plan', title: 'Build your plan', stepOf: 'Step {n} of 3',
    stepNames: ['Structure', 'Exercises', 'Review'],
    basics: 'Plan basics', name: 'Plan name', namePh: 'E.g. My PPL',
    goal: 'Goal', level: 'Level', cycle: 'Cycle', duration: 'Time per workout',
    basicsHint: 'Goal and level set the suggested sets, reps and rest.',
    weekdays: 'Training days', weekdaysHint: 'Pick 1 to 7 days.',
    presets: 'Quick templates', presetsHint: 'They fill in the days. You can change everything after.',
    preset: { ppl: 'Push, Pull, Legs', upper_lower: 'Upper / Lower', bro: 'One group per day', full: 'Full body', pairs: 'Classic ABC' },
    days: 'Plan days', daysHint: 'Each different workout in the plan. Pick up to 3 groups per day.',
    dayName: 'Day name (optional)', addDay: 'Add day', removeDay: 'Remove day', maxDays: 'Up to 6 different days.',
    week: 'Week', weekHint: 'Choose which workout falls on each weekday. You can repeat a workout.',
    rest: 'Rest',
    unused: 'Day {k} is not on any weekday.', needMuscles: 'Pick at least one group for day {k}.',
    needWeekday: 'Pick at least one training day.',
    next: 'Continue', back: 'Back',
    exHint: 'I suggested exercises for each day\'s groups, based on your goal, level and equipment. Edit as you like.',
    regen: 'Suggest again', empty: 'Clear', editDay: 'Edit day', noEx: 'No exercises yet. Tap Edit day to add some.',
    emptyErr: 'Day {k} has no exercises.',
    weekly: 'Sets per week', weeklyHint: 'Total across every time each group shows up in the week.',
    noWarnings: 'No warnings. Balanced plan.',
    activate: 'Activate plan', activating: 'Activating…', replaceTitle: 'Replace your current plan?',
    replaceText: 'Your history stays saved. The cycle starts again at week 1.', replace: 'Replace plan',
    done: 'Plan activated.', discardTitle: 'Leave the builder?', discardText: 'The plan you built will not be saved.', discard: 'Leave without saving',
    newPlan: 'New custom plan'
  },
  manage: {
    title: 'Organize plan', dup: 'Duplicate day {k}', add: 'Add day', remove: 'Remove day {k}', week: 'Change weekdays',
    removeTitle: 'Remove day {k}?', removeText: 'The weekdays it was on move to another workout.',
    lastDay: 'The plan needs at least one day.', maxDays: 'The plan already has 6 different days.',
    weekSaved: 'Week updated.', added: 'Day {k} added.', removed: 'Day removed.', duplicated: 'Day duplicated as {k}.',
    newDayTitle: 'New day', newDayHint: 'Pick up to 3 groups. I suggest the exercises and you edit them after.', create: 'Create day',
    weekTitle: 'Weekdays', copy: 'copy'
  },
  edit: { warn: { unused: 'Day {k} is not on any weekday. Use "Change weekdays".', lowVolume: 'Fewer than 10 sets per week for {m}. For hypertrophy, the 2026 ACSM review found more gains from 10 sets up.' } },
  coach: { tips: { builder: 'Start from a quick template or from scratch. Each day can have up to 3 groups, and you can repeat a workout in the week.' } }
};
