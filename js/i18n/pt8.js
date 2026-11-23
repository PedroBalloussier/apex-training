// Textos da etapa 7 (Party) — português
export default {
  nav: { invite: 'Convite' },
  csv: {
    label: 'Exportar em CSV', hint: 'Planilha para Excel, Numbers ou Google Sheets', workouts: 'Treinos', body: 'Medidas',
    done: '{n} linhas exportadas', empty: 'Ainda não há dados para exportar.',
    date: 'Data', time: 'Hora', workout: 'Treino', exercise: 'Exercício', set: 'Série', reps: 'Repetições', load: 'Carga', failure: 'Até a falha', duration: 'Duração do treino (min)', yes: 'sim'
  },
  auth: { showPass: 'Mostrar senha', hidePass: 'Esconder senha' },
  party: {
    title: 'Party', subtitle: 'Convide amigos e transforme a constância em competição.',
    create: 'Criar party', join: 'Entrar com código', mine: 'Suas parties',
    emptyTitle: 'Nenhuma party ainda', emptyText: 'Crie uma e mande o link para os amigos, ou entre com o código que recebeu.',
    formats: { hall: 'Hall da Fama', consistency: 'Batalha de consistência', duel: 'Duelo 1x1' },
    formatHints: {
      hall: 'Todos fazem o mesmo desafio da semana ou do mês. Concluir vale 25 pontos.',
      consistency: 'Ganha quem cumprir a maior parte do próprio plano. Justo para níveis diferentes.',
      duel: 'Só duas pessoas, pontos por esforço. Quem fizer mais leva.'
    },
    periods: { weekly: 'Semanal', monthly: 'Mensal' },
    name: 'Nome da party', namePh: 'Ex.: Monstros da Ericeira', format: 'Formato', period: 'Duração da temporada',
    categories: 'Categorias de lendas', challenge: 'Desafio da temporada', random: 'Sortear',
    bonus: 'Bônus do Hall da Fama', bonusHint: 'Desafios do Hall concluídos valem 25 pontos nesta party.',
    createBtn: 'Criar e convidar', errName: 'Dê um nome com pelo menos 2 letras.', errCats: 'Escolha pelo menos uma categoria.',
    invite: 'Convide os amigos', inviteHint: 'Mande o link ou o código. Até {n} pessoas.', code: 'Código',
    copyLink: 'Copiar link', share: 'Compartilhar', copied: 'Link copiado', shareText: 'Entra na minha party "{name}" no Apex: {url}',
    joinTitle: 'Entrar numa party', joinPh: 'Código de 6 letras', joinBtn: 'Entrar',
    invitedTitle: 'Você foi convidado', invitedText: 'Entre com o código abaixo para competir com os amigos.',
    errNotFound: 'Não achamos uma party com esse código. Confira e tente de novo.', errFull: 'Essa party já está cheia.', errJoin: 'Não foi possível entrar agora. Tente de novo.',
    season: 'Temporada {n}', daysLeft: 'faltam {n} dias', lastDay: 'último dia', ended: 'temporada encerrada',
    ranking: 'Ranking', you: 'você', pts: 'pts', workouts: '{n} treinos', records: '{n} recordes', ofPlan: 'do plano',
    todayCap: 'Hoje: {n} de {cap} pontos', feed: 'Atividade', noFeed: 'Ainda sem atividade. O primeiro treino abre o placar.',
    rules: 'Como pontuar', rulesWorkout: 'Treino concluído', rulesChallenge: 'Desafio do Hall da Fama', rulesRecord: 'Recorde pessoal (até 3 por treino)',
    rulesStreak: 'Sequência de 7 dias', rulesCap: 'Limite de {cap} pontos por dia: treinar com constância vale mais que exagerar num dia.',
    rulesConsistency: 'Nesta party o ranking é pelo % do próprio plano cumprido. Os pontos desempatam.',
    rulesBonusOff: 'Bônus do Hall desligado nesta party.',
    challengeCard: 'Desafio da temporada', seeChallenge: 'Ver desafio',
    champion: 'Campeão da temporada', championYou: 'Você venceu a temporada!', victoryCard: 'Compartilhar card de vitória',
    newSeason: 'Nova temporada', newSeasonTitle: 'Começar nova temporada?', newSeasonText: 'O placar zera para todos. O histórico continua salvo.',
    leave: 'Sair da party', leaveTitle: 'Sair desta party?', leaveText: 'Seus pontos deixam de aparecer no ranking.',
    remove: 'Apagar party', removeTitle: 'Apagar esta party?', removeText: 'A party some para todos os membros. Não dá para desfazer.',
    members: '{n} membros', ownerTag: 'criador', pointsToast: '+{n} pontos, somando suas parties', youName: 'Você', moreFeed: 'Ver toda a atividade ({n})',
    feedWorkout: '{name} concluiu um treino', feedChallenge: '{name} concluiu o desafio de {who}', feedRecord: '{name} bateu um recorde: {ex}',
    feedStreak: '{name} completou {n} dias seguidos', feedJoin: '{name} entrou na party',
    tLeader: '{name} lidera com {v}.', tGapSmall: 'Você está a {n} pontos de {name}. Um treino resolve.', tGap: 'Faltam {n} pontos para alcançar {name}.',
    tAhead: 'Você está na frente, mas {name} está a {n} pontos. Nada de relaxar.', tIdle: '{name} não treina há {n} dias. Alguém chama?',
    tTie: 'Empate entre {a} e {b}. A próxima série decide.', tAlone: 'Só você por aqui. Mande o convite: competir sozinho é fácil demais.',
    victory: ['Lenda da temporada. Os outros que lutem.', 'Treinou, pontuou, venceu. Simples assim.', 'O Hall da Fama já está guardando um lugar.', 'Campeão. Agora é defender o título.'],
    stand: 'Sua posição: {r}º de {n}'
  }
};
