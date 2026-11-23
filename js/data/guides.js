// Guias de execução por padrão de movimento (PT e EN).
// Cada guia: steps (como executar), tips (dicas), mistakes (erros comuns).

const PATTERN_TO_GUIDE = {
  horizontal_push: 'press', vertical_push: 'overhead', fly: 'fly', pullover: 'pullover',
  vertical_pull: 'pulldown', horizontal_pull: 'row', shrug: 'shrug',
  front_raise: 'raise', lateral_raise: 'lateral', rear_fly: 'rear',
  elbow_flexion: 'curl', elbow_flexion_short: 'curl', elbow_flexion_stretch: 'curl_stretch', hammer_curl: 'hammer',
  reverse_curl: 'hammer', elbow_extension: 'pushdown', elbow_extension_overhead: 'overhead_ext',
  elbow_extension_compound: 'tri_compound', wrist_flexion: 'wrist', wrist_extension: 'wrist',
  carry: 'grip', grip_hold: 'grip',
  squat: 'squat', lunge: 'lunge', knee_extension: 'knee_ext', hinge: 'hinge', knee_flexion: 'leg_curl',
  hip_thrust: 'hip_thrust', hip_extension: 'kickback', hip_abduction: 'abduction',
  calf_raise: 'calf', seated_calf_raise: 'calf',
  core_flexion: 'crunch', leg_raise: 'leg_raise', anti_extension: 'plank', anti_lateral: 'side_plank',
  anti_rotation: 'anti_rotation', rotation: 'rotation',
  plyometric: 'plyo', power: 'power', conditioning: 'conditioning', cardio: 'cardio'
};

const G = {
  press: {
    pt: { steps: ['Deite ou apoie as costas com os pés firmes no chão e as escápulas encaixadas para trás e para baixo.', 'Desça o peso com controle até a linha do peito, cotovelos a cerca de 45° do tronco.', 'Empurre de volta até quase estender os braços, sem perder a posição das escápulas.'],
      tips: ['Expire ao empurrar e inspire ao descer.', 'Pense em "dobrar" a barra ou aproximar os halteres para ativar mais o peito.'],
      mistakes: ['Abrir os cotovelos a 90°, o que sobrecarrega o ombro.', 'Quicar o peso no peito ou tirar o quadril do banco.'] },
    en: { steps: ['Set your back with feet planted and shoulder blades pulled back and down.', 'Lower the weight under control to chest level, elbows about 45° from your torso.', 'Press back up to nearly straight arms without losing your shoulder-blade position.'],
      tips: ['Breathe out as you press, in as you lower.', 'Think about bending the bar or bringing the dumbbells together to engage the chest.'],
      mistakes: ['Flaring elbows to 90°, which stresses the shoulder.', 'Bouncing the weight off your chest or lifting your hips.'] }
  },
  overhead: {
    pt: { steps: ['Comece com o peso na altura dos ombros, abdômen e glúteos contraídos.', 'Empurre para cima em linha reta até os braços quase estenderem acima da cabeça.', 'Desça com controle até a altura do queixo ou dos ombros.'],
      tips: ['Mantenha as costelas "fechadas" para não arquear a lombar.', 'Em pé, deixe os joelhos levemente soltos e os pés firmes.'],
      mistakes: ['Arquear demais a lombar para conseguir subir o peso.', 'Usar impulso das pernas sem querer.'] },
    en: { steps: ['Start with the weight at shoulder height, abs and glutes braced.', 'Press straight up until your arms are nearly locked overhead.', 'Lower under control to chin or shoulder height.'],
      tips: ['Keep your ribs down so your lower back does not arch.', 'Standing, keep knees soft and feet planted.'],
      mistakes: ['Over-arching the lower back to move the weight.', 'Accidentally using leg drive.'] }
  },
  fly: {
    pt: { steps: ['Comece com os braços estendidos à frente do peito e cotovelos levemente flexionados.', 'Abra os braços em arco, sentindo alongar o peito, até a linha dos ombros.', 'Volte em arco "abraçando" uma árvore, contraindo o peito no fim.'],
      tips: ['Mantenha o mesmo ângulo de cotovelo durante todo o movimento.', 'Use carga moderada: o objetivo é a contração, não o peso.'],
      mistakes: ['Transformar o crucifixo num supino, dobrando os cotovelos.', 'Descer além da linha do ombro com peso alto.'] },
    en: { steps: ['Start with arms extended in front of your chest, elbows slightly bent.', 'Open your arms in an arc, feeling the chest stretch, to shoulder level.', 'Bring them back in an arc as if hugging a tree, squeezing at the end.'],
      tips: ['Keep the same elbow angle throughout.', 'Use moderate load: the goal is the squeeze, not the weight.'],
      mistakes: ['Turning the fly into a press by bending the elbows.', 'Going below shoulder level with heavy weight.'] }
  },
  pullover: {
    pt: { steps: ['Segure o peso com os braços quase estendidos acima do peito ou da cabeça.', 'Leve os braços para trás ou para cima em arco até sentir o alongamento.', 'Volte em arco puxando com as costas e o peito, sem dobrar os cotovelos.'],
      tips: ['Mantenha o abdômen firme para a lombar não arquear.', 'Movimento lento e controlado rende mais que carga alta.'],
      mistakes: ['Dobrar os cotovelos e virar um tríceps.', 'Ir além da amplitude confortável do ombro.'] },
    en: { steps: ['Hold the weight with nearly straight arms above your chest or head.', 'Move your arms back or up in an arc until you feel the stretch.', 'Return in an arc pulling with your back and chest, elbows fixed.'],
      tips: ['Brace your abs so your lower back does not arch.', 'Slow, controlled reps beat heavy load.'],
      mistakes: ['Bending the elbows and turning it into a triceps move.', 'Going past a comfortable shoulder range.'] }
  },
  pulldown: {
    pt: { steps: ['Segure a barra ou o apoio com o peito alto e os ombros longe das orelhas.', 'Puxe levando os cotovelos para baixo e para trás, em direção ao alto do peito.', 'Volte devagar até estender os braços, sentindo as costas alongarem.'],
      tips: ['Pense em puxar com os cotovelos, não com as mãos.', 'Incline levemente o tronco para trás, sem balançar.'],
      mistakes: ['Puxar a barra atrás da nuca.', 'Usar o corpo para dar impulso a cada repetição.'] },
    en: { steps: ['Grip the bar or handle with your chest up and shoulders away from your ears.', 'Pull your elbows down and back toward your upper chest.', 'Return slowly to straight arms, feeling your back stretch.'],
      tips: ['Think about pulling with your elbows, not your hands.', 'Lean back slightly without swinging.'],
      mistakes: ['Pulling the bar behind your neck.', 'Using body momentum on every rep.'] }
  },
  row: {
    pt: { steps: ['Posicione o tronco firme, com a coluna neutra e o abdômen contraído.', 'Puxe o peso em direção ao abdômen ou às costelas, levando os cotovelos para trás.', 'Aperte as escápulas no fim e volte com controle até estender os braços.'],
      tips: ['Mantenha o pescoço alinhado com a coluna.', 'Faça uma pequena pausa com as escápulas apertadas.'],
      mistakes: ['Arredondar as costas, principalmente com barra.', 'Encolher os ombros em direção às orelhas.'] },
    en: { steps: ['Brace your torso with a neutral spine and tight abs.', 'Pull the weight toward your belly or ribs, driving your elbows back.', 'Squeeze your shoulder blades, then return under control to straight arms.'],
      tips: ['Keep your neck in line with your spine.', 'Pause briefly with your shoulder blades squeezed.'],
      mistakes: ['Rounding your back, especially with a barbell.', 'Shrugging your shoulders toward your ears.'] }
  },
  shrug: {
    pt: { steps: ['Fique em pé com o peso ao lado do corpo ou à frente, braços estendidos.', 'Eleve os ombros em direção às orelhas o mais alto possível.', 'Segure 1 segundo e desça devagar.'],
      tips: ['Movimento só para cima e para baixo.', 'Mantenha o pescoço neutro.'],
      mistakes: ['Girar os ombros em círculo.', 'Dobrar os cotovelos para ajudar.'] },
    en: { steps: ['Stand with the weight at your sides or in front, arms straight.', 'Raise your shoulders toward your ears as high as you can.', 'Hold for one second and lower slowly.'],
      tips: ['Move straight up and down only.', 'Keep your neck neutral.'],
      mistakes: ['Rolling your shoulders in circles.', 'Bending your elbows to help.'] }
  },
  raise: {
    pt: { steps: ['Fique em pé com o peso à frente das coxas e cotovelos levemente flexionados.', 'Eleve os braços à frente até a altura dos ombros.', 'Desça devagar, sem deixar o peso cair.'],
      tips: ['Tronco parado: o movimento é só dos ombros.', 'Carga leve a moderada.'],
      mistakes: ['Balançar o tronco para subir o peso.', 'Subir acima da cabeça.'] },
    en: { steps: ['Stand with the weight in front of your thighs, elbows slightly bent.', 'Raise your arms in front to shoulder height.', 'Lower slowly without letting the weight drop.'],
      tips: ['Keep your torso still: only the shoulders move.', 'Light to moderate load.'],
      mistakes: ['Swinging your torso to lift the weight.', 'Raising above your head.'] }
  },
  lateral: {
    pt: { steps: ['Fique em pé com os braços ao lado do corpo e cotovelos levemente flexionados.', 'Eleve os braços para os lados até a altura dos ombros, liderando com os cotovelos.', 'Desça em 2 a 3 segundos, mantendo a tensão.'],
      tips: ['Imagine empurrar o peso para longe, para os lados, e não para cima.', 'Incline levemente o tronco à frente para focar no deltoide lateral.'],
      mistakes: ['Encolher os ombros e usar o trapézio.', 'Usar peso demais e balançar.'] },
    en: { steps: ['Stand with arms at your sides and elbows slightly bent.', 'Raise your arms out to the sides to shoulder height, leading with your elbows.', 'Lower over 2 to 3 seconds, keeping tension.'],
      tips: ['Think about pushing the weight out to the sides, not up.', 'Lean slightly forward to target the side delts.'],
      mistakes: ['Shrugging and using your traps.', 'Going too heavy and swinging.'] }
  },
  rear: {
    pt: { steps: ['Incline o tronco ou apoie o peito, braços estendidos à frente.', 'Abra os braços para os lados e para trás, contraindo a parte de trás dos ombros.', 'Volte devagar até a posição inicial.'],
      tips: ['Cotovelos levemente flexionados e fixos.', 'Não aproxime demais as escápulas: o foco é o ombro.'],
      mistakes: ['Usar impulso do tronco.', 'Transformar o movimento numa remada.'] },
    en: { steps: ['Hinge forward or support your chest, arms extended in front.', 'Open your arms out and back, squeezing the rear of your shoulders.', 'Return slowly to the start.'],
      tips: ['Elbows slightly bent and fixed.', "Don't over-squeeze the shoulder blades: focus on the rear delts."],
      mistakes: ['Using torso momentum.', 'Turning it into a row.'] }
  },
  curl: {
    pt: { steps: ['Fique em pé ou sentado com os cotovelos colados ao corpo e palmas para cima.', 'Flexione os cotovelos trazendo o peso em direção aos ombros.', 'Contraia no alto e desça devagar até estender os braços.'],
      tips: ['Cotovelos parados: só o antebraço se move.', 'Desça em 2 a 3 segundos.'],
      mistakes: ['Balançar o tronco para subir o peso.', 'Não estender os braços por completo.'] },
    en: { steps: ['Stand or sit with elbows tucked and palms up.', 'Bend your elbows, bringing the weight toward your shoulders.', 'Squeeze at the top and lower slowly to straight arms.'],
      tips: ['Elbows stay still: only the forearms move.', 'Lower over 2 to 3 seconds.'],
      mistakes: ['Swinging your torso to lift the weight.', 'Not fully straightening your arms.'] }
  },
  curl_stretch: {
    pt: { steps: ['Posicione os braços atrás da linha do corpo (banco inclinado ou polia atrás de você).', 'Flexione os cotovelos sem trazê-los para frente.', 'Desça até alongar bem o bíceps.'],
      tips: ['A posição alongada é o diferencial deste exercício.', 'Use menos carga que na rosca comum.'],
      mistakes: ['Levar os cotovelos para frente ao subir.', 'Encurtar a amplitude no fim.'] },
    en: { steps: ['Set your arms behind your body line (incline bench or cable behind you).', 'Bend your elbows without bringing them forward.', 'Lower until your biceps are well stretched.'],
      tips: ['The stretched position is what makes this exercise special.', 'Use less load than a regular curl.'],
      mistakes: ['Bringing your elbows forward as you lift.', 'Cutting the range short at the bottom.'] }
  },
  hammer: {
    pt: { steps: ['Segure o peso com a pegada neutra (martelo) ou pronada (inversa), cotovelos colados.', 'Flexione os cotovelos até a altura dos ombros.', 'Desça devagar.'],
      tips: ['Trabalha braquial e antebraço: ótimo para "engrossar" o braço.', 'Punhos firmes e alinhados.'],
      mistakes: ['Deixar o punho dobrar.', 'Usar impulso.'] },
    en: { steps: ['Hold the weight with a neutral (hammer) or overhand (reverse) grip, elbows tucked.', 'Bend your elbows up to shoulder height.', 'Lower slowly.'],
      tips: ['Works the brachialis and forearm: great for arm thickness.', 'Keep your wrists firm and aligned.'],
      mistakes: ['Letting your wrists bend.', 'Using momentum.'] }
  },
  pushdown: {
    pt: { steps: ['De frente para a polia ou com o peso atrás, cotovelos colados ao corpo.', 'Estenda os cotovelos por completo, contraindo o tríceps.', 'Volte até cerca de 90° sem afastar os cotovelos.'],
      tips: ['Na corda, abra as mãos no fim do movimento.', 'Tronco levemente inclinado e firme.'],
      mistakes: ['Deixar os cotovelos subirem ou abrirem.', 'Usar o peso do corpo para empurrar.'] },
    en: { steps: ['Face the cable or hold the weight behind you, elbows tucked.', 'Fully straighten your elbows, squeezing the triceps.', 'Return to about 90° without moving your elbows.'],
      tips: ['With a rope, spread your hands at the bottom.', 'Torso slightly leaned and braced.'],
      mistakes: ['Letting your elbows drift up or out.', 'Leaning your body weight into it.'] }
  },
  overhead_ext: {
    pt: { steps: ['Segure o peso acima da cabeça ou da testa com os braços estendidos.', 'Dobre só os cotovelos, descendo o peso atrás da cabeça ou até a testa.', 'Estenda os braços de volta, sem mexer os ombros.'],
      tips: ['Cotovelos apontados para frente, não para os lados.', 'Desça com calma: o alongamento é o ponto forte.'],
      mistakes: ['Abrir os cotovelos.', 'Usar carga que obriga a mexer os ombros.'] },
    en: { steps: ['Hold the weight overhead or above your forehead with straight arms.', 'Bend only your elbows, lowering the weight behind your head or to your forehead.', 'Straighten back up without moving your shoulders.'],
      tips: ['Elbows point forward, not out.', 'Lower slowly: the stretch is the key part.'],
      mistakes: ['Flaring your elbows.', 'Using a load that forces your shoulders to move.'] }
  },
  tri_compound: {
    pt: { steps: ['Posicione as mãos mais fechadas que o normal (supino fechado, flexão diamante ou paralelas).', 'Desça com os cotovelos próximos ao corpo.', 'Empurre até estender os braços.'],
      tips: ['Cotovelos para trás, não para os lados.', 'Nas paralelas, mantenha o tronco mais vertical para focar no tríceps.'],
      mistakes: ['Descer além do confortável para o ombro.', 'Perder o alinhamento do corpo.'] },
    en: { steps: ['Set your hands closer than usual (close-grip press, diamond push-up or dips).', 'Lower with your elbows close to your body.', 'Press up to straight arms.'],
      tips: ['Elbows go back, not out.', 'On dips, stay more upright to target the triceps.'],
      mistakes: ['Going deeper than is comfortable for your shoulders.', 'Losing body alignment.'] }
  },
  wrist: {
    pt: { steps: ['Apoie os antebraços na coxa ou no banco, com os punhos para fora.', 'Movimente só o punho, subindo o peso o máximo possível.', 'Desça devagar até alongar.'],
      tips: ['Carga leve e muitas repetições.', 'Amplitude completa.'],
      mistakes: ['Mexer os cotovelos.', 'Usar peso demais.'] },
    en: { steps: ['Rest your forearms on your thighs or a bench, wrists hanging off.', 'Move only your wrist, lifting the weight as high as you can.', 'Lower slowly into a stretch.'],
      tips: ['Light load, high reps.', 'Full range of motion.'],
      mistakes: ['Moving your elbows.', 'Going too heavy.'] }
  },
  grip: {
    pt: { steps: ['Segure firme o peso ou a barra com a coluna ereta.', 'Mantenha os ombros encaixados e o abdômen contraído.', 'Caminhe ou sustente pelo tempo indicado.'],
      tips: ['Respire de forma contínua.', 'Aumente o tempo antes de aumentar o peso.'],
      mistakes: ['Deixar os ombros caírem para frente.', 'Inclinar o corpo para um lado.'] },
    en: { steps: ['Grip the weight or bar firmly with an upright spine.', 'Keep your shoulders set and abs braced.', 'Walk or hold for the set time.'],
      tips: ['Keep breathing steadily.', 'Increase time before increasing load.'],
      mistakes: ['Letting your shoulders round forward.', 'Leaning to one side.'] }
  },
  squat: {
    pt: { steps: ['Pés na largura dos ombros, pontas levemente para fora, peito alto.', 'Desça sentando para trás e para baixo, joelhos na direção dos pés.', 'Suba empurrando o chão com o pé inteiro.'],
      tips: ['Encha o abdômen de ar e trave antes de descer.', 'Desça até onde mantém a coluna neutra.'],
      mistakes: ['Deixar os joelhos caírem para dentro.', 'Tirar os calcanhares do chão.'] },
    en: { steps: ['Feet shoulder-width apart, toes slightly out, chest up.', 'Sit back and down, knees tracking over your toes.', 'Drive up by pushing the floor with your whole foot.'],
      tips: ['Take a big breath and brace before descending.', 'Go as deep as you can with a neutral spine.'],
      mistakes: ['Letting your knees cave in.', 'Lifting your heels.'] }
  },
  lunge: {
    pt: { steps: ['Dê um passo largo, mantendo o tronco ereto.', 'Desça até os dois joelhos ficarem perto de 90°.', 'Empurre com o pé da frente para voltar.'],
      tips: ['O joelho da frente acompanha a direção do pé.', 'Faça todas as repetições de um lado e depois troque.'],
      mistakes: ['Passo curto demais, que joga o joelho muito à frente.', 'Inclinar o tronco para frente.'] },
    en: { steps: ['Take a long step, keeping your torso upright.', 'Lower until both knees are close to 90°.', 'Push through your front foot to return.'],
      tips: ['Your front knee tracks over your foot.', 'Do all reps on one side, then switch.'],
      mistakes: ['Too short a step, pushing the knee far forward.', 'Leaning your torso forward.'] }
  },
  knee_ext: {
    pt: { steps: ['Ajuste o aparelho com o joelho alinhado ao eixo.', 'Estenda os joelhos por completo, contraindo o quadríceps.', 'Desça devagar.'],
      tips: ['Segure 1 segundo no alto.', 'Bom para terminar o treino de pernas.'],
      mistakes: ['Dar tranco no início.', 'Tirar o quadril do banco.'] },
    en: { steps: ['Set the machine so your knee lines up with the pivot.', 'Fully straighten your knees, squeezing the quads.', 'Lower slowly.'],
      tips: ['Hold for one second at the top.', 'Great as a leg-day finisher.'],
      mistakes: ['Jerking the weight at the start.', 'Lifting your hips off the seat.'] }
  },
  hinge: {
    pt: { steps: ['Pés na largura do quadril, joelhos levemente flexionados.', 'Leve o quadril para trás, descendo o peso rente às pernas com a coluna neutra.', 'Suba empurrando o quadril para frente e contraindo os glúteos.'],
      tips: ['Sinta alongar a parte de trás das coxas antes de subir.', 'O peso fica sempre perto do corpo.'],
      mistakes: ['Arredondar a lombar.', 'Transformar em agachamento, dobrando demais os joelhos.'] },
    en: { steps: ['Feet hip-width apart, knees slightly bent.', 'Push your hips back, lowering the weight close to your legs with a neutral spine.', 'Stand up by driving your hips forward and squeezing your glutes.'],
      tips: ['Feel the hamstring stretch before coming up.', 'Keep the weight close to your body.'],
      mistakes: ['Rounding your lower back.', 'Turning it into a squat by bending your knees too much.'] }
  },
  leg_curl: {
    pt: { steps: ['Ajuste o apoio logo acima dos calcanhares e o joelho alinhado ao eixo.', 'Flexione os joelhos trazendo os calcanhares em direção aos glúteos.', 'Volte devagar até quase estender.'],
      tips: ['Quadril firme no banco.', 'Fase de descida lenta.'],
      mistakes: ['Levantar o quadril.', 'Usar impulso.'] },
    en: { steps: ['Set the pad just above your heels and your knee in line with the pivot.', 'Bend your knees, bringing your heels toward your glutes.', 'Return slowly to nearly straight.'],
      tips: ['Keep your hips pinned down.', 'Slow lowering phase.'],
      mistakes: ['Lifting your hips.', 'Using momentum.'] }
  },
  hip_thrust: {
    pt: { steps: ['Apoie a parte de cima das costas no banco (ou deite no chão) com os pés firmes.', 'Suba o quadril até alinhar tronco e coxas, contraindo os glúteos.', 'Desça com controle.'],
      tips: ['Queixo levemente para baixo, olhar à frente.', 'Segure 1 segundo no alto.'],
      mistakes: ['Arquear a lombar no alto em vez de contrair os glúteos.', 'Pés longe demais, que jogam o trabalho para trás da coxa.'] },
    en: { steps: ['Rest your upper back on a bench (or lie on the floor) with feet planted.', 'Drive your hips up until torso and thighs line up, squeezing your glutes.', 'Lower under control.'],
      tips: ['Chin slightly tucked, eyes forward.', 'Hold for one second at the top.'],
      mistakes: ['Arching your lower back at the top instead of squeezing your glutes.', 'Feet too far out, shifting work to the hamstrings.'] }
  },
  kickback: {
    pt: { steps: ['Fique firme com o tronco levemente inclinado.', 'Leve a perna para trás, estendendo o quadril e contraindo o glúteo.', 'Volte devagar.'],
      tips: ['A lombar não se mexe.', 'Pense em empurrar o calcanhar para trás.'],
      mistakes: ['Arquear as costas para subir mais a perna.', 'Usar impulso.'] },
    en: { steps: ['Brace with your torso slightly leaned forward.', 'Push your leg back, extending the hip and squeezing the glute.', 'Return slowly.'],
      tips: ['Your lower back stays still.', 'Think about pushing your heel back.'],
      mistakes: ['Arching your back to lift the leg higher.', 'Using momentum.'] }
  },
  abduction: {
    pt: { steps: ['Sente ou deite de lado com o tronco firme.', 'Afaste as pernas para os lados contra a resistência.', 'Volte devagar sem deixar o peso bater.'],
      tips: ['Incline levemente o tronco à frente para ativar mais o glúteo.', 'Segure 1 segundo aberto.'],
      mistakes: ['Movimento rápido e sem controle.', 'Girar o quadril.'] },
    en: { steps: ['Sit or lie on your side with your torso braced.', 'Push your legs out against the resistance.', 'Return slowly without letting the weight slam.'],
      tips: ['Lean slightly forward to engage the glutes more.', 'Hold for one second open.'],
      mistakes: ['Fast, uncontrolled reps.', 'Rotating your hips.'] }
  },
  calf: {
    pt: { steps: ['Apoie a ponta dos pés numa plataforma, com os calcanhares livres.', 'Suba na ponta dos pés o mais alto possível.', 'Desça devagar até alongar bem a panturrilha.'],
      tips: ['Pause 1 segundo em cima e 1 embaixo.', 'Amplitude completa vale mais que carga.'],
      mistakes: ['Repetições curtas e quicadas.', 'Dobrar os joelhos para ajudar (na versão em pé).'] },
    en: { steps: ['Stand on the balls of your feet on a platform, heels free.', 'Rise onto your toes as high as you can.', 'Lower slowly into a deep calf stretch.'],
      tips: ['Pause one second at the top and at the bottom.', 'Full range beats heavy load.'],
      mistakes: ['Short, bouncy reps.', 'Bending your knees to help (standing version).'] }
  },
  crunch: {
    pt: { steps: ['Deite ou ajoelhe com o abdômen contraído.', 'Enrole o tronco aproximando as costelas do quadril.', 'Volte devagar sem relaxar por completo.'],
      tips: ['Expire ao subir.', 'O movimento é curto e controlado.'],
      mistakes: ['Puxar o pescoço com as mãos.', 'Usar impulso dos braços.'] },
    en: { steps: ['Lie down or kneel with your abs braced.', 'Curl your torso, bringing your ribs toward your hips.', 'Return slowly without fully relaxing.'],
      tips: ['Breathe out as you curl up.', 'The movement is short and controlled.'],
      mistakes: ['Pulling your neck with your hands.', 'Using arm momentum.'] }
  },
  leg_raise: {
    pt: { steps: ['Pendure-se ou deite com a lombar apoiada.', 'Eleve as pernas enrolando o quadril para cima.', 'Desça devagar sem balançar.'],
      tips: ['O objetivo é levar o quadril para cima, não só as pernas.', 'Joelhos dobrados facilitam.'],
      mistakes: ['Balançar o corpo.', 'Arquear a lombar ao descer.'] },
    en: { steps: ['Hang or lie down with your lower back supported.', 'Raise your legs by curling your pelvis up.', 'Lower slowly without swinging.'],
      tips: ['The goal is to lift your pelvis, not just your legs.', 'Bent knees make it easier.'],
      mistakes: ['Swinging your body.', 'Arching your lower back on the way down.'] }
  },
  plank: {
    pt: { steps: ['Apoie antebraços (ou mãos) e pontas dos pés, corpo em linha reta.', 'Contraia abdômen e glúteos.', 'Sustente pelo tempo indicado respirando normalmente.'],
      tips: ['Imagine puxar os cotovelos em direção aos pés.', 'Qualidade antes de tempo.'],
      mistakes: ['Quadril caindo ou alto demais.', 'Prender a respiração.'] },
    en: { steps: ['Support yourself on forearms (or hands) and toes, body in a straight line.', 'Squeeze your abs and glutes.', 'Hold for the set time, breathing normally.'],
      tips: ['Think about pulling your elbows toward your feet.', 'Quality before duration.'],
      mistakes: ['Hips sagging or piking up.', 'Holding your breath.'] }
  },
  side_plank: {
    pt: { steps: ['Deite de lado e apoie o antebraço embaixo do ombro.', 'Eleve o quadril até alinhar o corpo.', 'Sustente e troque de lado.'],
      tips: ['Quadril para frente, sem dobrar.', 'Joelhos no chão facilitam.'],
      mistakes: ['Deixar o quadril cair.', 'Ombro longe da linha do cotovelo.'] },
    en: { steps: ['Lie on your side with your forearm under your shoulder.', 'Lift your hips until your body is straight.', 'Hold, then switch sides.'],
      tips: ['Hips forward, not bent.', 'Knees down makes it easier.'],
      mistakes: ['Letting your hips drop.', 'Shoulder out of line with the elbow.'] }
  },
  anti_rotation: {
    pt: { steps: ['Fique de lado para a polia, segurando o cabo junto ao peito.', 'Estenda os braços à frente resistindo à rotação.', 'Segure 1 a 2 segundos e volte.'],
      tips: ['Quadril e ombros sempre de frente.', 'Pés na largura dos ombros.'],
      mistakes: ['Deixar o tronco girar.', 'Carga alta demais.'] },
    en: { steps: ['Stand side-on to the cable, holding the handle at your chest.', 'Press your arms straight out, resisting the twist.', 'Hold 1 to 2 seconds and return.'],
      tips: ['Hips and shoulders always face forward.', 'Feet shoulder-width apart.'],
      mistakes: ['Letting your torso rotate.', 'Too much load.'] }
  },
  rotation: {
    pt: { steps: ['Posicione o tronco firme, com o abdômen contraído.', 'Gire o tronco de forma controlada, levando o peso de um lado ao outro.', 'Volte ao centro antes de trocar de lado.'],
      tips: ['O giro vem do tronco, não dos braços.', 'Ritmo controlado.'],
      mistakes: ['Girar rápido e sem controle.', 'Arredondar a lombar.'] },
    en: { steps: ['Brace your torso with tight abs.', 'Rotate your torso under control, moving the weight side to side.', 'Return to center before switching sides.'],
      tips: ['The twist comes from your torso, not your arms.', 'Controlled pace.'],
      mistakes: ['Twisting fast without control.', 'Rounding your lower back.'] }
  },
  plyo: {
    pt: { steps: ['Comece em posição de agachamento parcial.', 'Salte com força máxima, usando os braços.', 'Aterrisse suave, com joelhos flexionados, e reinicie.'],
      tips: ['Qualidade do salto antes de quantidade.', 'Descanse o suficiente entre as séries.'],
      mistakes: ['Aterrissar com as pernas estendidas.', 'Joelhos caindo para dentro na aterrissagem.'] },
    en: { steps: ['Start in a partial squat.', 'Jump with maximum effort, using your arms.', 'Land softly with bent knees and reset.'],
      tips: ['Jump quality before quantity.', 'Rest enough between sets.'],
      mistakes: ['Landing with straight legs.', 'Knees caving in on landing.'] }
  },
  power: {
    pt: { steps: ['Comece com o peso firme e o corpo travado.', 'Use a força das pernas e do quadril para iniciar o movimento.', 'Termine empurrando o peso acima da cabeça e volte com controle.'],
      tips: ['Aprenda com carga leve antes de aumentar.', 'Movimento contínuo e fluido.'],
      mistakes: ['Fazer só com os braços.', 'Arquear a lombar no fim.'] },
    en: { steps: ['Start with a firm grip and your body braced.', 'Use your legs and hips to start the movement.', 'Finish by pressing overhead, then return under control.'],
      tips: ['Learn with light load before going heavier.', 'Smooth, continuous movement.'],
      mistakes: ['Doing it with arms only.', 'Arching your lower back at the top.'] }
  },
  conditioning: {
    pt: { steps: ['Comece num ritmo que dê para manter durante todo o tempo indicado.', 'Mantenha a postura mesmo cansado.', 'Respire de forma contínua e recupere no descanso.'],
      tips: ['Intensidade alta, mas técnica em primeiro lugar.', 'Se precisar, reduza a velocidade em vez de parar.'],
      mistakes: ['Começar rápido demais e quebrar no meio.', 'Perder a postura.'] },
    en: { steps: ['Start at a pace you can hold for the whole interval.', 'Keep good posture even when tired.', 'Breathe steadily and recover during rest.'],
      tips: ['High intensity, but technique first.', 'Slow down instead of stopping if needed.'],
      mistakes: ['Starting too fast and crashing halfway.', 'Losing posture.'] }
  },
  cardio: {
    pt: { steps: ['Aqueça 1 a 2 minutos em ritmo leve.', 'Mantenha um ritmo moderado a forte pelo tempo indicado.', 'Desacelere no último minuto.'],
      tips: ['Você deve conseguir falar frases curtas.', 'Postura ereta.'],
      mistakes: ['Ir no limite desde o início.', 'Apoiar o peso nos braços (esteira e bike).'] },
    en: { steps: ['Warm up for 1 to 2 minutes at an easy pace.', 'Hold a moderate to hard pace for the set time.', 'Slow down in the final minute.'],
      tips: ['You should be able to speak short sentences.', 'Upright posture.'],
      mistakes: ['Going all-out from the start.', 'Leaning your weight on your arms (treadmill and bike).'] }
  }
};

export function guideFor(ex, lang) {
  if (!ex) return null;
  const key = PATTERN_TO_GUIDE[ex.pattern];
  const g = key && G[key];
  return g ? (g[lang] || g.pt) : null;
}
