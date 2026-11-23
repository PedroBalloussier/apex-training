// Stage 7 texts (Party) — English
export default {
  nav: { invite: 'Invite' },
  csv: {
    label: 'Export as CSV', hint: 'Spreadsheet for Excel, Numbers or Google Sheets', workouts: 'Workouts', body: 'Measurements',
    done: '{n} rows exported', empty: 'No data to export yet.',
    date: 'Date', time: 'Time', workout: 'Workout', exercise: 'Exercise', set: 'Set', reps: 'Reps', load: 'Load', failure: 'To failure', duration: 'Workout duration (min)', yes: 'yes'
  },
  auth: { showPass: 'Show password', hidePass: 'Hide password' },
  party: {
    title: 'Party', subtitle: 'Invite friends and turn consistency into competition.',
    create: 'Create party', join: 'Join with code', mine: 'Your parties',
    emptyTitle: 'No parties yet', emptyText: 'Create one and send the link to your friends, or join with a code you received.',
    formats: { hall: 'Hall of Fame', consistency: 'Consistency battle', duel: '1v1 Duel' },
    formatHints: {
      hall: 'Everyone does the same challenge of the week or month. Finishing it is worth 25 points.',
      consistency: 'Whoever completes the biggest share of their own plan wins. Fair across levels.',
      duel: 'Just two people, points for effort. Whoever does more wins.'
    },
    periods: { weekly: 'Weekly', monthly: 'Monthly' },
    name: 'Party name', namePh: 'E.g. Ericeira Beasts', format: 'Format', period: 'Season length',
    categories: 'Legend categories', challenge: 'Season challenge', random: 'Random',
    bonus: 'Hall of Fame bonus', bonusHint: 'Completed Hall of Fame challenges are worth 25 points in this party.',
    createBtn: 'Create and invite', errName: 'Use a name with at least 2 letters.', errCats: 'Pick at least one category.',
    invite: 'Invite your friends', inviteHint: 'Send the link or the code. Up to {n} people.', code: 'Code',
    copyLink: 'Copy link', share: 'Share', copied: 'Link copied', shareText: 'Join my party "{name}" on Apex: {url}',
    joinTitle: 'Join a party', joinPh: '6-letter code', joinBtn: 'Join',
    invitedTitle: "You're invited", invitedText: 'Join with the code below to compete with your friends.',
    errNotFound: "We couldn't find a party with that code. Check it and try again.", errFull: 'That party is full.', errJoin: "Couldn't join right now. Try again.",
    season: 'Season {n}', daysLeft: '{n} days left', lastDay: 'last day', ended: 'season ended',
    ranking: 'Ranking', you: 'you', pts: 'pts', workouts: '{n} workouts', records: '{n} records', ofPlan: 'of plan',
    todayCap: 'Today: {n} of {cap} points', feed: 'Activity', noFeed: 'No activity yet. The first workout opens the scoreboard.',
    rules: 'How to score', rulesWorkout: 'Workout completed', rulesChallenge: 'Hall of Fame challenge', rulesRecord: 'Personal record (up to 3 per workout)',
    rulesStreak: '7-day streak', rulesCap: 'Cap of {cap} points per day: steady training beats overdoing a single day.',
    rulesConsistency: 'In this party the ranking is by share of your own plan completed. Points break ties.',
    rulesBonusOff: 'Hall of Fame bonus is off in this party.',
    challengeCard: 'Season challenge', seeChallenge: 'See challenge',
    champion: 'Season champion', championYou: 'You won the season!', victoryCard: 'Share victory card',
    newSeason: 'New season', newSeasonTitle: 'Start a new season?', newSeasonText: 'The scoreboard resets for everyone. History stays saved.',
    leave: 'Leave party', leaveTitle: 'Leave this party?', leaveText: 'Your points will no longer show in the ranking.',
    remove: 'Delete party', removeTitle: 'Delete this party?', removeText: "The party disappears for every member. This can't be undone.",
    members: '{n} members', ownerTag: 'creator', pointsToast: '+{n} points across your parties', youName: 'You', moreFeed: 'See all activity ({n})',
    feedWorkout: '{name} completed a workout', feedChallenge: "{name} completed {who}'s challenge", feedRecord: '{name} set a record: {ex}',
    feedStreak: '{name} hit {n} days in a row', feedJoin: '{name} joined the party',
    tLeader: '{name} leads with {v}.', tGapSmall: "You're {n} points behind {name}. One workout fixes that.", tGap: '{n} points to catch {name}.',
    tAhead: "You're ahead, but {name} is {n} points behind. No slacking.", tIdle: "{name} hasn't trained in {n} days. Someone call them?",
    tTie: '{a} and {b} are tied. The next set decides.', tAlone: "It's just you here. Send the invite: competing alone is too easy.",
    victory: ['Legend of the season. Good luck to the rest.', 'Trained, scored, won. Simple as that.', 'The Hall of Fame is saving you a spot.', 'Champion. Now defend the title.'],
    stand: 'Your position: #{r} of {n}'
  }
};
