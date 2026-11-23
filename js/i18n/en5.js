// Stage 5 strings (progress, body, report) — English
export default {
  dash: {
    title: 'Your progress', cycle: 'Current cycle', daysLeft: '{n} days left', ended: 'cycle complete',
    nearText: 'Your cycle is ending. Check the report and get ready for the next assessment.',
    endedText: 'Cycle complete! See your report and take the new assessment.',
    seeReport: 'See cycle report', partialReport: 'Partial report',
    noPlanText: 'Take the assessment and start training to see your progress here.',
    workouts: 'Workouts', inCycle: 'this cycle', adherence: 'Adherence', ofPlanned: 'of {n} planned',
    volume: 'Volume', improved: 'Gains', exercises: 'exercises with more load',
    consistency: 'Consistency', weeks16: 'last 16 weeks', less: 'less', more: 'more',
    weeklyGoal: 'Weekly goal', goalHits: '{n}/{t} weeks on target', goalLine: 'Dashed line: goal of {n} workouts per week.',
    byMuscle: 'Sets by muscle group', last28: 'last 28 days', setsN: '{n} sets',
    exerciseProgress: 'Progress by exercise', details: 'Details', needTwo: 'Log at least two sessions to see the chart.',
    topGains: 'Biggest gains this cycle', noGains: 'Gains show up from the second session of each exercise.',
    update: 'Update', noBody: 'Log your weight and measurements to track body changes.',
    noData: 'No data yet. Log your workouts.'
  },
  body: {
    title: 'Body', subtitle: 'Weight and measurements over time. Measure at the same time of day, ideally in the morning.',
    weight_kg: 'Weight', body_fat_pct: 'Body fat %', waist_cm: 'Waist', chest_cm: 'Chest', arm_cm: 'Arm', thigh_cm: 'Thigh', hip_cm: 'Hips',
    add: 'Log measurements', date: 'Date', save: 'Save measurements', saved: 'Measurements saved',
    hint: 'Fill in only what you want. One entry per day: saving again on the same day updates it.',
    history: 'History', delete: 'Delete', deleteTitle: 'Delete this entry?', deleteText: "This day's measurements will be removed.",
    errEmpty: 'Fill in at least one measurement.', errRange: 'A value is outside the expected range. Check and try again.',
    sinceStart: 'since the start', noData: 'no entries', noChange: 'no change', since: 'before:', firstEntry: 'first entry'
  },
  demo: {
    explore: 'Explore with demo data', title: 'Demo mode',
    text: "See the app in action with 2 simulated training cycles. Nothing is saved to your account: the data stays on this device only.",
    sample: 'Use built-in sample', import: 'Import JSON file', importHint: 'Apex demo file (demo-apex.json)',
    invalid: 'Invalid file. Use the Apex demo file.', bar: 'Demo mode: simulated data, nothing is saved to your account.',
    exit: 'Exit demo', settingsLabel: 'Demo data', settingsHint: 'Explore the app with simulated workouts, without touching your account',
    loadFail: "Couldn't load the sample. Try importing the file."
  },
  report: {
    eyebrow: 'Cycle report', title: 'Cycle report', partial: 'partial',
    highlights: 'Highlights', hlTitleName: 'Highlights, {name}',
    hlConsistency: '{p}% consistency: you trained {d} of {s} planned days.',
    hlConsistencyMid: '{p}% adherence. Good pace, with room to grow next cycle.',
    hlConsistencyLow: '{p}% adherence. Next cycle, pick fewer days and hit all of them.',
    hlStrength: 'Biggest gain: {ex}, from {a} to {b} (+{p}%).',
    hlReps: 'Biggest gain: {ex}, from {a} to {b} reps.',
    hlImproved: 'You increased the load on {n} exercises.',
    hlVolume: 'Your volume rose {p}% from the start to the end of the cycle.',
    hlStreak: 'Longest streak: {n} workouts in a row without missing.',
    hlWeightDown: 'Weight: −{v} this cycle.', hlWeightUp: 'Weight: +{v} this cycle.',
    hlWaist: 'Waist: −{v}.',
    hlEmpty: 'Log your workouts so highlights show up here.',
    ofScheduled: 'of {n} planned', bestStreak: 'longest streak: {n}', sets: '{n} sets',
    strength: 'Strength: start vs end', exercise: 'Exercise', start: 'Start', end: 'End', change: 'Change',
    noStrength: 'Do at least two sessions of an exercise to compare.',
    body: 'Body this cycle', noBody: 'Log measurements at the start and end of the cycle to compare.',
    weekly: 'Workouts per week',
    shareImage: 'Share image', pdf: 'Save as PDF', imageSaved: 'Image saved',
    nextTitle: 'Next cycle',
    nextEnded: "Your cycle is over. Take the new assessment: it's pre-filled and takes your performance into account.",
    nextEarly: 'Want to switch before the end? The new assessment archives the current plan and keeps this report.',
    levelHint: 'Based on your performance, we suggest the {level} level for your next plan.',
    newTriage: 'Take new assessment', endEarly: 'End cycle and take new assessment',
    endEarlyTitle: 'End the cycle now?', endEarlyText: 'The current plan is archived when you pick a new one. This cycle report stays available.',
    pastCycles: 'Previous cycles'
  }
};
