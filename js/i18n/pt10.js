// Textos de músculos trabalhados, técnicas de série e edição do plano — português
export default {
  areas: {
    pec_upper: 'Peitoral superior', pec_mid: 'Peitoral médio', pec_lower: 'Peitoral inferior', serratus: 'Serrátil anterior',
    lats: 'Latíssimo do dorso', teres: 'Redondo maior', traps_upper: 'Trapézio superior', traps_mid: 'Trapézio médio e inferior',
    rhomboids: 'Romboides', erectors: 'Eretores da espinha (lombar)', delt_front: 'Deltoide anterior', delt_side: 'Deltoide lateral',
    delt_rear: 'Deltoide posterior', rotator_cuff: 'Manguito rotador', biceps_long: 'Bíceps, cabeça longa', biceps_short: 'Bíceps, cabeça curta',
    brachialis: 'Braquial', brachioradialis: 'Braquiorradial', triceps_long: 'Tríceps, cabeça longa', triceps_lateral: 'Tríceps, cabeça lateral',
    triceps_medial: 'Tríceps, cabeça medial', forearm_flexors: 'Flexores do antebraço', forearm_extensors: 'Extensores do antebraço', grip: 'Pegada',
    quads: 'Quadríceps', adductors: 'Adutores', hamstrings: 'Posteriores da coxa', glutes_max: 'Glúteo máximo', glutes_med: 'Glúteo médio',
    hip_flexors: 'Flexores do quadril', gastrocnemius: 'Panturrilha (gastrocnêmio)', soleus: 'Sóleo', abs: 'Reto abdominal',
    lower_abs: 'Abdômen inferior', obliques: 'Oblíquos', transverse: 'Transverso do abdômen', cardio: 'Sistema cardiovascular'
  },
  areasShort: {
    pec_upper: 'peito superior', pec_mid: 'peito', pec_lower: 'peito inferior', serratus: 'serrátil', lats: 'dorsal', teres: 'redondo maior',
    traps_upper: 'trapézio sup.', traps_mid: 'trapézio médio', rhomboids: 'romboides', erectors: 'lombar', delt_front: 'ombro anterior',
    delt_side: 'ombro lateral', delt_rear: 'ombro posterior', rotator_cuff: 'manguito', biceps_long: 'bíceps', biceps_short: 'bíceps',
    brachialis: 'braquial', brachioradialis: 'braquiorradial', triceps_long: 'tríceps', triceps_lateral: 'tríceps', triceps_medial: 'tríceps',
    forearm_flexors: 'antebraço', forearm_extensors: 'antebraço', grip: 'pegada', quads: 'quadríceps', adductors: 'adutores',
    hamstrings: 'posteriores', glutes_max: 'glúteo', glutes_med: 'glúteo médio', hip_flexors: 'flexores do quadril', gastrocnemius: 'panturrilha',
    soleus: 'sóleo', abs: 'abdômen', lower_abs: 'abdômen inferior', obliques: 'oblíquos', transverse: 'transverso', cardio: 'cardio'
  },
  exercise: {
    musclesWorked: 'Músculos trabalhados', primary: 'Principais', secondary: 'Auxiliares',
    musclesHint: 'Principais fazem a maior parte do trabalho; auxiliares ajudam a estabilizar e completar o movimento.'
  },
  tech: {
    label: 'Técnica', choose: 'Técnica da série',
    names: { normal: 'Normal', warmup: 'Aquecimento', failure: 'Até a falha', drop: 'Drop set', rest_pause: 'Rest-pause', myo: 'Myo-reps', partials: 'Parciais', amrap: 'AMRAP', tempo: 'Cadência' },
    hints: {
      normal: 'Série comum.',
      warmup: 'Série leve para preparar. Não conta para volume, recordes nem sugestão de carga.',
      failure: 'Vá até não sair mais nenhuma repetição com boa técnica. Registre quantas saíram.',
      drop: 'Ao chegar na falha, reduza a carga (uns 20 a 30%) e continue sem descanso. Registre cada queda como um bloco.',
      rest_pause: 'Perto da falha, descanse 10 a 20 segundos e continue com a mesma carga. Registre cada retomada como um bloco.',
      myo: 'Uma série de ativação perto da falha, depois mini-séries de 3 a 5 repetições com 5 respirações de pausa. Cada mini-série é um bloco.',
      partials: 'No fim da série, quando a repetição completa não sai mais, faça repetições com amplitude parcial.',
      amrap: 'O máximo de repetições possível com a carga, mantendo a técnica.',
      tempo: 'Controle o tempo de cada fase. Ex.: 3-1-1 = 3 s descendo, 1 s parado, 1 s subindo.'
    },
    addBlock: { drop: 'Queda', rest_pause: 'Pausa', myo: 'Mini-série' },
    removeBlock: 'Remover bloco', tempoLabel: 'Cadência', tempoPh: 'ex.: 3-1-1',
    plannedLast: 'última série: {t}', plannedAll: 'todas as séries: {t}',
    group: { 2: 'Bi-set', 3: 'Tri-set', many: 'Série gigante' },
    groupHint: { 2: 'Bi-set: faça os dois exercícios em sequência e descanse no fim.', 3: 'Tri-set: faça os três em sequência e descanse no fim.', many: 'Série gigante: faça todos em sequência e descanse no fim.' }
  },
  csv: { blocks: 'Blocos (carga x reps)' },
  edit: {
    button: 'Editar dia', title: 'Editar treino {k}', focus: 'Grupos musculares do dia',
    focusHint: 'Escolha de 1 a 3. O app mantém os exercícios que ainda servem e completa o resto.',
    apply: 'Aplicar foco', preview: 'Prévia', kept: 'Mantidos', added: 'Novos', removed: 'Saem', usePreview: 'Usar esta versão',
    exercises: 'Exercícios', add: 'Adicionar exercício', search: 'Buscar exercício', allMuscles: 'Todos', onlyMine: 'Só meus equipamentos',
    sets: 'Séries', reps: 'Repetições', rest: 'Descanso (s)', technique: 'Técnica planejada', techOn: { last: 'Última série', all: 'Todas' },
    remove: 'Remover', save: 'Salvar dia', saved: 'Dia atualizado', restore: 'Restaurar original',
    restoreTitle: 'Restaurar o dia original?', restoreText: 'Volta ao treino gerado pela triagem. Seu histórico não muda.', restored: 'Dia restaurado',
    edited: 'Editado', trains: 'Treina: {m}', empty: 'Adicione pelo menos um exercício.', pickOne: 'Escolha pelo menos um grupo.',
    max3: 'No máximo 3 grupos.', discardTitle: 'Sair sem salvar?', discardText: 'As mudanças deste dia serão perdidas.', discard: 'Sair sem salvar',
    noResults: 'Nenhum exercício encontrado.', inDay: 'já está no dia', nothingChanged: 'Nada muda com este foco.',
    warnings: 'Avisos da semana',
    warn: {
      tooMany: 'Treino {k} tem {n} séries. Acima de umas 30 a qualidade costuma cair.',
      backToBack: '{m} treinado em dias seguidos ({a} e {b}). Prefira 48 h de descanso para o mesmo músculo.',
      missing: 'Nenhum trabalho na semana para: {m}.'
    },
    and: ' e '
  }
};
