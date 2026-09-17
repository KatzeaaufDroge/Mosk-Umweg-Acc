import { createClient } from '@supabase/supabase-js';

// The anon key is safe to expose client-side (access is enforced by Row
// Level Security policies in Supabase). It's read from env vars so the
// project can be configured per environment without editing source, but
// falls back to the known values below so the site keeps working even on
// hosts where the env vars haven't been configured yet (e.g. before the
// planned Netlify -> Vercel migration is done).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vdkrdvlixefpsjwrywku.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZka3JkdmxpeGVmcHNqd3J5d2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDIwMzAsImV4cCI6MjA3OTc3ODAzMH0.RpVArDYZ9BjBPyzMll8h99z-8QSMuU8QMVJmyvajPCs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);