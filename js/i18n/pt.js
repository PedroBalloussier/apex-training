export default {
  app: { name: 'Apex', version: 'v0.7' },
  nav: {
    today: 'Hoje', plan: 'Plano', calendar: 'Calendário', dashboard: 'Progresso',
    profile: 'Perfil', triage: 'Triagem', session: 'Treino', exercise: 'Exercício', body: 'Corpo', report: 'Relatório', hall: 'Hall da Fama', party: 'Party', settings: 'Configurações', more: 'Mais',
    collapse: 'Recolher menu', expand: 'Expandir menu'
  },
  top: {
    log: 'Registrar treino', themeToLight: 'Mudar para tema claro', themeToDark: 'Mudar para tema escuro',
    settings: 'Configurações', menu: 'Mais opções'
  },
  greeting: { morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite' },
  today: {
    eyebrow: 'Hoje',
    subtitle: 'Seu treino do dia aparece aqui depois da triagem.',
    workoutTitle: 'Treino de hoje',
    noPlan: 'Você ainda não tem um plano',
    noPlanText: 'Em poucos minutos a triagem entende seu objetivo, nível e disponibilidade e sugere 2 a 3 planos para você escolher.',
    startTriage: 'Fazer triagem',
    howItWorks: 'Como vai funcionar',
    step1: 'Crie sua conta e responda a triagem',
    step2: 'Escolha um dos planos sugeridos',
    step3: 'Registre cada série em poucos toques',
    step4: 'Acompanhe sua evolução e encare o Hall da Fama',
    quoteTitle: 'Frase do dia',
    quote: 'O treino mais difícil é o que você ainda não começou.',
    quoteAuthor: 'Apex',
    kpiStreak: 'Sequência', kpiStreakSub: 'dias seguidos',
    kpiWeek: 'Semana', kpiWeekSub: 'treinos feitos',
    kpiCycle: 'Ciclo', kpiCycleSub: 'sem plano ativo'
  },
  soon: {
    badge: 'Em breve',
    stage: 'Etapa {n} da construção',
    plan: {
      title: 'Plano',
      text: 'Seu plano de treino, dia a dia, montado a partir da triagem.',
      f1: 'Divisões: full body, superior/inferior, ABC a ABCDE, PPL, Arnold split e mais',
      f2: 'Troque qualquer exercício por um equivalente para o mesmo músculo',
      f3: 'Séries, repetições e descanso de acordo com o seu objetivo'
    },
    calendar: {
      title: 'Calendário',
      text: 'Seus dias de treino, descanso e desafios em uma visão só.',
      f1: 'Dias de treino com a cor de cada divisão',
      f2: 'Descanso e desafios do Hall da Fama encaixados',
      f3: 'Faltas e reposições visíveis'
    },
    dashboard: {
      title: 'Progresso',
      text: 'Toda a sua evolução, do primeiro treino ao fim do ciclo.',
      f1: 'Progressão de carga e recordes por exercício',
      f2: 'Heatmap de consistência e meta semanal',
      f3: 'Medidas corporais e relatório do ciclo para exportar'
    },
    hall: {
      title: 'Hall da Fama',
      text: 'Treinos inspirados em lendas do cinema, das lutas, do esporte e do fisiculturismo.',
      f1: 'Desafios semanais ou mensais que combinam com o seu plano',
      f2: 'Escolha as categorias: cinema, lutas, atletas, fisiculturismo, lendas históricas',
      f3: 'Conheça quem é cada lenda e por que é referência'
    },
    party: {
      title: 'Party',
      text: 'Convide amigos e transforme a constância em competição.',
      f1: 'Três formatos: Hall da Fama, Batalha de consistência e Duelo 1x1',
      f2: 'Pontos por esforço e evolução, com limite diário',
      f3: 'Card de vitória para compartilhar no story'
    }
  },
  settings: {
    eyebrow: 'Configurações',
    title: 'Configurações',
    subtitle: 'Idioma, unidades, aparência e seus dados.',
    general: 'Geral',
    language: 'Idioma', languageHint: 'Idioma de toda a interface',
    units: 'Unidades',
    weight: 'Peso', weightHint: 'Cargas e peso corporal',
    length: 'Medidas', lengthHint: 'Altura e medidas corporais',
    appearance: 'Aparência',
    palette: 'Paleta', paletteHint: 'Cor principal do app',
    emerald: 'Emerald', sunset: 'Sunset',
    mode: 'Modo', dark: 'Escuro', light: 'Claro',
    training: 'Treino',
    rest: 'Descanso padrão', restHint: 'Tempo entre séries quando o plano não define',
    data: 'Seus dados',
    storageLocal: 'Perfil, triagens e planos ficam na sua conta. Estas configurações ficam salvas neste aparelho.',
    storageMemory: 'Este navegador não permite salvar dados. Tudo será perdido ao fechar a página.',
    export: 'Exportar dados', exportHint: 'Gera um arquivo JSON com tudo o que está salvo',
    import: 'Importar dados', importHint: 'Restaura um arquivo exportado antes',
    reset: 'Apagar todos os dados', resetHint: 'Remove tudo deste aparelho',
    about: 'Sobre', version: 'Versão'
  },
  sheet: {
    close: 'Fechar', cancel: 'Cancelar',
    exportTitle: 'Exportar dados',
    exportText: 'Se o download não começar, copie o conteúdo abaixo e guarde em um arquivo .json.',
    download: 'Baixar arquivo', copy: 'Copiar',
    resetTitle: 'Apagar todos os dados?',
    resetText: 'Isso remove configurações, treinos e histórico deste aparelho. Não dá para desfazer. Se quiser guardar uma cópia, exporte antes.',
    resetConfirm: 'Apagar tudo'
  },
  toast: {
    saved: 'Configuração salva',
    soon: 'Disponível em breve',
    copied: 'Copiado',
    copyFail: 'Não foi possível copiar. Selecione o texto e copie manualmente.',
    imported: 'Dados importados',
    importFail: 'Arquivo inválido. Use um arquivo exportado pelo Apex.',
    reset: 'Dados apagados'
  },
  units: { seconds: 's', minutes: 'min' }
};
