// O que o Apex Coach já mostrou a cada usuário (boas-vindas, tour, dicas).
// Fica no aparelho e na conta (profiles.settings.coach), para não repetir em outro aparelho.
import { getUser, getProfile, saveProfile } from './account.js';

const key = () => `apex:v1:coach:${getUser()?.id || 'anon'}`;
function local() { try { return JSON.parse(localStorage.getItem(key()) || '{}'); } catch (e) { return {}; } }
function remote() { return (getProfile()?.settings || {}).coach || {}; }

export function coachSeen(k) { return !!(local()[k] || remote()[k]); }

export function markCoach(k) {
  const l = { ...local(), [k]: true };
  try { localStorage.setItem(key(), JSON.stringify(l)); } catch (e) { /* sem armazenamento */ }
  syncRemote({ ...remote(), [k]: true });
}

export function resetCoach() {
  try { localStorage.removeItem(key()); } catch (e) { /* sem armazenamento */ }
  syncRemote({});
}

function syncRemote(coach) {
  const p = getProfile();
  if (!p || !getUser()) return;
  saveProfile({ settings: { ...(p.settings || {}), coach } }).catch(() => { /* fica só no aparelho */ });
}
