// Cliente Supabase. A chave publicável é feita para ficar no código do app:
// os dados ficam protegidos pelas regras de acesso (RLS) de cada tabela.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://kzaewandnavneczgqvvy.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_RPY9Q11K10nwI2CcMnpHjQ_bltW8nAQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'apex:v1:auth'
  }
});
