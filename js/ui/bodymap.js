// Mapa do corpo (frente e costas) com as áreas musculares destacadas: principais em cor forte, secundárias em cor clara.
// Desenho próprio e esquemático; as chaves são as mesmas áreas do catálogo (tools/muscle_map.py).

const W = 200;
const mirror = (pts) => pts.map(([x, y]) => [W - x, y]);
// Contorno suave (Catmull-Rom fechado convertido em curvas de Bézier)
const poly = (pts, k = 0.18) => {
  const n = pts.length;
  const f = (v) => Math.round(v * 10) / 10;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + ' Z';
};
const ell = (cx, cy, rx, ry) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0 Z`;

// Contorno do lado esquerdo do desenho, do pescoço até a virilha
const OUTLINE = [
  [91, 50], [90, 62], [74, 68], [58, 73], [48, 84], [44, 102], [42, 126], [38, 150], [33, 180], [30, 208], [27, 222],
  [30, 240], [37, 240], [40, 222], [44, 202], [49, 176], [54, 152], [58, 130], [63, 112], [67, 140], [71, 174],
  [69, 200], [67, 226], [69, 262], [73, 300], [75, 322], [73, 350], [76, 386], [79, 404], [74, 420], [96, 422],
  [95, 404], [95, 386], [96, 350], [97, 322], [99, 262], [100, 238]
];
const SILHOUETTE = poly([...OUTLINE, ...mirror(OUTLINE).reverse()]);
const HEAD = ell(100, 30, 17, 21);

// Formas de cada área (lado esquerdo do desenho; o direito é espelhado). [vista, caminho]
const SHAPES = {
  // Frente
  traps_upper: [['front', poly([[91, 60], [70, 70], [91, 68]])], ['back', poly([[100, 54], [92, 56], [68, 70], [100, 82]])]],
  delt_front: [['front', ell(62, 84, 9, 13)]],
  delt_side: [['front', ell(52, 88, 6, 12)], ['back', ell(52, 88, 6, 12)]],
  pec_upper: [['front', poly([[98, 74], [72, 76], [67, 88], [98, 90]])]],
  pec_mid: [['front', poly([[98, 91], [67, 89], [68, 102], [98, 106]])]],
  pec_lower: [['front', poly([[98, 107], [69, 103], [78, 115], [98, 118]])]],
  serratus: [['front', poly([[68, 118], [79, 121], [79, 140], [71, 137]])]],
  abs: [['front', poly([[88, 121], [98, 121], [98, 172], [88, 172]])]],
  transverse: [['front', poly([[82, 150], [88, 150], [88, 196], [84, 192]])]],
  lower_abs: [['front', poly([[88, 174], [98, 174], [98, 206], [89, 200]])]],
  obliques: [['front', poly([[79, 123], [87, 123], [87, 148], [81, 192], [74, 186], [73, 150]])]],
  biceps_long: [['front', ell(49, 118, 5, 19)]],
  biceps_short: [['front', ell(56, 120, 4.5, 16)]],
  brachialis: [['front', ell(48, 141, 4.5, 7)]],
  brachioradialis: [['front', poly([[46, 150], [40, 152], [36, 180], [42, 178]])]],
  forearm_flexors: [['front', poly([[53, 154], [46, 156], [40, 205], [45, 206]])]],
  grip: [['front', poly([[29, 214], [41, 214], [38, 238], [31, 238]])]],
  hip_flexors: [['front', poly([[80, 206], [95, 212], [93, 226], [77, 220]])]],
  quads: [['front', poly([[71, 224], [96, 228], [97, 312], [80, 318], [72, 290]])]],
  adductors: [['front', poly([[97, 236], [100, 240], [100, 280], [96, 292]])]],
  // Costas
  delt_rear: [['back', ell(61, 86, 9, 12)]],
  rotator_cuff: [['back', ell(78, 98, 9, 7)]],
  rhomboids: [['back', poly([[98, 86], [86, 90], [86, 112], [98, 118]])]],
  traps_mid: [['back', poly([[100, 82], [84, 84], [94, 108], [100, 132]])]],
  teres: [['back', ell(70, 110, 7, 5)]],
  lats: [['back', poly([[85, 114], [67, 112], [70, 150], [90, 182], [98, 172], [98, 124]])]],
  erectors: [['back', poly([[92, 150], [99, 150], [99, 208], [91, 206]])]],
  triceps_long: [['back', ell(56, 114, 4.5, 18)]],
  triceps_lateral: [['back', ell(48, 112, 4.5, 16)]],
  triceps_medial: [['back', ell(52, 136, 5, 7)]],
  forearm_extensors: [['back', poly([[42, 152], [52, 154], [46, 205], [38, 203]])]],
  glutes_med: [['back', poly([[72, 202], [96, 204], [96, 214], [70, 218]])]],
  glutes_max: [['back', poly([[70, 218], [99, 214], [99, 252], [74, 250]])]],
  hamstrings: [['back', poly([[73, 254], [98, 254], [96, 314], [78, 318]])]],
  gastrocnemius: [['back', ell(85, 348, 10, 22)]],
  soleus: [['back', ell(85, 378, 7, 11)], ['front', poly([[75, 340], [80, 338], [80, 382], [77, 384]])]]
};

const VIEWS = ['front', 'back'];

/** Áreas em destaque de um exercício do catálogo. */
export function areasOf(ex) {
  return { primary: (ex && ex.primary) || [], secondary: (ex && ex.secondary) || [] };
}

/** Junta as áreas de vários exercícios: principal vence secundária. */
export function mergeAreas(list) {
  const p = new Set(), s = new Set();
  for (const a of list) { (a.primary || []).forEach((k) => p.add(k)); (a.secondary || []).forEach((k) => s.add(k)); }
  p.forEach((k) => s.delete(k));
  return { primary: [...p], secondary: [...s] };
}

/**
 * SVG com as duas vistas. opts: { label, labels: [frente, costas], cls }
 * As cores vêm de classes (.bm-p principal, .bm-s secundária) para seguir o tema e a impressão.
 */
export function bodyMap({ primary = [], secondary = [] } = {}, { label = '', labels = null, cls = '' } = {}) {
  const P = new Set(primary), S = new Set(secondary);
  const view = (v, dx) => {
    const parts = [];
    for (const [key, shapes] of Object.entries(SHAPES)) {
      for (const [sv, d] of shapes) {
        if (sv !== v) continue;
        const c = P.has(key) ? 'bm-p' : S.has(key) ? 'bm-s' : 'bm-o';
        parts.push(`<path class="${c}" d="${d}"/><path class="${c}" d="${d}" transform="matrix(-1 0 0 1 ${W} 0)"/>`);
      }
    }
    return `<g transform="translate(${dx} 0)">
      <path class="bm-body" d="${SILHOUETTE}"/><path class="bm-body" d="${HEAD}"/>
      ${parts.join('')}
      ${labels ? `<text class="bm-label" x="100" y="438" text-anchor="middle">${labels[VIEWS.indexOf(v)]}</text>` : ''}
    </g>`;
  };
  const h = labels ? 446 : 426;
  return `<svg class="bodymap ${cls}" viewBox="0 0 420 ${h}" role="img" aria-label="${label}">${view('front', 0)}${view('back', 220)}</svg>`;
}

export const AREA_KEYS = Object.keys(SHAPES);
