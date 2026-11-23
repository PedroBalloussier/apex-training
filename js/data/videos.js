// Vídeos do YouTube escolhidos por exercício (canais de referência, a maioria NASM).
// Exercícios sem vídeo aqui ganham um botão de busca no YouTube.
export const VIDEOS = {
  bb_bench_press: 'CayG6UYqL8g',
  bb_incline_press: '5kyLUGVq_pk',
  db_bench_press: 'AuNRCrdhquE',
  db_incline_press: 'JKnpHchOWPU',
  push_up: 'WDIpL0pjun0',
  decline_push_up: 'DBz85WuXqMk',
  pike_push_up: '2b5t0Cu2nQI',
  lat_pulldown: 'CAwf7n6Luuc',
  seated_cable_row: 'oFtfkSElE0s',
  db_row: 'nNpxG9fGHoM',
  db_shoulder_press: 'qEwKCR5JCog',
  lateral_raise_db: 'XPPfnSEATJA',
  db_curl: 'MtXdEcW3Eog',
  rope_pushdown: 'y6EdXBdL75A',
  bar_pushdown: 'WUu0oK5j7Hk',
  bb_back_squat: '-bJIpOq-LWk',
  goblet_squat: 'nfX7IFK9UNI',
  kb_goblet_squat: 'MWHIs0zxkCU',
  leg_press: 'cDGOn-yfKJA',
  bb_rdl: '2bmuYtv4HbQ',
  db_rdl: 'wqMYwk_-P14',
  lying_leg_curl: 'lUH80pneL5w',
  seated_leg_curl: '_2Kd0d-JEUM',
  bb_hip_thrust: 'aweBS7K71l8',
  plank: 'mwlp75MS6Rg',
  side_plank: '44ND4bOB-T0'
};

export const videoFor = (id) => VIDEOS[id] || null;

export function youtubeSearchUrl(ex) {
  const q = `${ex.name.en} proper form`;
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
}
