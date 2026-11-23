export default {
  app: { name: 'Apex', version: 'v0.8' },
  nav: {
    today: 'Today', plan: 'Plan', calendar: 'Calendar', dashboard: 'Progress',
    profile: 'Profile', triage: 'Assessment', session: 'Workout', exercise: 'Exercise', body: 'Body', report: 'Report', hall: 'Hall of Fame', party: 'Party', settings: 'Settings', more: 'More',
    collapse: 'Collapse menu', expand: 'Expand menu'
  },
  top: {
    log: 'Log workout', themeToLight: 'Switch to light theme', themeToDark: 'Switch to dark theme',
    settings: 'Settings', menu: 'More options'
  },
  greeting: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
  today: {
    eyebrow: 'Today',
    subtitle: 'Your workout of the day shows up here after the assessment.',
    workoutTitle: "Today's workout",
    noPlan: "You don't have a plan yet",
    noPlanText: 'In a few minutes the assessment learns your goal, level and availability, then suggests 2 to 3 plans for you to choose from.',
    startTriage: 'Start assessment',
    howItWorks: 'How it will work',
    step1: 'Create your account and take the assessment',
    step2: 'Pick one of the suggested plans',
    step3: 'Log every set in a few taps',
    step4: 'Track your progress and take on the Hall of Fame',
    quoteTitle: 'Quote of the day',
    quote: "The hardest workout is the one you haven't started yet.",
    quoteAuthor: 'Apex',
    kpiStreak: 'Streak', kpiStreakSub: 'days in a row',
    kpiWeek: 'Week', kpiWeekSub: 'workouts done',
    kpiCycle: 'Cycle', kpiCycleSub: 'no active plan'
  },
  soon: {
    badge: 'Coming soon',
    stage: 'Build stage {n}',
    plan: {
      title: 'Plan',
      text: 'Your training plan, day by day, built from the assessment.',
      f1: 'Splits: full body, upper/lower, ABC to ABCDE, PPL, Arnold split and more',
      f2: 'Swap any exercise for an equivalent one for the same muscle',
      f3: 'Sets, reps and rest matched to your goal'
    },
    calendar: {
      title: 'Calendar',
      text: 'Your training days, rest and challenges in a single view.',
      f1: 'Training days in the color of each split day',
      f2: 'Rest days and Hall of Fame challenges fitted in',
      f3: 'Missed and make-up sessions at a glance'
    },
    dashboard: {
      title: 'Progress',
      text: 'All your progress, from the first workout to the end of the cycle.',
      f1: 'Load progression and personal records per exercise',
      f2: 'Consistency heatmap and weekly goal',
      f3: 'Body measurements and an exportable cycle report'
    },
    hall: {
      title: 'Hall of Fame',
      text: 'Workouts inspired by legends of film, combat sports, athletics and bodybuilding.',
      f1: 'Weekly or monthly challenges that fit your plan',
      f2: 'Pick categories: film, combat, athletes, bodybuilding, historic legends',
      f3: 'Learn who each legend is and why they matter'
    },
    party: {
      title: 'Party',
      text: 'Invite friends and turn consistency into competition.',
      f1: 'Three formats: Hall of Fame, Consistency battle and 1v1 Duel',
      f2: 'Points for effort and progress, with a daily cap',
      f3: 'Victory card to share on your story'
    }
  },
  settings: {
    eyebrow: 'Settings',
    title: 'Settings',
    subtitle: 'Language, units, appearance and your data.',
    general: 'General',
    language: 'Language', languageHint: 'Language for the whole interface',
    units: 'Units',
    weight: 'Weight', weightHint: 'Loads and body weight',
    length: 'Measurements', lengthHint: 'Height and body measurements',
    appearance: 'Appearance',
    palette: 'Palette', paletteHint: 'Main app color',
    emerald: 'Emerald', sunset: 'Sunset',
    mode: 'Mode', dark: 'Dark', light: 'Light',
    training: 'Training',
    rest: 'Default rest', restHint: "Time between sets when the plan doesn't set one",
    data: 'Your data',
    storageLocal: 'Profile, assessments and plans live in your account. These settings are saved on this device.',
    storageMemory: "This browser doesn't allow saving data. Everything is lost when the page closes.",
    export: 'Export data', exportHint: 'Creates a JSON file with everything saved',
    import: 'Import data', importHint: 'Restores a previously exported file',
    reset: 'Delete all data', resetHint: 'Removes everything from this device',
    about: 'About', version: 'Version'
  },
  sheet: {
    close: 'Close', cancel: 'Cancel',
    exportTitle: 'Export data',
    exportText: "If the download doesn't start, copy the content below and save it as a .json file.",
    download: 'Download file', copy: 'Copy',
    resetTitle: 'Delete all data?',
    resetText: "This removes settings, workouts and history from this device. It can't be undone. Export first if you want a copy.",
    resetConfirm: 'Delete everything'
  },
  toast: {
    saved: 'Setting saved',
    soon: 'Coming soon',
    copied: 'Copied',
    copyFail: "Couldn't copy. Select the text and copy it manually.",
    imported: 'Data imported',
    importFail: 'Invalid file. Use a file exported by Apex.',
    reset: 'Data deleted'
  },
  units: { seconds: 's', minutes: 'min' }
};
