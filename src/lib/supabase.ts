import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Export a flag to check if Supabase is properly initialized
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// Debugging logs for production (only values existence, not the keys themselves for security)
if (import.meta.env.PROD) {
  console.log('Production mode detected. Checking Supabase configuration...');
  console.log('VITE_SUPABASE_URL exists:', !!supabaseUrl);
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY exists:', !!supabasePublishableKey);
}

// Fail-fast validation (logged but not throwing to avoid total white-screen crash before React mounts)
if (!isSupabaseConfigured) {
  console.error(
    'CRITICAL ERROR: Missing Supabase environment variables!\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your deployment environment settings.'
  );
}

// Provide a safe client or a dummy if not configured
// Using dummy strings if missing to avoid throwing within createClient
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder'
);

