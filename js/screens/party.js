// Party: lista, criação, convite, ranking, feed, card de vitória e novas temporadas.
import { t, tl, getLanguage } from '../i18n/index.js';
import { icon } from '../ui/icons.js';
import { esc } from '../utils/dom.js';
import { toast, openSheet } from '../ui/feedback.js';
import { getUser } from '../data/account.js';
import { loadCatalog, exerciseName } from '../data/catalog.js';
import { CHALLENGES, CATEGORIES, getChallenge } from '../data/challenges.js';
import {
  listParties, getParty, createParty, joinParty, leaveParty, deleteParty, newSeason,
  ranking, seasonInfo, inSeason, DAILY_CAP, POINTS
} from '../data/party.js';
import { diffBadge } from '../ui/difficulty.js';
import { challengeDifficulty } from '../engine/difficulty.js';
import { coachTip } from '../ui/coach.js';
import { collapsible, bindCollapsibles } from '../ui/collapse.js';

const SWATCH = ['#F472B6', '#818CF8', '#FBBF24', '#38BDF8', '#34D399', '#F87171', '#C084FC'];
const initials = (n) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
const colorFor = (id) => SWATCH[[...String(id)].reduce((s, c) => s + c.charCodeAt(0), 0) % SWATCH.length];
const memberAvatar = (m, cls = '') => `<span class="avatar member-av ${cls}" style="background:${colorFor(m.user_id)}">${esc(initials(m.display_name))}</span>`;
const inviteUrl = (code) => `${location.origin}${location.pathname}#convite-${code}`;
const fmtDay = (d, lang) => new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short' }).format(new Date(d + 'T12:00:00'));
const maxMembers = (p) => (p.format === 'duel' ? 2 : 20);

function daysLeftText(info) {
  if (info.ended) return t('party.ended');
  if (info.daysLeft <= 1) return t('party.lastDay');
  return t('party.daysLeft', { n: info.daysLeft });
}

function scoreText(r, p) {
  return p.format === 'consistency' ? `${r.adherence}%` : `${r.points} ${t('party.pts')}`;
}

async function shareInvite(p) {
  const url = inviteUrl(p.code);
  const text = t('party.shareText', { name: p.name, url });
  try {
    if (navigator.share) { await navigator.share({ title: 'Apex', text, url }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  copyText(url);
}

function copyText(txt) {
  const done = () => toast(t('party.copied'), 'check');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => fallbackCopy(txt, done));
  else fallbackCopy(txt, done);
}
function fallbackCopy(txt, done) {
  const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { /* sem cópia */ }
  ta.remove();
}

function joinError(err) {
  const m = String(err && (err.message || err)).toLowerCase();
  if (m.includes('not_found')) return t('party.errNotFound');
  if (m.includes('full')) return t('party.errFull');
  return t('party.errJoin');
}

/** Folha para entrar com código. */
function openJoinSheet(prefill = '') {
  openSheet({
    title: t('party.joinTitle'),
    content: `<form class="form" novalidate>
        <input class="input code-input" name="code" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="${esc(t('party.joinPh'))}" value="${esc(prefill)}">
        <div class="form-error" hidden></div>
        <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
        <button type="submit" class="btn btn-primary">${esc(t('party.joinBtn'))}</button></div></form>`,
    onMount(sheet) {
      const form = sheet.querySelector('form');
      const input = form.querySelector('input');
      input.addEventListener('input', () => { input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const err = form.querySelector('.form-error'); err.hidden = true;
        const btn = form.querySelector('[type="submit"]'); btn.disabled = true;
        try { const id = await joinParty(input.value); location.hash = '#party-' + id; }
        catch (ex) { err.textContent = joinError(ex); err.hidden = false; btn.disabled = false; }
      });
    }
  });
}

/* ---------- Lista ---------- */
async function renderList(el) {
  const lang = getLanguage();
  el.innerHTML = '<section class="screen"><div class="center-state"><div class="spinner"></div></div></section>';
  const list = await listParties(true);
  if (!el.isConnected) return;
  const me = getUser()?.id;
  el.innerHTML = `
    <section class="screen">
      <header class="screen-head">
        <span class="eyebrow">${esc(t('nav.party'))}</span>
        <h1>${esc(t('party.title'))}</h1>
        <p class="muted">${esc(t('party.subtitle'))}</p>
      </header>
      <div class="party-actions">
        <a class="btn btn-primary" href="#party-nova">${icon('plus')}${esc(t('party.create'))}</a>
        <button type="button" class="btn" data-join>${icon('users')}${esc(t('party.join'))}</button>
      </div>
      ${list.length ? `
        <span class="eyebrow">${esc(t('party.mine'))}</span>
        <div class="party-list">${list.map((p) => {
          const rk = ranking(p);
          const mine = rk.find((r) => r.user_id === me);
          const info = seasonInfo(p);
          return `<a class="card party-card" href="#party-${esc(p.id)}">
            <div class="party-card-head">
              <div style="min-width:0"><h3>${esc(p.name)}</h3>
                <p class="setting-hint">${esc(t('party.formats.' + p.format))} · ${esc(t('party.season', { n: p.season }))} · ${esc(daysLeftText(info))}</p></div>
              ${mine ? `<span class="rank-pill r${mine.rank}">${mine.rank}º</span>` : ''}
            </div>
            <div class="party-card-foot">
              <span class="av-stack">${rk.slice(0, 5).map((r) => memberAvatar(r, 'sm')).join('')}</span>
              <span class="setting-hint">${esc(t('party.members', { n: p.members.length }))}${mine ? ' · ' + esc(scoreText(mine, p)) : ''}</span>
            </div>
          </a>`;
        }).join('')}</div>` : `
        <div class="card"><div class="empty"><div class="empty-icon">${icon('users')}</div>
          <h3>${esc(t('party.emptyTitle'))}</h3><p>${esc(t('party.emptyText'))}</p></div>
          <ul class="feature-list">${['hall', 'consistency', 'duel'].map((f) => `<li>${icon('trophy')}<span><strong>${esc(t('party.formats.' + f))}.</strong> ${esc(t('party.formatHints.' + f))}</span></li>`).join('')}</ul>
        </div>`}
    </section>`;
  el.querySelector('[data-join]').addEventListener('click', () => openJoinSheet());
}

/* ---------- Criar ---------- */
function renderCreate(el) {
  const lang = getLanguage();
  const st = { format: 'hall', period: 'weekly', categories: [...CATEGORIES], bonus: true, challenge: 'random' };
  const challengeOptions = () => CHALLENGES.filter((c) => st.categories.includes(c.category));

  const draw = () => {
    const opts = challengeOptions();
    if (st.challenge !== 'random' && !opts.some((c) => c.id === st.challenge)) st.challenge = 'random';
    const name = el.querySelector('[name="name"]')?.value || '';
    el.innerHTML = `
      <section class="screen">
        <a class="btn btn-sm btn-ghost back-link" href="#party">${icon('chevron')}${esc(t('nav.party'))}</a>
        <header class="screen-head"><h1>${esc(t('party.create'))}</h1></header>
        <form class="card form" novalidate>
          <div class="field"><label for="pn">${esc(t('party.name'))}</label>
            <input class="input" id="pn" name="name" maxlength="40" placeholder="${esc(t('party.namePh'))}" value="${esc(name)}"></div>
          <div class="field"><span class="label">${esc(t('party.format'))}</span>
            <div class="format-grid">${['hall', 'consistency', 'duel'].map((f) => `
              <button type="button" class="format-opt" data-format="${f}" aria-pressed="${st.format === f}">
                <strong>${esc(t('party.formats.' + f))}</strong><span>${esc(t('party.formatHints.' + f))}</span></button>`).join('')}</div></div>
          <div class="field"><span class="label">${esc(t('party.period'))}</span>
            <div class="seg seg-block">${['weekly', 'monthly'].map((p) => `<button type="button" data-period="${p}" aria-pressed="${st.period === p}">${esc(t('party.periods.' + p))}</button>`).join('')}</div></div>
          <div class="field"><span class="label">${esc(t('party.categories'))}</span>
            <div class="chips">${CATEGORIES.map((c) => `<button type="button" class="chip-btn" data-cat="${c}" aria-pressed="${st.categories.includes(c)}">${esc(t('triage.challenges.' + c))}</button>`).join('')}</div></div>
          ${st.format === 'hall' ? `
          <div class="field"><label for="pc">${esc(t('party.challenge'))}</label>
            <select class="input" id="pc" name="challenge">
              <option value="random" ${st.challenge === 'random' ? 'selected' : ''}>${esc(t('party.random'))}</option>
              ${opts.map((c) => `<option value="${esc(c.id)}" ${st.challenge === c.id ? 'selected' : ''}>${esc(c.person)} · ${esc(c.title[lang] || c.title.pt)} (${challengeDifficulty(c)}/5)</option>`).join('')}
            </select></div>` : `
          <label class="toggle-row"><span><strong>${esc(t('party.bonus'))}</strong><span class="setting-hint">${esc(t('party.bonusHint'))}</span></span>
            <input type="checkbox" name="bonus" ${st.bonus ? 'checked' : ''}></label>`}
          <div class="form-error" hidden></div>
          <button type="submit" class="btn btn-primary btn-block">${icon('users')}${esc(t('party.createBtn'))}</button>
        </form>
      </section>`;
    el.querySelectorAll('[data-format]').forEach((b) => b.addEventListener('click', () => { st.format = b.dataset.format; draw(); }));
    el.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => { st.period = b.dataset.period; draw(); }));
    el.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => {
      const c = b.dataset.cat;
      st.categories = st.categories.includes(c) ? st.categories.filter((x) => x !== c) : [...st.categories, c];
      draw();
    }));
    const sel = el.querySelector('[name="challenge"]');
    if (sel) sel.addEventListener('change', () => { st.challenge = sel.value; });
    const bonus = el.querySelector('[name="bonus"]');
    if (bonus) bonus.addEventListener('change', () => { st.bonus = bonus.checked; });
    const form = el.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = form.querySelector('.form-error'); err.hidden = true;
      const nm = form.querySelector('[name="name"]').value.trim();
      if (nm.length < 2) { err.textContent = t('party.errName'); err.hidden = false; return; }
      if (!st.categories.length) { err.textContent = t('party.errCats'); err.hidden = false; return; }
      let challengeId = null;
      if (st.format === 'hall') {
        const pool = challengeOptions();
        challengeId = st.challenge !== 'random' ? st.challenge : (pool[Math.floor(Math.random() * pool.length)] || CHALLENGES[0]).id;
      }
      const btn = form.querySelector('[type="submit"]'); btn.disabled = true;
      try {
        const p = await createParty({ name: nm, format: st.format, period: st.period, categories: st.categories, hallBonus: st.format === 'hall' ? true : st.bonus, challengeId });
        location.hash = '#party-' + p.id;
      } catch (ex) { err.textContent = t('party.errJoin'); err.hidden = false; btn.disabled = false; }
    });
  };
  draw();
}

/* ---------- Convite ---------- */
function renderInvite(el, code) {
  const c = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  el.innerHTML = `
    <section class="screen">
      <div class="card invite-hero">
        <img class="coach-avatar big" src="icons/icon-192.png" alt="" width="72" height="72">
        <h1>${esc(t('party.invitedTitle'))}</h1>
        <p class="muted">${esc(t('party.invitedText'))}</p>
        <div class="invite-code num">${esc(c)}</div>
        <button type="button" class="btn btn-primary btn-block" data-go>${icon('users')}${esc(t('party.joinBtn'))}</button>
        <div class="form-error" hidden></div>
      </div>
    </section>`;
  const btn = el.querySelector('[data-go]');
  btn.addEventListener('click', async () => {
    const err = el.querySelector('.form-error'); err.hidden = true;
    btn.disabled = true;
    try { const id = await joinParty(c); location.hash = '#party-' + id; }
    catch (ex) { err.textContent = joinError(ex); err.hidden = false; btn.disabled = false; }
  });
}

/* ---------- Detalhe ---------- */
function feedLine(e, nameOf, lang) {
  const name = nameOf(e.user_id);
  if (e.kind === 'workout') return t('party.feedWorkout', { name });
  if (e.kind === 'challenge') { const c = getChallenge(String(e.ref).split(':')[0]); return t('party.feedChallenge', { name, who: c ? c.person : '?' }); }
  if (e.kind === 'record') return t('party.feedRecord', { name, ex: exerciseName(String(e.ref).split(':')[0], lang) });
  if (e.kind === 'streak') return t('party.feedStreak', { name, n: String(e.ref).split(':')[0] });
  return t('party.feedJoin', { name });
}

function taunts(p, rk, me) {
  const out = [];
  if (rk.length < 2) return [t('party.tAlone')];
  const val = (r) => scoreText(r, p);
  const leader = rk[0];
  const second = rk[1];
  const mine = rk.find((r) => r.user_id === me);
  if (leader.score === second.score && leader.score > 0) out.push(t('party.tTie', { a: leader.display_name, b: second.display_name }));
  else if (leader.score > 0) out.push(t('party.tLeader', { name: leader.user_id === me ? t('party.youName') : leader.display_name, v: val(leader) }));
  if (p.format !== 'consistency' && mine) {
    if (mine.rank === 1 && second.points < mine.points) out.push(t('party.tAhead', { name: second.display_name, n: mine.points - second.points }));
    else if (mine.rank > 1) {
      const ahead = rk[rk.indexOf(mine) - 1];
      const gap = ahead.points - mine.points;
      if (gap > 0) out.push(t(gap <= POINTS.workout ? 'party.tGapSmall' : 'party.tGap', { n: gap, name: ahead.display_name }));
    }
  }
  const info = seasonInfo(p);
  if (!info.ended && info.elapsedDays >= 3) {
    const today = new Date();
    for (const r of rk) {
      if (r.user_id === me) continue;
      const last = p.events.filter((e) => e.user_id === r.user_id && (e.kind === 'workout' || e.kind === 'challenge') && inSeason(e, p)).map((e) => e.day).sort().pop();
      const ref = last || p.season_start;
      const idle = Math.floor((today - new Date(ref + 'T12:00:00')) / 864e5);
      if (idle >= 3) { out.push(t('party.tIdle', { name: r.display_name, n: idle })); break; }
    }
  }
  return out.slice(0, 3);
}

/** Card de vitória (1080 x 1350) para o story. */
async function victoryCard(p, rk, lang) {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#0B0F14'); bg.addColorStop(1, '#1A1508');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, 430, 20, W / 2, 430, 620); glow.addColorStop(0, 'rgba(251,191,36,.42)'); glow.addColorStop(1, 'rgba(251,191,36,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  const font = (w, s) => `${w} ${s}px -apple-system, "Segoe UI", Inter, Roboto, sans-serif`;
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'icons/icon-192.png'; });
    g.save(); g.beginPath(); g.roundRect(80, 80, 72, 72, 20); g.clip(); g.drawImage(img, 80, 80, 72, 72); g.restore();
  } catch (e) { /* sem logo */ }
  g.fillStyle = '#F8FAFC'; g.font = font(700, 40); g.textAlign = 'left'; g.fillText('Apex', 172, 130);
  g.textAlign = 'center';
  g.fillStyle = '#FBBF24'; g.font = font(700, 30); g.fillText(t('party.champion').toUpperCase(), W / 2, 270);
  g.fillStyle = '#9DACBF'; g.font = font(500, 32); g.fillText(`${p.name} · ${t('party.season', { n: p.season })}`, W / 2, 320);
  // Troféu
  g.strokeStyle = '#FBBF24'; g.lineWidth = 14; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(450, 380); g.lineTo(630, 380); g.lineTo(615, 470); g.quadraticCurveTo(540, 540, 465, 470); g.closePath(); g.stroke();
  g.beginPath(); g.arc(440, 420, 30, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
  g.beginPath(); g.arc(640, 420, 30, Math.PI * 1.5, Math.PI * 0.5); g.stroke();
  g.beginPath(); g.moveTo(540, 520); g.lineTo(540, 570); g.moveTo(490, 585); g.lineTo(590, 585); g.stroke();
  const w = rk[0];
  g.fillStyle = '#F8FAFC'; g.font = font(800, 92); g.fillText(w.display_name, W / 2, 700);
  g.fillStyle = '#FBBF24'; g.font = font(700, 52); g.fillText(scoreText(w, p), W / 2, 770);
  // Pódio
  rk.slice(1, 4).forEach((r, i) => {
    const y = 880 + i * 92;
    g.fillStyle = 'rgba(22,27,34,.9)'; g.beginPath(); g.roundRect(160, y - 58, W - 320, 76, 22); g.fill();
    g.textAlign = 'left'; g.fillStyle = '#7A8798'; g.font = font(700, 32); g.fillText(`${r.rank}º`, 196, y - 8);
    g.fillStyle = '#F8FAFC'; g.font = font(600, 34); g.fillText(r.display_name, 270, y - 8);
    g.textAlign = 'right'; g.fillStyle = '#9DACBF'; g.fillText(scoreText(r, p), W - 196, y - 8);
  });
  const lines = tl('party.victory');
  g.textAlign = 'center'; g.fillStyle = '#F8FAFC'; g.font = font(600, 36);
  g.fillText(lines[p.season % lines.length] || '', W / 2, 1200);
  g.fillStyle = '#7A8798'; g.font = font(500, 26);
  g.fillText(`${fmtDay(p.season_start, lang)} – ${fmtDay(p.season_end, lang)} · pedroballoussier.github.io/apex-training`, W / 2, H - 60);

  const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
  const file = new File([blob], 'apex-campeao.png', { type: 'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: t('party.champion') }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'apex-campeao.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function confirmSheet(title, text, label, danger, onOk) {
  openSheet({
    title,
    content: `<p class="muted">${esc(text)}</p><div class="sheet-actions">
      <button type="button" class="btn btn-ghost" data-dismiss>${esc(t('sheet.cancel'))}</button>
      <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${esc(label)}</button></div>`,
    onMount: (sheet, close) => {
      const b = sheet.querySelector('[data-ok]');
      b.addEventListener('click', async () => { b.disabled = true; try { await onOk(); close(); } catch (e) { b.disabled = false; toast(t('auth.errGeneric'), 'info'); } });
    }
  });
}

async function renderDetail(el, id) {
  const lang = getLanguage();
  el.innerHTML = '<section class="screen"><div class="center-state"><div class="spinner"></div></div></section>';
  const [p] = await Promise.all([getParty(id), loadCatalog()]);
  if (!el.isConnected) return;
  if (!p) { location.hash = '#party'; return; }
  const me = getUser()?.id;
  const rk = ranking(p);
  const mine = rk.find((r) => r.user_id === me);
  const info = seasonInfo(p);
  const isOwner = p.owner_id === me;
  const nameOf = (uid) => (uid === me ? t('party.youName') : (p.members.find((m) => m.user_id === uid)?.display_name || '?'));
  const challenge = p.format === 'hall' && p.challenge_id ? getChallenge(p.challenge_id) : null;
  const feed = p.events.filter((e) => inSeason(e, p) || e.kind === 'join').slice(0, 30);
  const full = p.members.length >= maxMembers(p);
  const maxScore = Math.max(1, ...rk.map((r) => r.score));
  const winner = info.ended && rk[0] && rk[0].score > 0 ? rk[0] : null;

  el.innerHTML = `
    <section class="screen">
      <a class="btn btn-sm btn-ghost back-link" href="#party">${icon('chevron')}${esc(t('nav.party'))}</a>
      <header class="card party-hero">
        <span class="eyebrow">${esc(t('party.formats.' + p.format))} · ${esc(t('party.periods.' + p.period))}</span>
        <h1>${esc(p.name)}</h1>
        <p class="muted">${esc(t('party.season', { n: p.season }))} · ${esc(fmtDay(p.season_start, lang))} – ${esc(fmtDay(p.season_end, lang))} · ${esc(daysLeftText(info))}</p>
        <div class="progress"><i style="width:${Math.min(100, (info.elapsedDays / Math.max(1, info.total)) * 100).toFixed(1)}%"></i></div>
        ${mine ? `<p class="setting-hint" style="margin-top:8px">${esc(t('party.stand', { r: mine.rank, n: rk.length }))} · ${esc(t('party.todayCap', { n: mine.todayPts, cap: DAILY_CAP }))}</p>` : ''}
      </header>

      ${winner ? `
      <div class="card champion-card">
        <div class="champ-row">${icon('trophy')}<div><span class="eyebrow">${esc(t('party.champion'))}</span>
          <h2>${esc(winner.user_id === me ? t('party.championYou') : winner.display_name)}</h2>
          <p class="muted">${esc(scoreText(winner, p))}</p></div></div>
        <div class="hall-actions">
          <button type="button" class="btn btn-primary" data-victory>${icon('upload')}${esc(t('party.victoryCard'))}</button>
          ${isOwner ? `<button type="button" class="btn" data-season>${icon('sparkle')}${esc(t('party.newSeason'))}</button>` : ''}
        </div>
      </div>` : ''}

      ${(() => { const tt = taunts(p, rk, me); return tt.length ? `<div class="taunts">${tt.map((x) => `<div class="taunt">${icon('flame')}<span>${esc(x)}</span></div>`).join('')}</div>` : ''; })()}

      <div class="card">
        <div class="card-head"><span class="eyebrow">${esc(t('party.ranking'))}</span><span class="chip num">${esc(t('party.members', { n: p.members.length }))}</span></div>
        <ol class="rank-list">${rk.map((r) => `
          <li class="${r.user_id === me ? 'me' : ''}">
            <span class="rank-pill r${r.rank}">${r.rank}</span>
            ${memberAvatar(r, 'sm')}
            <div class="rank-main">
              <div class="rank-name"><strong>${esc(r.display_name)}</strong>${r.user_id === me ? ` <span class="tag">${esc(t('party.you'))}</span>` : ''}${r.user_id === p.owner_id ? ` <span class="tag">${esc(t('party.ownerTag'))}</span>` : ''}</div>
              <div class="rank-bar"><i style="width:${((r.score / maxScore) * 100).toFixed(1)}%;background:${colorFor(r.user_id)}"></i></div>
              <div class="setting-hint">${esc(t('party.workouts', { n: r.workouts }))} · ${esc(t('party.records', { n: r.records }))}${p.format === 'consistency' ? ` · ${r.points} ${esc(t('party.pts'))}` : ''}</div>
            </div>
            <span class="rank-score num">${esc(scoreText(r, p))}${p.format === 'consistency' ? `<small>${esc(t('party.ofPlan'))}</small>` : ''}</span>
          </li>`).join('')}</ol>
      </div>

      ${challenge ? `
      <div class="card">
        <div class="card-head"><span class="eyebrow">${esc(t('party.challengeCard'))}</span>${diffBadge(challengeDifficulty(challenge), { compact: true })}</div>
        <div class="hall-row"><div class="avatar cat-${esc(challenge.category)}">${esc(initials(challenge.person))}</div>
          <div><h3>${esc(challenge.person)}</h3><p class="hall-title sm">${esc(challenge.title[lang] || challenge.title.pt)}</p></div></div>
        <a class="btn btn-block" href="#hall-${esc(challenge.id)}" style="margin-top:12px">${icon('trophy')}${esc(t('party.seeChallenge'))}</a>
      </div>` : ''}

      ${!full ? `
      <div class="card invite-card">
        <div class="card-head"><div class="card-title">${icon('users')}<h2>${esc(t('party.invite'))}</h2></div></div>
        <p class="setting-hint">${esc(t('party.inviteHint', { n: maxMembers(p) }))}</p>
        <div class="invite-row"><span class="invite-code num" aria-label="${esc(t('party.code'))}">${esc(p.code)}</span>
          <div class="invite-btns"><button type="button" class="btn" data-copy>${icon('copy')}${esc(t('party.copyLink'))}</button>
          <button type="button" class="btn btn-primary" data-share>${icon('upload')}${esc(t('party.share'))}</button></div></div>
      </div>` : ''}

      <div class="card">
        <div class="card-head"><span class="eyebrow">${esc(t('party.feed'))}</span></div>
        ${feed.length ? `<ul class="feed">${feed.map((e, i) => `${i === 10 ? `</ul><details class="hist-more"><summary>${icon('chevron')}<span>${esc(t('party.moreFeed', { n: feed.length }))}</span></summary><ul class="feed">` : ''}
          <li>${memberAvatar(p.members.find((m) => m.user_id === e.user_id) || { user_id: e.user_id, display_name: '?' }, 'xs')}
            <span class="feed-text">${esc(feedLine(e, nameOf, lang))}</span>
            ${e.points ? `<span class="feed-pts num">+${e.points}</span>` : ''}
            <span class="feed-day">${esc(fmtDay(e.day, lang))}</span></li>`).join('')}</ul>${feed.length > 10 ? '</details>' : ''}`
          : `<p class="muted">${esc(t('party.noFeed'))}</p>`}
      </div>

      ${collapsible({ key: 'party-rules', head: `<div class="card-title">${icon('info')}<h2>${esc(t('party.rules'))}</h2></div>`, body: `
        <ul class="chg-list">
          <li><span>${esc(t('party.rulesWorkout'))}</span><span></span><span class="chg-delta num">+${POINTS.workout}</span></li>
          <li><span>${esc(t('party.rulesChallenge'))}</span><span></span><span class="chg-delta num">${p.format === 'hall' || p.hall_bonus ? '+' + POINTS.challenge : '—'}</span></li>
          <li><span>${esc(t('party.rulesRecord'))}</span><span></span><span class="chg-delta num">+${POINTS.record}</span></li>
          <li><span>${esc(t('party.rulesStreak'))}</span><span></span><span class="chg-delta num">+${POINTS.streak}</span></li>
        </ul>
        <p class="setting-hint" style="margin-top:8px">${esc(t('party.rulesCap', { cap: DAILY_CAP }))}</p>
        ${p.format === 'consistency' ? `<p class="setting-hint">${esc(t('party.rulesConsistency'))}</p>` : ''}
        ${p.format !== 'hall' && !p.hall_bonus ? `<p class="setting-hint">${esc(t('party.rulesBonusOff'))}</p>` : ''}` })}

      <div class="party-footer">
        ${isOwner && !winner ? `<button type="button" class="btn btn-ghost" data-season>${icon('sparkle')}${esc(t('party.newSeason'))}</button>` : ''}
        ${isOwner ? `<button type="button" class="btn btn-ghost danger-text" data-remove>${icon('trash')}${esc(t('party.remove'))}</button>`
          : `<button type="button" class="btn btn-ghost danger-text" data-leave>${esc(t('party.leave'))}</button>`}
      </div>
    </section>`;

  bindCollapsibles(el);
  coachTip('party');
  const on = (sel, fn) => el.querySelectorAll(sel).forEach((b) => b.addEventListener('click', fn));
  on('[data-copy]', () => copyText(inviteUrl(p.code)));
  on('[data-share]', () => shareInvite(p));
  on('[data-victory]', async (e) => { const b = e.currentTarget; b.disabled = true; try { await victoryCard(p, rk, lang); } finally { b.disabled = false; } });
  on('[data-season]', () => confirmSheet(t('party.newSeasonTitle'), t('party.newSeasonText'), t('party.newSeason'), false, async () => {
    let next = null;
    if (p.format === 'hall') {
      const pool = CHALLENGES.filter((c) => (p.categories || []).includes(c.category) && c.id !== p.challenge_id);
      next = (pool[Math.floor(Math.random() * pool.length)] || CHALLENGES[0]).id;
    }
    await newSeason(p.id, next);
    renderDetail(el, id);
  }));
  on('[data-leave]', () => confirmSheet(t('party.leaveTitle'), t('party.leaveText'), t('party.leave'), true, async () => { await leaveParty(p.id, me); location.hash = '#party'; }));
  on('[data-remove]', () => confirmSheet(t('party.removeTitle'), t('party.removeText'), t('party.remove'), true, async () => { await deleteParty(p.id); location.hash = '#party'; }));
}

export default {
  async render(el, param) {
    if (param === 'nova') return renderCreate(el);
    if (param) return renderDetail(el, param);
    return renderList(el);
  }
};

export const inviteScreen = { render: (el, code) => renderInvite(el, code) };
