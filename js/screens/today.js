import { t } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast } from '../ui/feedback.js';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return t('greeting.morning');
  if (h < 19) return t('greeting.afternoon');
  return t('greeting.evening');
}

export default {
  render(el) {
    const kpi = (label, value, sub) => `
      <div class="kpi">
        <span class="kpi-label">${esc(label)}</span>
        <span class="kpi-value num">${esc(value)}</span>
        <span class="kpi-sub">${esc(sub)}</span>
      </div>`;

    el.innerHTML = `
      <section class="screen">
        <header class="hero">
          <span class="eyebrow">${esc(t('today.eyebrow'))}</span>
          <h1>${esc(greeting())}</h1>
          <p class="muted">${esc(t('today.subtitle'))}</p>
        </header>

        <div class="kpis">
          ${kpi(t('today.kpiStreak'), '0', t('today.kpiStreakSub'))}
          ${kpi(t('today.kpiWeek'), '0', t('today.kpiWeekSub'))}
          ${kpi(t('today.kpiCycle'), '—', t('today.kpiCycleSub'))}
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-title">${icon('dumbbell')}<h2>${esc(t('today.workoutTitle'))}</h2></div>
          </div>
          <div class="empty" style="padding:16px 8px 8px">
            <h3>${esc(t('today.noPlan'))}</h3>
            <p>${esc(t('today.noPlanText'))}</p>
            <button class="btn btn-primary" data-act="triage">${icon('sparkle')}${esc(t('today.startTriage'))}</button>
          </div>
        </div>

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
          <div class="card">
            <div class="card-head"><span class="eyebrow">${esc(t('today.howItWorks'))}</span></div>
            <ol class="steps-list">
              <li>${esc(t('today.step1'))}</li>
              <li>${esc(t('today.step2'))}</li>
              <li>${esc(t('today.step3'))}</li>
              <li>${esc(t('today.step4'))}</li>
            </ol>
          </div>
        </div>
      </section>`;

    el.querySelector('[data-act="triage"]').addEventListener('click', () => toast(t('toast.soon'), 'info'));
  }
};
