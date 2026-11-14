import { createClient } from '@supabase/supabase-js';

// Optional backend. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in
// .env.local to use your own Supabase project; until then `supabase` is null
// and the app should use src/lib/data.js.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;
