// Página do exercício: vídeo, como executar, dicas, erros comuns, histórico e equivalentes.
import { t, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { getSettings } from '../data/settings.js';
import { loadCatalog, getExercise, exerciseName, equivalents } from '../data/catalog.js';
import { guideFor } from '../data/guides.js';
import { videoFor, youtubeSearchUrl } from '../data/videos.js';
import { exerciseHistory } from '../data/workouts.js';
import { formatWeight, weightToUser } from '../utils/units.js';

export const exerciseHash = (id) => `#ex-${id}`;

function fmtDate(iso, lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso));
}

// Repetição máxima estimada (fórmula de Epley)
const e1rm = (w, r) => (r > 0 && w > 0 ? w * (1 + Math.min(r, 12) / 30) : 0);

function sparkline(points, unit) {
  if (points.length < 2) return '';
  const W = 300, H = 72, P = 6;
  const vals = points.map((p) => weightToUser(p, unit));
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const xy = vals.map((v, i) => [P + (i * (W - 2 * P)) / (vals.length - 1), H - P - ((v - min) / span) * (H - 2 * P)]);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = xy[xy.length - 1];
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${d}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="var(--accent)"/></svg>`;
}

export default {
  async render(el, param) {
    await loadCatalog();
    const lang = getLanguage();
    const unit = getSettings().weightUnit;
    const ex = getExercise(param);
    if (!ex) { el.innerHTML = `<div class="center-state"><p class="muted">${esc(t('exercise.notFound'))}</p></div>`; return; }

    const guide = guideFor(ex, lang);
    const vid = videoFor(ex.id);
    const alts = equivalents(ex.id).slice(0, 8);
    const levelLabel = t('exercise.level' + ex.level);

    el.innerHTML = `
      <section class="screen">
        <button type="button" class="btn btn-sm btn-ghost back-link" data-back>${icon('chevron')}${esc(t('exercise.back'))}</button>
        <header class="screen-head">
          <span class="eyebrow">${esc(t('muscles.' + ex.muscle))}</span>
          <h1>${esc(exerciseName(ex.id, lang))}</h1>
          <div class="plan-meta" style="margin-top:8px">
            <span class="chip">${esc(t('equip.' + ex.equipment))}</span>
            <span class="chip">${esc(t('exercise.' + ex.type))}</span>
            <span class="chip">${esc(levelLabel)}</span>
            ${ex.unilateral ? `<span class="chip">${esc(t('session.perSide'))}</span>` : ''}
          </div>
        </header>

        <div class="card video-card">
          ${vid ? `
            <button type="button" class="video-thumb" data-play aria-label="${esc(t('exercise.play'))}">
              <img src="https://i.ytimg.com/vi/${esc(vid)}/hqdefault.jpg" alt="" loading="lazy">
              <span class="play-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></span>
            </button>
            <div class="video-links">
              <a class="btn btn-sm btn-ghost" href="https://www.youtube.com/watch?v=${esc(vid)}" target="_blank" rel="noopener">${esc(t('exercise.openYoutube'))}</a>
              <a class="btn btn-sm btn-ghost" href="${esc(youtubeSearchUrl(ex))}" target="_blank" rel="noopener">${esc(t('exercise.moreVideos'))}</a>
            </div>` : `
            <div class="empty" style="padding:18px 8px">
              <div class="empty-icon">${icon('sparkle')}</div>
              <p>${esc(t('exercise.noVideo'))}</p>
              <a class="btn btn-primary" href="${esc(youtubeSearchUrl(ex))}" target="_blank" rel="noopener">${esc(t('exercise.searchYoutube'))}</a>
            </div>`}
        </div>

        ${guide ? `
        <div class="grid grid-2">
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('exercise.howTo'))}</span></div>
            <ol class="steps-list">${guide.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
          </div>
          <div class="card guide-lists">
            <div><span class="eyebrow">${esc(t('exercise.tips'))}</span>
              <ul class="feature-list">${guide.tips.map((s) => `<li>${icon('check')}<span>${esc(s)}</span></li>`).join('')}</ul></div>
            <div><span class="eyebrow">${esc(t('exercise.mistakes'))}</span>
              <ul class="feature-list bad">${guide.mistakes.map((s) => `<li>${icon('minus')}<span>${esc(s)}</span></li>`).join('')}</ul></div>
          </div>
        </div>` : ''}

        <div class="card" data-history>
          <div class="card-head"><span class="eyebrow">${esc(t('exercise.history'))}</span></div>
          <div class="center-state" style="min-height:80px"><div class="spinner"></div></div>
        </div>

        ${alts.length ? `
        <div class="card">
          <div class="card-head"><span class="eyebrow">${esc(t('exercise.alternatives'))}</span></div>
          <div class="chips">${alts.map((a) => `<a class="chip-btn" href="#ex-${esc(a.id)}" style="display:inline-flex;align-items:center;text-decoration:none">${esc(exerciseName(a.id, lang))}</a>`).join('')}</div>
        </div>` : ''}

        <p class="setting-hint" style="text-align:center">${esc(t('exercise.disclaimer'))}</p>
      </section>`;

    el.querySelector('[data-back]').addEventListener('click', () => {
      if (history.length > 1) history.back(); else location.hash = '#plano';
    });
    const play = el.querySelector('[data-play]');
    if (play) play.addEventListener('click', () => {
      const wrap = document.createElement('div');
      wrap.className = 'video-frame';
      wrap.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
        title="${esc(exerciseName(ex.id, lang))}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      play.replaceWith(wrap);
    });

    // Histórico
    const box = el.querySelector('[data-history]');
    let sessions = [];
    try { sessions = await exerciseHistory(ex.id); } catch (e) { sessions = []; }
    if (!box.isConnected) return;
    if (!sessions.length) {
      box.innerHTML = `<div class="card-head"><span class="eyebrow">${esc(t('exercise.history'))}</span></div>
        <p class="muted">${esc(t('exercise.noHistory'))}</p>`;
      return;
    }
    const best = Math.max(...sessions.flatMap((s) => s.sets.map((x) => Number(x.weight_kg || 0))));
    const best1rm = Math.max(...sessions.flatMap((s) => s.sets.map((x) => e1rm(Number(x.weight_kg || 0), Number(x.reps || 0)))));
    const chrono = [...sessions].reverse().slice(-12).map((s) => Math.max(...s.sets.map((x) => Number(x.weight_kg || 0))));
    box.innerHTML = `
      <div class="card-head"><span class="eyebrow">${esc(t('exercise.history'))}</span><span class="chip num">${esc(t('exercise.sessions', { n: sessions.length }))}</span></div>
      <div class="kpis" style="margin-bottom:12px">
        <div class="kpi"><span class="kpi-label">${esc(t('exercise.best'))}</span><span class="kpi-value num">${esc(best ? formatWeight(best, unit, lang) : '—')}</span></div>
        <div class="kpi"><span class="kpi-label">${esc(t('exercise.e1rm'))}</span><span class="kpi-value num">${esc(best1rm ? formatWeight(best1rm, unit, lang) : '—')}</span></div>
        <div class="kpi"><span class="kpi-label">${esc(t('exercise.last'))}</span><span class="kpi-value num">${esc(fmtDate(sessions[0].date, lang))}</span></div>
      </div>
      ${sparkline(chrono, unit)}
      <details class="hist-more" data-collapse="ex-hist"><summary>${icon('chevron')}<span>${esc(t('exercise.sessions', { n: sessions.length }))}</span></summary>
      <ul class="hist-list">${sessions.slice(0, 8).map((s) => `
        <li><span class="hist-date">${esc(fmtDate(s.date, lang))}</span>
          <span class="hist-sets num">${esc(s.sets.map((x) => `${x.weight_kg != null ? weightToUser(Number(x.weight_kg), unit) : '—'}×${x.reps ?? '—'}${x.to_failure ? 'F' : ''}`).join('  ·  '))}</span></li>`).join('')}
      </ul></details>`;
  }
};
