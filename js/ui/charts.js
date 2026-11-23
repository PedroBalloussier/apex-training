// Gráficos em SVG próprios, com as cores do tema.
import { esc } from '../utils/dom.js';

/** Linha simples com área suave. points: [{ label, value }] */
export function lineChart(points, { height = 160, format = (v) => v, color = 'var(--primary)', overlay = null, overlayColor = 'var(--text-3)', band = null, lines = [], labels = true } = {}) {
  if (points.length < 2) return '';
  const W = 600, H = height, PL = 8, PR = 8, PT = 16, PB = labels ? 22 : 8;
  const vals = points.map((p) => p.value).concat(overlay || [], ...lines.map((l) => l.values.filter((v) => v != null)));
  let min = Math.min(...vals), max = Math.max(...vals);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12; min -= pad; max += pad;
  const x = (i) => PL + (i * (W - PL - PR)) / (points.length - 1);
  const y = (v) => PT + (1 - (v - min) / (max - min)) * (H - PT - PB);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${d} L${x(points.length - 1).toFixed(1)},${H - PB} L${x(0).toFixed(1)},${H - PB} Z`;
  const step = Math.ceil(points.length / 6);
  const gid = 'g' + Math.random().toString(36).slice(2, 8);
  return `<svg class="chart chart-line" viewBox="0 0 ${W} ${H}" role="img">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${[0, 0.5, 1].map((f) => `<line x1="${PL}" x2="${W - PR}" y1="${(PT + f * (H - PT - PB)).toFixed(1)}" y2="${(PT + f * (H - PT - PB)).toFixed(1)}" stroke="var(--grid)"/>`).join('')}
    ${band ? `<rect x="${PL}" width="${W - PL - PR}" y="${Math.max(PT, y(Math.min(band[1], max))).toFixed(1)}" height="${Math.max(0, y(Math.max(band[0], min)) - Math.max(PT, y(Math.min(band[1], max)))).toFixed(1)}" fill="var(--primary)" opacity=".08"/>` : ''}
    <path d="${area}" fill="url(#${gid})"/>
    ${lines.map((l) => { let pen = false; const dd = l.values.map((v, i) => { if (v == null) { pen = false; return ''; } const seg = `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`; pen = true; return seg; }).join(' ');
      return `<path d="${dd}" fill="none" stroke="${l.color}" stroke-width="2" ${l.dash ? 'stroke-dasharray="4 4"' : ''} stroke-linecap="round" stroke-linejoin="round"/>`; }).join('')}
    ${overlay ? `<path d="${overlay.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${overlayColor}" stroke-width="2" stroke-dasharray="6 5" stroke-linecap="round"/>` : ''}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${points.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="${i === points.length - 1 ? 4.5 : 3}" fill="${i === points.length - 1 ? 'var(--accent)' : color}"><title>${esc(p.label)}: ${esc(format(p.value))}</title></circle>`).join('')}
    ${!labels ? '' : points.map((p, i) => ((i % step === 0 && (points.length - 1 - i >= step || i === 0)) || i === points.length - 1) ? `<text x="${x(i).toFixed(1)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}" class="chart-label">${esc(p.label)}</text>` : '').join('')}
    <text x="${W - PR}" y="${(y(points[points.length - 1].value) - 10).toFixed(1)}" text-anchor="end" class="chart-value">${esc(format(points[points.length - 1].value))}</text>
  </svg>`;
}

/** Barras verticais por semana com linha de meta. bars: [{ label, value }] */
export function weekBars(bars, goal) {
  const W = 600, H = 150, PB = 22, PT = 14;
  const max = Math.max(goal || 0, ...bars.map((b) => b.value), 1);
  const bw = (W / bars.length) * 0.56;
  const y = (v) => PT + (1 - v / max) * (H - PT - PB);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">
    ${goal ? `<line x1="0" x2="${W}" y1="${y(goal).toFixed(1)}" y2="${y(goal).toFixed(1)}" stroke="var(--accent)" stroke-dasharray="5 5" stroke-width="1.5"/>` : ''}
    ${bars.map((b, i) => {
      const cx = (i + 0.5) * (W / bars.length);
      const top = y(b.value);
      const hit = goal && b.value >= goal;
      return `<rect x="${(cx - bw / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, H - PB - top).toFixed(1)}" rx="6"
        fill="${hit ? 'var(--primary)' : 'var(--surface-3)'}"><title>${esc(b.label)}: ${b.value}</title></rect>
        ${b.value ? `<text x="${cx.toFixed(1)}" y="${(top - 4).toFixed(1)}" text-anchor="middle" class="chart-value sm">${b.value}</text>` : ''}
        <text x="${cx.toFixed(1)}" y="${H - 6}" text-anchor="middle" class="chart-label">${esc(b.label)}</text>`;
    }).join('')}
  </svg>`;
}

/** Barras horizontais (volume por grupo). rows: [{ label, value, sub }] */
export function hBars(rows) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return `<div class="hbars">${rows.map((r) => `
    <div class="hbar"><span class="hbar-label">${esc(r.label)}</span>
      <span class="hbar-track"><i style="width:${(r.value / max) * 100}%"></i></span>
      <span class="hbar-value num">${esc(r.sub ?? r.value)}</span></div>`).join('')}</div>`;
}

/**
 * Heatmap de consistência (semanas em colunas, segunda a domingo em linhas).
 * cells: Map(key -> { level 0-4, hall, missed, tip })
 */
export function heatmap(cells, weeks, keyOf, labels) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(today); end.setDate(end.getDate() + (6 - ((today.getDay() + 6) % 7))); // domingo desta semana
  const start = new Date(end); start.setDate(start.getDate() - weeks * 7 + 1);
  let cols = '';
  for (let w = 0; w < weeks; w++) {
    let cells_ = '';
    for (let d = 0; d < 7; d++) {
      const date = new Date(start); date.setDate(start.getDate() + w * 7 + d);
      const c = cells.get(keyOf(date)) || {};
      const future = date > today;
      const cls = future ? 'lf' : `l${c.level || 0}${c.hall ? ' hall' : ''}${c.missed ? ' miss' : ''}`;
      const tip = `${date.toLocaleDateString()}${c.tip ? ': ' + c.tip : ''}`;
      cells_ += `<i class="hm ${cls}" title="${esc(tip)}"></i>`;
    }
    cols += `<div class="hm-col">${cells_}</div>`;
  }
  return `<div class="heatmap"><div class="hm-days">${labels.map((l, i) => `<span>${i % 2 === 0 ? esc(l) : ''}</span>`).join('')}</div><div class="hm-grid">${cols}</div></div>`;
}
