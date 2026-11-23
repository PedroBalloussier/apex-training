// Stage 3 strings (session, swap, progression) — English
export default {
  plan: {
    actions: 'Options', swap: 'Swap exercise', link: 'Pair with next (superset)', unlink: 'Remove from superset',
    moveUp: 'Move up', moveDown: 'Move down', updated: 'Plan updated', startDay: 'Start workout {k}'
  },
  swap: {
    title: 'Swap exercise', current: 'Current', same: 'Same muscle and movement', similar: 'Same muscle, different variation',
    none: 'No alternatives for this exercise yet.',
    planNote: 'The swap applies to every future session of this workout.',
    sessionNote: "The swap applies to today's workout only."
  },
  session: {
    eyebrow: 'Training', weight: 'Load', reps: 'Reps', time: 'Time', perSide: 'each side',
    biset: 'Superset', bisetHint: 'Superset: do both back to back, then rest',
    markDone: 'Mark set', failureHint: 'To failure', addSet: 'Set', repeatLast: 'Repeat last load',
    rest: 'Rest', skip: 'Skip', restDone: 'Rest over. Next set!',
    needReps: 'Enter the reps.', saveFail: "Couldn't save. Check your connection.",
    sugFirst: 'First time: pick a load where the last reps feel hard.',
    sugUp: 'Suggestion: {w}. You hit the top of the range ({last}).',
    sugHold: 'Stay at {w} until you complete the range (last: {last}).',
    sugReps: 'Stay at {w} and go for more reps (last: {last}).',
    finish: 'Finish workout', menuTitle: 'Workout', discard: 'Discard workout',
    discardTitle: 'Discard this workout?', discardText: "Today's logged sets will be deleted.",
    summaryTitle: 'Workout summary', duration: 'Duration', setsDone: 'Sets', volume: 'Volume',
    prs: '{n} record(s)', incomplete: "Some sets weren't logged. That's fine: what you did is saved.",
    keepGoing: 'Keep training', finishConfirm: 'Finish', finished: 'Workout done. Great job!',
    openTitle: 'You have a workout in progress', openText: 'Workout {k} is still open. Continue it, or discard and start another?',
    continue: 'Continue workout', discardAndStart: 'Discard and start',
    whichDay: 'Which workout are you doing?',
    inProgress: 'Workout in progress', inProgressText: '{n} set(s) logged so far.',
    doneToday: 'Workout {k} done today', doneTodayText: 'Duration: {d}. Time to recover.'
  }
};
