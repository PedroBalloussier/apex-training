// Citações reais das lendas do Hall da Fama, conferidas uma a uma com a fonte.
// O texto em inglês é o original; o português é tradução. Só entra citação com origem confirmada.

export const QUOTES = {
  'Bruce Lee': [
    { text: { pt: 'Seja água, meu amigo.', en: 'Be water, my friend.' },
      src: { pt: 'entrevista a Pierre Berton, 1971', en: 'interview with Pierre Berton, 1971' } }
  ],
  'Arnold Schwarzenegger': [
    { text: { pt: 'As últimas três ou quatro repetições são o que faz o músculo crescer.', en: 'The last three or four reps is what makes the muscle grow.' },
      src: { pt: 'documentário "Pumping Iron", 1977', en: '"Pumping Iron" documentary, 1977' } }
  ],
  'Ronnie Coleman': [
    { text: { pt: 'Todo mundo quer ser fisiculturista, mas ninguém quer levantar peso pesado.', en: "Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights." },
      src: { pt: 'vídeos de treino', en: 'training videos' } },
    { text: { pt: 'Peso leve, baby!', en: 'Light weight, baby!' },
      src: { pt: 'bordão nos treinos', en: 'gym catchphrase' } }
  ],
  'Mike Tyson': [
    { text: { pt: 'Todo mundo tem um plano até levar o primeiro golpe.', en: 'Everybody has plans until they get hit for the first time.' },
      src: { pt: 'Associated Press, 1987', en: 'Associated Press, 1987' } }
  ],
  'Jack LaLanne': [
    { text: { pt: 'O exercício é o rei, a nutrição é a rainha. Junte os dois e você tem um reino.', en: "Exercise is king. Nutrition is queen. Put them together and you've got a kingdom." },
      src: { pt: 'frase que repetia em entrevistas', en: 'a line he repeated in interviews' } }
  ],
  'David Goggins': [
    { text: { pt: 'Quem vai carregar os barcos?', en: "Who's gonna carry the boats?" },
      src: { pt: 'livro "Can\'t Hurt Me", 2018', en: '"Can\'t Hurt Me", 2018' } }
  ],
  'Brie Larson': [
    { text: { pt: 'Fui muito além do que eu achava possível para o meu corpo.', en: 'I went far beyond what I ever believed was possible for my body.' },
      src: { pt: 'sobre a preparação para "Capitã Marvel"', en: 'on her "Captain Marvel" prep' } }
  ]
};

export const quotesFor = (person) => QUOTES[person] || [];

/** Citação do dia para a lenda do desafio atual (gira pelo dia do ano). */
export function legendQuoteOfDay(person, date = new Date()) {
  const list = quotesFor(person);
  if (!list.length) return null;
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date - start) / 864e5);
  return list[day % list.length];
}
