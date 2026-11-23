import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast } from '../ui/feedback.js';
import { getActivePlan, getProfile } from '../data/account.js';
import { loadCatalog } from '../data/catalog.js';
import { dayForDate, nextTraining } from '../engine/generator.js';
import { cycleWeek, weekStrip, exerciseList } from './plan.js';
import { loadWorkouts, getOpen, doneToday, workoutsThisWeek, streak } from '../data/workouts.js';
import { startDay } from './start.js';
import { dayLabel } from '../data/labels.js';
import { phraseOfDay } from '../data/phrases.js';
import { hallState } from './hall.js';
import { startChallenge } from './start.js';
import { getRecent } from '../data/workouts.js';
import { formatDuration } from '../utils/units.js';
import { cycleCard } from './dashboard.js';
import { cycleInfo } from '../data/stats.js';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return t('greeting.morning');
  if (h < 19) return t('greeting.afternoon');
  return t('greeting.evening');
}

const kpi = (label, value, sub) => `
  <div class="kpi">
    <span class="kpi-label">${esc(label)}</span>
    <span class="kpi-value num">${esc(value)}</span>
    <span class="kpi-sub">${esc(sub)}</span>
  </div>`;

export default {
  async render(el) {
    const row = getActivePlan();
    const profile = getProfile();
    const firstName = profile && profile.name ? profile.name.split(' ')[0] : '';
    const lang = getLanguage();
    if (row) await Promise.all([loadCatalog(), loadWorkouts()]);
    const open = row ? getOpen() : null;
    const finished = row ? doneToday() : null;

    let hall = null;
    if (row) { try { hall = await hallState(); } catch (e) { hall = null; } }
    const hallToday = hall && hall.current && hall.pl && !hall.doneThisWeek && new Date().toDateString() === hall.pl.date.toDateString();

    let workoutCard;
    let cycleKpi = kpi(t('today.kpiCycle'), '—', t('today.kpiCycleSub'));

    if (!row) {
      workoutCard = `
        <div class="card">
          <div class="card-head"><div class="card-title">${icon('dumbbell')}<h2>${esc(t('today.workoutTitle'))}</h2></div></div>
          <div class="empty" style="padding:16px 8px 8px">
            <h3>${esc(t('today.noPlan'))}</h3>
            <p>${esc(t('today.noPlanText'))}</p>
            <a class="btn btn-primary" href="#triagem">${icon('sparkle')}${esc(t('today.startTriage'))}</a>
          </div>
        </div>`;
    } else {
      const plan = row.data;
      const { n, w } = cycleWeek(row);
      cycleKpi = kpi(t('today.kpiCycle'), t('todayPlan.cycleValue', { n, w }), t('todayPlan.cycleSub'));
      const today = dayForDate(plan);
      const next = nextTraining(plan);
      if (open) {
        workoutCard = `
          <div class="card">
            <div class="card-head">
              <div class="card-title"><span class="day-badge day-${esc(open.day_key)}">${esc(open.day_key)}</span>
                <div><span class="eyebrow">${esc(t('session.inProgress'))}</span><h2>${esc(dayLabel(open.day_type))}</h2></div></div>
            </div>
            <p class="muted">${esc(t('session.inProgressText', { n: open.sets.filter((x) => x.done).length }))}</p>
            <a class="btn btn-primary btn-block" href="#treino" style="margin-top:14px">${icon('dumbbell')}${esc(t('session.continue'))}</a>
          </div>`;
      } else if (finished) {
        workoutCard = `
          <div class="card">
            <div class="empty" style="padding:20px 8px">
              <div class="empty-icon">${icon('trophy')}</div>
              <h3>${esc(t('session.doneToday', { k: finished.day_key }))}</h3>
              <p>${esc(t('session.doneTodayText', { d: formatDuration(Math.max(60, finished.duration_sec - (finished.duration_sec % 60)), lang) }))}</p>
              ${next ? `<p class="setting-hint">${esc(t('todayPlan.next'))}: ${esc(t('dayTypes.' + next.day.type))} · ${esc(tl('weekdaysLong')[next.date.getDay()])}</p>` : ''}
            </div>
          </div>`;
      } else if (today) {
        workoutCard = `
          <div class="card">
            <div class="card-head">
              <div class="card-title"><span class="day-badge day-${today.key}">${today.key}</span>
                <div><span class="eyebrow">${esc(t('todayPlan.todayIs', { k: today.key }))}</span><h2>${esc(t('dayTypes.' + today.type))}</h2></div></div>
            </div>
            ${exerciseList(today, lang)}
            <button type="button" class="btn btn-primary btn-block" data-start style="margin-top:14px">${icon('dumbbell')}${esc(t('todayPlan.start'))}</button>
          </div>`;
      } else {
        const dayName = next ? tl('weekdaysLong')[next.date.getDay()] : '';
        workoutCard = `
          <div class="card">
            <div class="empty" style="padding:20px 8px">
              <div class="empty-icon">${icon('moon')}</div>
              <h3>${esc(t('todayPlan.rest'))}</h3>
              ${next ? `<p>${esc(t('todayPlan.restText', { k: next.day.key, day: dayName }))}</p>` : ''}
            </div>
          </div>`;
      }
    }

    let context = 'g';
    if (row) {
      const todayDay = dayForDate(row.data);
      const recent = getRecent();
      const last = recent[0] ? new Date(recent[0].started_at) : null;
      const st = streak(row.data.schedule);
      if (finished) context = 'done';
      else if (hallToday) context = 'hall';
      else if (last && Date.now() - last > 7 * 864e5) context = 'back';
      else if (!todayDay) context = 'rest';
      else if (st >= 3 && Math.random() < 0.4) context = 'streak';
      else if (/legs|lower/.test(todayDay.type)) context = 'legs';
      else if (!/full|conditioning/.test(todayDay.type)) context = 'upper';
    }
    const phrase = phraseOfDay(context, lang);

    const hallCard = hall && hall.current && !hall.doneThisWeek ? `
      <div class="card hall-mini">
        <div class="hall-row">
          <div class="avatar cat-${esc(hall.current.category)}">${esc(hall.current.person.split(' ').map((p) => p[0]).slice(0, 2).join(''))}</div>
          <div style="min-width:0;flex:1">
            <span class="eyebrow">${esc(hall.mode === 'monthly' ? t('hall.monthly') : t('hall.weekly'))}</span>
            <h3>${esc(hall.current.person)}: ${esc(hall.current.title[lang] || hall.current.title.pt)}</h3>
          </div>
        </div>
        <div class="hall-actions">
          ${hallToday ? `<button type="button" class="btn btn-primary btn-sm" data-hall-start>${icon('trophy')}${esc(t('hall.start'))}</button>` : ''}
          <a class="btn btn-sm" href="#hall-${esc(hall.current.id)}">${esc(t('hall.details'))}</a>
        </div>
      </div>` : '';

    el.innerHTML = `
      <section class="screen">
        <header class="hero">
          <span class="eyebrow">${esc(t('today.eyebrow'))}</span>
          <h1>${esc(greeting())}${firstName ? ', ' + esc(firstName) : ''}</h1>
          ${row ? '' : `<p class="muted">${esc(t('today.subtitle'))}</p>`}
        </header>

        <div class="kpis">
          ${kpi(t('today.kpiStreak'), row ? String(streak(row.data.schedule)) : '0', t('today.kpiStreakSub'))}
          ${kpi(t('today.kpiWeek'), row ? `${workoutsThisWeek()}/${row.data.daysPerWeek}` : '0', t('today.kpiWeekSub'))}
          ${cycleKpi}
        </div>

        ${row && cycleInfo(row).daysLeft <= 7 ? cycleCard(row, lang, { compact: true }) : ''}

        ${workoutCard}

        ${hallCard}

        <div class="grid grid-2">
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('today.quoteTitle'))}</span></div>
            <div class="quote">
              <div class="quote-mark">${icon('quote')}</div>
              <div>
                <p class="quote-text">${esc(phrase)}</p>
                <p class="quote-author">${esc(t('today.quoteAuthor'))}</p>
              </div>
            </div>
          </div>
          ${row ? `
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('plan.schedule'))}</span><a class="btn btn-sm btn-ghost" href="#plano">${esc(t('nav.plan'))}${icon('chevron')}</a></div>
            ${weekStrip(row.data)}
          </div>` : `
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('today.howItWorks'))}</span></div>
            <ol class="steps-list">
              <li>${esc(t('today.step1'))}</li>
              <li>${esc(t('today.step2'))}</li>
              <li>${esc(t('today.step3'))}</li>
              <li>${esc(t('today.step4'))}</li>
            </ol>
          </div>`}
        </div>
      </section>`;

    const start = el.querySelector('[data-start]');
    if (start) start.addEventListener('click', () => startDay(dayForDate(row.data)));
    const hs = el.querySelector('[data-hall-start]');
    if (hs) hs.addEventListener('click', () => startChallenge(hall.current));
  }
};
