// Começar ou retomar um treino (usado por Hoje, Plano e o botão +).
import { t } from '../i18n/index.js';
import { esc } from '../utils/dom.js';
import { icon } from '../ui/icons.js';
import { openSheet, toast } from '../ui/feedback.js';
import { getActivePlan } from '../data/account.js';
import { dayLabel } from '../data/labels.js';
import { loadWorkouts, getOpen, startWorkout, discardWorkout } from '../data/workouts.js';

export async function startDay(day) {
  const plan = getActivePlan();
  if (!plan) { location.hash = '#triagem'; return; }
  await loadWorkouts();
  const open = getOpen();
  if (open && open.day_key !== day.key) {
    openSheet({
      title: t('session.openTitle'),
      content: `<p class="muted">${esc(t('session.openText', { k: open.day_key }))}</p>
        <div class="sheet-actions">
          <button type="button" class="btn btn-danger" data-discard>${esc(t('session.discardAndStart'))}</button>
          <button type="button" class="btn btn-primary" data-continue>${esc(t('session.continue'))}</button>
        </div>`,
      onMount(sheet, close) {
        sheet.querySelector('[data-continue]').addEventListener('click', () => { close(); location.hash = '#treino'; });
        sheet.querySelector('[data-discard]').addEventListener('click', async () => {
          await discardWorkout(); close(); await startDay(day);
        });
      }
    });
    return;
  }
  try {
    await startWorkout(plan, day);
    location.hash = '#treino';
  } catch (e) {
    toast(t('auth.errGeneric'), 'info');
  }
}

/** Botão + : retoma o treino aberto ou pergunta qual dia começar. */
export async function quickStart() {
  const plan = getActivePlan();
  if (!plan) { location.hash = '#triagem'; return; }
  await loadWorkouts();
  if (getOpen()) { location.hash = '#treino'; return; }
  openSheet({
    title: t('session.whichDay'),
    content: `<div class="day-list">${plan.data.days.map((d) => `
      <button type="button" class="day-item option" data-day="${d.key}" style="text-align:left">
        <span class="day-badge day-${d.key}">${d.key}</span>
        <span class="day-text"><span class="day-title">${esc(dayLabel(d.type))}</span>
        <span class="day-ex">${esc(t('results.exercises', { n: d.exercises.length }))}</span></span>
        ${icon('chevron')}
      </button>`).join('')}</div>`,
    onMount(sheet, close) {
      sheet.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => {
        close(); startDay(plan.data.days.find((d) => d.key === b.dataset.day));
      }));
    }
  });
}

/** Começa o treino de um desafio do Hall da Fama como uma sessão normal. */
export async function startChallenge(c) {
  await startDay({ key: 'H', type: 'hall:' + c.id, exercises: c.exercises.map((x) => ({ ...x })) });
}
