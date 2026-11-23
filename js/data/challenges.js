// Hall da Fama: desafios inspirados em treinos documentados de lendas.
// kind: 'replace' substitui um dia com os mesmos músculos; 'extra' entra num dia livre.
// refKg: carga de referência da lenda (quando a fonte informa). Treinos com volumes extremos vêm escalonados.

export const CATEGORIES = ['film', 'fight', 'athletes', 'bodybuilding', 'legends'];

const ex = (id, sets, reps, restSec, more = {}) => ({ id, sets, reps, restSec, ...more });

export const CHALLENGES = [
  {
    id: 'bruce-lee-1965', person: 'Bruce Lee', category: 'fight', kind: 'replace', level: 2,
    focus: ['biceps', 'triceps', 'forearms'],
    title: { pt: 'A ficha de 1965', en: 'The 1965 card' },
    who: {
      pt: 'Lutador, ator e criador do Jeet Kune Do. Levou as artes marciais para o cinema mundial nos anos 1970.',
      en: 'Martial artist, actor and creator of Jeet Kune Do. He brought martial arts to world cinema in the 1970s.'
    },
    why: {
      pt: 'É referência de físico funcional: força, velocidade e definição, com foco obsessivo em antebraços e abdômen.',
      en: 'A benchmark for a functional physique: strength, speed and definition, with an obsessive focus on forearms and abs.'
    },
    fact: {
      pt: 'Esta ficha, de 27 de maio de 1965, é da Hak Keung Gymnasium. Os exercícios vêm em pares, alternando tríceps e bíceps.',
      en: 'This card, dated 27 May 1965, comes from the Hak Keung Gymnasium. The exercises are paired, alternating triceps and biceps.'
    },
    note: { pt: 'Cargas originais em libras, convertidas. "INF." na ficha virou "até a falha".', en: 'Original loads in pounds, converted. "INF." on the card became "to failure".' },
    exercises: [
      ex('bb_back_squat', 3, '10', 90, { refKg: 43 }),
      ex('french_press_bb', 4, '6', 0, { group: 'b1', refKg: 29 }),
      ex('incline_db_curl', 4, '6', 90, { group: 'b1', refKg: 16 }),
      ex('french_press_bb', 4, '6', 0, { group: 'b2', refKg: 29 }),
      ex('concentration_curl', 4, '6', 90, { group: 'b2', refKg: 16 }),
      ex('close_grip_bench', 3, '10', 0, { group: 'b3', refKg: 34 }),
      ex('bb_curl', 3, '8', 90, { group: 'b3', refKg: 34 }),
      ex('db_overhead_ext', 3, '8', 60),
      ex('reverse_wrist_curl', 4, 'falha', 0, { group: 'b4', refKg: 7 }),
      ex('reverse_curl', 4, '6', 60, { group: 'b4', refKg: 29 }),
      ex('wrist_curl', 4, 'falha', 0, { group: 'b5', refKg: 29 }),
      ex('db_wrist_curl', 4, 'falha', 60, { group: 'b5', refKg: 4.5 }),
      ex('sit_up', 5, '12', 45),
      ex('bw_calf_raise', 5, '20', 45)
    ],
    source: null
  },
  {
    id: 'arnold-golden-six', person: 'Arnold Schwarzenegger', category: 'bodybuilding', kind: 'extra', level: 1,
    focus: ['quads', 'chest', 'back', 'shoulders', 'biceps', 'core'],
    title: { pt: 'Golden Six', en: 'Golden Six' },
    who: {
      pt: 'Sete vezes Mr. Olympia, ator de "O Exterminador do Futuro" e ex-governador da Califórnia.',
      en: 'Seven-time Mr. Olympia, star of "The Terminator" and former Governor of California.'
    },
    why: {
      pt: 'O Golden Six foi o full body de seis exercícios com que Arnold começou. Simples, pesado e ainda muito usado por iniciantes.',
      en: 'The Golden Six was the six-exercise full-body routine Arnold started with. Simple, heavy and still widely used by beginners.'
    },
    fact: {
      pt: 'A rotina original pedia 3 treinos por semana em dias alternados. O desenvolvimento era feito atrás da nuca; aqui usamos a versão pela frente, mais segura para o ombro.',
      en: 'The original routine called for 3 sessions a week on alternate days. The press was done behind the neck; here we use the front version, which is safer for the shoulder.'
    },
    exercises: [
      ex('bb_back_squat', 4, '10', 120),
      ex('bb_bench_press', 3, '10', 90),
      ex('chin_up', 3, 'falha', 90),
      ex('bb_ohp', 4, '10', 90),
      ex('bb_curl', 3, '10', 90),
      ex('sit_up', 3, 'falha', 60)
    ],
    source: 'https://liftvault.com/programs/bodybuilding/arnold-schwarzenegger-workout-routine-golden-six/'
  },
  {
    id: 'arnold-chest-back', person: 'Arnold Schwarzenegger', category: 'bodybuilding', kind: 'replace', level: 3,
    focus: ['chest', 'back'],
    title: { pt: 'Peito e costas da Era de Ouro', en: 'Golden Era chest and back' },
    who: {
      pt: 'Sete vezes Mr. Olympia, ator de "O Exterminador do Futuro" e ex-governador da Califórnia.',
      en: 'Seven-time Mr. Olympia, star of "The Terminator" and former Governor of California.'
    },
    why: {
      pt: 'Arnold treinava peito e costas no mesmo dia, em supersets de músculos opostos. O volume é altíssimo.',
      en: 'Arnold trained chest and back on the same day, supersetting opposing muscles. The volume is huge.'
    },
    fact: {
      pt: 'As pirâmides de 15, 12, 8 e 6 repetições eram marca registrada desse treino.',
      en: 'Pyramids of 15, 12, 8 and 6 reps were a trademark of this workout.'
    },
    exercises: [
      ex('pull_up', 4, '10', 0, { group: 's1' }),
      ex('bb_incline_press', 4, '6-15', 90, { group: 's1' }),
      ex('bb_bench_press', 4, '6-15', 0, { group: 's2' }),
      ex('chin_up', 4, '10-15', 90, { group: 's2' }),
      ex('db_fly', 4, '10', 0, { group: 's3' }),
      ex('bb_row', 4, '12', 90, { group: 's3' }),
      ex('pullover_db', 4, '15', 0, { group: 's4' }),
      ex('chest_dip', 4, 'falha', 90, { group: 's4' })
    ],
    source: 'https://www.t3.com/news/arnold-schwarzenegger-shares-his-golden-era-chest-and-back-workout-and-its-insane'
  },
  {
    id: 'steve-reeves-full', person: 'Steve Reeves', category: 'legends', kind: 'extra', level: 2,
    focus: ['shoulders', 'chest', 'back', 'biceps', 'triceps', 'quads', 'hamstrings', 'calves'],
    title: { pt: 'Full body clássico', en: 'Classic full body' },
    who: {
      pt: 'Fisiculturista da "Era de Prata" e ator que viveu Hércules no cinema. Morreu em 2000, aos 74 anos.',
      en: '"Silver Era" bodybuilder and the actor who played Hercules on screen. He died in 2000, aged 74.'
    },
    why: {
      pt: 'Símbolo de físico simétrico e natural. Treinava o corpo inteiro 3 vezes por semana, antes de os treinos divididos virarem moda.',
      en: 'A symbol of a symmetrical, natural physique. He trained his whole body 3 times a week, before split routines became popular.'
    },
    fact: {
      pt: 'Reeves deixava as pernas para o fim do treino, para não cansar antes dos exercícios de tronco.',
      en: 'Reeves left legs for the end of the workout so he would not be tired for the upper-body work.'
    },
    exercises: [
      ex('upright_row', 3, '8-12', 60),
      ex('bb_incline_press', 3, '8-12', 60),
      ex('chin_up', 3, '8-12', 60),
      ex('bb_row', 3, '8-12', 60),
      ex('db_shoulder_press', 3, '8-12', 60),
      ex('bb_curl', 3, '8-12', 60),
      ex('skull_crusher', 3, '8-12', 60),
      ex('bb_back_squat', 3, '8-12', 90),
      ex('lying_leg_curl', 3, '8-12', 60),
      ex('standing_calf_raise', 3, '12-15', 45)
    ],
    source: 'https://fitnessvolt.com/steve-reeves-workout/'
  },
  {
    id: 'tyson-calisthenics', person: 'Mike Tyson', category: 'fight', kind: 'extra', level: 2,
    focus: ['core', 'triceps', 'chest', 'quads'],
    title: { pt: 'Calistenia do Iron Mike', en: 'Iron Mike calisthenics' },
    who: {
      pt: 'Ex-campeão mundial dos pesos-pesados. Aos 20 anos, tornou-se o mais jovem campeão da categoria.',
      en: 'Former heavyweight world champion. At 20, he became the youngest heavyweight champion ever.'
    },
    why: {
      pt: 'No auge, construiu o físico com calistenia em volume enorme, planejada com o treinador Cus D\'Amato.',
      en: 'In his prime he built his physique with huge-volume calisthenics, planned with his coach Cus D\'Amato.'
    },
    fact: {
      pt: 'A rotina relatada somava cerca de 2.000 abdominais, 500 paralelas, 500 flexões e 500 encolhimentos por dia. Aqui vai uma versão escalonada, em circuito.',
      en: 'The reported routine added up to about 2,000 sit-ups, 500 dips, 500 push-ups and 500 shrugs a day. This is a scaled circuit version.'
    },
    exercises: [
      ex('sit_up', 5, '40', 0, { group: 'c1' }),
      ex('bench_dip', 5, '15', 0, { group: 'c1' }),
      ex('push_up', 5, '15', 0, { group: 'c1' }),
      ex('db_shrug', 5, '15', 0, { group: 'c1' }),
      ex('bodyweight_squat', 5, '20', 90, { group: 'c1' })
    ],
    source: 'https://www.sportskeeda.com/mma/news-mike-tyson-calisthenics-what-legendary-boxer-s-workout-routine-include'
  },
  {
    id: 'herschel-walker-bodyweight', person: 'Herschel Walker', category: 'athletes', kind: 'extra', level: 1,
    focus: ['chest', 'core', 'back'],
    title: { pt: 'Flexões, abdominais e barra', en: 'Push-ups, sit-ups and pull-ups' },
    who: {
      pt: 'Vencedor do Troféu Heisman de 1982 e running back da NFL. Também competiu no bobsled olímpico e no MMA.',
      en: '1982 Heisman Trophy winner and NFL running back. He also competed in Olympic bobsled and MMA.'
    },
    why: {
      pt: 'Construiu um físico de granito quase sem pesos, com milhares de flexões e abdominais por dia desde a adolescência.',
      en: 'He built a granite physique with almost no weights, doing thousands of push-ups and sit-ups a day since his teens.'
    },
    fact: {
      pt: 'Ele contou que fazia as flexões nos intervalos comerciais da TV. Esta é uma versão escalonada da rotina.',
      en: 'He said he did his push-ups during TV commercial breaks. This is a scaled version of the routine.'
    },
    exercises: [
      ex('push_up', 6, '25', 0, { group: 'c1' }),
      ex('sit_up', 6, '30', 0, { group: 'c1' }),
      ex('chin_up', 6, '6', 60, { group: 'c1' }),
      ex('jump_squat', 4, '12', 60)
    ],
    source: 'https://www.nfl.com/news/football-fit-a-look-at-herschel-walker-s-workout-routine-0ap3000000537126'
  },
  {
    id: 'lalanne-1959', person: 'Jack LaLanne', category: 'legends', kind: 'extra', level: 2,
    focus: ['back', 'biceps', 'fullbody'],
    title: { pt: 'Desafio de 1959', en: 'The 1959 challenge' },
    who: {
      pt: 'O "Padrinho do Fitness". Teve um programa de exercícios na TV americana por décadas e morreu em 2011, aos 96 anos.',
      en: 'The "Godfather of Fitness". He hosted a TV exercise show in the US for decades and died in 2011, aged 96.'
    },
    why: {
      pt: 'Pioneiro do fitness moderno, ajudou a popularizar o polichinelo e fazia proezas públicas para provar o valor do exercício.',
      en: 'A pioneer of modern fitness, he helped popularize the jumping jack and staged public feats to prove the value of exercise.'
    },
    fact: {
      pt: 'Aos 45 anos, em 1959, fez 1.000 polichinelos e 1.000 barras em 1h22. Aqui vai a versão de 10% do recorde: 100 de cada.',
      en: 'At 45, in 1959, he did 1,000 jumping jacks and 1,000 chin-ups in 1h22. This is the 10% version: 100 of each.'
    },
    exercises: [
      ex('jumping_jack', 10, '10', 0, { group: 'c1' }),
      ex('chin_up', 10, '10', 60, { group: 'c1' }),
      ex('push_up', 3, 'falha', 60)
    ],
    source: 'https://jacklalanne.com/?p=86'
  },
  {
    id: 'jackman-wolverine', person: 'Hugh Jackman', category: 'film', kind: 'extra', level: 3,
    focus: ['chest', 'back', 'quads', 'hamstrings'],
    title: { pt: 'Força do Wolverine', en: 'Wolverine strength' },
    who: {
      pt: 'Ator australiano que interpretou o Wolverine de "X-Men" (2000) a "Deadpool & Wolverine" (2024).',
      en: 'Australian actor who played Wolverine from "X-Men" (2000) to "Deadpool & Wolverine" (2024).'
    },
    why: {
      pt: 'Manteve o físico do personagem por mais de 20 anos com compostos pesados e progressão constante.',
      en: 'He kept the character\'s physique for over 20 years with heavy compound lifts and steady progression.'
    },
    fact: {
      pt: 'O treinador Mike Ryan baseava o treino em agachamento, terra e supinos, na faixa de 6 a 12 repetições em 4 séries.',
      en: 'Trainer Mike Ryan built the program on squats, deadlifts and presses, in the 6-12 rep range for 4 sets.'
    },
    exercises: [
      ex('bb_back_squat', 4, '6-12', 150),
      ex('bb_bench_press', 4, '6-12', 120),
      ex('bb_deadlift', 4, '5-8', 150),
      ex('pull_up', 4, '6-12', 90),
      ex('db_curl', 3, '8-12', 60)
    ],
    source: 'https://coachweb.com/exercises/celebrity-workouts/146/exclusive-hugh-jackman-wolverine-workout'
  },
  {
    id: 'ramon-dino-back', person: 'Ramon Dino', category: 'bodybuilding', kind: 'replace', level: 2,
    focus: ['back', 'shoulders'],
    title: { pt: 'V-taper do Dino', en: "Dino's V-taper" },
    who: {
      pt: 'O "Dinossauro Acreano". Campeão do Mr. Olympia Classic Physique em 2025, o primeiro título masculino do Brasil no Olympia.',
      en: 'The "Dinosaur from Acre". 2025 Mr. Olympia Classic Physique champion and Brazil\'s first men\'s Olympia title.'
    },
    why: {
      pt: 'O físico clássico depende de costas largas, cintura fina e ombros cheios. O desempenho nas poses de costas pesou no título.',
      en: 'A classic physique depends on wide lats, a narrow waist and full shoulders. His back poses were key to the title.'
    },
    fact: {
      pt: 'Antes do título, foi vice do Olympia em 2022 e 2023, atrás de Chris Bumstead. Desafio inspirado no foco em costas e ombros.',
      en: 'Before the title, he was Olympia runner-up in 2022 and 2023, behind Chris Bumstead. Challenge inspired by his back and shoulder focus.'
    },
    exercises: [
      ex('pull_up', 4, '8-12', 90),
      ex('lat_pulldown', 4, '10-12', 75),
      ex('seated_cable_row', 4, '10-12', 75),
      ex('straight_arm_pulldown', 3, '12-15', 60),
      ex('lateral_raise_cable', 4, '12-15', 0, { group: 's1' }),
      ex('reverse_pec_deck', 4, '12-15', 60, { group: 's1' })
    ],
    source: 'https://en.wikipedia.org/wiki/Ramon_Dino'
  },
  {
    id: 'ronnie-coleman-back', person: 'Ronnie Coleman', category: 'bodybuilding', kind: 'replace', level: 3,
    focus: ['back', 'biceps'],
    title: { pt: 'Light weight, baby!', en: 'Light weight, baby!' },
    who: {
      pt: 'Oito vezes Mr. Olympia, de 1998 a 2005, recorde empatado com Lee Haney. Foi policial no Texas.',
      en: 'Eight-time Mr. Olympia, from 1998 to 2005, a record shared with Lee Haney. He was a police officer in Texas.'
    },
    why: {
      pt: 'É sinônimo de treino pesado e de costas gigantes. Os bordões "Yeah buddy!" e "Light weight, baby!" viraram parte da cultura da academia.',
      en: 'He is synonymous with heavy training and huge backs. His catchphrases "Yeah buddy!" and "Light weight, baby!" became part of gym culture.'
    },
    fact: {
      pt: 'Grite "Yeah buddy!" no fim de cada série pesada. É opcional, mas recomendado.',
      en: 'Shout "Yeah buddy!" at the end of every heavy set. Optional, but recommended.'
    },
    exercises: [
      ex('bb_deadlift', 4, '6-10', 150),
      ex('bb_row', 4, '10-12', 90),
      ex('t_bar_row', 4, '10-12', 90),
      ex('db_row', 3, '10-12', 75),
      ex('lat_pulldown', 3, '12', 60),
      ex('bb_curl', 3, '10-12', 60)
    ],
    source: null
  },
  {
    id: 'rebeca-andrade-gym', person: 'Rebeca Andrade', category: 'athletes', kind: 'extra', level: 2,
    focus: ['core', 'shoulders', 'quads'],
    title: { pt: 'Força de ginasta', en: 'Gymnast strength' },
    who: {
      pt: 'Ginasta brasileira com seis medalhas olímpicas, a maior medalhista do Brasil na história, incluindo o ouro no solo em Paris 2024.',
      en: 'Brazilian gymnast with six Olympic medals, the most decorated Brazilian Olympian ever, including floor gold at Paris 2024.'
    },
    why: {
      pt: 'A ginástica exige força relativa, core de aço e potência nas pernas. Rebeca superou três lesões graves no joelho para chegar ao topo.',
      en: 'Gymnastics demands relative strength, a rock-solid core and leg power. Rebeca overcame three serious knee injuries to reach the top.'
    },
    fact: {
      pt: 'No Rio 2016, ela se apresentou no solo ao som de Beyoncé, e os fãs criaram o apelido "Rebeyoncé". Desafio inspirado na preparação de ginastas.',
      en: 'At Rio 2016 she performed her floor routine to Beyoncé, and fans nicknamed her "Rebeyoncé". Challenge inspired by gymnastics conditioning.'
    },
    exercises: [
      ex('hanging_leg_raise', 4, '10', 60),
      ex('pike_push_up', 4, '8-10', 60),
      ex('jump_squat', 4, '10', 60),
      ex('plank', 3, '45 s', 0, { group: 'c1' }),
      ex('side_plank', 3, '30 s', 0, { group: 'c1' }),
      ex('dead_bug', 3, '12', 45, { group: 'c1' })
    ],
    source: 'https://olympics.com/en/news/rebeca-andrade-floor-gold-medal-earned-history-brazil-bows-simone-biles-jordan-chiles'
  }
];

export const getChallenge = (id) => CHALLENGES.find((c) => c.id === id) || null;
