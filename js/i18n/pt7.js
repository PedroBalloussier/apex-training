// Textos da etapa 6.5 (corpo, dificuldade, heatmap, coach) — português
export default {
  body: {
    neck_cm: 'Pescoço',
    bmi: 'IMC', whtr: 'Cintura / altura', fat: '% de gordura', lean: 'Massa magra', fatMass: 'Massa gorda', comp: 'Composição',
    bmiBand: { under: 'abaixo do normal', normal: 'faixa normal', over: 'acima do normal', obese: 'bem acima do normal' },
    whtrBand: { good: 'saudável (abaixo de 0,5)', watch: 'atenção (0,5 a 0,6)', high: 'alto (acima de 0,6)' },
    fatEstimated: 'estimada pelas medidas', fatLogged: 'registrada', fatNeed: 'registre pescoço e cintura',
    needHeight: 'complete a altura no perfil', needWaist: 'registre a cintura',
    bmiNote: 'O IMC não separa músculo de gordura: em quem treina força ele tende a exagerar. A relação cintura/altura e a % de gordura dizem mais.',
    fatNote: 'Estimativa pelo método da Marinha americana (pescoço, cintura{hip} e altura). Margem de erro de alguns pontos: use para ver a tendência.',
    fatNoteHip: ', quadril',
    evolution: 'Evolução', period: { w4: '4 semanas', cycle: 'Ciclo', all: 'Tudo' },
    avg: 'média móvel', healthy: 'faixa saudável',
    needTwo: 'Registre pelo menos duas medidas neste período para ver o gráfico.',
    changes: 'Variação no período', start: 'início', now: 'agora'
  },
  diff: { label: 'Dificuldade', levels: ['', 'Leve', 'Moderado', 'Puxado', 'Pesado', 'Lendário'] },
  heat: {
    less: 'menos', more: 'mais', missed: 'falta', hall: 'Hall da Fama',
    hint: 'Cor = quanto da sessão planejada você cumpriu. Contorno = dia de treino que ficou para trás.'
  },
  today: { quoteLegend: 'Frase da semana do desafio' },
  todayPlan: { go: 'Começar' },
  report: {
    charts: 'Gráficos do ciclo', topLifts: 'Cargas principais', topLiftsHint: 'Melhor carga de cada sessão nos exercícios que você mais fez.',
    weekShort: 'S{n}', bodyCycle: 'Corpo no ciclo', bodyStart: 'Início', bodyEnd: 'Fim', bodyChange: 'Mudança',
    weightComp: 'Peso no ciclo'
  },
  hall: {
    documented: 'Documentado', inspired: 'Inspirado em',
    documentedHint: 'Treino publicado pela própria pessoa, pelo treinador ou por uma fonte original (ficha, livro, entrevista).',
    inspiredHint: 'Inspirado no que se sabe da preparação. Os exercícios exatos não foram publicados por completo, ou o volume original foi escalonado.'
  },
  coach: { name: 'Apex Coach', says: 'Apex Coach diz' }
};
