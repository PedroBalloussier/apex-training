// PDF do treino: página otimizada para impressão (o navegador salva como PDF). Plano inteiro ou um dia.
import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { getActivePlan, getProfile } from '../data/account.js';
import { getSettings } from '../data/settings.js';
import { loadCatalog, getExercise, exerciseName } from '../data/catalog.js';
import { guideFor } from '../data/guides.js';
import { videoFor, youtubeSearchUrl } from '../data/videos.js';
import { lastSessions } from '../data/workouts.js';
import { suggest } from '../engine/progression.js';
import { dayAtSlot } from '../engine/generator.js';
import { planTitle, dayTitle, repsText } from '../data/labels.js';
import { plannedText, groupSize, groupName, techName } from '../data/techniques.js';
import { formatWeight, formatDuration } from '../utils/units.js';
import { bodyMap, areasOf, mergeAreas } from '../ui/bodymap.js';
import qrcode from '../vendor/qrcode.js';

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const GRID_KEY = 'apex:v1:pdfGrid';

export const gridOn = () => { try { return localStorage.getItem(GRID_KEY) !== 'off'; } catch (e) { return true; } };
export const setGrid = (on) => { try { localStorage.setItem(GRID_KEY, on ? 'on' : 'off'); } catch (e) { /* sem armazenamento */ } };

/** QR code em SVG (módulos como um único caminho). */
function qrSvg(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c},${r}h1v1h-1z`;
  return `<svg class="pdf-qr" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" aria-hidden="true"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

const fmtDate = (d, lang) => new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);

function weekdaysOf(plan, key) {
  const names = tl('weekdaysLong');
  return ORDER.filter((wd) => { const d = dayAtSlot(plan, plan.schedule.indexOf(wd)); return d && plan.schedule.includes(wd) && d.key === key; }).map((wd) => names[wd]);
}

function cover(row, plan, lang, unit) {
  const start = new Date(row.started_at || row.created_at || Date.now());
  const weeks = row.cycle_weeks || plan.cycleWeeks || 12;
  const end = new Date(start); end.setDate(end.getDate() + weeks * 7 - 1);
  const prof = getProfile();
  const names = tl('weekdaysLong');
  const used = new Set();
  for (const d of plan.days) for (const x of d.exercises) if (x.technique) used.add(x.technique.type);
  const hasGroups = plan.days.some((d) => d.exercises.some((x) => x.group));
  return `
    <section class="pdf-page pdf-cover">
      <div class="pdf-brand"><img src="icons/icon-192.png" alt="" width="40" height="40"><strong>Apex</strong></div>
      <h1>${esc(planTitle(plan))}</h1>
      ${prof && prof.name ? `<p class="pdf-who">${esc(prof.name)}</p>` : ''}
      <p class="pdf-meta">${esc(t('goals.' + plan.goal))} · ${esc(t('triage.level.' + (plan.level || 'beginner')))} · ${esc(t('pdf.perWeek', { d: plan.schedule.length }))}</p>
      <p class="pdf-meta">${esc(t('pdf.cycle', { w: weeks, a: fmtDate(start, lang), b: fmtDate(end, lang) }))}</p>

      <h2>${esc(t('pdf.schedule'))}</h2>
      <table class="pdf-table pdf-week"><tbody>${ORDER.map((wd) => {
        const i = plan.schedule.indexOf(wd);
        const d = i === -1 ? null : dayAtSlot(plan, i);
        return `<tr><th>${esc(names[wd])}</th><td>${d ? `<span class="pdf-badge day-${d.key}">${d.key}</span>${esc(dayTitle(d))}` : `<span class="pdf-rest">${esc(t('builder.rest'))}</span>`}</td></tr>`;
      }).join('')}</tbody></table>

      <h2>${esc(t('pdf.howToRead'))}</h2>
      <ul class="pdf-read">
        <li>${esc(t('pdf.read.dose'))}</li><li>${esc(t('pdf.read.rest'))}</li><li>${esc(t('pdf.read.load'))}</li><li>${esc(t('pdf.read.qr'))}</li>
      </ul>
      ${used.size || hasGroups ? `<h2>${esc(t('pdf.techniques'))}</h2><dl class="pdf-tech">
        ${[...used].map((k) => `<dt>${esc(techName(k))}</dt><dd>${esc(t('tech.hints.' + k))}</dd>`).join('')}
        ${hasGroups ? `<dt>${esc(t('tech.group.2'))} / ${esc(t('tech.group.3'))}</dt><dd>${esc(t('tech.groupHint.2'))}</dd>` : ''}
      </dl>` : ''}
      <div class="pdf-coach"><img src="icons/coach.jpg" alt="" width="56" height="56"><p><strong>Apex Coach</strong>${esc(t('pdf.coach'))}</p></div>
      <p class="pdf-foot">${esc(t('pdf.generated', { d: fmtDate(new Date(), lang) }))} · ${esc(unit)}</p>
    </section>`;
}

function exerciseBlock(x, i, day, ctx) {
  const { lang, unit, last, grid } = ctx;
  const e = getExercise(x.id);
  if (!e) return '';
  const g = guideFor(e, lang);
  const vid = videoFor(e.id);
  const url = vid ? `https://www.youtube.com/watch?v=${vid}` : youtubeSearchUrl(e);
  const planned = plannedText(x);
  const list = day.exercises;
  const gs = groupSize(list, i);
  const startsGroup = x.group && list[i + 1] && list[i + 1].group === x.group;
  const l = last.get(e.id);
  const sug = suggest(e, x, l);
  const best = l && l.sets.length ? l.sets.reduce((a, s) => (Number(s.weight_kg || 0) > Number(a.weight_kg || 0) ? s : a), l.sets[0]) : null;
  const lastTxt = best && Number(best.weight_kg) > 0 ? `${formatWeight(Number(best.weight_kg), unit, lang)} × ${best.reps ?? '-'}` : (best ? `${best.reps ?? '-'} reps` : t('pdf.noHistory'));
  const sugTxt = sug && sug.weightKg ? formatWeight(sug.weightKg, unit, lang) : '—';
  const sets = Math.max(1, Number(x.sets) || 1);
  return `
    <article class="pdf-ex">
      <header class="pdf-ex-head">
        <span class="pdf-num">${i + 1}</span>
        <div class="pdf-ex-title"><h3>${esc(exerciseName(e.id, lang))}</h3>
          <p>${esc(t('equip.' + e.equipment))}${e.unilateral ? ' · ' + esc(t('session.perSide')) : ''}${startsGroup ? ' · ' + esc(t('pdf.groupWith', { g: groupName(gs) })) : ''}</p></div>
        <div class="pdf-dose"><strong>${x.sets} × ${esc(repsText(x.reps))}</strong>${x.restSec ? `<span>${esc(t('plan.rest'))} ${esc(formatDuration(x.restSec, lang))}</span>` : ''}${planned ? `<span>${esc(planned)}</span>` : ''}</div>
      </header>
      <div class="pdf-ex-body">
        <div class="pdf-ex-side">
          ${bodyMap(areasOf(e), { cls: 'bm-mini', label: t('bodymap.label') })}
          <div class="pdf-qr-wrap">${qrSvg(url)}<span>${esc(vid ? t('pdf.video') : t('pdf.search'))}</span></div>
        </div>
        <div class="pdf-ex-main">
          <p class="pdf-mus"><strong>${esc(t('pdf.primary'))}:</strong> ${esc((e.primary || []).map((a) => t('areas.' + a)).join(', '))}${e.secondary && e.secondary.length ? `<br><strong>${esc(t('pdf.secondary'))}:</strong> ${esc(e.secondary.map((a) => t('areas.' + a)).join(', '))}` : ''}</p>
          <p class="pdf-loads"><span><strong>${esc(t('pdf.lastLoad'))}:</strong> ${esc(lastTxt)}</span><span><strong>${esc(t('pdf.suggested'))}:</strong> ${esc(sugTxt)}</span></p>
          ${g ? `<h4>${esc(t('pdf.steps'))}</h4><ol class="pdf-steps">${g.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
          <div class="pdf-two">
            <div><h4>${esc(t('pdf.tips'))}</h4><ul>${g.tips.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
            <div><h4>${esc(t('pdf.mistakes'))}</h4><ul>${g.mistakes.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
          </div>` : ''}
        </div>
      </div>
      ${grid ? `<table class="pdf-table pdf-log"><thead><tr><th>${esc(t('pdf.set'))}</th>${[1, 2, 3, 4].map((n) => `<th>${esc(t('pdf.session', { n }))}</th>`).join('')}</tr></thead>
        <tbody>${Array.from({ length: sets }, (_, k) => `<tr><th>${k + 1}</th>${(`<td><span>${unit}</span><span>reps</span></td>`).repeat(4)}</tr>`).join('')}</tbody></table>` : ''}
    </article>`;
}

function dayPage(plan, day, ctx) {
  const areas = mergeAreas(day.exercises.map((x) => areasOf(getExercise(x.id))));
  const wds = weekdaysOf(plan, day.key);
  return `
    <section class="pdf-page pdf-day">
      <header class="pdf-day-head">
        <span class="pdf-badge big day-${day.key}">${day.key}</span>
        <div><span class="pdf-eyebrow">${esc(t('pdf.dayOf', { k: day.key }))} · ${esc(t('results.exercises', { n: day.exercises.length }))}</span>
          <h2>${esc(dayTitle(day))}</h2>
          <p class="pdf-meta">${esc(wds.length ? t('pdf.on', { d: wds.join(', ') }) : t('pdf.notScheduled'))}</p></div>
      </header>
      <div class="pdf-day-map">${bodyMap(areas, { label: t('bodymap.label'), labels: [t('bodymap.front'), t('bodymap.back')] })}
        <div class="pdf-day-mus"><p><strong>${esc(t('pdf.primary'))}:</strong> ${esc(areas.primary.map((a) => t('areas.' + a)).join(', '))}</p>
        ${areas.secondary.length ? `<p><strong>${esc(t('pdf.secondary'))}:</strong> ${esc(areas.secondary.map((a) => t('areas.' + a)).join(', '))}</p>` : ''}</div></div>
      ${day.exercises.map((x, i) => exerciseBlock(x, i, day, ctx)).join('')}
    </section>`;
}

export default {
  async render(el, param) {
    const row = getActivePlan();
    if (!row) { location.hash = '#plano'; return; }
    await loadCatalog();
    const lang = getLanguage();
    const unit = getSettings().weightUnit;
    const plan = row.data;
    const scope = param === 'all' || !plan.days.some((d) => d.key === param) ? 'all' : param;
    const days = scope === 'all' ? plan.days : plan.days.filter((d) => d.key === scope);
    const ids = [...new Set(days.flatMap((d) => d.exercises.map((x) => x.id)))];
    let last = new Map();
    try { last = await lastSessions(ids); } catch (e) { /* sem histórico */ }
    const ctx = { lang, unit, last, grid: gridOn() };

    el.innerHTML = `
      <section class="screen pdf-screen">
        <div class="pdf-toolbar no-print">
          <a class="btn btn-sm btn-ghost" href="#plano">${icon('chevron')}${esc(t('pdf.back'))}</a>
          <label class="pdf-opt"><span>${esc(t('pdf.scope'))}</span>
            <select class="input input-sm" data-scope><option value="all" ${scope === 'all' ? 'selected' : ''}>${esc(t('pdf.whole'))}</option>
            ${plan.days.map((d) => `<option value="${d.key}" ${scope === d.key ? 'selected' : ''}>${esc(d.key + ' · ' + dayTitle(d))}</option>`).join('')}</select></label>
          <label class="toggle-row pdf-opt"><span>${esc(t('pdf.grid'))}</span><input type="checkbox" data-grid ${ctx.grid ? 'checked' : ''}></label>
          <button type="button" class="btn btn-primary" data-print>${icon('download')}${esc(t('pdf.save'))}</button>
          <p class="setting-hint">${esc(t('pdf.printHint'))}</p>
        </div>
        <div class="pdf-doc">
          ${scope === 'all' ? cover(row, plan, lang, unit) : ''}
          ${days.map((d) => dayPage(plan, d, ctx)).join('')}
        </div>
      </section>`;

    el.querySelector('[data-scope]').addEventListener('change', (e) => { location.hash = '#pdf-' + e.target.value; });
    el.querySelector('[data-grid]').addEventListener('change', (e) => { setGrid(e.target.checked); this.render(el, scope); });
    el.querySelector('[data-print]').addEventListener('click', () => {
      document.title = `Apex - ${planTitle(plan)}${scope === 'all' ? '' : ' - ' + scope}`;
      try { window.print(); } catch (e) { /* navegador sem impressão */ }
    });
  }
};
