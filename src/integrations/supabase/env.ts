// Single place that reads the Supabase connection settings.
// Server: SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY (runtime env vars).
// Browser (and server fallback): VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY (inlined at build time).
const proc: Record<string, string | undefined> =
  typeof process !== 'undefined' && process.env ? process.env : {};

export function getSupabaseConfig() {
  const url = (proc['SUPABASE_URL'] || import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const publishableKey =
    proc['SUPABASE_PUBLISHABLE_KEY'] || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  if (!url || !publishableKey) {
    const missing = [...(!url ? ['SUPABASE_URL'] : []), ...(!publishableKey ? ['SUPABASE_PUBLISHABLE_KEY'] : [])];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Copy .env.example to .env and fill in your own Supabase project's URL and anon/publishable key.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return { url, publishableKey };
}
