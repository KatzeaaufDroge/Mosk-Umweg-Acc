import { createClient } from '@supabase/supabase-js';

// The anon key is safe to expose client-side (access is enforced by Row
// Level Security policies in Supabase), but it lives in env vars so the
// project can be configured per environment without editing source.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);