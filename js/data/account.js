// Conta, perfil, triagens e planos (Supabase).
import { supabase } from './supabase.js';

let session = null;
let profile = null;
let activePlan = null;
const subs = new Set();

const notify = () => subs.forEach((fn) => fn({ session, profile, activePlan }));
export const onAccount = (fn) => { subs.add(fn); return () => subs.delete(fn); };

export const getSession = () => session;
export const getUser = () => session?.user || null;
export const getProfile = () => profile;
export const getActivePlan = () => activePlan;

export function profileComplete(p = profile) {
  return !!(p && p.name && p.birth_date && p.sex && p.height_cm && p.weight_kg);
}

/** Carrega sessão, perfil e plano ativo. Chamar no início do app. */
export async function initAccount() {
  const { data } = await supabase.auth.getSession();
  session = data.session;
  if (session) await loadUserData();
  supabase.auth.onAuthStateChange(async (event, s) => {
    const changedUser = (s?.user?.id || null) !== (session?.user?.id || null);
    session = s;
    if (!s) { profile = null; activePlan = null; notify(); return; }
    if (changedUser) { await loadUserData(); notify(); }
  });
}

async function loadUserData() {
  const uid = session.user.id;
  const [p, plan] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
    supabase.from('plans').select('*').eq('status', 'active').maybeSingle()
  ]);
  profile = p.data || { id: uid };
  activePlan = plan.data || null;
}

/* ---------- Autenticação ---------- */
export async function signUp({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name }, emailRedirectTo: location.origin + location.pathname }
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/* ---------- Perfil ---------- */
export async function saveProfile(patch) {
  const uid = getUser().id;
  const { data, error } = await supabase.from('profiles')
    .upsert({ id: uid, ...patch }).select().single();
  if (error) throw error;
  profile = data;
  notify();
  return data;
}

/* ---------- Triagem e planos ---------- */
export async function saveTriage(answers) {
  const { data, error } = await supabase.from('triages').insert({ answers }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function activatePlan(plan, triageId) {
  const { data: id, error } = await supabase.rpc('activate_plan', { p_plan: plan, p_triage: triageId });
  if (error) throw error;
  const { data } = await supabase.from('plans').select('*').eq('id', id).single();
  activePlan = data;
  notify();
  return data;
}

export async function lastTriage() {
  const { data } = await supabase.from('triages').select('answers, created_at')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  return data;
}

/** Converte erros do Supabase em chaves de texto do app. */
export function errorKey(err) {
  const msg = (err && (err.message || err.error_description || '')).toLowerCase();
  if (msg.includes('invalid login')) return 'auth.errInvalid';
  if (msg.includes('already registered') || msg.includes('already been registered')) return 'auth.errExists';
  if (msg.includes('password') && (msg.includes('least') || msg.includes('weak') || msg.includes('short'))) return 'auth.errWeak';
  if (msg.includes('email') && msg.includes('invalid')) return 'auth.errEmail';
  if (msg.includes('rate') || msg.includes('too many')) return 'auth.errRate';
  if (msg.includes('fetch') || msg.includes('network')) return 'auth.errNetwork';
  return 'auth.errGeneric';
}
