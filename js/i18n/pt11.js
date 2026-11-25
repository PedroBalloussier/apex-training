// Textos do construtor de plano personalizado e da organização do plano — português
export default {
  nav: { builder: 'Montar plano' },
  splits: { custom: 'Plano personalizado' },
  splitDesc: { custom: 'Você escolhe os dias, os grupos de cada dia e os exercícios.' },
  results: {
    customTitle: 'Montar o meu', customText: 'Prefere a sua própria estrutura? Escolha os dias, os grupos de cada dia e os exercícios.',
    customBtn: 'Montar plano personalizado'
  },
  builder: {
    eyebrow: 'Plano personalizado', title: 'Monte o seu plano', stepOf: 'Passo {n} de 3',
    stepNames: ['Estrutura', 'Exercícios', 'Revisão'],
    basics: 'Base do plano', name: 'Nome do plano', namePh: 'Ex.: Meu PPL',
    goal: 'Objetivo', level: 'Nível', cycle: 'Ciclo', duration: 'Tempo por treino',
    basicsHint: 'O objetivo e o nível definem séries, repetições e descanso sugeridos.',
    weekdays: 'Dias de treino', weekdaysHint: 'Escolha de 1 a 7 dias.',
    presets: 'Modelos rápidos', presetsHint: 'Preenchem os dias. Depois você ajusta tudo.',
    preset: { ppl: 'Push, Pull, Legs', upper_lower: 'Superior / Inferior', bro: 'Um grupo por dia', full: 'Full body', pairs: 'ABC clássico' },
    days: 'Dias do plano', daysHint: 'Cada treino diferente do plano. Escolha até 3 grupos por dia.',
    dayName: 'Nome do dia (opcional)', addDay: 'Adicionar dia', removeDay: 'Remover dia', maxDays: 'Até 6 dias diferentes.',
    week: 'Semana', weekHint: 'Escolha qual treino cai em cada dia da semana. Pode repetir um treino.',
    rest: 'Descanso',
    unused: 'O dia {k} não aparece em nenhum dia da semana.', needMuscles: 'Escolha pelo menos um grupo no dia {k}.',
    needWeekday: 'Escolha pelo menos um dia de treino.',
    next: 'Continuar', back: 'Voltar',
    exHint: 'Sugeri exercícios para os grupos de cada dia, com o seu objetivo, nível e equipamento. Edite à vontade.',
    regen: 'Sugerir de novo', empty: 'Esvaziar', editDay: 'Editar dia', noEx: 'Sem exercícios ainda. Toque em Editar dia para adicionar.',
    emptyErr: 'O dia {k} está sem exercícios.',
    weekly: 'Séries por semana', weeklyHint: 'Soma de todas as vezes que cada grupo aparece na semana.',
    noWarnings: 'Nenhum aviso. Plano equilibrado.',
    activate: 'Ativar plano', activating: 'Ativando…', replaceTitle: 'Trocar o plano atual?',
    replaceText: 'O seu histórico continua salvo. O ciclo começa de novo na semana 1.', replace: 'Trocar plano',
    done: 'Plano ativado.', discardTitle: 'Sair do construtor?', discardText: 'O plano que você montou não será salvo.', discard: 'Sair sem salvar',
    newPlan: 'Novo plano personalizado'
  },
  manage: {
    title: 'Organizar plano', dup: 'Duplicar dia {k}', add: 'Adicionar dia', remove: 'Remover dia {k}', week: 'Mudar dias da semana',
    removeTitle: 'Remover o dia {k}?', removeText: 'Os dias da semana em que ele caía passam para outro treino.',
    lastDay: 'O plano precisa de pelo menos um dia.', maxDays: 'O plano já tem 6 dias diferentes.',
    weekSaved: 'Semana atualizada.', added: 'Dia {k} adicionado.', removed: 'Dia removido.', duplicated: 'Dia duplicado como {k}.',
    newDayTitle: 'Novo dia', newDayHint: 'Escolha até 3 grupos. Eu sugiro os exercícios e você edita depois.', create: 'Criar dia',
    weekTitle: 'Dias da semana', copy: 'cópia'
  },
  edit: { warn: { unused: 'O dia {k} não cai em nenhum dia da semana. Use "Mudar dias da semana".', lowVolume: 'Menos de 10 séries por semana em {m}. Para hipertrofia, a revisão de 2026 do ACSM viu mais ganho a partir de 10.' } },
  coach: { tips: { builder: 'Comece por um modelo rápido ou monte do zero. Cada dia pode ter até 3 grupos, e você pode repetir um treino na semana.' } }
};
