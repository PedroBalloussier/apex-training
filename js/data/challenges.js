// Hall da Fama: desafios inspirados em treinos documentados de lendas.
// kind: 'replace' substitui um dia com os mesmos músculos; 'extra' entra num dia livre.
// refKg: carga de referência da lenda (quando a fonte informa). Treinos com volumes extremos vêm escalonados.

export const CATEGORIES = ['film', 'fight', 'athletes', 'bodybuilding', 'legends'];

const ex = (id, sets, reps, restSec, more = {}) => ({ id, sets, reps, restSec, ...more });

export const CHALLENGES = [
  {
    id: 'bruce-lee-1965', person: 'Bruce Lee', category: 'fight', kind: 'replace', level: 2, difficulty: 3,
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
    id: 'arnold-golden-six', person: 'Arnold Schwarzenegger', category: 'bodybuilding', kind: 'extra', level: 1, difficulty: 2,
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
    id: 'arnold-chest-back', person: 'Arnold Schwarzenegger', category: 'bodybuilding', kind: 'replace', level: 3, difficulty: 5,
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
    id: 'steve-reeves-full', person: 'Steve Reeves', category: 'legends', kind: 'extra', level: 2, difficulty: 3,
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
    id: 'tyson-calisthenics', person: 'Mike Tyson', category: 'fight', kind: 'extra', level: 2, difficulty: 4,
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
    id: 'herschel-walker-bodyweight', person: 'Herschel Walker', category: 'athletes', kind: 'extra', level: 1, difficulty: 4,
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
    id: 'lalanne-1959', person: 'Jack LaLanne', category: 'legends', kind: 'extra', level: 2, difficulty: 3,
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
    id: 'jackman-wolverine', person: 'Hugh Jackman', category: 'film', kind: 'extra', level: 3, difficulty: 4,
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
    id: 'ramon-dino-back', person: 'Ramon Dino', category: 'bodybuilding', kind: 'replace', level: 2, difficulty: 4,
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
    id: 'ronnie-coleman-back', person: 'Ronnie Coleman', category: 'bodybuilding', kind: 'replace', level: 3, difficulty: 5,
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
    id: 'rebeca-andrade-gym', person: 'Rebeca Andrade', category: 'athletes', kind: 'extra', level: 2, difficulty: 3, sourceType: 'inspired',
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
  },
  {
    id: 'chris-evans-legs', person: 'Chris Evans', category: 'film', kind: 'replace', level: 2, difficulty: 3,
    focus: ['quads', 'hamstrings', 'glutes', 'calves'],
    title: { pt: 'Pernas do Capitão América', en: "Captain America's legs" },
    who: {
      pt: 'Ator americano que interpretou o Capitão América em dez filmes da Marvel, de 2011 a 2019.',
      en: 'American actor who played Captain America in ten Marvel films, from 2011 to 2019.'
    },
    why: {
      pt: 'O treinador Simon Waterson buscava um físico atlético, não só estético, para Evans fazer boa parte das próprias cenas de ação.',
      en: 'Trainer Simon Waterson aimed for an athletic physique, not just a look, so Evans could do most of his own stunts.'
    },
    fact: {
      pt: 'Este é o treino de pernas que Evans usou para "Capitão América: O Primeiro Vingador", com cargas altas e poucas repetições, mantendo o coração acelerado.',
      en: 'This is the leg routine Evans used for "Captain America: The First Avenger": heavy loads, low reps and a high heart rate.'
    },
    exercises: [
      ex('bb_back_squat', 3, '6-8', 120),
      ex('bb_lunge', 3, '6-8', 90),
      ex('leg_press', 3, '6-8', 90),
      ex('seated_calf_raise', 3, '6-8', 60),
      ex('lying_leg_curl', 3, '6-8', 60)
    ],
    source: 'https://www.coachweb.com/leg-workouts/1932/captain-america-s-heroic-legs-workout'
  },
  {
    id: 'goggins-boats', person: 'David Goggins', category: 'athletes', kind: 'extra', level: 2, difficulty: 5, sourceType: 'inspired',
    focus: ['back', 'biceps', 'chest'],
    title: { pt: 'Quem vai carregar os barcos?', en: "Who's gonna carry the boats?" },
    who: {
      pt: 'Ex-Navy SEAL, ultramaratonista e autor de "Can\'t Hurt Me". Ficou famoso pela disciplina extrema e pelos desafios que cria.',
      en: 'Former Navy SEAL, ultramarathoner and author of "Can\'t Hurt Me". Known for extreme discipline and the challenges he creates.'
    },
    why: {
      pt: 'Em 2013 bateu o recorde do Guinness de barras em 24 horas: 4.030 repetições em 17 horas, na terceira tentativa, depois de duas falhas.',
      en: 'In 2013 he set the Guinness record for pull-ups in 24 hours: 4,030 reps in 17 hours, on his third attempt after two failures.'
    },
    fact: {
      pt: 'Para o recorde ele treinava 400 barras por dia útil e 1.500 nos fins de semana. Aqui a meta é 100 barras somando as séries, com corrida no fim.',
      en: 'For the record he trained 400 pull-ups each weekday and 1,500 on weekends. Here the goal is 100 pull-ups across all sets, then a run.'
    },
    note: { pt: 'Versão escalonada. Use barra assistida ou elástico se precisar: o que conta é não parar antes das 100.', en: 'Scaled version. Use an assisted bar or band if needed: what counts is not stopping before 100.' },
    exercises: [
      ex('pull_up', 10, 'falha', 90),
      ex('push_up', 5, 'falha', 60),
      ex('treadmill_run', 1, '30 min', 0)
    ],
    source: 'https://www.shortform.com/blog/david-goggins-pull-up/'
  },
  {
    id: 'brie-larson-marvel', person: 'Brie Larson', category: 'film', kind: 'extra', level: 2, difficulty: 4,
    focus: ['glutes', 'hamstrings', 'back', 'core'],
    title: { pt: 'Força de Capitã Marvel', en: 'Captain Marvel strength' },
    who: {
      pt: 'Atriz vencedora do Oscar por "O Quarto de Jack" e protagonista de "Capitã Marvel" (2019), o primeiro filme da Marvel com uma heroína como protagonista.',
      en: 'Oscar winner for "Room" and star of "Captain Marvel" (2019), the first Marvel film led by a female hero.'
    },
    why: {
      pt: 'Treinou 9 meses com Jason Walsh. Começou sem conseguir fazer uma barra e terminou levantando 97 kg no terra e 181 kg no hip thrust.',
      en: 'She trained for 9 months with Jason Walsh. She started unable to do a pull-up and finished deadlifting 97 kg and hip thrusting 181 kg.'
    },
    fact: {
      pt: 'No fim da preparação ela empurrou o jipe do treinador ladeira acima. Walsh focava em compostos: agachamento, terra, hip thrust e trenó.',
      en: "By the end of her prep she pushed her trainer's Jeep up a hill. Walsh focused on compound lifts: squats, deadlifts, hip thrusts and sled pushes."
    },
    exercises: [
      ex('bb_hip_thrust', 4, '6-8', 120, { refKg: 181 }),
      ex('bb_deadlift', 4, '5', 150, { refKg: 97 }),
      ex('sled_push', 4, '20 m', 90),
      ex('pull_up', 3, 'falha', 90),
      ex('reverse_lunge', 3, '10', 60),
      ex('ab_wheel', 3, '10', 60)
    ],
    source: 'https://www.hollywoodreporter.com/news/disney-brie-larson-trainer-share-captain-marvel-workout-fitness-app-1191910'
  },
  {
    id: 'gal-gadot-legs', person: 'Gal Gadot', category: 'film', kind: 'replace', level: 1, difficulty: 2,
    focus: ['quads', 'glutes', 'core'],
    title: { pt: 'Pernas da Mulher-Maravilha', en: "Wonder Woman's legs" },
    who: {
      pt: 'Atriz israelense, Mulher-Maravilha nos filmes da DC desde 2016. Serviu dois anos no exército de Israel antes da carreira.',
      en: 'Israeli actress, Wonder Woman in DC films since 2016. She served two years in the Israeli army before her career.'
    },
    why: {
      pt: 'O treinador Magnus Lygdback chama o método de "beleza atlética": força, mobilidade e agilidade, uma hora por dia, cinco dias por semana.',
      en: 'Trainer Magnus Lygdback calls his method "athletic beauty": strength, mobility and agility, one hour a day, five days a week.'
    },
    fact: {
      pt: 'Este é o treino de pernas que Lygdback divulgou da preparação de "Mulher-Maravilha 1984": tiros na esteira, pernas e core.',
      en: 'This is the leg workout Lygdback shared from the "Wonder Woman 1984" prep: treadmill sprints, legs and core.'
    },
    note: { pt: 'Afundo cruzado virou afundo reverso, caminhada lateral com elástico virou abdução com elástico e prancha oca virou prancha.', en: 'Curtsy lunge became reverse lunge, banded lateral walk became banded abduction and hollow hold became plank.' },
    exercises: [
      ex('treadmill_run', 1, '5 min', 0),
      ex('treadmill_run', 3, '30 s', 30),
      ex('goblet_squat', 3, '12', 60),
      ex('walking_lunge', 3, '10', 60),
      ex('reverse_lunge', 3, '10', 60),
      ex('band_abduction', 3, '15', 45),
      ex('plank', 3, '45 s', 45)
    ],
    source: 'https://www.yahoo.com/lifestyle/gal-gadot-worked-five-days-151100870.html'
  },
  {
    id: 'scarlett-black-widow', person: 'Scarlett Johansson', category: 'film', kind: 'extra', level: 2, difficulty: 3, sourceType: 'inspired',
    focus: ['hamstrings', 'shoulders', 'back', 'core'],
    title: { pt: 'Circuito da Viúva Negra', en: 'Black Widow circuit' },
    who: {
      pt: 'Atriz americana que interpretou a Viúva Negra em nove filmes da Marvel, de "Homem de Ferro 2" (2010) ao filme solo de 2021.',
      en: 'American actress who played Black Widow in nine Marvel films, from "Iron Man 2" (2010) to her 2021 solo film.'
    },
    why: {
      pt: 'Disse que nunca tinha pisado numa academia antes do papel. O treinador Eric Johnson montou um treino de atleta: potência rotacional, força e condicionamento.',
      en: 'She said she had never set foot in a gym before the role. Trainer Eric Johnson built an athlete-style program: rotational power, strength and conditioning.'
    },
    fact: {
      pt: 'A inspiração de Johnson para a Viúva Negra de "Vingadores: Ultimato" foi a Sarah Connor de Linda Hamilton em "O Exterminador do Futuro 2".',
      en: 'Johnson\'s inspiration for Black Widow in "Avengers: Endgame" was Linda Hamilton\'s Sarah Connor in "Terminator 2".'
    },
    note: { pt: 'Arremesso rotacional de medicine ball virou rotação na polia; saltos laterais e skaters viraram agachamento com salto e escalador.', en: 'Rotational medicine-ball slam became cable woodchop; lateral bounds and skaters became jump squats and mountain climbers.' },
    exercises: [
      ex('cable_woodchop', 3, '10', 0, { group: 'c1' }),
      ex('jump_squat', 3, '10', 60, { group: 'c1' }),
      ex('bb_rdl', 3, '10', 0, { group: 'c2' }),
      ex('bb_ohp', 3, '10', 90, { group: 'c2' }),
      ex('chin_up', 3, '10', 0, { group: 'c3' }),
      ex('mountain_climber', 3, '10', 60, { group: 'c3' })
    ],
    source: 'https://www.hollywoodreporter.com/news/scarlett-johanssons-avengers-workout-how-get-a-black-widow-body-1204043'
  },
  {
    id: 'jennifer-lawrence-katniss', person: 'Jennifer Lawrence', category: 'film', kind: 'extra', level: 1, difficulty: 2,
    focus: ['fullbody', 'quads', 'chest', 'core'],
    title: { pt: 'Preparação da Katniss', en: "Katniss's prep" },
    who: {
      pt: 'Atriz americana vencedora do Oscar, Katniss Everdeen na série "Jogos Vorazes" (2012 a 2015).',
      en: 'Oscar-winning American actress, Katniss Everdeen in "The Hunger Games" series (2012 to 2015).'
    },
    why: {
      pt: 'O Dr. Joe Horrigan tinha pouco tempo para prepará-la. A base foi cardio intenso, com pular corda como favorito, mais um circuito de peso corporal.',
      en: 'Dr. Joe Horrigan had little time to get her ready. The base was intense cardio, with jump rope as a favorite, plus a bodyweight circuit.'
    },
    fact: {
      pt: 'Horrigan contou que ela nunca chegou atrasada, nunca faltou e nunca reclamou. O circuito pede 10 a 15 repetições em 30 segundos por exercício.',
      en: 'Horrigan said she was never late, never missed a workout and never complained. The circuit calls for 10-15 reps in 30 seconds per exercise.'
    },
    exercises: [
      ex('jump_rope', 1, '10 min', 60),
      ex('bodyweight_squat', 3, '30 s', 0, { group: 'c1' }),
      ex('push_up', 3, '30 s', 0, { group: 'c1' }),
      ex('sit_up', 3, '30 s', 60, { group: 'c1' })
    ],
    source: 'https://www.etonline.com/fashion/148153_jennifer_lawrence_skipped_to_get_hunger_games_shape'
  },
  {
    id: 'dorian-yates-back', person: 'Dorian Yates', category: 'bodybuilding', kind: 'replace', level: 3, difficulty: 4,
    focus: ['back', 'shoulders'],
    title: { pt: 'Blood and Guts: costas', en: 'Blood and Guts: back' },
    who: {
      pt: 'Fisiculturista inglês, seis vezes Mr. Olympia (1992 a 1997). Abriu a era dos "monstros de massa".',
      en: 'English bodybuilder, six-time Mr. Olympia (1992 to 1997). He opened the "mass monster" era.'
    },
    why: {
      pt: 'É considerado dono de uma das melhores costas da história. Seu método: só uma série válida por exercício, levada à falha total.',
      en: 'He is credited with one of the best backs in history. His method: just one working set per exercise, taken to total failure.'
    },
    fact: {
      pt: 'Este treino está na autobiografia dele, "A Warrior\'s Story" (1998). Ele dizia que, se dá para fazer uma segunda série, a primeira não foi de verdade.',
      en: 'This workout comes from his 1998 autobiography, "A Warrior\'s Story". He said that if you can do a second set, the first wasn\'t real.'
    },
    note: { pt: 'Faça 1 ou 2 séries de aquecimento antes do primeiro exercício. Cada série registrada aqui é a série válida, até a falha.', en: 'Do 1-2 warm-up sets before the first exercise. Each set logged here is the working set, to failure.' },
    exercises: [
      ex('machine_pulldown', 1, '8-10', 120, { technique: { type: 'failure', on: 'all' } }),
      ex('bb_row', 1, '8-10', 120, { technique: { type: 'failure', on: 'all' } }),
      ex('db_row', 1, '8-10', 90, { technique: { type: 'failure', on: 'all' } }),
      ex('seated_cable_row', 1, '8-10', 90, { technique: { type: 'failure', on: 'all' } }),
      ex('reverse_pec_deck', 1, '8-10', 60, { technique: { type: 'failure', on: 'all' } }),
      ex('rear_delt_fly_db', 1, '8-10', 60, { technique: { type: 'failure', on: 'all' } }),
      ex('back_extension', 1, '8', 60, { technique: { type: 'failure', on: 'all' } }),
      ex('bb_deadlift', 1, '8', 0, { technique: { type: 'failure', on: 'all' } })
    ],
    source: 'https://barbend.com/news/dorian-yates-back-workout/'
  },
  {
    id: 'rock-chest-hercules', person: 'Dwayne Johnson', category: 'film', kind: 'replace', level: 3, difficulty: 5,
    focus: ['chest', 'shoulders', 'triceps'],
    title: { pt: 'Peito de Hércules', en: 'Hercules chest' },
    who: {
      pt: '"The Rock": ex-lutador da WWE, um dos atores mais bem pagos do mundo. Treina no "Iron Paradise", a academia que leva para as filmagens.',
      en: '"The Rock": former WWE wrestler and one of the highest-paid actors in the world. He trains in the "Iron Paradise", the gym he takes to film sets.'
    },
    why: {
      pt: 'É famoso pela ética de trabalho: cardio de manhã cedo e treinos de alto volume, quase todos os dias.',
      en: 'He is famous for his work ethic: early-morning cardio and high-volume training, almost every day.'
    },
    fact: {
      pt: 'Este é o dia de peito da preparação para "Hércules" (2014), feito depois de uma hora de cardio.',
      en: 'This is the chest day from his "Hercules" (2014) prep, done after an hour of cardio.'
    },
    exercises: [
      ex('db_bench_press', 4, '10-12', 75),
      ex('cable_crossover', 3, 'falha', 60),
      ex('bb_bench_press', 4, '10-12', 90),
      ex('db_incline_press', 5, '10-12', 75),
      ex('low_cable_fly', 4, '10-12', 60),
      ex('bb_incline_press', 3, '10-12', 90)
    ],
    source: 'https://www.military.com/military-fitness/workouts/the-real-dwayne-on-hjohnsercules-workout'
  },
  {
    id: 'michael-b-jordan-creed', person: 'Michael B. Jordan', category: 'film', kind: 'extra', level: 1, difficulty: 3,
    focus: ['fullbody', 'quads', 'chest', 'core'],
    title: { pt: 'Circuito do Creed', en: 'Creed circuit' },
    who: {
      pt: 'Ator americano, Adonis Creed na trilogia "Creed" e Killmonger em "Pantera Negra".',
      en: 'American actor, Adonis Creed in the "Creed" trilogy and Killmonger in "Black Panther".'
    },
    why: {
      pt: 'O treinador Corey Calliet adapta o treino a cada papel. Para o boxe, priorizou condicionamento: dá para estar trincado e se mover como um robô.',
      en: 'Trainer Corey Calliet adapts the training to each role. For boxing he prioritized conditioning: you can look ripped and still move like a robot.'
    },
    fact: {
      pt: 'Calliet usava este circuito em "Creed II" e dizia que dava para fazer em casa, na academia, em qualquer lugar.',
      en: 'Calliet used this circuit for "Creed II" and said it could be done at home, in the gym, anywhere.'
    },
    exercises: [
      ex('jump_rope', 4, '3 min', 0, { group: 'c1' }),
      ex('kb_swing', 4, '8', 0, { group: 'c1' }),
      ex('goblet_squat', 4, '8', 0, { group: 'c1' }),
      ex('push_up', 4, '15', 0, { group: 'c1' }),
      ex('sit_up', 4, '20', 90, { group: 'c1' })
    ],
    source: 'https://menshealth.com.au/?p=5907'
  },
  {
    id: 'henry-cavill-steel', person: 'Henry Cavill', category: 'film', kind: 'replace', level: 2, difficulty: 4,
    focus: ['hamstrings', 'quads', 'glutes', 'calves'],
    title: { pt: 'Pernas de aço', en: 'Legs of steel' },
    who: {
      pt: 'Ator britânico, Superman em "O Homem de Aço" (2013) e Geralt em "The Witcher".',
      en: 'British actor, Superman in "Man of Steel" (2013) and Geralt in "The Witcher".'
    },
    why: {
      pt: 'Treinou até 2 horas e meia por dia, 4 a 5 dias por semana, com Mark Twight e depois Michael Blevins, misturando levantamentos olímpicos e musculação.',
      en: 'He trained up to 2.5 hours a day, 4-5 days a week, with Mark Twight and later Michael Blevins, mixing Olympic lifts and bodybuilding.'
    },
    fact: {
      pt: 'Este é o dia de pernas da fase de musculação de Superman. Blevins diz que mais capacidade de trabalho permite treinar mais forte e por mais tempo.',
      en: 'This is the leg day from the Superman bodybuilding phase. Blevins says more work capacity lets you train harder and longer.'
    },
    exercises: [
      ex('bb_deadlift', 5, '5', 150),
      ex('bb_front_squat', 5, '6-8', 120),
      ex('walking_lunge', 4, '8', 75),
      ex('standing_calf_raise', 5, '12', 45)
    ],
    source: 'https://www.menshealth.com.au/training-takeaways'
  }
];

export const getChallenge = (id) => CHALLENGES.find((c) => c.id === id) || null;
