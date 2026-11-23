import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast } from '../ui/feedback.js';
import { getActivePlan, getProfile } from '../data/account.js';
import { loadCatalog } from '../data/catalog.js';
import { dayForDate, nextTraining } from '../engine/generator.js';
import { cycleWeek, weekStrip, exerciseList } from './plan.js';

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
    if (row) await loadCatalog();

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
      if (today) {
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

    el.innerHTML = `
      <section class="screen">
        <header class="hero">
          <span class="eyebrow">${esc(t('today.eyebrow'))}</span>
          <h1>${esc(greeting())}${firstName ? ', ' + esc(firstName) : ''}</h1>
          ${row ? '' : `<p class="muted">${esc(t('today.subtitle'))}</p>`}
        </header>

        <div class="kpis">
          ${kpi(t('today.kpiStreak'), '0', t('today.kpiStreakSub'))}
          ${kpi(t('today.kpiWeek'), '0', t('today.kpiWeekSub'))}
          ${cycleKpi}
        </div>

        ${workoutCard}

        <div class="grid grid-2">
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('today.quoteTitle'))}</span></div>
            <div class="quote">
              <div class="quote-mark">${icon('quote')}</div>
              <div>
                <p class="quote-text">${esc(t('today.quote'))}</p>
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
    if (start) start.addEventListener('click', () => toast(t('toast.soon'), 'info'));
  }
};
